import type {
  ArchitectureCategory,
  ArchitectureConcreteProvider,
  ArchitectureEstimatePolicyBand,
  ArchitecturePlatform,
  ArchitectureSourceLink,
} from "@/lib/architecture-review/types";

export type ArchitectureRuleProvider = ArchitectureConcreteProvider | ArchitecturePlatform | "shared";

export type ArchitectureReviewRule = {
  id: string;
  provider: ArchitectureRuleProvider;
  ruleVersion: string;
  category: ArchitectureCategory;
  researchCategory: string;
  ruleName: string;
  launchPriority: "critical" | "high" | "medium" | "low";
  ruleType: "required" | "recommended" | "anti_pattern" | "contradiction_check";
  scoreWeight: number;
  maxPartialCredit: number;
  partialCreditLogic: string;
  remediationSummary: string;
  remediationHoursLow: number;
  remediationHoursHigh: number;
  estimateLineItemLabel: string;
  estimatePolicyBand: ArchitectureEstimatePolicyBand;
  confidenceGuidance: string;
  officialSourceLinks: ArchitectureSourceLink[];
  customerSummarySnippet: string;
  evidenceMatchers?: string[];
};
