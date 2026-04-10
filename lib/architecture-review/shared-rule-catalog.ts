import type { ArchitectureReviewRule } from "@/lib/architecture-review/rule-types";

export const SHARED_ARCHITECTURE_REVIEW_RULES: ArchitectureReviewRule[] = [
  {
    id: "shared:diagram_narrative_core_component_mismatch",
    provider: "shared",
    ruleVersion: "shared-launch-v1",
    category: "clarity",
    researchCategory: "operations",
    ruleName: "Diagram and narrative match on core components and data flows",
    launchPriority: "critical",
    ruleType: "contradiction_check",
    scoreWeight: 5,
    maxPartialCredit: 2,
    partialCreditLogic: "pass(no material mismatch)=5; partial(minor labels)=2; fail(material)=0.",
    remediationSummary: "Align the diagram and narrative 1:1 for entry points, tiers, and data flows before estimating remediation work.",
    remediationHoursLow: 1,
    remediationHoursHigh: 6,
    estimateLineItemLabel: "Resolve diagram/narrative contradictions",
    estimatePolicyBand: "consultation-only",
    confidenceGuidance: "Fail only when the contradiction is explicit in the submitted evidence.",
    officialSourceLinks: [
      {
        label: "AWS Well-Architected guidance",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html",
      },
      {
        label: "Azure Well-Architected guidance",
        url: "https://learn.microsoft.com/azure/well-architected/what-is-well-architected-framework",
      },
      {
        label: "Google Cloud Architecture Framework",
        url: "https://cloud.google.com/architecture/framework",
      },
    ],
    customerSummarySnippet: "Diagram and narrative match on core components and data flows.",
  },
];

const sharedArchitectureRuleById = new Map(
  SHARED_ARCHITECTURE_REVIEW_RULES.map((rule) => [rule.id, rule]),
);

export function getSharedArchitectureReviewRule(ruleId: string) {
  const normalizedRuleId = ruleId.startsWith("shared:") ? ruleId : `shared:${ruleId}`;
  return sharedArchitectureRuleById.get(normalizedRuleId) ?? null;
}
