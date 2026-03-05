import { buildDeterministicNarrative, buildDeterministicReviewFindings, extractServiceTokens } from "@/lib/architecture-review/engine";
import { buildArchitectureReviewReport } from "@/lib/architecture-review/report";
import {
  architectureFindingDraftSchema,
  llmRefinementSchema,
  type ArchitectureEvidenceBundle,
  type ArchitectureProvider,
  type ArchitectureReviewReport,
  type LlmRefinement,
} from "@/lib/architecture-review/types";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export async function isStrictPngFile(file: File) {
  if (file.type !== "image/png") {
    return {
      ok: false,
      error: "Only PNG files are allowed.",
    };
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".png")) {
    return {
      ok: false,
      error: "File name must end with .png.",
    };
  }

  const bytes = new Uint8Array(await file.slice(0, PNG_SIGNATURE.length).arrayBuffer());
  const hasSignature = PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);

  if (!hasSignature) {
    return {
      ok: false,
      error: "Invalid PNG signature.",
    };
  }

  return {
    ok: true,
  };
}

export function createEvidenceBundle(input: {
  provider: ArchitectureProvider;
  paragraph: string;
  ocrText: string;
  metadata: {
    title?: string;
    owner?: string;
    lastUpdated?: string;
    version?: string;
    legend?: string;
  };
}) {
  const normalizedOcrText = input.ocrText.replace(/\s+/g, " ").trim();
  const serviceTokens = extractServiceTokens(input.provider, normalizedOcrText);

  const bundle: ArchitectureEvidenceBundle = {
    provider: input.provider,
    paragraph: input.paragraph.trim(),
    ocrText: normalizedOcrText,
    serviceTokens,
    metadata: {
      title: input.metadata.title?.trim(),
      owner: input.metadata.owner?.trim(),
      lastUpdated: input.metadata.lastUpdated?.trim(),
      version: input.metadata.version?.trim(),
      legend: input.metadata.legend?.trim(),
    },
  };

  return bundle;
}

function dedupeMergeFindings(
  deterministicFindings: ReturnType<typeof buildDeterministicReviewFindings>,
  refinement: LlmRefinement | null,
) {
  if (!refinement || refinement.findings.length === 0) {
    return deterministicFindings;
  }

  const byRuleId = new Map(deterministicFindings.map((finding) => [finding.ruleId, finding]));

  for (const rawFinding of refinement.findings) {
    const parsed = architectureFindingDraftSchema.safeParse(rawFinding);
    if (!parsed.success) {
      continue;
    }

    const finding = parsed.data;
    const existing = byRuleId.get(finding.ruleId);

    if (!existing) {
      byRuleId.set(finding.ruleId, finding);
      continue;
    }

    byRuleId.set(finding.ruleId, {
      ...existing,
      pointsDeducted: finding.pointsDeducted,
      message: finding.message,
      fix: finding.fix,
      evidence: finding.evidence,
      category: finding.category,
    });
  }

  return [...byRuleId.values()];
}

export function parseLlmRefinement(raw: unknown): LlmRefinement | null {
  const parsed = llmRefinementSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function buildReviewReportFromEvidence(input: {
  bundle: ArchitectureEvidenceBundle;
  userEmail: string;
  llmRefinement?: LlmRefinement | null;
}): ArchitectureReviewReport {
  const deterministicFindings = buildDeterministicReviewFindings(input.bundle);
  const mergedFindings = dedupeMergeFindings(deterministicFindings, input.llmRefinement ?? null);

  const narrative =
    input.llmRefinement?.flowNarrative?.trim() ||
    buildDeterministicNarrative(input.bundle);

  return buildArchitectureReviewReport({
    provider: input.bundle.provider,
    flowNarrative: narrative,
    findings: mergedFindings,
    userEmail: input.userEmail,
  });
}
