import { AccessModel, PriceKind } from "@prisma/client";

import { isCheckoutEnabledStripePriceId } from "@/lib/stripe-price-id";

type BillingCatalogProduct = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  accessModel: AccessModel;
  prices: Array<{
    id: string;
    stripePriceId: string;
    active: boolean;
    kind: PriceKind;
  }>;
};

export type BillingSanityIssue = {
  id: string;
  title: string;
  summary: string;
  details: string[];
  statusTone: "warning" | "danger";
  href: string;
};

const ENV_PRICE_EXPECTATIONS = [
  {
    envName: "STRIPE_PRICE_ID_FTR_SINGLE",
    label: "FTR single-run price",
    expectedProductSlug: "zokorp-validator",
    expectedAccessModel: AccessModel.ONE_TIME_CREDIT,
    href: "/admin/prices",
  },
  {
    envName: "STRIPE_PRICE_ID_SDP_SRP_SINGLE",
    label: "SDP/SRP single-run price",
    expectedProductSlug: "zokorp-validator",
    expectedAccessModel: AccessModel.ONE_TIME_CREDIT,
    href: "/admin/prices",
  },
  {
    envName: "STRIPE_PRICE_ID_COMPETENCY_REVIEW",
    label: "Competency review price",
    expectedProductSlug: "zokorp-validator",
    expectedAccessModel: AccessModel.ONE_TIME_CREDIT,
    href: "/admin/prices",
  },
  {
    envName: "STRIPE_PRICE_ID_PLATFORM_MONTHLY",
    label: "Platform monthly subscription price",
    expectedProductSlug: "mlops-foundation-platform",
    expectedAccessModel: AccessModel.SUBSCRIPTION,
    href: "/admin/prices",
  },
  {
    envName: "STRIPE_PRICE_ID_PLATFORM_ANNUAL",
    label: "Platform annual subscription price",
    expectedProductSlug: "mlops-foundation-platform",
    expectedAccessModel: AccessModel.SUBSCRIPTION,
    href: "/admin/prices",
  },
] as const;

export function evaluateBillingSanity({
  products,
  env = process.env,
}: {
  products: BillingCatalogProduct[];
  env?: Record<string, string | undefined>;
}): BillingSanityIssue[] {
  const activeProducts = products.filter((product) => product.active);
  const activePriceRows = activeProducts.flatMap((product) =>
    product.prices
      .filter((price) => price.active)
      .map((price) => ({
        ...price,
        product,
      })),
  );

  const issues: BillingSanityIssue[] = [];

  for (const product of activeProducts) {
    if (product.accessModel === AccessModel.FREE) {
      continue;
    }

    const activePrices = product.prices.filter((price) => price.active);
    const validCheckoutPrices = activePrices.filter((price) => isCheckoutEnabledStripePriceId(price.stripePriceId));

    if (activePrices.length === 0) {
      issues.push({
        id: `${product.slug}:missing_active_price`,
        title: "Paid product missing active Stripe price",
        summary: `${product.name} is active but has no active DB-backed Stripe price.`,
        details: [
          `Product slug ${product.slug}`,
          `Access model ${product.accessModel}`,
        ],
        statusTone: "danger",
        href: "/admin/prices",
      });
      continue;
    }

    if (validCheckoutPrices.length === 0) {
      issues.push({
        id: `${product.slug}:placeholder_only`,
        title: "Active paid product only has placeholder Stripe prices",
        summary: `${product.name} has active prices, but none are checkout-enabled.`,
        details: [
          `Product slug ${product.slug}`,
          ...activePrices.map((price) => `${price.stripePriceId} · ${price.kind}`),
        ],
        statusTone: "warning",
        href: "/admin/prices",
      });
    }
  }

  for (const expectation of ENV_PRICE_EXPECTATIONS) {
    const configuredPriceId = env[expectation.envName]?.trim();
    if (!configuredPriceId) {
      continue;
    }

    const matchingPrice = activePriceRows.find((price) => price.stripePriceId === configuredPriceId);
    if (!matchingPrice) {
      issues.push({
        id: `${expectation.envName}:missing_db_row`,
        title: "Env Stripe price is missing from the DB catalog",
        summary: `${expectation.label} is configured in env but not represented by an active DB price row.`,
        details: [
          `Env var ${expectation.envName}`,
          configuredPriceId,
        ],
        statusTone: "danger",
        href: expectation.href,
      });
      continue;
    }

    if (
      matchingPrice.product.slug !== expectation.expectedProductSlug ||
      matchingPrice.product.accessModel !== expectation.expectedAccessModel
    ) {
      issues.push({
        id: `${expectation.envName}:unexpected_product`,
        title: "Env Stripe price is mapped to an unexpected product",
        summary: `${expectation.label} points at ${matchingPrice.product.name}, which does not match the expected billing model.`,
        details: [
          `Env var ${expectation.envName}`,
          `Expected ${expectation.expectedProductSlug} · ${expectation.expectedAccessModel}`,
          `Found ${matchingPrice.product.slug} · ${matchingPrice.product.accessModel}`,
        ],
        statusTone: "danger",
        href: expectation.href,
      });
    }
  }

  const subscriptionPricingApproved = env.PUBLIC_SUBSCRIPTION_PRICING_APPROVED === "true";
  if (subscriptionPricingApproved) {
    const subscriptionProducts = activeProducts.filter((product) => product.accessModel === AccessModel.SUBSCRIPTION);
    const activeSubscriptionPrices = subscriptionProducts.flatMap((product) =>
      product.prices.filter((price) => price.active && isCheckoutEnabledStripePriceId(price.stripePriceId)),
    );

    if (subscriptionProducts.length === 0 || activeSubscriptionPrices.length === 0) {
      issues.push({
        id: "subscription_visibility_mismatch",
        title: "Subscription pricing approval does not match the active catalog",
        summary: "Public subscription pricing is approved, but the active subscription catalog is still incomplete.",
        details: [
          `Subscription products ${subscriptionProducts.length}`,
          `Checkout-enabled subscription prices ${activeSubscriptionPrices.length}`,
        ],
        statusTone: "warning",
        href: "/admin/billing",
      });
    }
  }

  return issues;
}
