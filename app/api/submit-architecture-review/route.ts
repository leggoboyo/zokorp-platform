import { NextResponse } from "next/server";
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
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { maxUploadBytes } from "@/lib/security";
import { archiveArchitectureReviewToWorkDrive } from "@/lib/zoho-workdrive";

export const runtime = "nodejs";

const ARCHITECTURE_REVIEW_MAX_MB = Number(process.env.ARCHITECTURE_REVIEW_UPLOAD_MAX_MB ?? "8");

type ParsedDiagram = {
  filename: string;
  bytes: Uint8Array;
  format: "png" | "svg";
  mimeType: "image/png" | "image/svg+xml";
  svgEvidence: { text: string; dimensions: { width: number; height: number } | null } | null;
};

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
  const reportRaw = formData.get("report");

  if ((reportRaw !== null && typeof reportRaw !== "string") || typeof metadataRaw !== "string" || !(diagramRaw instanceof File)) {
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
  try {
    const user = await requireUser();
    if (!user.email) {
      return NextResponse.json({ error: "Account email is required." }, { status: 400 });
    }

    const limiter = consumeRateLimit({
      key: `arch-review:${user.id}:${getRequestFingerprint(request)}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many architecture review requests. Please retry later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSeconds),
          },
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
      return NextResponse.json(
        {
          error:
            "Uploaded diagram appears to be non-architecture content. No review email was sent. Upload a real architecture diagram.",
        },
        { status: 422 },
      );
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
          },
        },
      });
    } catch (error) {
      if (!isSchemaDriftError(error)) {
        throw error;
      }
    }

    if (sendResult.ok) {
      return NextResponse.json({
        status: "sent",
      });
    }

    const mailtoUrl = buildMailtoUrl({
      to: user.email,
      subject: emailContent.subject,
      body: emailContent.text,
    });

    const secret = emlSecret();
    if (!secret) {
      if (mailtoUrl) {
        return NextResponse.json({
          status: "fallback",
          reason: "Email sending failed. Use the mailto draft fallback.",
          mailtoUrl,
        });
      }

      return NextResponse.json(
        {
          error: "Email fallback is not configured. Set ARCH_REVIEW_EML_SECRET to enable .eml downloads.",
        },
        { status: 503 },
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

    return NextResponse.json({
      status: "fallback",
      reason: sendResult.error ?? "Email delivery fallback triggered.",
      mailtoUrl,
      emlDownloadToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && (error.message === "INVALID_DIAGRAM_FILE" || error.message === "INVALID_SVG_FILE")) {
      return NextResponse.json({ error: "Invalid diagram file. Upload a safe PNG or SVG." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "DIAGRAM_TOO_LARGE") {
      return NextResponse.json(
        { error: `Diagram too large. Max allowed is ${ARCHITECTURE_REVIEW_MAX_MB}MB.` },
        { status: 413 },
      );
    }

    if (error instanceof Error && error.message === "INVALID_PAYLOAD") {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }

    if (isOcrTimeoutError(error)) {
      return NextResponse.json(
        { error: "OCR timed out while processing the diagram. Retry with a clearer or smaller PNG." },
        { status: 504 },
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Unable to submit architecture review." }, { status: 500 });
  }
}