import { calculateConsultationQuoteUSD, calculateFixCostUSD, calculateOverallScore } from "@/lib/architecture-review/quote";
import {
  ARCHITECTURE_REVIEW_VERSION,
  architectureFindingDraftSchema,
  architectureReviewReportSchema,
  type ArchitectureFinding,
  type ArchitectureFindingDraft,
  type ArchitectureProvider,
  type ArchitectureReviewReport,
} from "@/lib/architecture-review/types";

function truncate(input: string, maxLength: number) {
  const trimmed = input.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function normalizeFindingDraft(input: ArchitectureFindingDraft): ArchitectureFindingDraft {
  return {
    ruleId: truncate(input.ruleId, 80),
    category: input.category,
    pointsDeducted: Math.max(0, Math.min(100, Math.round(input.pointsDeducted))),
    message: truncate(input.message, 120),
    fix: truncate(input.fix, 160),
    evidence: truncate(input.evidence, 240),
  };
}

function mergeOverflowFindings(findings: ArchitectureFindingDraft[]) {
  if (findings.length <= 20) {
    return findings;
  }

  const head = findings.slice(0, 19);
  const overflow = findings.slice(19);
  const totalOverflowPoints = overflow.reduce((sum, finding) => sum + finding.pointsDeducted, 0);

  head.push({
    ruleId: "merged-overflow",
    category: "clarity",
    pointsDeducted: Math.min(100, totalOverflowPoints),
    message: `Consolidate ${overflow.length} lower-priority findings into one remediation plan.`,
    fix: "Group similar issues by ownership and close them in one iteration plan.",
    evidence: `Merged ${overflow.length} overflow findings to keep output within the 20-item limit.`,
  });

  return head;
}

function sortFindingDrafts(findings: ArchitectureFindingDraft[]) {
  return [...findings].sort((a, b) => {
    if (b.pointsDeducted !== a.pointsDeducted) {
      return b.pointsDeducted - a.pointsDeducted;
    }

    return a.category.localeCompare(b.category);
  });
}

export function finalizeFindings(inputFindings: ArchitectureFindingDraft[]): ArchitectureFinding[] {
  const parsedFindings = inputFindings
    .map((finding) => architectureFindingDraftSchema.safeParse(normalizeFindingDraft(finding)))
    .filter((result) => result.success)
    .map((result) => result.data);

  const dedupedByRuleId = new Map<string, ArchitectureFindingDraft>();
  for (const finding of parsedFindings) {
    if (!dedupedByRuleId.has(finding.ruleId)) {
      dedupedByRuleId.set(finding.ruleId, finding);
      continue;
    }

    const existing = dedupedByRuleId.get(finding.ruleId)!;
    if (finding.pointsDeducted > existing.pointsDeducted) {
      dedupedByRuleId.set(finding.ruleId, finding);
    }
  }

  const sorted = sortFindingDrafts([...dedupedByRuleId.values()]);
  const merged = mergeOverflowFindings(sorted);

  return merged.map((finding) => ({
    ...finding,
    fixCostUSD: calculateFixCostUSD(finding.category, finding.pointsDeducted),
  }));
}

export function buildArchitectureReviewReport(input: {
  provider: ArchitectureProvider;
  flowNarrative: string;
  findings: ArchitectureFindingDraft[];
  userEmail: string;
  generatedAtISO?: string;
}): ArchitectureReviewReport {
  const findings = finalizeFindings(input.findings);
  const overallScore = calculateOverallScore(findings);
  const consultationQuoteUSD = calculateConsultationQuoteUSD(findings, overallScore);

  const report: ArchitectureReviewReport = {
    reportVersion: ARCHITECTURE_REVIEW_VERSION,
    provider: input.provider,
    overallScore,
    flowNarrative: truncate(input.flowNarrative, 2000),
    findings,
    consultationQuoteUSD,
    generatedAtISO: input.generatedAtISO ?? new Date().toISOString(),
    userEmail: input.userEmail.trim().toLowerCase(),
  };

  const parsed = architectureReviewReportSchema.parse(report);
  return {
    ...parsed,
    findings: sortFindingDrafts(parsed.findings).map((finding) => ({
      ...finding,
      fixCostUSD: calculateFixCostUSD(finding.category, finding.pointsDeducted),
    })),
  };
}

export function summarizeTopIssues(findings: ArchitectureFinding[], maxItems = 3) {
  return findings
    .filter((finding) => finding.pointsDeducted > 0)
    .slice(0, maxItems)
    .map((finding) => `${finding.ruleId}:${finding.pointsDeducted}`)
    .join(", ");
}
