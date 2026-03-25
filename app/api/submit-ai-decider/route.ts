import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { sendToolResultEmail } from "@/lib/architecture-review/sender";
import { buildAiDeciderEmailContent } from "@/lib/ai-decider/email";
import { buildAiDeciderReport } from "@/lib/ai-decider/engine";
import { isAllowedAiDeciderBusinessEmail, normalizeAiDeciderWebsite } from "@/lib/ai-decider/input";
import { buildAiDeciderQuestions, validateAiDeciderAnswers } from "@/lib/ai-decider/questions";
import { extractAiDeciderSignals } from "@/lib/ai-decider/signals";
import {
  aiDeciderSubmissionRequestSchema,
  type AiDeciderSubmissionResponse,
} from "@/lib/ai-decider/types";
import { db } from "@/lib/db";
import { isFreeToolAccessError, requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import {
  archiveToolSubmission,
  recordLeadEvent,
  upsertLead,
} from "@/lib/privacy-leads";
import { requireSameOrigin } from "@/lib/request-origin";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import {
  estimateBandForRange,
  normalizeToolConsent,
  scoreBandForScore,
} from "@/lib/tool-consent";
import { upsertZohoLead } from "@/lib/zoho-crm";

export const runtime = "nodejs";

const RATE_LIMIT = 6;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function jsonResponse(body: AiDeciderSubmissionResponse, requestId: string, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
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
      key: `ai-decider:${getRequestFingerprint(request)}`,
      limit: RATE_LIMIT,
      windowMs: RATE_LIMIT_WINDOW_MS,
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

    const rawBody = await request.json();
    const parsed = aiDeciderSubmissionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonResponse({ error: "Please complete the required fields and try again." }, requestId, 400);
    }

    const consent = normalizeToolConsent(parsed.data);
    const submission = {
      ...parsed.data,
      ...consent,
      email: parsed.data.email.trim().toLowerCase(),
      website: normalizeAiDeciderWebsite(parsed.data.website ?? ""),
      narrativeInput: parsed.data.narrativeInput.trim(),
    };

    if (!isAllowedAiDeciderBusinessEmail(submission.email)) {
      return jsonResponse(
        { error: "Personal email domains are not allowed. Use your business email." },
        requestId,
        400,
      );
    }

    const access = await requireVerifiedFreeToolAccess({
      toolName: "AI Decider",
      submittedEmail: submission.email,
    });

    submission.email = access.email;

    const signals = extractAiDeciderSignals(submission.narrativeInput);
    const questions = buildAiDeciderQuestions(signals);
    const answerValidation = validateAiDeciderAnswers(questions, submission.answers);
    if (!answerValidation.ok) {
      return jsonResponse({ error: answerValidation.error }, requestId, 400);
    }

    const report = buildAiDeciderReport({
      lead: submission,
      answers: submission.answers,
    });

    const lead = await upsertLead({
      userId: access.user.id,
      email: submission.email,
      name: submission.fullName,
      companyName: submission.companyName,
    });

    const zohoDescription = [
      `Verdict: ${report.verdictLine}`,
      `Recommendation: ${report.recommendation}`,
      `AI fit: ${report.scores.aiFitScore}/100`,
      `Automation fit: ${report.scores.automationFitScore}/100`,
      `Data readiness: ${report.scores.dataReadinessScore}/100`,
      `Implementation risk: ${report.scores.implementationRiskScore}/100`,
      `Estimate: ${report.quote.engagementType} ${report.quote.priceLow}-${report.quote.priceHigh}`,
    ].join("; ");

    const zohoResult = consent.allowCrmFollowUp
      ? await upsertZohoLead({
          email: submission.email,
          fullName: submission.fullName,
          companyName: submission.companyName,
          website: submission.website || undefined,
          roleTitle: submission.roleTitle,
          leadSource: "ZoKorp AI Decider",
          description: zohoDescription,
        })
      : { status: "skipped", error: null };

    const emailContent = buildAiDeciderEmailContent({
      lead: submission,
      report,
    });
    const sendResult = await sendToolResultEmail({
      to: submission.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (consent.saveForFollowUp) {
      try {
        await archiveToolSubmission({
          leadId: lead.id,
          userId: access.user.id,
          toolName: "ai-decider",
          payload: {
            lead: {
              email: submission.email,
              fullName: submission.fullName,
              companyName: submission.companyName,
              roleTitle: submission.roleTitle,
              website: submission.website || null,
            },
            narrativeInput: submission.narrativeInput,
            answers: submission.answers,
            report,
            consent,
            archivedAtISO: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("submit-ai-decider archive failed", { requestId, error });
      }
    }

    await recordLeadEvent({
      leadId: lead.id,
      userId: access.user.id,
      aggregate: {
        source: "ai-decider",
        deliveryState: sendResult.ok ? "sent" : "fallback",
        crmSyncState: deriveCrmSyncState(zohoResult),
        saveForFollowUp: consent.saveForFollowUp,
        allowCrmFollowUp: consent.allowCrmFollowUp,
        scoreBand: scoreBandForScore(report.scores.aiFitScore),
        estimateBand: estimateBandForRange(report.quote.priceLow, report.quote.priceHigh),
        recommendedEngagement: report.quote.engagementType,
        sourceRecordKey: `ai-decider:${requestId}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: access.user.id,
        action: "tool.ai_decider_submit",
        metadataJson: {
          email: submission.email,
          companyName: submission.companyName,
          recommendation: report.recommendation,
          verdictLine: report.verdictLine,
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
          verdictLine: report.verdictLine,
          recommendation: report.recommendation,
          reason: "Automated email delivery was unavailable. Please retry shortly.",
        },
        requestId,
        200,
      );
    }

    return jsonResponse(
      {
        status: "sent",
        verdictLine: report.verdictLine,
        recommendation: report.recommendation,
      },
      requestId,
      200,
    );
  } catch (error) {
    if (isFreeToolAccessError(error)) {
      return jsonResponse({ error: error.message }, requestId, error.status);
    }

    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Invalid submission payload." }, requestId, 400);
    }

    console.error("submit-ai-decider failed", { requestId, error });
    return jsonResponse({ error: "Unable to submit AI Decider right now." }, requestId, 500);
  }
}
