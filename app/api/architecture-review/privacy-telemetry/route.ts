import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  buildArchitecturePrivacySourceRecordKey,
  ensureArchitecturePrivacyFingerprint,
  ensureArchitectureReviewLead,
} from "@/lib/architecture-review/privacy-context";
import { architectureReviewPrivacyTelemetrySchema } from "@/lib/architecture-review/types";
import { db } from "@/lib/db";
import { isFreeToolAccessError, requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import { jsonNoStore } from "@/lib/internal-route";
import { recordLeadEvent } from "@/lib/privacy-leads";
import { requireSameOrigin } from "@/lib/request-origin";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { recordArchitectureReviewToolRun } from "@/lib/tool-runs";

export const runtime = "nodejs";

const ARCH_REVIEW_RATE_LIMIT = 8;
const ARCH_REVIEW_WINDOW_MS = 60 * 60 * 1000;
const ARCH_REVIEW_DAILY_LIMIT = Number(process.env.ARCH_REVIEW_DAILY_LIMIT ?? "24");

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

    const toolRun = await recordArchitectureReviewToolRun({
      userId: user.id,
      summary: `Privacy-mode architecture review · score band ${payload.scoreBand}`,
      sourceType: "privacy",
      sourceName: "AWS",
      deliveryStatus: payload.emailDeliveryRequested ? "local-email-pending" : "local-only",
      metadata: {
        executionMode: "privacy",
        sourceRecordKey,
        fingerprintId: fingerprint.id,
        submissionFingerprintHash: payload.submissionFingerprintHash,
        scoreBand: payload.scoreBand,
        emailDeliveryRequested: payload.emailDeliveryRequested,
      },
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
