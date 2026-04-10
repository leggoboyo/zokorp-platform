import { AWS_ARCHITECTURE_LAUNCH_V1_RULES } from "@/lib/architecture-review/aws-launch-v1-catalog";
import { AZURE_ARCHITECTURE_LAUNCH_V1_RULES } from "@/lib/architecture-review/azure-launch-v1-catalog";
import { GCP_ARCHITECTURE_LAUNCH_V1_RULES } from "@/lib/architecture-review/gcp-launch-v1-catalog";
import type { ArchitectureReviewRule } from "@/lib/architecture-review/rule-types";
import { SHARED_ARCHITECTURE_REVIEW_RULES } from "@/lib/architecture-review/shared-rule-catalog";
import { SNOWFLAKE_ARCHITECTURE_LAUNCH_V1_RULES } from "@/lib/architecture-review/snowflake-launch-v1-catalog";
import type { ArchitectureReviewScope } from "@/lib/architecture-review/types";

export const ARCHITECTURE_REVIEW_RULES: ArchitectureReviewRule[] = [
  ...SHARED_ARCHITECTURE_REVIEW_RULES,
  ...AWS_ARCHITECTURE_LAUNCH_V1_RULES,
  ...AZURE_ARCHITECTURE_LAUNCH_V1_RULES,
  ...GCP_ARCHITECTURE_LAUNCH_V1_RULES,
  ...SNOWFLAKE_ARCHITECTURE_LAUNCH_V1_RULES,
];

const RULE_NAMESPACE_ORDER = ["shared", "aws", "azure", "gcp", "snowflake"] as const;

const architectureReviewRuleById = new Map(
  ARCHITECTURE_REVIEW_RULES.map((rule) => [rule.id, rule]),
);

function normalizeRuleId(ruleId: string) {
  if (architectureReviewRuleById.has(ruleId)) {
    return ruleId;
  }

  for (const namespace of RULE_NAMESPACE_ORDER) {
    const candidate = `${namespace}:${ruleId}`;
    if (architectureReviewRuleById.has(candidate)) {
      return candidate;
    }
  }

  return ruleId;
}

export function getArchitectureReviewRule(ruleId: string) {
  return architectureReviewRuleById.get(normalizeRuleId(ruleId)) ?? null;
}

export function getArchitectureReviewRulesForScope(scope: Pick<ArchitectureReviewScope, "providers" | "platforms">) {
  const rules: ArchitectureReviewRule[] = [...SHARED_ARCHITECTURE_REVIEW_RULES];

  for (const provider of scope.providers) {
    if (provider === "aws") {
      rules.push(...AWS_ARCHITECTURE_LAUNCH_V1_RULES);
    } else if (provider === "azure") {
      rules.push(...AZURE_ARCHITECTURE_LAUNCH_V1_RULES);
    } else if (provider === "gcp") {
      rules.push(...GCP_ARCHITECTURE_LAUNCH_V1_RULES);
    }
  }

  for (const platform of scope.platforms) {
    if (platform === "snowflake") {
      rules.push(...SNOWFLAKE_ARCHITECTURE_LAUNCH_V1_RULES);
    }
  }

  return rules;
}

export function getArchitectureReviewRuleCountForScope(scope: Pick<ArchitectureReviewScope, "providers" | "platforms">) {
  return getArchitectureReviewRulesForScope(scope).length;
}
