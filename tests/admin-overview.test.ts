import { describe, expect, it } from "vitest";

import { buildAdminOverview } from "@/lib/admin-overview";
import type { AdminBillingSnapshot } from "@/lib/admin-billing";
import type { AdminOperationsSnapshot } from "@/lib/admin-operations";
import type { RuntimeReadinessReport } from "@/lib/runtime-readiness";

function buildReadinessReport(input: Partial<RuntimeReadinessReport>): RuntimeReadinessReport {
  return {
    sections: [],
    totals: {
      pass: 0,
      warning: 0,
      fail: 0,
    },
    ...input,
  };
}

function buildOperationsSnapshot(input: Partial<AdminOperationsSnapshot>): AdminOperationsSnapshot {
  return {
    stats: {
      pendingArchitectureEmail: 0,
      failedArchitectureEmail: 0,
      crmNeedsAttention: 0,
      failedQuoteCompanions: 0,
      recentArchitectureRuns: 0,
      recentValidatorRuns: 0,
      recentMlopsRuns: 0,
      recentBookedCalls: 0,
      followUpAttention: 0,
      automationAttention: 0,
      internalFailures: 0,
      securitySignals: 0,
      publicContractAttention: 0,
    },
    architectureEmailIssues: [],
    crmSyncIssues: [],
    estimateCompanionIssues: [],
    bookedCallSignals: [],
    automationHealthSignals: [],
    publicContractSignals: [],
    internalFailureSignals: [],
    securitySignals: [],
    followUpAttentionIssues: [],
    toolRunSignals: [],
    ...input,
  };
}

function buildBillingSnapshot(input: Partial<AdminBillingSnapshot>): AdminBillingSnapshot {
  return {
    stats: {
      recentCheckouts: 0,
      creditEvents: 0,
      billingAttention: 0,
      refundsAndDisputes: 0,
      webhookEvents: 0,
      integritySignals: 0,
    },
    latestWebhookReceivedAt: null,
    recentCheckouts: [],
    creditActivity: [],
    attentionSignals: [],
    webhookHistory: [],
    integritySignals: [],
    ...input,
  };
}

describe("admin overview", () => {
  it("normalizes readiness, scheduled-job, delivery, and billing status into operator cards", () => {
    const overview = buildAdminOverview({
      readinessReport: buildReadinessReport({
        totals: { pass: 4, warning: 1, fail: 1 },
        sections: [
          {
            id: "billing",
            label: "Billing",
            checks: [
              { id: "stripe", label: "Stripe webhook", level: "fail", summary: "Missing." },
              { id: "zoho", label: "Zoho sync", level: "warning", summary: "Partial." },
            ],
          },
        ],
      }),
      operationsSnapshot: buildOperationsSnapshot({
        architectureEmailIssues: [
          {
            id: "email_1",
            createdAt: new Date("2026-04-12T10:00:00.000Z"),
            title: "Architecture email delivery",
            statusLabel: "delayed",
            statusTone: "warning",
            summary: "Pending follow-up",
            details: [],
            href: "/admin/operations",
          },
        ],
        bookedCallSignals: [
          {
            id: "booking_1",
            createdAt: new Date("2026-04-12T11:00:00.000Z"),
            title: "Booked-call ingest",
            statusLabel: "not configured",
            statusTone: "warning",
            summary: "Calendly sync disabled",
            details: [],
            href: "/admin/readiness",
          },
        ],
        automationHealthSignals: [
          {
            id: "job_1",
            createdAt: new Date("2026-04-12T12:00:00.000Z"),
            title: "Zoho lead sync",
            statusLabel: "failed",
            statusTone: "danger",
            summary: "Latest run failed",
            details: [],
            href: "/admin/operations",
          },
        ],
        publicContractSignals: [
          {
            id: "public_1",
            createdAt: new Date("2026-04-12T12:30:00.000Z"),
            title: "Production smoke contract",
            statusLabel: "stale",
            statusTone: "warning",
            summary: "Services page is older than the repo contract.",
            details: [],
            href: "/admin/operations",
          },
        ],
      }),
      billingSnapshot: buildBillingSnapshot({
        latestWebhookReceivedAt: null,
        integritySignals: [
          {
            id: "billing_1",
            createdAt: new Date("2026-04-12T13:00:00.000Z"),
            title: "Catalog drift",
            statusLabel: "warning",
            statusTone: "warning",
            summary: "Missing active price",
            details: [],
            href: "/admin/billing",
          },
        ],
      }),
    });

    expect(overview.map((item) => [item.id, item.status])).toEqual([
      ["readiness", "failing"],
      ["public-contract", "stale"],
      ["scheduled-jobs", "failing"],
      ["delivery-sync", "not configured"],
      ["billing", "warning"],
    ]);
    expect(overview[0].highlights).toEqual(["Stripe webhook · failing", "Zoho sync · warning"]);
    expect(overview[1].highlights).toEqual(["Production smoke contract · stale"]);
    expect(overview[2].highlights).toEqual(["Zoho lead sync · failed"]);
    expect(overview[3].highlights).toEqual(["Architecture email delivery · delayed", "Booked-call ingest · not configured"]);
  });

  it("reports healthy and configured states when no operator attention is visible", () => {
    const overview = buildAdminOverview({
      readinessReport: buildReadinessReport({
        totals: { pass: 6, warning: 0, fail: 0 },
      }),
      operationsSnapshot: buildOperationsSnapshot({
        automationHealthSignals: [
          {
            id: "job_2",
            createdAt: new Date("2026-04-12T12:00:00.000Z"),
            title: "Architecture queue worker",
            statusLabel: "healthy",
            statusTone: "success",
            summary: "Latest run succeeded",
            details: [],
            href: "/admin/operations",
          },
        ],
      }),
      billingSnapshot: buildBillingSnapshot({
        latestWebhookReceivedAt: new Date("2026-04-12T13:00:00.000Z"),
      }),
    });

    expect(overview.map((item) => [item.id, item.status])).toEqual([
      ["readiness", "configured"],
      ["public-contract", "healthy"],
      ["scheduled-jobs", "healthy"],
      ["delivery-sync", "healthy"],
      ["billing", "healthy"],
    ]);
  });
});
