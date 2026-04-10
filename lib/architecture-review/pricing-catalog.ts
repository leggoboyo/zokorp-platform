import { ARCHITECTURE_REVIEW_RULES } from "@/lib/architecture-review/rules";
import { calculateFixCostUSD } from "@/lib/architecture-review/quote";
import type { ArchitectureCategory, ArchitectureSourceLink } from "@/lib/architecture-review/types";

type QuoteImpact = "included" | "review-rejected" | "zero-cost-optional";

export type ArchitectureReviewPricingCatalogEntry = {
  ruleId: string;
  category: ArchitectureCategory;
  serviceLine: string;
  triggerSummary: string;
  pointsSummary: string;
  minPointsDeducted: number;
  maxPointsDeducted: number;
  minFixCostUSD: number;
  maxFixCostUSD: number;
  quoteImpact: QuoteImpact;
  pricingNotes?: string;
  officialSourceLinks: ArchitectureSourceLink[];
  confidenceGuidance: string;
  partialCreditGuidance: string;
  remediationHoursLow: number;
  remediationHoursHigh: number;
};

export type ArchitectureReviewPackageCatalogEntry = {
  tier: "advisory-review" | "remediation-sprint" | "implementation-partner";
  label: string;
  pricingSummary: string;
  deliverySummary: string;
};

function quoteImpactForPolicyBand(policyBand: string): QuoteImpact {
  if (policyBand === "consultation-only") {
    return "review-rejected";
  }

  if (policyBand === "optional-polish") {
    return "zero-cost-optional";
  }

  return "included";
}

function pricingNotesForPolicyBand(policyBand: string) {
  if (policyBand === "consultation-only") {
    return "Launch v1 blocker. Keep the outcome consultation-first whenever this issue is explicitly evidenced.";
  }

  if (policyBand === "optional-polish") {
    return "Optional polish item. Only quote this after the architecture is already viable.";
  }

  return "Launch v1 remediation item derived from the evidence-backed rule catalog.";
}

export const ARCHITECTURE_REVIEW_PACKAGE_CATALOG: ArchitectureReviewPackageCatalogEntry[] = [
  {
    tier: "advisory-review",
    label: "Advisory Review",
    pricingSummary: "Fixed at $249.",
    deliverySummary: "45-minute review call to validate blockers, tighten scope, and agree the shortest correction path.",
  },
  {
    tier: "remediation-sprint",
    label: "Remediation Sprint",
    pricingSummary:
      "Rendered in the email as a bounded estimate derived from the evidence-backed rule catalog, clamped to visible scope only.",
    deliverySummary: "Hands-on fix package for explicit, predictable remediation work shown by the submission.",
  },
  {
    tier: "implementation-partner",
    label: "Implementation Partner",
    pricingSummary: "Custom, used when the score profile or follow-up call indicates redesign, migration, or broader delivery work.",
    deliverySummary: "Deeper redesign, migration, or implementation support that should not be auto-scoped from a diagram upload alone.",
  },
];

export const ARCHITECTURE_REVIEW_PRICING_CATALOG: ArchitectureReviewPricingCatalogEntry[] = ARCHITECTURE_REVIEW_RULES.filter(
  (rule) => rule.provider !== "shared",
).map(
  (rule) => {
    const partialDeduction = Math.max(0, rule.scoreWeight - rule.maxPartialCredit);
    const maxFixCostUSD = calculateFixCostUSD(rule.category, rule.scoreWeight);
    const minFixCostUSD = calculateFixCostUSD(rule.category, partialDeduction);

    return {
      ruleId: rule.id,
      category: rule.category,
      serviceLine: rule.estimateLineItemLabel,
      triggerSummary: rule.customerSummarySnippet,
      pointsSummary: rule.partialCreditLogic,
      minPointsDeducted: partialDeduction,
      maxPointsDeducted: rule.scoreWeight,
      minFixCostUSD,
      maxFixCostUSD,
      quoteImpact: quoteImpactForPolicyBand(rule.estimatePolicyBand),
      pricingNotes: pricingNotesForPolicyBand(rule.estimatePolicyBand),
      officialSourceLinks: rule.officialSourceLinks,
      confidenceGuidance: rule.confidenceGuidance,
      partialCreditGuidance: rule.partialCreditLogic,
      remediationHoursLow: rule.remediationHoursLow,
      remediationHoursHigh: rule.remediationHoursHigh,
    };
  },
);

const pricingCatalogByRuleId = new Map(
  ARCHITECTURE_REVIEW_PRICING_CATALOG.map((entry) => [entry.ruleId, entry]),
);

export function resolveArchitectureReviewPricingCatalogRuleId(ruleId: string) {
  const normalized = ruleId.trim();
  if (!normalized) {
    return null;
  }

  if (pricingCatalogByRuleId.has(normalized)) {
    return normalized;
  }

  if (!normalized.includes(":")) {
    const awsRuleId = `aws:${normalized}`;
    if (pricingCatalogByRuleId.has(awsRuleId)) {
      return awsRuleId;
    }
  }

  return null;
}

export function legacyArchitectureReviewPricingCatalogRuleId(ruleId: string) {
  const resolvedRuleId = resolveArchitectureReviewPricingCatalogRuleId(ruleId) ?? ruleId.trim();
  return resolvedRuleId.startsWith("aws:") ? resolvedRuleId.slice(4) : null;
}

export function getArchitectureReviewPricingCatalogEntry(ruleId: string) {
  const resolvedRuleId = resolveArchitectureReviewPricingCatalogRuleId(ruleId);
  return resolvedRuleId ? pricingCatalogByRuleId.get(resolvedRuleId) ?? null : null;
}
