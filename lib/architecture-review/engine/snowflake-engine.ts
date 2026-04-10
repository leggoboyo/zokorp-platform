import type { ArchitectureEvidenceBundle, ArchitectureFindingDraft } from "@/lib/architecture-review/types";
import {
  fallbackEvidenceExcerpt,
  includesAny,
  includesTerm,
  pickEvidenceExcerpt,
  pushRuleDecision,
  type RuleDecision,
} from "@/lib/architecture-review/engine/shared";

function ruleEvidence(bundle: ArchitectureEvidenceBundle, terms: string[]) {
  return pickEvidenceExcerpt(bundle, terms);
}

function push(findings: ArchitectureFindingDraft[], ruleId: string, decision: RuleDecision) {
  pushRuleDecision(findings, `snowflake:${ruleId}`, decision);
}

export function buildSnowflakeDeterministicFindings(bundle: ArchitectureEvidenceBundle) {
  const findings: ArchitectureFindingDraft[] = [];
  const combined = `${bundle.paragraph} ${bundle.ocrText}`.replace(/\s+/g, " ").trim().toLowerCase();
  const objectiveStated = includesAny(combined, ["analytics", "bi", "warehouse", "dashboard", "transformation", "etl", "elt"]);
  const measurableConstraintCount =
    ["latency", "concurrency", "retention", "cost", "sla", "slo", "users", "dashboards"].filter((term) =>
      includesTerm(combined, term),
    ).length + (/\b\d+(\.\d+)?\s?(seconds|minutes|hours|days|users?|tb|gb)\b/.test(combined) ? 1 : 0);

  push(findings, "workload_objective_and_constraints_stated", {
    outcome: objectiveStated && measurableConstraintCount >= 2 ? "pass" : objectiveStated ? "partial" : "fail",
    evidenceSeen: objectiveStated
      ? ruleEvidence(bundle, ["analytics", "bi", "warehouse", "dashboard", "etl", "elt"])
      : fallbackEvidenceExcerpt(bundle),
  });

  const hasWarehouseSize = includesAny(combined, ["x-small", "xsmall", "small", "medium", "large", "x-large", "xlarge"]);
  const hasWarehouseRole = includesAny(combined, ["etl warehouse", "bi warehouse", "dashboard warehouse", "ad hoc warehouse", "transform warehouse", "warehouse for"]);
  push(findings, "warehouse_size_and_role_is_explicit", {
    outcome: hasWarehouseSize && hasWarehouseRole ? "pass" : hasWarehouseSize || hasWarehouseRole ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["x-small", "small", "medium", "large", "warehouse", "etl warehouse", "bi warehouse"]),
  });

  const alwaysOnWarehouse = includesAny(combined, ["always on warehouse", "warehouse always on", "never suspend"]);
  const autoSuspend = includesAny(combined, ["auto-suspend", "auto suspend", "auto resume", "auto-resume"]);
  push(findings, "warehouse_auto_suspend_configured", {
    outcome: alwaysOnWarehouse ? "fail" : autoSuspend ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["always on warehouse", "never suspend", "auto-suspend", "auto suspend", "auto resume"]),
  });

  const rightSizing = includesAny(combined, ["right-size", "right size", "concurrency", "warehouse class", "warehouse size"]);
  push(findings, "warehouse_right_sizing_documented", {
    outcome: rightSizing ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["concurrency", "warehouse class", "warehouse size", "right-size", "right size"]),
  });

  const retentionControls = includesAny(combined, ["retention", "time travel", "fail-safe", "failsafe", "lifecycle"]);
  push(findings, "storage_retention_controls_noted", {
    outcome: retentionControls ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["retention", "time travel", "fail-safe", "failsafe", "lifecycle"]),
  });

  const largeTables = includesAny(combined, ["large table", "fact table", "hot table", "partition", "micro-partition"]);
  const clustering = includesAny(combined, ["clustering", "cluster by", "clustered"]);
  push(findings, "clustering_strategy_for_large_tables", {
    outcome: !largeTables ? "na" : clustering ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["large table", "fact table", "hot table", "clustering", "cluster by", "micro-partition"]),
  });

  const costControls = includesAny(combined, ["budget", "cost controls", "cost guardrail", "credit cap", "warehouse schedule"]);
  push(findings, "cost_controls_documented", {
    outcome: costControls ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["budget", "cost controls", "cost guardrail", "credit cap", "warehouse schedule"]),
  });

  const dataRetentionScope = includesAny(combined, ["retention", "history", "rollback", "storage scope", "time travel"]);
  push(findings, "data_retention_scope_noted", {
    outcome: dataRetentionScope ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["retention", "history", "rollback", "storage scope", "time travel"]),
  });

  return findings;
}
