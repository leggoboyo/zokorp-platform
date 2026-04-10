import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  buildArchitecturePrivacyInteractionEventId,
  buildArchitecturePrivacySourceRecordKey,
  ensureArchitecturePrivacyFingerprint,
  ensureArchitectureReviewLead,
} from "@/lib/architecture-review/privacy-context";
import { resolveArchitectureReviewScope, reviewScopeLabel } from "@/lib/architecture-review/scope";
import { architectureReviewPrivacyTelemetrySchema } from "@/lib/architecture-review/types";
import { db } from "@/lib/db";
import { isFreeToolAccessError, requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import { jsonNoStore } from "@/lib/internal-route";
import { ensureLeadInteraction, recordLeadEvent } from "@/lib/privacy-leads";
import { requireSameOrigin } from "@/lib/request-origin";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { getEmailDomain } from "@/lib/security";
import { recordArchitectureReviewToolRun } from "@/lib/tool-runs";

export const runtime = "nodejs";

const ARCH_REVIEW_RATE_LIMIT = 8;
const ARCH_REVIEW_WINDOW_MS = 60 * 60 * 1000;
const ARCH_REVIEW_DAILY_LIMIT = Number(process.env.ARCH_REVIEW_DAILY_LIMIT ?? "24");
const ARCH_REVIEW_DOMAIN_LIMIT = 1;
const ARCH_REVIEW_DOMAIN_WINDOW_MS = 24 * 60 * 60 * 1000;

type ToolRunCountDelegate = {
  count: (args: { where: Record<string, unknown> }) => Promise<number>;
};

async function exceedsDailyLimit(userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [jobCount, privacyRunCount] = await Promise.all([
    db.architectureReviewJob.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    }),
    (async () => {
      const delegate = (db as unknown as { toolRun?: ToolRunCountDelegate }).toolRun;
      if (!delegate?.count) {
        return 0;
      }

      return delegate.count({
        where: {
          userId,
          toolSlug: "architecture-diagram-reviewer",
          sourceType: "privacy",
          createdAt: { gte: since },
        },
      });
    })(),
  ]);

  return jobCount + privacyRunCount >= Math.max(1, ARCH_REVIEW_DAILY_LIMIT);
}

async function recordPrivacyTelemetryAudit(input: {
  userId: string;
  requestId: string;
  toolRunId: string | null;
  dedupedLeadFingerprint: boolean;
  scoreBand: string;
  emailDeliveryRequested: boolean;
  sourceRecordKey: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: "tool.architecture_review_privacy_run",
        metadataJson: {
          requestId: input.requestId,
          toolRunId: input.toolRunId,
          dedupedLeadFingerprint: input.dedupedLeadFingerprint,
          scoreBand: input.scoreBand,
          emailDeliveryRequested: input.emailDeliveryRequested,
          sourceRecordKey: input.sourceRecordKey,
        },
      },
    });
  } catch (error) {
    console.error("Failed to persist privacy telemetry audit log", {
      requestId: input.requestId,
      error,
    });
  }
}

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse) {
      crossSiteResponse.headers.set("Cache-Control", "no-store");
      crossSiteResponse.headers.set("X-Request-Id", requestId);
      return crossSiteResponse;
    }

    const access = await requireVerifiedFreeToolAccess({
      toolName: "Architecture Diagram Reviewer",
    });
    const user = access.user;
    const emailDomain = getEmailDomain(access.email);

    if (emailDomain) {
      const domainLimiter = await consumeRateLimit({
        key: `arch-review-domain:${emailDomain}`,
        limit: ARCH_REVIEW_DOMAIN_LIMIT,
        windowMs: ARCH_REVIEW_DOMAIN_WINDOW_MS,
      });

      if (!domainLimiter.allowed) {
        return jsonNoStore(
          {
            error: "This business domain has already used its free architecture review for the current 24-hour window.",
            requestId,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(domainLimiter.retryAfterSeconds),
              "X-Request-Id": requestId,
            },
          },
        );
      }
    }

    const limiter = await consumeRateLimit({
      key: `arch-review-privacy:${user.id}:${getRequestFingerprint(request)}`,
      limit: ARCH_REVIEW_RATE_LIMIT,
      windowMs: ARCH_REVIEW_WINDOW_MS,
    });

    if (!limiter.allowed) {
      return jsonNoStore(
        { error: "Too many privacy-mode architecture review requests. Please retry later.", requestId },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSeconds),
            "X-Request-Id": requestId,
          },
        },
      );
    }

    if (await exceedsDailyLimit(user.id)) {
      return jsonNoStore(
        {
          error: `Daily review limit reached (${ARCH_REVIEW_DAILY_LIMIT}/day). Please retry tomorrow.`,
          requestId,
        },
        {
          status: 429,
          headers: {
            "X-Request-Id": requestId,
          },
        },
      );
    }

    const payload = architectureReviewPrivacyTelemetrySchema.parse(await request.json());
    const reviewScope = resolveArchitectureReviewScope({
      provider: payload.provider,
      additionalProviders: payload.additionalProviders,
      additionalPlatforms: payload.additionalPlatforms,
    });
    const lead = await ensureArchitectureReviewLead({
      userId: user.id,
      email: access.email,
      name: user.name,
    });
    const { fingerprint, deduped } = await ensureArchitecturePrivacyFingerprint({
      leadId: lead.id,
      userId: user.id,
      fingerprintHash: payload.submissionFingerprintHash,
    });
    const sourceRecordKey = buildArchitecturePrivacySourceRecordKey(fingerprint.id);

    await recordLeadEvent({
      leadId: lead.id,
      userId: user.id,
      aggregate: {
        source: "architecture-review",
        deliveryState: payload.emailDeliveryRequested ? "pending" : "sent",
        crmSyncState: "skipped",
        saveForFollowUp: false,
        allowCrmFollowUp: false,
        scoreBand: payload.scoreBand,
        estimateBand: null,
        recommendedEngagement: null,
        sourceRecordKey,
      },
    });

    await ensureLeadInteraction({
      leadId: lead.id,
      userId: user.id,
      source: "architecture-review",
      action: "run_completed",
      externalEventId: buildArchitecturePrivacyInteractionEventId({
        fingerprintId: fingerprint.id,
        action: "run_completed",
      }),
    });

    if (payload.emailDeliveryRequested) {
      await ensureLeadInteraction({
        leadId: lead.id,
        userId: user.id,
        source: "architecture-review",
        action: "delivery_requested",
        externalEventId: buildArchitecturePrivacyInteractionEventId({
          fingerprintId: fingerprint.id,
          action: "delivery_requested",
        }),
      });
    }

    const toolRun = await recordArchitectureReviewToolRun({
      userId: user.id,
      summary: `Privacy-mode architecture review · score band ${payload.scoreBand}`,
      sourceType: "privacy",
      sourceName: reviewScopeLabel(reviewScope),
      deliveryStatus: payload.emailDeliveryRequested ? "local-email-pending" : "local-only",
      metadata: {
        executionMode: "privacy",
        sourceRecordKey,
        fingerprintId: fingerprint.id,
        submissionFingerprintHash: payload.submissionFingerprintHash,
        scoreBand: payload.scoreBand,
        emailDeliveryRequested: payload.emailDeliveryRequested,
        provider: payload.provider,
        additionalProviders: payload.additionalProviders,
        additionalPlatforms: payload.additionalPlatforms,
      },
    });

    await recordPrivacyTelemetryAudit({
      userId: user.id,
      requestId,
      toolRunId: toolRun?.id ?? null,
      dedupedLeadFingerprint: deduped,
      scoreBand: payload.scoreBand,
      emailDeliveryRequested: payload.emailDeliveryRequested,
      sourceRecordKey,
    });

    return jsonNoStore(
      {
        ok: true,
        requestId,
        toolRunId: toolRun?.id ?? null,
        dedupedLeadFingerprint: deduped,
      },
      {
        headers: {
          "X-Request-Id": requestId,
        },
      },
    );
  } catch (error) {
    if (isFreeToolAccessError(error)) {
      return jsonNoStore(
        {
          error: error.message,
          requestId,
        },
        {
          status: error.status,
          headers: {
            "X-Request-Id": requestId,
          },
        },
      );
    }

    console.error("architecture-review privacy telemetry failed", { requestId, error });
    return NextResponse.json(
      {
        error: "Unable to record privacy-mode telemetry.",
        requestId,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
        },
      },
    );
  }
}
