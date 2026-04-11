import { describe, expect, it } from "vitest";

import {
  getAwsArchitectureLaunchV1Rule,
} from "@/lib/architecture-review/aws-launch-v1-catalog";
import { ARCHITECTURE_REVIEW_RULES } from "@/lib/architecture-review/rules";
import {
  ARCHITECTURE_REVIEW_PACKAGE_CATALOG,
  ARCHITECTURE_REVIEW_PRICING_CATALOG,
  getArchitectureReviewPricingCatalogEntry,
} from "@/lib/architecture-review/pricing-catalog";
import { calculateFixCostUSD } from "@/lib/architecture-review/quote";

describe("architecture review pricing catalog", () => {
  it("covers the full live rule catalog without duplicate rule ids", () => {
    const ruleIds = ARCHITECTURE_REVIEW_PRICING_CATALOG.map((entry) => entry.ruleId);
    expect(new Set(ruleIds).size).toBe(ruleIds.length);
    expect(ruleIds).toEqual(
      ARCHITECTURE_REVIEW_RULES.filter((rule) => rule.provider !== "shared").map((rule) => rule.id),
    );
  });

  it("captures pricing ranges from the AWS rule weights and partial-credit rules", () => {
    const multiRegionRule = getAwsArchitectureLaunchV1Rule("stated_multi_region_requirement_mismatch");
    const iacRule = getAwsArchitectureLaunchV1Rule("infrastructure_as_code_indicated");
    const multiRegionEntry = getArchitectureReviewPricingCatalogEntry("stated_multi_region_requirement_mismatch");
    const iacEntry = getArchitectureReviewPricingCatalogEntry("infrastructure_as_code_indicated");

    expect(multiRegionRule).not.toBeNull();
    expect(iacRule).not.toBeNull();

    expect(multiRegionEntry).toMatchObject({
      minPointsDeducted: multiRegionRule!.scoreWeight - multiRegionRule!.maxPartialCredit,
      maxPointsDeducted: multiRegionRule!.scoreWeight,
      minFixCostUSD: calculateFixCostUSD(
        multiRegionRule!.category,
        multiRegionRule!.scoreWeight - multiRegionRule!.maxPartialCredit,
      ),
      maxFixCostUSD: calculateFixCostUSD(multiRegionRule!.category, multiRegionRule!.scoreWeight),
    });

    expect(iacEntry).toMatchObject({
      minPointsDeducted: iacRule!.scoreWeight - iacRule!.maxPartialCredit,
      maxPointsDeducted: iacRule!.scoreWeight,
      minFixCostUSD: calculateFixCostUSD(iacRule!.category, iacRule!.scoreWeight - iacRule!.maxPartialCredit),
      maxFixCostUSD: calculateFixCostUSD(iacRule!.category, iacRule!.scoreWeight),
    });
  });

  it("marks consultation-only and optional-polish rules with the correct quote posture", () => {
    expect(getArchitectureReviewPricingCatalogEntry("vpc_flow_logs_enabled")).toMatchObject({
      quoteImpact: "zero-cost-optional",
      pricingNotes: expect.stringContaining("Optional polish"),
    });

    expect(getArchitectureReviewPricingCatalogEntry("public_database_exposure")).toMatchObject({
      quoteImpact: "review-rejected",
      pricingNotes: expect.stringContaining("Launch v1 blocker"),
    });
  });

  it("documents the package-level pricing posture", () => {
    expect(ARCHITECTURE_REVIEW_PACKAGE_CATALOG).toEqual([
      expect.objectContaining({
        tier: "advisory-review",
        pricingSummary: "Fixed at $249.",
      }),
      expect.objectContaining({
        tier: "remediation-sprint",
      }),
      expect.objectContaining({
        tier: "implementation-partner",
        pricingSummary: expect.stringContaining("Custom"),
      }),
    ]);
  });

  it("includes source links, confidence guidance, and remediation ranges in the runtime catalog", () => {
    expect(getArchitectureReviewPricingCatalogEntry("cloudtrail_multi_region_enabled")).toMatchObject({
      officialSourceLinks: expect.arrayContaining([
        expect.objectContaining({
          label: expect.stringContaining("AWS"),
          url: expect.stringContaining("https://"),
        }),
      ]),
      confidenceGuidance: expect.stringContaining("Fail only if explicit"),
      partialCreditGuidance: expect.stringContaining("partial"),
      remediationHoursLow: expect.any(Number),
      remediationHoursHigh: expect.any(Number),
    });
  });
});
