import { buildAwsDeterministicFindings } from "@/lib/architecture-review/engine/aws-engine";
import { buildAzureDeterministicFindings } from "@/lib/architecture-review/engine/azure-engine";
import { buildGcpDeterministicFindings } from "@/lib/architecture-review/engine/gcp-engine";
import { buildSnowflakeDeterministicFindings } from "@/lib/architecture-review/engine/snowflake-engine";
import { resolveArchitectureReviewScope } from "@/lib/architecture-review/scope";
import {
  buildFindingFromRule,
  buildDeterministicNarrative,
  detectCoreComponentMismatch,
  detectNonArchitectureEvidence,
  extractServiceTokens,
  extractServiceTokensForScope,
  fallbackEvidenceExcerpt,
} from "@/lib/architecture-review/engine/shared";
import type { ArchitectureEvidenceBundle, ArchitectureFindingDraft } from "@/lib/architecture-review/types";

function dedupeFindings(findings: ArchitectureFindingDraft[]) {
  const byRuleId = new Map<string, ArchitectureFindingDraft>();

  for (const finding of findings) {
    const existing = byRuleId.get(finding.ruleId);
    if (!existing || finding.pointsDeducted > existing.pointsDeducted) {
      byRuleId.set(finding.ruleId, finding);
    }
  }

  return [...byRuleId.values()];
}

export function buildDeterministicReviewFindings(bundle: ArchitectureEvidenceBundle) {
  const reviewScope =
    bundle.reviewScope ??
    resolveArchitectureReviewScope({
      provider: bundle.provider,
    });
  const findings: ArchitectureFindingDraft[] = [];
  const mismatchEvidence = detectCoreComponentMismatch(bundle);
  const nonArchitectureEvidence = detectNonArchitectureEvidence(bundle);

  if (mismatchEvidence || nonArchitectureEvidence.likely) {
    const sharedFinding = buildFindingFromRule(
      "shared:diagram_narrative_core_component_mismatch",
      "fail",
      mismatchEvidence ?? fallbackEvidenceExcerpt(bundle),
      nonArchitectureEvidence.likely ? nonArchitectureEvidence.reason : undefined,
    );

    if (sharedFinding) {
      findings.push(sharedFinding);
    }
  }

  if (nonArchitectureEvidence.likely) {
    return dedupeFindings(findings);
  }

  for (const provider of reviewScope.providers) {
    if (provider === "aws") {
      findings.push(...buildAwsDeterministicFindings(bundle));
    } else if (provider === "azure") {
      findings.push(...buildAzureDeterministicFindings(bundle));
    } else if (provider === "gcp") {
      findings.push(...buildGcpDeterministicFindings(bundle));
    }
  }

  for (const platform of reviewScope.platforms) {
    if (platform === "snowflake") {
      findings.push(...buildSnowflakeDeterministicFindings(bundle));
    }
  }

  return dedupeFindings(findings);
}

export {
  buildDeterministicNarrative,
  detectNonArchitectureEvidence,
  extractServiceTokens,
  extractServiceTokensForScope,
};
