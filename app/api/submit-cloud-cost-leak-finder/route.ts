import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { sendToolResultEmail } from "@/lib/architecture-review/sender";
import {
  selectCloudCostLeakFinderFollowUpQuestions,
  validateCloudCostLeakFinderFollowUpAnswers,
} from "@/lib/cloud-cost-leak-finder/adaptive";
import { buildCloudCostLeakFinderEmailContent } from "@/lib/cloud-cost-leak-finder/email";
import { buildCloudCostLeakFinderReport } from "@/lib/cloud-cost-leak-finder/engine";
import {
  isAllowedCloudCostBusinessEmail,
  narrativeValidationMessage,
  normalizeCloudCostWebsite,
} from "@/lib/cloud-cost-leak-finder/input";
import { extractCloudCostSignals } from "@/lib/cloud-cost-leak-finder/signal-extractor";
import {
  cloudCostLeakFinderAnswersSchema,
  cloudCostLeakFinderSubmissionResponseSchema,
  type FollowUpQuestionId,
  type CloudCostLeakFinderSubmissionResponse,
} from "@/lib/cloud-cost-leak-finder/types";
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

const RATE_LIMIT = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function jsonResponse(body: CloudCostLeakFinderSubmissionResponse, requestId: string, status = 200) {
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
      key: `cloud-cost-leak-finder:${getRequestFingerprint(request)}`,
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
    const parsed = cloudCostLeakFinderAnswersSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonResponse({ error: "Please complete the required fields and try again." }, requestId, 400);
    }

    const consent = normalizeToolConsent(parsed.data);
    const answers = {
      ...parsed.data,
      ...consent,
      email: parsed.data.email.trim().toLowerCase(),
      website: normalizeCloudCostWebsite(parsed.data.website),
      narrativeInput: parsed.data.narrativeInput.trim(),
      billingSummaryInput: parsed.data.billingSummaryInput?.trim() ?? "",
    };

    if (!isAllowedCloudCostBusinessEmail(answers.email)) {
      return jsonResponse(
        { error: "Personal email domains are not allowed. Use your business email." },
        requestId,
        400,
      );
    }

    const access = await requireVerifiedFreeToolAccess({
      toolName: "Cloud Cost Leak Finder",
      submittedEmail: answers.email,
    });

    answers.email = access.email;

    const narrativeError = narrativeValidationMessage(answers.narrativeInput);
    if (narrativeError) {
      return jsonResponse({ error: narrativeError }, requestId, 400);
    }

    const extractedSignals = extractCloudCostSignals(answers);
    const adaptiveQuestions = selectCloudCostLeakFinderFollowUpQuestions(extractedSignals);
    const adaptiveAnswers = Object.fromEntries(
      adaptiveQuestions
        .map((question) => [question.id, answers.adaptiveAnswers[question.id]])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    ) as Partial<Record<FollowUpQuestionId, string>>;
    const followUpError = validateCloudCostLeakFinderFollowUpAnswers(adaptiveQuestions, adaptiveAnswers);
    if (followUpError) {
      return jsonResponse({ error: followUpError }, requestId, 400);
    }

    const normalizedAnswers = {
      ...answers,
      adaptiveAnswers,
    };

    const report = buildCloudCostLeakFinderReport(normalizedAnswers);
    const lead = await upsertLead({
      userId: access.user.id,
      email: normalizedAnswers.email,
      name: normalizedAnswers.fullName,
      companyName: normalizedAnswers.companyName,
    });

    const zohoDescription = [
      `Verdict: ${report.verdictHeadline}`,
      `MonthlySavings: ${report.savingsEstimate.estimatedMonthlySavingsRange}`,
      `WasteRisk: ${report.scores.wasteRiskScore}/100`,
      `FinOpsMaturity: ${report.scores.finopsMaturityScore}/100`,
      `PrimaryCloud: ${normalizedAnswers.primaryCloud}`,
      `SecondaryCloud: ${normalizedAnswers.secondaryCloud ?? "none"}`,
      `Estimate: ${report.quote.engagementType}`,
      `EstimateRange: ${report.quote.quoteLow}-${report.quote.quoteHigh}`,
      `Categories: ${report.likelyWasteCategories.join(",")}`,
    ]
      .filter(Boolean)
      .join("; ");

    const zohoResult = consent.allowCrmFollowUp
      ? await upsertZohoLead({
          email: normalizedAnswers.email,
          fullName: normalizedAnswers.fullName,
          companyName: normalizedAnswers.companyName,
          website: normalizedAnswers.website,
          roleTitle: normalizedAnswers.roleTitle,
          leadSource: "ZoKorp Cloud Cost Leak Finder",
          description: zohoDescription,
        })
      : { status: "skipped", error: null };

    const emailContent = buildCloudCostLeakFinderEmailContent({
      answers: normalizedAnswers,
      report,
    });
    const sendResult = await sendToolResultEmail({
      to: normalizedAnswers.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (consent.saveForFollowUp) {
      try {
        await archiveToolSubmission({
          leadId: lead.id,
          userId: access.user.id,
          toolName: "cloud-cost",
          payload: {
            answers: normalizedAnswers,
            report,
            consent,
            archivedAtISO: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("submit-cloud-cost-leak-finder archive failed", { requestId, error });
      }
    }

    await recordLeadEvent({
      leadId: lead.id,
      userId: access.user.id,
      aggregate: {
        source: "cloud-cost",
        deliveryState: sendResult.ok ? "sent" : "fallback",
        crmSyncState: deriveCrmSyncState(zohoResult),
        saveForFollowUp: consent.saveForFollowUp,
        allowCrmFollowUp: consent.allowCrmFollowUp,
        scoreBand: scoreBandForScore(report.scores.wasteRiskScore),
        estimateBand: estimateBandForRange(report.quote.quoteLow, report.quote.quoteHigh),
        recommendedEngagement: report.quote.engagementType,
        sourceRecordKey: `cloud-cost:${requestId}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: access.user.id,
        action: "tool.cloud_cost_leak_finder_submit",
        metadataJson: {
          email: normalizedAnswers.email,
          companyName: normalizedAnswers.companyName,
          primaryCloud: normalizedAnswers.primaryCloud,
          verdictClass: report.verdictClass,
          recommendedEngagement: report.quote.engagementType,
          wasteRiskScore: report.scores.wasteRiskScore,
          savingsRange: report.savingsEstimate.estimatedMonthlySavingsRange,
          emailStatus: sendResult.ok ? "sent" : "fallback",
          crmSyncStatus: deriveCrmSyncState(zohoResult),
          saveForFollowUp: consent.saveForFollowUp,
          allowCrmFollowUp: consent.allowCrmFollowUp,
          requestId,
        },
      },
    });

    const responseBody = cloudCostLeakFinderSubmissionResponseSchema.parse({
      status: sendResult.ok ? "sent" : "fallback",
      verdictHeadline: report.verdictHeadline,
      savingsRangeLine:
        report.scores.savingsConfidenceScore >= 45
          ? `Likely savings range: ${report.savingsEstimate.estimatedMonthlySavingsRange} per month`
          : undefined,
      reason: sendResult.ok ? undefined : "Automated email delivery was unavailable. Please retry shortly.",
    });

    return jsonResponse(responseBody, requestId, 200);
  } catch (error) {
    if (isFreeToolAccessError(error)) {
      return jsonResponse({ error: error.message }, requestId, error.status);
    }

    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Invalid submission payload." }, requestId, 400);
    }

    console.error("submit-cloud-cost-leak-finder failed", { requestId, error });
    return jsonResponse({ error: "Unable to submit the cost review right now." }, requestId, 500);
  }
}
