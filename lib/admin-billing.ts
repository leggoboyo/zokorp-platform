import { AccessModel, EntitlementStatus, type AuditLog, type CreditLedgerEntry } from "@prisma/client";

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

type StripeWebhookEventEntry = {
  id: string;
  stripeEventId: string;
  eventType: string;
  processingStatus: string;
  livemode: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeInvoiceId: string | null;
  stripeChargeId: string | null;
  stripeDisputeId: string | null;
  metadataJson: unknown;
  errorMessage: string | null;
  receivedAt: Date;
  processedAt: Date | null;
  updatedAt: Date;
};

type StripeWebhookEventFindManyDelegate = {
  findMany: (args: {
    orderBy: {
      receivedAt: "desc";
    };
    take: number;
  }) => Promise<StripeWebhookEventEntry[]>;
};

type EntitlementIntegrityEntry = {
  id: string;
  remainingUses: number;
  stripeSubscriptionId: string | null;
  userId: string;
  productId: string;
  user: {
    email: string | null;
    stripeCustomerId: string | null;
  };
  product: {
    name: string;
    slug: string;
    accessModel: AccessModel;
  };
};

type CreditBalanceSummaryEntry = {
  userId: string;
  productId: string;
  remainingUses: number;
};

export type AdminBillingSnapshot = {
  stats: {
    recentCheckouts: number;
    creditEvents: number;
    billingAttention: number;
    refundsAndDisputes: number;
    webhookEvents: number;
    integritySignals: number;
  };
  latestWebhookReceivedAt: Date | null;
  recentCheckouts: BillingEntry[];
  creditActivity: BillingEntry[];
  attentionSignals: BillingEntry[];
  webhookHistory: BillingEntry[];
  integritySignals: BillingEntry[];
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

function stripeWebhookEventDelegate(client: unknown) {
  return (client as { stripeWebhookEvent?: StripeWebhookEventFindManyDelegate }).stripeWebhookEvent;
}

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

function webhookStatusTone(status: string): BillingEntry["statusTone"] {
  if (status === "failed") {
    return "danger";
  }

  if (status === "ignored") {
    return "warning";
  }

  if (status === "processed") {
    return "success";
  }

  return "secondary";
}

function mapWebhookHistory(entry: StripeWebhookEventEntry): BillingEntry {
  return {
    id: entry.id,
    createdAt: entry.receivedAt,
    title: entry.eventType,
    statusLabel: entry.processingStatus.replaceAll("_", " "),
    statusTone: webhookStatusTone(entry.processingStatus),
    summary: [
      entry.stripeCheckoutSessionId ??
        entry.stripeSubscriptionId ??
        entry.stripeInvoiceId ??
        entry.stripeChargeId ??
        entry.stripeDisputeId ??
        "No linked Stripe object",
      entry.stripeCustomerId ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
    details: [
      entry.stripeCheckoutSessionId ? `Checkout ${entry.stripeCheckoutSessionId}` : null,
      entry.stripeSubscriptionId ? `Subscription ${entry.stripeSubscriptionId}` : null,
      entry.stripeInvoiceId ? `Invoice ${entry.stripeInvoiceId}` : null,
      entry.stripeChargeId ? `Charge ${entry.stripeChargeId}` : null,
      entry.stripeDisputeId ? `Dispute ${entry.stripeDisputeId}` : null,
      entry.errorMessage ? entry.errorMessage : null,
    ].filter((value): value is string => Boolean(value)),
    href: "/admin/billing",
  };
}

function mapIntegritySignal(input: {
  id: string;
  createdAt?: Date | null;
  title: string;
  summary: string;
  details: string[];
  statusTone: BillingEntry["statusTone"];
  href?: string | null;
}): BillingEntry {
  return {
    id: input.id,
    createdAt: input.createdAt ?? new Date(0),
    title: input.title,
    statusLabel: "attention",
    statusTone: input.statusTone,
    summary: input.summary,
    details: input.details,
    href: input.href ?? "/admin/billing",
  };
}

export async function getAdminBillingSnapshot(): Promise<AdminBillingSnapshot> {
  const [recentCheckouts, attentionSignals, activeEntitlements, activeCreditBalances] = await Promise.all([
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
    db.entitlement.findMany({
      where: {
        status: EntitlementStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            email: true,
            stripeCustomerId: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
            accessModel: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 200,
    }),
    db.creditBalance.findMany({
      where: {
        status: EntitlementStatus.ACTIVE,
      },
      select: {
        userId: true,
        productId: true,
        remainingUses: true,
      },
    }),
  ]);

  let creditActivity: CreditLedgerEntryWithRelations[] = [];
  let webhookHistory: StripeWebhookEventEntry[] = [];

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

  try {
    const delegate = stripeWebhookEventDelegate(db);
    if (!delegate?.findMany) {
      webhookHistory = [];
    } else {
      webhookHistory = await delegate.findMany({
        orderBy: {
          receivedAt: "desc",
        },
        take: 30,
      });
    }
  } catch (error) {
    if (!isSchemaDriftError(error)) {
      throw error;
    }
  }

  const activeWalletTotals = new Map<string, number>();
  for (const wallet of activeCreditBalances as CreditBalanceSummaryEntry[]) {
    const key = `${wallet.userId}:${wallet.productId}`;
    activeWalletTotals.set(key, (activeWalletTotals.get(key) ?? 0) + wallet.remainingUses);
  }

  const integritySignals: BillingEntry[] = [];

  for (const entitlement of activeEntitlements as EntitlementIntegrityEntry[]) {
    const ownerLabel = entitlement.user.email ?? "unknown customer";
    const productLabel = entitlement.product.name;
    const detailsBase = [`Product ${entitlement.product.slug}`];

    if (!entitlement.user.stripeCustomerId) {
      integritySignals.push(
        mapIntegritySignal({
          id: `${entitlement.id}:missing_customer`,
          title: "Stripe customer binding missing",
          summary: `${ownerLabel} · ${productLabel}`,
          details: [
            "Active entitlement exists without a Stripe customer binding on the user record.",
            ...detailsBase,
          ],
          statusTone: "warning",
        }),
      );
    }

    if (
      entitlement.product.accessModel === AccessModel.SUBSCRIPTION &&
      !entitlement.stripeSubscriptionId
    ) {
      integritySignals.push(
        mapIntegritySignal({
          id: `${entitlement.id}:missing_subscription`,
          title: "Subscription linkage missing",
          summary: `${ownerLabel} · ${productLabel}`,
          details: [
            "Active subscription entitlement is missing the Stripe subscription identifier.",
            ...detailsBase,
          ],
          statusTone: "danger",
        }),
      );
    }

    if (entitlement.product.accessModel === AccessModel.ONE_TIME_CREDIT) {
      const walletTotal = activeWalletTotals.get(`${entitlement.userId}:${entitlement.productId}`) ?? 0;
      if (walletTotal !== entitlement.remainingUses) {
        integritySignals.push(
          mapIntegritySignal({
            id: `${entitlement.id}:credit_mismatch`,
            title: "Credit balance mismatch",
            summary: `${ownerLabel} · ${productLabel}`,
            details: [
              `Entitlement shows ${entitlement.remainingUses} remaining uses.`,
              `Active credit wallets sum to ${walletTotal}.`,
              ...detailsBase,
            ],
            statusTone: "warning",
          }),
        );
      }
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
      webhookEvents: webhookHistory.length,
      integritySignals: integritySignals.length,
    },
    latestWebhookReceivedAt: webhookHistory[0]?.receivedAt ?? null,
    recentCheckouts: recentCheckouts.map((checkout) => ({
      id: checkout.id,
      createdAt: checkout.createdAt,
      title: `${checkout.product.name} · ${checkout.user.email ?? "unknown customer"}`,
      statusLabel: "fulfilled",
      statusTone: "success",
      summary: `Checkout session ${checkout.stripeCheckoutSessionId}`,
      details: [`Product slug ${checkout.product.slug}`],
      href:
        checkout.product.slug === "architecture-review-remediation"
          ? "/software/architecture-diagram-reviewer"
          : `/software/${checkout.product.slug}`,
    })),
    creditActivity: creditActivity.map(mapCreditActivity),
    attentionSignals: attentionSignals.map(mapBillingSignal),
    webhookHistory: webhookHistory.map(mapWebhookHistory),
    integritySignals,
  };
}
