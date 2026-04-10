import { buildReviewReportFromEvidence, createEvidenceBundle } from "@/lib/architecture-review/client";
import { buildFallbackArchitectureEstimateSnapshot } from "@/lib/architecture-review/estimate-snapshot";
import { detectNonArchitectureEvidence } from "@/lib/architecture-review/engine";
import type {
  ArchitectureAnalysisConfidence,
  ArchitectureDiagramFormat,
  ArchitectureEngagementPreference,
  ArchitectureEnvironment,
  ArchitectureLifecycleStage,
  ArchitectureProvider,
  ArchitectureRegulatoryScope,
  ArchitectureReviewReport,
  ArchitectureWorkloadCriticality,
} from "@/lib/architecture-review/types";

type EvaluateArchitectureReviewInput = {
  provider: ArchitectureProvider;
  userEmail: string;
  paragraphInput: string;
  ocrText: string;
  metadata?: {
    diagramFormat?: ArchitectureDiagramFormat;
    title?: string;
    owner?: string;
    lastUpdated?: string;
    version?: string;
    legend?: string;
    workloadCriticality?: ArchitectureWorkloadCriticality;
    regulatoryScope?: ArchitectureRegulatoryScope;
    environment?: ArchitectureEnvironment;
    lifecycleStage?: ArchitectureLifecycleStage;
    desiredEngagement?: ArchitectureEngagementPreference;
  };
  analysisConfidenceOverride?: ArchitectureAnalysisConfidence;
  bookingUrl?: string;
  remediationRateUsdPerHour?: number;
};

export function evaluateArchitectureReviewInput(input: EvaluateArchitectureReviewInput): {
  bundle: ReturnType<typeof createEvidenceBundle>;
  nonArchitectureEvidence: ReturnType<typeof detectNonArchitectureEvidence>;
  report: ArchitectureReviewReport;
  estimateSnapshot: ReturnType<typeof buildFallbackArchitectureEstimateSnapshot>["snapshot"];
  estimateAuditUsage: ReturnType<typeof buildFallbackArchitectureEstimateSnapshot>["auditUsage"];
} {
  const bundle = createEvidenceBundle({
    provider: input.provider,
    paragraph: input.paragraphInput,
    ocrText: input.ocrText,
    metadata: {
      diagramFormat: input.metadata?.diagramFormat,
      title: input.metadata?.title,
      owner: input.metadata?.owner,
      lastUpdated: input.metadata?.lastUpdated,
      version: input.metadata?.version,
      legend: input.metadata?.legend,
      workloadCriticality: input.metadata?.workloadCriticality,
      regulatoryScope: input.metadata?.regulatoryScope,
      environment: input.metadata?.environment,
      lifecycleStage: input.metadata?.lifecycleStage,
      desiredEngagement: input.metadata?.desiredEngagement,
    },
  });

  const nonArchitectureEvidence = detectNonArchitectureEvidence(bundle);
  const report = buildReviewReportFromEvidence({
    bundle,
    userEmail: input.userEmail,
    quoteContext: {
      tokenCount: bundle.serviceTokens.length,
      ocrCharacterCount: input.ocrText.length,
      mode: "rules-only",
      workloadCriticality: input.metadata?.workloadCriticality,
      regulatoryScope: input.metadata?.regulatoryScope,
      desiredEngagement: input.metadata?.desiredEngagement,
      remediationRateUsdPerHour: input.remediationRateUsdPerHour,
    },
    analysisConfidenceOverride:
      (nonArchitectureEvidence.likely && nonArchitectureEvidence.confidence === "medium"
        ? "low"
        : input.analysisConfidenceOverride) ?? undefined,
  });
  const { snapshot: estimateSnapshot, auditUsage: estimateAuditUsage } = buildFallbackArchitectureEstimateSnapshot(report, {
    bookingUrl: input.bookingUrl,
  });

  return {
    bundle,
    nonArchitectureEvidence,
    report,
    estimateSnapshot,
    estimateAuditUsage,
  };
}
