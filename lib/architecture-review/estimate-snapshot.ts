import type {
  ArchitectureEstimateLineItem,
  ArchitectureEstimateSnapshot,
  ArchitectureReviewReport,
} from "@/lib/architecture-review/types";
import {
  getArchitectureReviewPricingCatalogEntry,
} from "@/lib/architecture-review/pricing-catalog";
import { configuredArchitectureRemediationRateUsdPerHour } from "@/lib/architecture-review/quote";
import { isExpandedReviewScope } from "@/lib/architecture-review/scope";
import { buildEstimateReferenceCode } from "@/lib/privacy-leads";
import { getMarketingSiteUrl } from "@/lib/site";

export type ArchitectureEstimateAuditUsage = {
  ruleId: string;
  source: "published" | "fallback";
  publishedRevisionId: string | null;
  pricingMode: "DERIVED" | "OVERRIDE";
  amountUsd: number;
};

export type ArchitectureEstimateOverrideRecord = {
  ruleId: string;
  publishedRevisionId: string | null;
  serviceLineLabel: string | null;
  publicFixSummary: string | null;
  pricingMode: "DERIVED" | "OVERRIDE";
  overrideMinPriceUsd: number | null;
  overrideMaxPriceUsd: number | null;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function defaultBookingUrl() {
  return process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${getMarketingSiteUrl()}/services#service-request`;
}

function roundToNearest(value: number, step: number) {
  return Math.round(value / step) * step;
}

function midpointAmount(low: number, high: number) {
  if (low === high) {
    return low;
  }

  return roundToNearest((low + high) / 2, 25);
}

function roundHours(value: number) {
  return Math.max(0.5, Math.round(value * 2) / 2);
}

function estimatedHoursForFinding(input: {
  remediationHoursLow: number;
  remediationHoursHigh: number;
  scopeMultiplier: number;
}) {
  const midpoint = (input.remediationHoursLow + input.remediationHoursHigh) / 2;
  return roundHours(midpoint * input.scopeMultiplier);
}

function quoteAmountForFinding(input: {
  lineItem: ArchitectureEstimateLineItem;
  overrideMinPriceUsd: number | null;
  overrideMaxPriceUsd: number | null;
  pricingMode: "DERIVED" | "OVERRIDE";
}) {
  if (input.pricingMode !== "OVERRIDE") {
    return input.lineItem.amountUsd;
  }

  const low = input.overrideMinPriceUsd;
  const high = input.overrideMaxPriceUsd;

  if (typeof low === "number" && typeof high === "number") {
    return midpointAmount(low, high);
  }

  if (low !== null) {
    return low;
  }

  if (high !== null) {
    return high;
  }

  return input.lineItem.amountUsd;
}

function estimatePolicyForScore(input: {
  overallScore: number;
  payableQuoteTotalUsd: number;
}) {
  if (input.overallScore < 60) {
    return {
      band: "consultation-only" as const,
      scoreBandLabel: "0-59" as const,
      headline: "Consultation-first path",
      nextStep:
        "This architecture needs a consultation-first review before ZoKorp issues a payable remediation quote. Use the booking link to confirm the real target state and the shortest correction path.",
      payableQuoteEnabled: false,
    };
  }

  if (input.overallScore >= 90) {
    return {
      band: "optional-polish" as const,
      scoreBandLabel: "90-100" as const,
      headline: "Optional polish only",
      nextStep:
        input.payableQuoteTotalUsd > 0
          ? "The architecture is largely workable. Any scoped follow-up should focus on polish, presentation quality, or targeted optimization only."
          : "No payable remediation scope was generated because the current submission does not show material fix work. Use the booking link only if you want a human polish pass.",
      payableQuoteEnabled: input.payableQuoteTotalUsd > 0,
    };
  }

  return {
    band: "remediation-estimate" as const,
    scoreBandLabel: "60-89" as const,
    headline: "Bounded remediation estimate",
    nextStep:
      "The architecture is workable but has fixable gaps. The estimate below stays bounded to the issues visible in this submission so you can act quickly without opening a larger project.",
    payableQuoteEnabled: input.payableQuoteTotalUsd > 0,
  };
}

export function buildArchitectureEstimateSnapshot(
  report: ArchitectureReviewReport,
  overrides?: Map<string, ArchitectureEstimateOverrideRecord>,
  options?: {
    bookingUrl?: string;
  },
) {
  const publishedOverrides = overrides ?? new Map<string, ArchitectureEstimateOverrideRecord>();
  const bookingUrl = options?.bookingUrl ?? defaultBookingUrl();
  const positiveFindings = report.findings.filter((finding) => finding.pointsDeducted > 0);
  const scopeMultiplier = isExpandedReviewScope(report.reviewScope) ? 1.15 : 1;
  const remediationRateUsdPerHour = configuredArchitectureRemediationRateUsdPerHour();

  const quoteCandidateLineItems = positiveFindings.map((finding) => {
    const codeEntry = getArchitectureReviewPricingCatalogEntry(finding.ruleId);
    const publishedOverride = publishedOverrides.get(finding.ruleId);
    const remediationHoursLow = codeEntry?.remediationHoursLow ?? 0.5;
    const remediationHoursHigh = codeEntry?.remediationHoursHigh ?? 0.5;
    const estimatedHours = estimatedHoursForFinding({
      remediationHoursLow,
      remediationHoursHigh,
      scopeMultiplier,
    });
    const derivedAmountUsd = Math.max(75, roundToNearest(estimatedHours * remediationRateUsdPerHour, 25));
    const baseLineItem: ArchitectureEstimateLineItem = {
      ruleId: finding.ruleId,
      category: finding.category,
      pointsDeducted: finding.pointsDeducted,
      serviceLineLabel:
        normalizeText(publishedOverride?.serviceLineLabel) ||
        codeEntry?.serviceLine ||
        `Fix ${finding.ruleId}`,
      publicFixSummary: normalizeText(publishedOverride?.publicFixSummary) || finding.howToFix || finding.fix,
      amountUsd: derivedAmountUsd,
      estimatedHours,
      remediationHoursLow,
      remediationHoursHigh,
      officialSourceLinks: codeEntry?.officialSourceLinks ?? [],
      confidenceGuidance:
        codeEntry?.confidenceGuidance ??
        "Confidence depends on whether the submitted diagram and narrative clearly show the controls being claimed.",
      partialCreditGuidance:
        codeEntry?.partialCreditGuidance ??
        "Partial credit applies when the reviewer can see the architectural intent but not the exact implementation detail.",
      source: publishedOverride ? "published" : "fallback",
      publishedRevisionId: publishedOverride?.publishedRevisionId ?? null,
    };

    const amountUsd = quoteAmountForFinding({
      lineItem: baseLineItem,
      overrideMinPriceUsd: publishedOverride?.overrideMinPriceUsd ?? null,
      overrideMaxPriceUsd: publishedOverride?.overrideMaxPriceUsd ?? null,
      pricingMode: publishedOverride?.pricingMode ?? "DERIVED",
    });

    return {
      ...baseLineItem,
      amountUsd,
    };
  });

  const payableQuoteTotalUsd = quoteCandidateLineItems.reduce((sum, item) => sum + item.amountUsd, 0);
  const policy = estimatePolicyForScore({
    overallScore: report.overallScore,
    payableQuoteTotalUsd,
  });
  const lineItems = policy.band === "consultation-only" ? [] : quoteCandidateLineItems;
  const totalUsd = lineItems.reduce((sum, item) => sum + item.amountUsd, 0);
  const assumptions =
    policy.band === "consultation-only"
      ? [
          "No payable remediation quote is being issued at this score band.",
          "The architecture needs a consultation-first review to confirm whether the design is feasible, salvageable, or should be redesigned.",
          "Any future quote depends on validating the intended workload, constraints, and target outcome during the follow-up call.",
        ]
      : [
          "Estimated only for the issues visible in the submitted diagram and written narrative.",
          report.analysisConfidence === "low"
            ? "Because the evidence confidence was low, the estimate assumes no hidden dependencies outside the submitted material."
            : policy.band === "optional-polish"
              ? "The follow-up scope assumes polish, optimization, or presentation cleanup instead of a broader redesign."
              : "The estimate assumes the current architecture can be corrected without a broader redesign.",
          "Work is scoped for a solo implementation pass and one review cycle unless expanded during the booking conversation.",
        ];
  const exclusions =
    policy.band === "consultation-only"
      ? [
          "This email does not include a payable remediation quote or delivery commitment.",
          "New requirements, migrations, application code changes, and vendor procurement stay outside scope until the consultation confirms a workable target state.",
          "If the intended design is impossible or materially misaligned with AWS best practices, the next step is redesign guidance rather than a light remediation pass.",
        ]
      : [
          "New requirements, migrations, application code changes, and vendor procurement are excluded from this estimate.",
          "Issues not visible in the submitted diagram or uncovered later are outside this estimated total.",
          "Ongoing support, managed operations, and subscription work are not included unless separately agreed.",
        ];

  const snapshot: ArchitectureEstimateSnapshot = {
    referenceCode: buildEstimateReferenceCode({
      source: "architecture-review",
      email: report.userEmail,
      generatedAtISO: report.generatedAtISO,
    }),
    bookingUrl,
    totalUsd,
    policy,
    lineItems,
    assumptions,
    exclusions,
  };

  const auditUsage: ArchitectureEstimateAuditUsage[] = quoteCandidateLineItems.map((item) => ({
    ruleId: item.ruleId,
    source: item.source,
    publishedRevisionId: item.publishedRevisionId ?? null,
    pricingMode: publishedOverrides.get(item.ruleId)?.pricingMode ?? "DERIVED",
    amountUsd: item.amountUsd,
  }));

  return {
    snapshot,
    auditUsage,
  };
}

export function buildFallbackArchitectureEstimateSnapshot(
  report: ArchitectureReviewReport,
  options?: {
    bookingUrl?: string;
  },
) {
  return buildArchitectureEstimateSnapshot(report, new Map<string, ArchitectureEstimateOverrideRecord>(), options);
}
