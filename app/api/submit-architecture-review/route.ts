import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { createEvidenceBundle } from "@/lib/architecture-review/evidence";
import { buildArchitectureReviewEmailContent, buildMailtoUrl } from "@/lib/architecture-review/email";
import { createEmlToken } from "@/lib/architecture-review/eml-token";
import { summarizeTopIssues } from "@/lib/architecture-review/report";
import { extractOcrTextFromPng, extractSvgEvidenceFromBytes, isOcrTimeoutError } from "@/lib/architecture-review/server";
import { sendArchitectureReviewEmail } from "@/lib/architecture-review/sender";
import { buildReviewReportFromEvidence } from "@/lib/architecture-review/client";
import { submitArchitectureReviewMetadataSchema } from "@/lib/architecture-review/types";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import { ensureLeadLogSchemaReady } from "@/lib/lead-log-schema";
import { normalizeIdempotencyKey, readIdempotencyEntry, writeIdempotencyEntry } from "@/lib/idempotency-cache";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { maxUploadBytes } from "@/lib/security";
import { archiveArchitectureReviewToWorkDrive } from "@/lib/zoho-workdrive";

export const runtime = "nodejs";

const ARCHITECTURE_REVIEW_MAX_MB = Number(process.env.ARCHITECTURE_REVIEW_UPLOAD_MAX_MB ?? "8");
const ARCH_REVIEW_RATE_LIMIT = 8;
const ARCH_REVIEW_WINDOW_MS = 60 * 60 * 1000;
const MAX_METADATA_JSON_CHARS = 40_000;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type ParsedDiagram = {
  filename: string;
  bytes: Uint8Array;
  format: "png" | "svg";
  mimeType: "image/png" | "image/svg+xml";
  svgEvidence: { text: string; dimensions: { width: number; height: number } | null } | null;
};

function responseHeaders(requestId: string, limiter?: RateLimitResult) {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
  };

  if (limiter) {
    headers["X-RateLimit-Limit"] = String(ARCH_REVIEW_RATE_LIMIT);
    headers["X-RateLimit-Remaining"] = String(limiter.remaining);
    headers["X-RateLimit-Reset"] = String(Math.floor(Date.now() / 1000) + limiter.retryAfterSeconds);
  }

  return headers;
}

function jsonResponse(
  requestId: string,
  body: Record<string, unknown>,
  status = 200,
  limiter?: RateLimitResult,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json(
    {
      ...body,
      requestId,
    },
    {
      status,
      headers: {
        ...responseHeaders(requestId, limiter),
        ...(extraHeaders ?? {}),
      },
    },
  );
}

function emlSecret() {
  return process.env.ARCH_REVIEW_EML_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

function isPngBytes(bytes: Uint8Array) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((byte, index) => bytes[index] === byte);
}

async function parsePayloadFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("INVALID_PAYLOAD");
  }

  const formData = await request.formData();
  const metadataRaw = formData.get("metadata");
  const diagramRaw = formData.get("diagram");

  if (typeof metadataRaw !== "string" || !(diagramRaw instanceof File)) {
    throw new Error("INVALID_PAYLOAD");
  }

  if (metadataRaw.length <= 0 || metadataRaw.length > MAX_METADATA_JSON_CHARS) {
    throw new Error("INVALID_PAYLOAD");
  }

  const maxBytes = maxUploadBytes(ARCHITECTURE_REVIEW_MAX_MB);
  if (diagramRaw.size <= 0 || diagramRaw.size > maxBytes) {
    throw new Error("DIAGRAM_TOO_LARGE");
  }

  const metadata = submitArchitectureReviewMetadataSchema.parse(JSON.parse(metadataRaw));
  const bytes = new Uint8Array(await diagramRaw.arrayBuffer());
  if (bytes.length > maxBytes) {
    throw new Error("DIAGRAM_TOO_LARGE");
  }

  const lowerName = diagramRaw.name.toLowerCase();
  if (lowerName.endsWith(".png")) {
    if (metadata.diagramFormat && metadata.diagramFormat !== "png") {
      throw new Error("DIAGRAM_FORMAT_MISMATCH");
    }

    if (!isPngBytes(bytes)) {
      throw new Error("INVALID_DIAGRAM_FILE");
    }

    return {
      metadata,
      diagram: {
        filename: diagramRaw.name,
        bytes,
        format: "png",
        mimeType: "image/png",
        svgEvidence: null,
      } satisfies ParsedDiagram,
    } as const;
  }

  if (!lowerName.endsWith(".svg")) {
    throw new Error("INVALID_DIAGRAM_FILE");
  }

  if (metadata.diagramFormat && metadata.diagramFormat !== "svg") {
    throw new Error("DIAGRAM_FORMAT_MISMATCH");
  }

  return {
    metadata,
    diagram: {
      filename: diagramRaw.name,
      bytes,
      format: "svg",
      mimeType: "image/svg+xml",
      svgEvidence: extractSvgEvidenceFromBytes(bytes),
    } satisfies ParsedDiagram,
  } as const;
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let limiterContext: RateLimitResult | undefined;

  try {
    const user = await requireUser();
    if (!user.email) {
      return jsonResponse(requestId, { error: "Account email is required." }, 400);
    }

    const incomingIdempotencyKey = normalizeIdempotencyKey(request.headers.get("x-idempotency-key"));
    const idempotencyCacheKey = incomingIdempotencyKey
      ? `arch-review:${user.id}:${incomingIdempotencyKey}`
      : null;

    if (idempotencyCacheKey) {
      const cached = readIdempotencyEntry(idempotencyCacheKey);
      if (cached) {
        const cachedRequestId = typeof cached.body.requestId === "string" ? cached.body.requestId : requestId;
        return NextResponse.json(cached.body, {
          status: cached.status,
          headers: {
            ...responseHeaders(cachedRequestId),
            "X-Idempotent-Replay": "1",
          },
        });
      }
    }

    const limiter = consumeRateLimit({
      key: `arch-review:${user.id}:${getRequestFingerprint(request)}`,
      limit: ARCH_REVIEW_RATE_LIMIT,
      windowMs: ARCH_REVIEW_WINDOW_MS,
    });
    limiterContext = limiter;

    if (!limiter.allowed) {
      return jsonResponse(
        requestId,
        { error: "Too many architecture review requests. Please retry later." },
        429,
        limiter,
        {
          "Retry-After": String(limiter.retryAfterSeconds),
        },
      );
    }

    const { metadata, diagram } = await parsePayloadFromRequest(request);
    const extractedText =
      diagram.format === "png"
        ? await extractOcrTextFromPng(Buffer.from(diagram.bytes))
        : (diagram.svgEvidence?.text ?? "");

    const evidenceBundle = createEvidenceBundle({
      provider: metadata.provider,
      paragraph: metadata.paragraphInput,
      ocrText: extractedText,
      metadata: {
        diagramFormat: diagram.format,
        title: metadata.title,
        owner: metadata.owner,
        lastUpdated: metadata.lastUpdated,
        version: metadata.version,
        legend: metadata.legend,
        workloadCriticality: metadata.workloadCriticality,
        regulatoryScope: metadata.regulatoryScope,
        environment: metadata.environment,
        lifecycleStage: metadata.lifecycleStage,
        desiredEngagement: metadata.desiredEngagement,
      },
    });

    const finalizedReport = buildReviewReportFromEvidence({
      bundle: evidenceBundle,
      userEmail: user.email,
      quoteContext: {
        tokenCount: evidenceBundle.serviceTokens.length,
        ocrCharacterCount: evidenceBundle.ocrText.length,
        mode: "rules-only",
        workloadCriticality: metadata.workloadCriticality,
        desiredEngagement: metadata.desiredEngagement,
      },
    });

    const hasNonArchitectureFinding = finalizedReport.findings.some(
      (finding) => finding.ruleId === "INPUT-NOT-ARCH-DIAGRAM" && finding.pointsDeducted > 0,
    );
    if (hasNonArchitectureFinding) {
      const body = {
        error:
          "Uploaded diagram appears to be non-architecture content. No review email was sent. Upload a real architecture diagram.",
      } as const;
      if (idempotencyCacheKey) {
        writeIdempotencyEntry(idempotencyCacheKey, { status: 422, body: { ...body, requestId } });
      }
      return jsonResponse(requestId, body, 422, limiterContext);
    }

    const resolvedUserName = user.name?.trim() || user.email.split("@")[0] || "user";

    const latestAccount = await (async () => {
      try {
        return await db.account.findFirst({
          where: { userId: user.id },
          select: { provider: true },
          orderBy: { id: "desc" },
        });
      } catch (error) {
        if (!isSchemaDriftError(error)) {
          throw error;
        }

        return null;
      }
    })();

    const leadData = {
      userId: user.id,
      userEmail: user.email,
      userName: resolvedUserName,
      architectureProvider: finalizedReport.provider,
      authProvider: latestAccount?.provider ?? "credentials",
      overallScore: finalizedReport.overallScore,
      topIssues: summarizeTopIssues(finalizedReport.findings) || "none",
      inputParagraph: metadata.paragraphInput ?? null,
      reportJson: finalizedReport,
      workdriveUploadStatus: "pending",
    } as const;

    const leadSchemaReady = await ensureLeadLogSchemaReady();
    const createdLead = leadSchemaReady
      ? await (async () => {
          try {
            return await db.leadLog.create({
              data: leadData,
            });
          } catch (error) {
            if (!isSchemaDriftError(error)) {
              throw error;
            }

            return db.leadLog.create({
              data: {
                userId: leadData.userId,
                userEmail: leadData.userEmail,
                architectureProvider: leadData.architectureProvider,
                authProvider: leadData.authProvider,
                overallScore: leadData.overallScore,
                topIssues: leadData.topIssues,
              },
            });
          }
        })()
      : null;

    const archiveResult = await archiveArchitectureReviewToWorkDrive({
      diagramFileName: diagram.filename,
      diagramBytes: diagram.bytes,
      diagramMimeType: diagram.mimeType,
      report: finalizedReport,
      userName: resolvedUserName,
      paragraphInput: metadata.paragraphInput ?? "",
    });

    const workdriveStatus = archiveResult.error ? `${archiveResult.status}:${archiveResult.error}` : archiveResult.status;

    if (createdLead) {
      try {
        await db.leadLog.update({
          where: { id: createdLead.id },
          data: {
            workdriveDiagramFileId: archiveResult.diagramFileId,
            workdriveReportFileId: archiveResult.reportFileId,
            workdriveUploadStatus: workdriveStatus,
          },
        });
      } catch (error) {
        if (!isSchemaDriftError(error)) {
          throw error;
        }
      }
    }

    const emailContent = buildArchitectureReviewEmailContent(finalizedReport);
    const sendResult = await sendArchitectureReviewEmail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "tool.architecture_review_submit",
          metadataJson: {
            provider: finalizedReport.provider,
            score: finalizedReport.overallScore,
            findings: finalizedReport.findings.length,
            ocrCharacterCount: evidenceBundle.ocrText.length,
            emailStatus: sendResult.ok ? "sent" : "fallback",
            emailProvider: sendResult.provider,
            emailError: sendResult.error ?? null,
            workdriveStatus,
            requestId,
          },
        },
      });
    } catch (error) {
      if (!isSchemaDriftError(error)) {
        throw error;
      }
    }

    if (sendResult.ok) {
      const body = { status: "sent" } as const;
      if (idempotencyCacheKey) {
        writeIdempotencyEntry(idempotencyCacheKey, { status: 200, body: { ...body, requestId } });
      }
      return jsonResponse(requestId, body, 200, limiterContext);
    }

    const mailtoUrl = buildMailtoUrl({
      to: user.email,
      subject: emailContent.subject,
      body: emailContent.text,
    });

    const secret = emlSecret();
    if (!secret) {
      if (mailtoUrl) {
        const body = {
          status: "fallback",
          reason: "Email sending failed. Use the mailto draft fallback.",
          mailtoUrl,
        } as const;
        if (idempotencyCacheKey) {
          writeIdempotencyEntry(idempotencyCacheKey, { status: 200, body: { ...body, requestId } });
        }
        return jsonResponse(requestId, body, 200, limiterContext);
      }

      return jsonResponse(
        requestId,
        {
          error: "Email fallback is not configured. Set ARCH_REVIEW_EML_SECRET to enable .eml downloads.",
        },
        503,
        limiterContext,
      );
    }

    const emlDownloadToken = createEmlToken(
      {
        to: user.email,
        subject: emailContent.subject,
        body: emailContent.text,
      },
      secret,
    );

    const body = {
      status: "fallback",
      reason: sendResult.error ?? "Email delivery fallback triggered.",
      mailtoUrl,
      emlDownloadToken,
    } as const;
    if (idempotencyCacheKey) {
      writeIdempotencyEntry(idempotencyCacheKey, { status: 200, body: { ...body, requestId } });
    }
    return jsonResponse(requestId, body, 200, limiterContext);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonResponse(requestId, { error: "Unauthorized" }, 401, limiterContext);
    }

    if (error instanceof Error && (error.message === "INVALID_DIAGRAM_FILE" || error.message === "INVALID_SVG_FILE")) {
      return jsonResponse(requestId, { error: "Invalid diagram file. Upload a safe PNG or SVG." }, 400, limiterContext);
    }

    if (error instanceof Error && error.message === "DIAGRAM_FORMAT_MISMATCH") {
      return jsonResponse(
        requestId,
        { error: "Diagram metadata format does not match the uploaded file type." },
        400,
        limiterContext,
      );
    }

    if (error instanceof Error && error.message === "DIAGRAM_TOO_LARGE") {
      return jsonResponse(
        requestId,
        { error: `Diagram too large. Max allowed is ${ARCHITECTURE_REVIEW_MAX_MB}MB.` },
        413,
        limiterContext,
      );
    }

    if (error instanceof Error && error.message === "INVALID_PAYLOAD") {
      return jsonResponse(requestId, { error: "Invalid review payload." }, 400, limiterContext);
    }

    if (isOcrTimeoutError(error)) {
      return jsonResponse(
        requestId,
        { error: "OCR timed out while processing the diagram. Retry with a clearer or smaller PNG." },
        504,
        limiterContext,
      );
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(requestId, { error: "Invalid review payload." }, 400, limiterContext);
    }

    if (error instanceof z.ZodError) {
      return jsonResponse(requestId, { error: "Invalid review payload." }, 400, limiterContext);
    }

    console.error("submit-architecture-review unhandled error", { requestId, error });
    return jsonResponse(requestId, { error: "Unable to submit architecture review." }, 500, limiterContext);
  }
}
