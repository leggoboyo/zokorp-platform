import { type AuditLog, type CreditLedgerEntry } from "@prisma/client";

import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";

type BillingEntry = {
  id: string;
  createdAt: Date;
  title: string;
  statusLabel: string;
  statusTone: "secondary" | "success" | "warning" | "danger" | "info";
  summary: string;
  details: string[];
  href?: string | null;
};

type CreditLedgerEntryWithRelations = CreditLedgerEntry & {
  user: {
    email: string | null;
  };
  product: {
    name: string;
    slug: string;
  };
};

export type AdminBillingSnapshot = {
  stats: {
    recentCheckouts: number;
    creditEvents: number;
    billingAttention: number;
    refundsAndDisputes: number;
  };
  recentCheckouts: BillingEntry[];
  creditActivity: BillingEntry[];
  attentionSignals: BillingEntry[];
};

const BILLING_ATTENTION_ACTIONS = [
  "billing.invoice_payment_failed",
  "billing.charge_refunded",
  "billing.dispute_created",
  "billing.webhook_failed",
  "billing.webhook_checkout_skipped",
  "billing.webhook_checkout_duplicate",
  "billing.customer_binding_rejected",
  "billing.customer_binding_backfill_failed",
] as const;

function asRecord(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function billingSignalTone(action: string): BillingEntry["statusTone"] {
  if (action === "billing.dispute_created" || action === "billing.webhook_failed") {
    return "danger";
  }

  if (action === "billing.invoice_payment_failed" || action === "billing.webhook_checkout_skipped") {
    return "warning";
  }

  if (action === "billing.charge.refunded" || action === "billing.charge_refunded") {
    return "info";
  }

  return "secondary";
}

function billingSignalLabel(action: string) {
  switch (action) {
    case "billing.invoice_payment_failed":
      return "Payment failed";
    case "billing.charge_refunded":
      return "Refund";
    case "billing.dispute_created":
      return "Dispute";
    case "billing.webhook_failed":
      return "Webhook failed";
    case "billing.webhook_checkout_skipped":
      return "Checkout skipped";
    case "billing.webhook_checkout_duplicate":
      return "Duplicate webhook";
    case "billing.customer_binding_rejected":
      return "Customer rejected";
    case "billing.customer_binding_backfill_failed":
      return "Binding repair failed";
    default:
      return action.replace("billing.", "");
  }
}

function billingSignalTitle(action: string) {
  switch (action) {
    case "billing.invoice_payment_failed":
      return "Stripe invoice payment failed";
    case "billing.charge_refunded":
      return "Stripe charge refunded";
    case "billing.dispute_created":
      return "Stripe dispute created";
    case "billing.webhook_failed":
      return "Webhook handler failed";
    case "billing.webhook_checkout_skipped":
      return "Checkout fulfillment skipped";
    case "billing.webhook_checkout_duplicate":
      return "Duplicate checkout webhook";
    case "billing.customer_binding_rejected":
      return "Customer binding rejected";
    case "billing.customer_binding_backfill_failed":
      return "Customer binding repair failed";
    default:
      return action;
  }
}

function mapBillingSignal(log: AuditLog & { user: { email: string | null } | null }): BillingEntry {
  const metadata = asRecord(log.metadataJson);
  const amountLabel =
    formatAmount(readNumber(metadata, "amountDue"), readString(metadata, "currency")) ??
    formatAmount(readNumber(metadata, "amountRefunded"), readString(metadata, "currency")) ??
    formatAmount(readNumber(metadata, "amount"), readString(metadata, "currency"));

  return {
    id: log.id,
    createdAt: log.createdAt,
    title: billingSignalTitle(log.action),
    statusLabel: billingSignalLabel(log.action),
    statusTone: billingSignalTone(log.action),
    summary: [
      log.user?.email ?? readString(metadata, "stripeCustomerId") ?? "internal signal",
      amountLabel,
      readString(metadata, "eventType"),
    ]
      .filter(Boolean)
      .join(" · "),
    details: [
      readString(metadata, "stripeInvoiceId"),
      readString(metadata, "stripeChargeId"),
      readString(metadata, "stripeDisputeId"),
      readString(metadata, "stripeCheckoutSessionId"),
      readString(metadata, "stripeEventId"),
      readString(metadata, "reason"),
      readString(metadata, "error"),
      readNumber(metadata, "attemptCount") !== null ? `Attempt ${readNumber(metadata, "attemptCount")}` : null,
    ].filter((value): value is string => Boolean(value)),
    href: "/admin/operations",
  };
}

function mapCreditActivity(entry: CreditLedgerEntryWithRelations): BillingEntry {
  const delta = entry.delta > 0 ? `+${entry.delta}` : `${entry.delta}`;
  const statusTone: BillingEntry["statusTone"] =
    entry.reason === "PURCHASE"
      ? "success"
      : entry.reason === "CONSUMPTION"
        ? "info"
        : entry.reason === "REFUND" || entry.reason === "REVERSAL"
          ? "warning"
          : "secondary";

  return {
    id: entry.id,
    createdAt: entry.createdAt,
    title: `${entry.product.name} · ${entry.user.email ?? "unknown customer"}`,
    statusLabel: entry.reason.toLowerCase().replaceAll("_", " "),
    statusTone,
    summary: `${delta} use${Math.abs(entry.delta) === 1 ? "" : "s"} · Balance after ${entry.balanceAfter}`,
    details: [
      `Tier ${entry.tier}`,
      `Source ${entry.source}`,
      entry.sourceRecordKey ? `Reference ${entry.sourceRecordKey}` : null,
    ].filter((value): value is string => Boolean(value)),
    href: `/software/${entry.product.slug}`,
  };
}

export async function getAdminBillingSnapshot(): Promise<AdminBillingSnapshot> {
  const [recentCheckouts, attentionSignals] = await Promise.all([
    db.checkoutFulfillment.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    }),
    db.auditLog.findMany({
      where: {
        action: {
          in: [...BILLING_ATTENTION_ACTIONS],
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    }),
  ]);

  let creditActivity: CreditLedgerEntryWithRelations[] = [];

  try {
    creditActivity = await db.creditLedgerEntry.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });
  } catch (error) {
    if (!isSchemaDriftError(error)) {
      throw error;
    }
  }

  return {
    stats: {
      recentCheckouts: recentCheckouts.length,
      creditEvents: creditActivity.length,
      billingAttention: attentionSignals.length,
      refundsAndDisputes: attentionSignals.filter((entry) =>
        entry.action === "billing.charge_refunded" || entry.action === "billing.dispute_created",
      ).length,
    },
    recentCheckouts: recentCheckouts.map((checkout) => ({
      id: checkout.id,
      createdAt: checkout.createdAt,
      title: `${checkout.product.name} · ${checkout.user.email ?? "unknown customer"}`,
      statusLabel: "fulfilled",
      statusTone: "success",
      summary: `Checkout session ${checkout.stripeCheckoutSessionId}`,
      details: [`Product slug ${checkout.product.slug}`],
      href: `/software/${checkout.product.slug}`,
    })),
    creditActivity: creditActivity.map(mapCreditActivity),
    attentionSignals: attentionSignals.map(mapBillingSignal),
  };
}
