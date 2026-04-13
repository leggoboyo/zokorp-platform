import { AccessModel, PriceKind } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { evaluateBillingSanity } from "@/lib/billing-sanity";

describe("billing sanity", () => {
  it("flags active paid products that have no active db-backed price", () => {
    const issues = evaluateBillingSanity({
      products: [
        {
          id: "product_validator",
          slug: "zokorp-validator",
          name: "ZoKorp Validator",
          active: true,
          accessModel: AccessModel.ONE_TIME_CREDIT,
          prices: [],
        },
      ],
      env: {},
    });

    expect(issues).toMatchObject([
      {
        title: "Paid product missing active Stripe price",
        statusTone: "danger",
      },
    ]);
  });

  it("flags placeholder subscription pricing and env drift deterministically", () => {
    const issues = evaluateBillingSanity({
      products: [
        {
          id: "product_validator",
          slug: "zokorp-validator",
          name: "ZoKorp Validator",
          active: true,
          accessModel: AccessModel.ONE_TIME_CREDIT,
          prices: [
            {
              id: "price_validator",
              stripePriceId: "price_validatorliveftr123",
              active: true,
              kind: PriceKind.CREDIT_PACK,
            },
          ],
        },
        {
          id: "product_platform",
          slug: "mlops-foundation-platform",
          name: "Forecasting Beta",
          active: true,
          accessModel: AccessModel.SUBSCRIPTION,
          prices: [
            {
              id: "price_platform",
              stripePriceId: "price_placeholdermonthly123",
              active: true,
              kind: PriceKind.SUBSCRIPTION,
            },
          ],
        },
      ],
      env: {
        STRIPE_PRICE_ID_PLATFORM_MONTHLY: "price_platformlivemissing123",
        PUBLIC_SUBSCRIPTION_PRICING_APPROVED: "true",
      },
    });

    expect(issues.map((issue) => issue.title)).toEqual([
      "Active paid product only has placeholder Stripe prices",
      "Env Stripe price is missing from the DB catalog",
      "Subscription pricing approval does not match the active catalog",
    ]);
  });
});
