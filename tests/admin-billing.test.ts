import { AccessModel, EntitlementStatus, PriceKind } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  checkoutFulfillmentFindManyMock,
  auditLogFindManyMock,
  entitlementFindManyMock,
  creditBalanceFindManyMock,
  creditLedgerEntryFindManyMock,
  stripeWebhookEventFindManyMock,
  productFindManyMock,
  dbMock,
} = vi.hoisted(() => {
  const checkoutFulfillmentFindManyMock = vi.fn();
  const auditLogFindManyMock = vi.fn();
  const entitlementFindManyMock = vi.fn();
  const creditBalanceFindManyMock = vi.fn();
  const creditLedgerEntryFindManyMock = vi.fn();
  const stripeWebhookEventFindManyMock = vi.fn();
  const productFindManyMock = vi.fn();

  return {
    checkoutFulfillmentFindManyMock,
    auditLogFindManyMock,
    entitlementFindManyMock,
    creditBalanceFindManyMock,
    creditLedgerEntryFindManyMock,
    stripeWebhookEventFindManyMock,
    productFindManyMock,
    dbMock: {
      checkoutFulfillment: {
        findMany: checkoutFulfillmentFindManyMock,
      },
      auditLog: {
        findMany: auditLogFindManyMock,
      },
      entitlement: {
        findMany: entitlementFindManyMock,
      },
      creditBalance: {
        findMany: creditBalanceFindManyMock,
      },
      creditLedgerEntry: {
        findMany: creditLedgerEntryFindManyMock,
      },
      stripeWebhookEvent: {
        findMany: stripeWebhookEventFindManyMock,
      },
      product: {
        findMany: productFindManyMock,
      },
    } as {
      checkoutFulfillment: { findMany: typeof checkoutFulfillmentFindManyMock };
      auditLog: { findMany: typeof auditLogFindManyMock };
      entitlement: { findMany: typeof entitlementFindManyMock };
      creditBalance: { findMany: typeof creditBalanceFindManyMock };
      creditLedgerEntry: { findMany: typeof creditLedgerEntryFindManyMock };
      stripeWebhookEvent?: { findMany: typeof stripeWebhookEventFindManyMock };
      product: { findMany: typeof productFindManyMock };
    },
  };
});

vi.mock("@/lib/db", () => ({
  db: dbMock,
}));

import { getAdminBillingSnapshot } from "@/lib/admin-billing";

const originalSubscriptionApproval = process.env.PUBLIC_SUBSCRIPTION_PRICING_APPROVED;
const originalFtrPriceId = process.env.STRIPE_PRICE_ID_FTR_SINGLE;
const originalSdpSrpPriceId = process.env.STRIPE_PRICE_ID_SDP_SRP_SINGLE;
const originalCompetencyPriceId = process.env.STRIPE_PRICE_ID_COMPETENCY_REVIEW;
const originalPlatformMonthlyPriceId = process.env.STRIPE_PRICE_ID_PLATFORM_MONTHLY;
const originalPlatformAnnualPriceId = process.env.STRIPE_PRICE_ID_PLATFORM_ANNUAL;

describe("admin billing snapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.stripeWebhookEvent = {
      findMany: stripeWebhookEventFindManyMock,
    };
    process.env.PUBLIC_SUBSCRIPTION_PRICING_APPROVED = "false";
    delete process.env.STRIPE_PRICE_ID_FTR_SINGLE;
    delete process.env.STRIPE_PRICE_ID_SDP_SRP_SINGLE;
    delete process.env.STRIPE_PRICE_ID_COMPETENCY_REVIEW;
    delete process.env.STRIPE_PRICE_ID_PLATFORM_MONTHLY;
    delete process.env.STRIPE_PRICE_ID_PLATFORM_ANNUAL;

    checkoutFulfillmentFindManyMock.mockResolvedValue([
      {
        id: "checkout_1",
        createdAt: new Date("2026-04-04T20:00:00.000Z"),
        stripeCheckoutSessionId: "cs_test_123",
        user: {
          email: "owner@acme-enterprise.com",
        },
        product: {
          name: "ZoKorp Validator",
          slug: "zokorp-validator",
        },
      },
    ]);

    auditLogFindManyMock.mockResolvedValue([
      {
        id: "audit_1",
        action: "billing.charge_refunded",
        createdAt: new Date("2026-04-04T19:00:00.000Z"),
        metadataJson: {
          stripeChargeId: "ch_123",
          stripeEventId: "evt_refund_1",
          amountRefunded: 5000,
          currency: "usd",
        },
        user: {
          email: "owner@acme-enterprise.com",
        },
      },
    ]);

    entitlementFindManyMock.mockResolvedValue([
      {
        id: "ent_sub_1",
        remainingUses: 0,
        stripeSubscriptionId: null,
        userId: "user_1",
        productId: "product_sub_1",
        user: {
          email: "owner@acme-enterprise.com",
          stripeCustomerId: null,
        },
        product: {
          name: "Forecasting Beta",
          slug: "mlops-foundation-platform",
          accessModel: AccessModel.SUBSCRIPTION,
        },
      },
      {
        id: "ent_credit_1",
        remainingUses: 3,
        stripeSubscriptionId: null,
        userId: "user_2",
        productId: "product_credit_1",
        user: {
          email: "validator@acme-enterprise.com",
          stripeCustomerId: "cus_123",
        },
        product: {
          name: "ZoKorp Validator",
          slug: "zokorp-validator",
          accessModel: AccessModel.ONE_TIME_CREDIT,
        },
      },
    ]);

    creditBalanceFindManyMock.mockResolvedValue([
      {
        userId: "user_2",
        productId: "product_credit_1",
        remainingUses: 1,
        status: EntitlementStatus.ACTIVE,
      },
    ]);

    creditLedgerEntryFindManyMock.mockResolvedValue([
      {
        id: "ledger_1",
        createdAt: new Date("2026-04-04T18:00:00.000Z"),
        delta: 1,
        balanceAfter: 4,
        reason: "PURCHASE",
        tier: "FTR",
        source: "stripe_checkout",
        sourceRecordKey: "cs_test_123",
        user: {
          email: "validator@acme-enterprise.com",
        },
        product: {
          name: "ZoKorp Validator",
          slug: "zokorp-validator",
        },
      },
    ]);

    stripeWebhookEventFindManyMock.mockResolvedValue([
      {
        id: "webhook_1",
        stripeEventId: "evt_checkout_1",
        eventType: "checkout.session.completed",
        processingStatus: "processed",
        livemode: false,
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: null,
        stripeCheckoutSessionId: "cs_test_123",
        stripeInvoiceId: null,
        stripeChargeId: null,
        stripeDisputeId: null,
        metadataJson: {},
        errorMessage: null,
        receivedAt: new Date("2026-04-04T21:00:00.000Z"),
        processedAt: new Date("2026-04-04T21:00:01.000Z"),
        updatedAt: new Date("2026-04-04T21:00:01.000Z"),
      },
    ]);

    productFindManyMock.mockResolvedValue([
      {
        id: "product_credit_1",
        slug: "zokorp-validator",
        name: "ZoKorp Validator",
        active: true,
        accessModel: AccessModel.ONE_TIME_CREDIT,
        prices: [
          {
            id: "price_credit_1",
            stripePriceId: "price_validatorliveftr123",
            active: true,
            kind: PriceKind.CREDIT_PACK,
          },
        ],
      },
      {
        id: "product_sub_1",
        slug: "mlops-foundation-platform",
        name: "Forecasting Beta",
        active: true,
        accessModel: AccessModel.SUBSCRIPTION,
        prices: [
          {
            id: "price_sub_1",
            stripePriceId: "price_forecastinglivemonthly123",
            active: true,
            kind: PriceKind.SUBSCRIPTION,
          },
        ],
      },
    ]);
  });

  afterEach(() => {
    if (originalSubscriptionApproval === undefined) {
      delete process.env.PUBLIC_SUBSCRIPTION_PRICING_APPROVED;
    } else {
      process.env.PUBLIC_SUBSCRIPTION_PRICING_APPROVED = originalSubscriptionApproval;
    }

    if (originalFtrPriceId === undefined) {
      delete process.env.STRIPE_PRICE_ID_FTR_SINGLE;
    } else {
      process.env.STRIPE_PRICE_ID_FTR_SINGLE = originalFtrPriceId;
    }

    if (originalSdpSrpPriceId === undefined) {
      delete process.env.STRIPE_PRICE_ID_SDP_SRP_SINGLE;
    } else {
      process.env.STRIPE_PRICE_ID_SDP_SRP_SINGLE = originalSdpSrpPriceId;
    }

    if (originalCompetencyPriceId === undefined) {
      delete process.env.STRIPE_PRICE_ID_COMPETENCY_REVIEW;
    } else {
      process.env.STRIPE_PRICE_ID_COMPETENCY_REVIEW = originalCompetencyPriceId;
    }

    if (originalPlatformMonthlyPriceId === undefined) {
      delete process.env.STRIPE_PRICE_ID_PLATFORM_MONTHLY;
    } else {
      process.env.STRIPE_PRICE_ID_PLATFORM_MONTHLY = originalPlatformMonthlyPriceId;
    }

    if (originalPlatformAnnualPriceId === undefined) {
      delete process.env.STRIPE_PRICE_ID_PLATFORM_ANNUAL;
    } else {
      process.env.STRIPE_PRICE_ID_PLATFORM_ANNUAL = originalPlatformAnnualPriceId;
    }
  });

  it("surfaces webhook history and billing integrity issues together", async () => {
    const snapshot = await getAdminBillingSnapshot();

    expect(snapshot.stats.recentCheckouts).toBe(1);
    expect(snapshot.stats.creditEvents).toBe(1);
    expect(snapshot.stats.refundsAndDisputes).toBe(1);
    expect(snapshot.stats.webhookEvents).toBe(1);
    expect(snapshot.stats.integritySignals).toBe(3);
    expect(snapshot.latestWebhookReceivedAt?.toISOString()).toBe("2026-04-04T21:00:00.000Z");
    expect(snapshot.webhookHistory[0]).toMatchObject({
      title: "checkout.session.completed",
      statusLabel: "processed",
      summary: "cs_test_123 · cus_123",
    });
    expect(snapshot.integritySignals.map((entry) => entry.title)).toEqual([
      "Subscription linkage missing",
      "Stripe customer binding missing",
      "Credit balance mismatch",
    ]);
  });

  it("still reports integrity signals when webhook history is unavailable", async () => {
    dbMock.stripeWebhookEvent = undefined;
    entitlementFindManyMock.mockResolvedValue([
      {
        id: "ent_credit_2",
        remainingUses: 2,
        stripeSubscriptionId: null,
        userId: "user_3",
        productId: "product_credit_2",
        user: {
          email: "ops@acme-enterprise.com",
          stripeCustomerId: "cus_ops",
        },
        product: {
          name: "ZoKorp Validator",
          slug: "zokorp-validator",
          accessModel: AccessModel.ONE_TIME_CREDIT,
        },
      },
    ]);
    creditBalanceFindManyMock.mockResolvedValue([
      {
        userId: "user_3",
        productId: "product_credit_2",
        remainingUses: 1,
        status: EntitlementStatus.ACTIVE,
      },
    ]);
    stripeWebhookEventFindManyMock.mockReset();

    const snapshot = await getAdminBillingSnapshot();

    expect(snapshot.stats.webhookEvents).toBe(0);
    expect(snapshot.webhookHistory).toEqual([]);
    expect(snapshot.stats.integritySignals).toBe(1);
    expect(snapshot.integritySignals[0]).toMatchObject({
      title: "Credit balance mismatch",
      summary: "ops@acme-enterprise.com · ZoKorp Validator",
    });
  });
});
