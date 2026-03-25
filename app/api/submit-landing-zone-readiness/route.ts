import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { sendToolResultEmail } from "@/lib/architecture-review/sender";
import { db } from "@/lib/db";
import { isFreeToolAccessError, requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import { buildLandingZoneReadinessEmailContent } from "@/lib/landing-zone-readiness/email";
import { buildLandingZoneReadinessReport } from "@/lib/landing-zone-readiness/engine";
import { isAllowedLandingZoneBusinessEmail, normalizeLandingZoneWebsite } from "@/lib/landing-zone-readiness/input";
import {
  type LandingZoneReadinessSubmissionResponse,
  landingZoneReadinessAnswersSchema,
} from "@/lib/landing-zone-readiness/types";
import {
  archiveToolSubmission,
  findRecentSubmissionFingerprint,
  hashSubmissionFingerprint,
  recordLeadEvent,
  rememberSubmissionFingerprint,
  upsertLead,
} from "@/lib/privacy-leads";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/request-origin";
import {
  estimateBandForRange,
  normalizeToolConsent,
  scoreBandForScore,
} from "@/lib/tool-consent";
import { upsertZohoLead } from "@/lib/zoho-crm";

export const runtime = "nodejs";

const FINGERPRINT_RATE_LIMIT = 8;
const FINGERPRINT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_RATE_LIMIT = 4;
const EMAIL_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUEST_BODY_CHARS = 32_000;
const JSON_CONTENT_TYPE = "application/json";
const INVALID_CONTENT_TYPE = "INVALID_CONTENT_TYPE";
const INVALID_PAYLOAD = "INVALID_PAYLOAD";
const PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE";

function jsonResponse(body: LandingZoneReadinessSubmissionResponse, requestId: string, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}

function contentTypeIsJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes(JSON_CONTENT_TYPE);
}

async function parseRequestBody(request: Request) {
  if (!contentTypeIsJson(request)) {
    throw new Error(INVALID_CONTENT_TYPE);
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    throw new Error(INVALID_PAYLOAD);
  }

  if (rawBody.length > MAX_REQUEST_BODY_CHARS) {
    throw new Error(PAYLOAD_TOO_LARGE);
  }

  return JSON.parse(rawBody) as unknown;
}

function deriveCrmSyncState(result: { status: string }) {
  if (result.status === "success" || result.status === "duplicate") {
    return "synced" as const;
  }

  if (result.status === "not_configured") {
    return "not_configured" as const;
  }

  if (result.status === "skipped") {
    return "skipped" as const;
  }

  return "failed" as const;
}

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse) {
      return crossSiteResponse;
    }

    const limiter = await consumeRateLimit({
      key: `landing-zone-readiness:${getRequestFingerprint(request)}`,
      limit: FINGERPRINT_RATE_LIMIT,
      windowMs: FINGERPRINT_RATE_LIMIT_WINDOW_MS,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSeconds),
            "X-Request-Id": requestId,
          },
        },
      );
    }

    const rawBody = await parseRequestBody(request);
    const parsed = landingZoneReadinessAnswersSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonResponse({ error: "Please complete the required fields and try again." }, requestId, 400);
    }

    const consent = normalizeToolConsent(parsed.data);
    const answers = {
      ...parsed.data,
      ...consent,
      email: parsed.data.email.trim().toLowerCase(),
      website: normalizeLandingZoneWebsite(parsed.data.website),
      biggestChallenge: parsed.data.biggestChallenge?.trim() ?? "",
    };

    if (!isAllowedLandingZoneBusinessEmail(answers.email)) {
      return jsonResponse(
        { error: "Personal email domains are not allowed. Use your business email." },
        requestId,
        400,
      );
    }

    const access = await requireVerifiedFreeToolAccess({
      toolName: "Landing Zone Readiness Checker",
      submittedEmail: answers.email,
    });

    answers.email = access.email;

    const emailLimiter = await consumeRateLimit({
      key: `landing-zone-readiness-email:${answers.email}`,
      limit: EMAIL_RATE_LIMIT,
      windowMs: EMAIL_RATE_LIMIT_WINDOW_MS,
    });

    if (!emailLimiter.allowed) {
      return NextResponse.json(
        { error: "Too many submissions were sent for this email. Please wait and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailLimiter.retryAfterSeconds),
            "X-Request-Id": requestId,
          },
        },
      );
    }

    const report = buildLandingZoneReadinessReport(answers);
    const fingerprintHash = hashSubmissionFingerprint({
      toolName: "landing-zone",
      email: answers.email,
      payload: answers,
    });
    const recentFingerprint = await findRecentSubmissionFingerprint({
      toolName: "landing-zone",
      fingerprintHash,
    });

    if (recentFingerprint) {
      const priorEvent =
        recentFingerprint.leadId
          ? await db.leadEvent.findFirst({
              where: {
                leadId: recentFingerprint.leadId,
                source: "landing-zone",
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                deliveryState: true,
              },
            })
          : null;

      if (priorEvent?.deliveryState === "sent") {
        return jsonResponse(
          {
            status: "sent",
            overallScore: report.overallScore,
            maturityBand: report.maturityBand,
            quoteTier: report.quote.quoteTier,
          },
          requestId,
          200,
        );
      }

      return jsonResponse(
        {
          status: "fallback",
          overallScore: report.overallScore,
          maturityBand: report.maturityBand,
          quoteTier: report.quote.quoteTier,
          reason: "A recent matching submission already exists. Please check your email before retrying.",
        },
        requestId,
        200,
      );
    }

    const lead = await upsertLead({
      userId: access.user.id,
      email: answers.email,
      name: answers.fullName,
      companyName: answers.companyName,
    });

    const zohoDescription = [
      `Score: ${report.overallScore}/100`,
      `Maturity: ${report.maturityBand}`,
      `PrimaryCloud: ${answers.primaryCloud}`,
      `SecondaryCloud: ${answers.secondaryCloud ?? "none"}`,
      `Estimate: ${report.quote.quoteTier}`,
      `EstimateRange: ${report.quote.quoteLow}-${report.quote.quoteHigh}`,
      `EstimatedDays: ${report.quote.estimatedDaysLow}-${report.quote.estimatedDaysHigh}`,
      `Summary: ${report.summaryLine}`,
      answers.biggestChallenge ? `Challenge: ${answers.biggestChallenge}` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const zohoResult = consent.allowCrmFollowUp
      ? await upsertZohoLead({
          email: answers.email,
          fullName: answers.fullName,
          companyName: answers.companyName,
          website: answers.website,
          roleTitle: answers.roleTitle,
          leadSource: "ZoKorp Landing Zone Checker",
          description: zohoDescription,
        })
      : { status: "skipped", error: null };

    const emailContent = buildLandingZoneReadinessEmailContent({ answers, report });
    const sendResult = await sendToolResultEmail({
      to: answers.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (consent.saveForFollowUp) {
      try {
        await archiveToolSubmission({
          leadId: lead.id,
          userId: access.user.id,
          toolName: "landing-zone",
          payload: {
            answers,
            report,
            consent,
            archivedAtISO: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("submit-landing-zone-readiness archive failed", { requestId, error });
      }
    }

    await recordLeadEvent({
      leadId: lead.id,
      userId: access.user.id,
      aggregate: {
        source: "landing-zone",
        deliveryState: sendResult.ok ? "sent" : "fallback",
        crmSyncState: deriveCrmSyncState(zohoResult),
        saveForFollowUp: consent.saveForFollowUp,
        allowCrmFollowUp: consent.allowCrmFollowUp,
        scoreBand: scoreBandForScore(report.overallScore),
        estimateBand: estimateBandForRange(report.quote.quoteLow, report.quote.quoteHigh),
        recommendedEngagement: report.quote.quoteTier,
        sourceRecordKey: `landing-zone:${requestId}`,
      },
    });

    await rememberSubmissionFingerprint({
      leadId: lead.id,
      userId: access.user.id,
      toolName: "landing-zone",
      fingerprintHash,
    });

    await db.auditLog.create({
      data: {
        userId: access.user.id,
        action: "tool.landing_zone_readiness_submit",
        metadataJson: {
          email: answers.email,
          primaryCloud: answers.primaryCloud,
          secondaryCloud: answers.secondaryCloud ?? null,
          companyName: answers.companyName,
          score: report.overallScore,
          maturityBand: report.maturityBand,
          recommendedEngagement: report.quote.quoteTier,
          emailStatus: sendResult.ok ? "sent" : "fallback",
          crmSyncStatus: deriveCrmSyncState(zohoResult),
          saveForFollowUp: consent.saveForFollowUp,
          allowCrmFollowUp: consent.allowCrmFollowUp,
          requestId,
        },
      },
    });

    if (!sendResult.ok) {
      return jsonResponse(
        {
          status: "fallback",
          overallScore: report.overallScore,
          maturityBand: report.maturityBand,
          quoteTier: report.quote.quoteTier,
          reason: "Automated email delivery was unavailable. Please retry shortly.",
        },
        requestId,
        200,
      );
    }

    return jsonResponse(
      {
        status: "sent",
        overallScore: report.overallScore,
        maturityBand: report.maturityBand,
        quoteTier: report.quote.quoteTier,
      },
      requestId,
      200,
    );
  } catch (error) {
    if (isFreeToolAccessError(error)) {
      return jsonResponse({ error: error.message }, requestId, error.status);
    }

    if (error instanceof Error && error.message === INVALID_CONTENT_TYPE) {
      return jsonResponse({ error: "Submissions must be sent as JSON." }, requestId, 415);
    }

    if (error instanceof Error && error.message === PAYLOAD_TOO_LARGE) {
      return jsonResponse({ error: "Submission payload is too large." }, requestId, 413);
    }

    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Invalid submission payload." }, requestId, 400);
    }

    if (error instanceof Error && error.message === INVALID_PAYLOAD) {
      return jsonResponse({ error: "Invalid submission payload." }, requestId, 400);
    }

    console.error("submit-landing-zone-readiness failed", { requestId, error });
    return jsonResponse({ error: "Unable to submit the readiness check right now." }, requestId, 500);
  }
}
