import type { AdminBillingSnapshot } from "@/lib/admin-billing";
import type { AdminOperationsSnapshot } from "@/lib/admin-operations";
import type { RuntimeReadinessReport } from "@/lib/runtime-readiness";

export type AdminOverviewStatus =
  | "configured"
  | "not configured"
  | "healthy"
  | "warning"
  | "failing"
  | "stale";

export type AdminOverviewItem = {
  id: string;
  title: string;
  status: AdminOverviewStatus;
  summary: string;
  highlights: string[];
  href: string;
};

function prioritizeHighlights(values: string[], emptyLabel: string) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length > 0 ? unique.slice(0, 2) : [emptyLabel];
}

function buildReadinessItem(report: RuntimeReadinessReport): AdminOverviewItem {
  const status =
    report.totals.fail > 0
      ? "failing"
      : report.totals.warning > 0
        ? "warning"
        : "configured";

  return {
    id: "readiness",
    title: "Runtime readiness",
    status,
    summary:
      report.totals.fail > 0 || report.totals.warning > 0
        ? `${report.totals.fail} failure(s) and ${report.totals.warning} warning(s) are visible in runtime configuration.`
        : "Core auth, billing, scheduler, and integration checks are configured cleanly.",
    highlights: prioritizeHighlights(
      report.sections.flatMap((section) =>
        section.checks
          .filter((check) => check.level !== "pass")
          .map((check) => `${check.label} · ${check.level === "fail" ? "failing" : "warning"}`),
      ),
      "No readiness warnings are active.",
    ),
    href: "/admin/readiness",
  };
}

function buildScheduledJobsItem(snapshot: AdminOperationsSnapshot): AdminOverviewItem {
  const attentionItems = snapshot.automationHealthSignals.filter((item) => item.statusTone !== "success");
  const status = attentionItems.some((item) => item.statusLabel === "not configured")
    ? "not configured"
    : attentionItems.some((item) => item.statusTone === "danger")
      ? "failing"
      : attentionItems.some((item) => item.statusLabel === "stale")
        ? "stale"
        : attentionItems.length > 0
          ? "warning"
          : "healthy";

  return {
    id: "scheduled-jobs",
    title: "Scheduled jobs",
    status,
    summary:
      attentionItems.length > 0
        ? `${attentionItems.length} scheduled job family${attentionItems.length === 1 ? "" : "ies"} need operator attention.`
        : "Tracked GitHub and internal scheduled jobs are currently healthy.",
    highlights: prioritizeHighlights(
      attentionItems.map((item) => `${item.title} · ${item.statusLabel}`),
      "No scheduled job attention signals are active.",
    ),
    href: "/admin/operations",
  };
}

function buildPublicContractItem(snapshot: AdminOperationsSnapshot): AdminOverviewItem {
  const attentionItems = snapshot.publicContractSignals.filter((item) => item.statusTone !== "success");
  const status = attentionItems.some((item) => item.statusLabel === "not configured")
    ? "not configured"
    : attentionItems.some((item) => item.statusTone === "danger")
      ? "failing"
      : attentionItems.some((item) => item.statusLabel === "stale")
        ? "stale"
        : attentionItems.length > 0
          ? "warning"
          : "healthy";

  return {
    id: "public-contract",
    title: "Public contract",
    status,
    summary:
      attentionItems.length > 0
        ? `${attentionItems.length} public host or content contract signal${attentionItems.length === 1 ? "" : "s"} need review.`
        : "Latest smoke and browser journey checks match the public contract.",
    highlights: prioritizeHighlights(
      attentionItems.map((item) => `${item.title} · ${item.statusLabel}`),
      "No public-contract drift is visible.",
    ),
    href: "/admin/operations",
  };
}

function buildDeliverySyncItem(snapshot: AdminOperationsSnapshot): AdminOverviewItem {
  const deliveryAttention = [
    ...snapshot.architectureEmailIssues,
    ...snapshot.crmSyncIssues,
    ...snapshot.estimateCompanionIssues,
    ...snapshot.bookedCallSignals.filter((item) => item.statusTone !== "success"),
  ];
  const status = deliveryAttention.some((item) => item.statusLabel === "not configured")
    ? "not configured"
    : deliveryAttention.some((item) => item.statusTone === "danger")
      ? "failing"
      : deliveryAttention.length > 0
        ? "warning"
        : "healthy";

  return {
    id: "delivery-sync",
    title: "Delivery and sync",
    status,
    summary:
      deliveryAttention.length > 0
        ? `${deliveryAttention.length} delivery, CRM, or booked-call item${deliveryAttention.length === 1 ? "" : "s"} need review.`
        : "Email delivery, CRM sync, estimate sync, and booked-call linkage look clear.",
    highlights: prioritizeHighlights(
      deliveryAttention.map((item) => `${item.title} · ${item.statusLabel}`),
      "No delivery or sync queues need attention.",
    ),
    href: "/admin/operations",
  };
}

function buildBillingItem(snapshot: AdminBillingSnapshot): AdminOverviewItem {
  const allBillingAttention = [...snapshot.attentionSignals, ...snapshot.integritySignals];
  const status =
    allBillingAttention.some((item) => item.statusTone === "danger")
      ? "failing"
      : allBillingAttention.length > 0
        ? "warning"
        : snapshot.latestWebhookReceivedAt
          ? "healthy"
          : "not configured";

  return {
    id: "billing",
    title: "Billing pulse",
    status,
    summary:
      allBillingAttention.length > 0
        ? `${allBillingAttention.length} billing exception or integrity signal${allBillingAttention.length === 1 ? "" : "s"} need review.`
        : snapshot.latestWebhookReceivedAt
          ? "Stripe webhook history is recording and no billing exceptions are currently visible."
          : "No persisted Stripe webhook history is visible yet in this environment.",
    highlights: prioritizeHighlights(
      allBillingAttention.map((item) => `${item.title} · ${item.statusLabel}`),
      snapshot.latestWebhookReceivedAt ? "Latest Stripe webhook pulse is recorded." : "Billing pulse has not recorded webhook history yet.",
    ),
    href: "/admin/billing",
  };
}

export function buildAdminOverview(input: {
  readinessReport: RuntimeReadinessReport;
  operationsSnapshot: AdminOperationsSnapshot;
  billingSnapshot: AdminBillingSnapshot;
}): AdminOverviewItem[] {
  return [
    buildReadinessItem(input.readinessReport),
    buildPublicContractItem(input.operationsSnapshot),
    buildScheduledJobsItem(input.operationsSnapshot),
    buildDeliverySyncItem(input.operationsSnapshot),
    buildBillingItem(input.billingSnapshot),
  ];
}
