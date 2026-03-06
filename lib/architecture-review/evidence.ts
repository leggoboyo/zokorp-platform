import { extractServiceTokens } from "@/lib/architecture-review/engine";
import type { ArchitectureEvidenceBundle, ArchitectureProvider } from "@/lib/architecture-review/types";

export function createEvidenceBundle(input: {
  provider: ArchitectureProvider;
  paragraph: string;
  ocrText: string;
  metadata: {
    diagramFormat?: ArchitectureEvidenceBundle["metadata"]["diagramFormat"];
    title?: string;
    owner?: string;
    lastUpdated?: string;
    version?: string;
    legend?: string;
    workloadCriticality?: ArchitectureEvidenceBundle["metadata"]["workloadCriticality"];
    regulatoryScope?: ArchitectureEvidenceBundle["metadata"]["regulatoryScope"];
    environment?: ArchitectureEvidenceBundle["metadata"]["environment"];
    lifecycleStage?: ArchitectureEvidenceBundle["metadata"]["lifecycleStage"];
    desiredEngagement?: ArchitectureEvidenceBundle["metadata"]["desiredEngagement"];
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
      diagramFormat: input.metadata.diagramFormat,
      title: input.metadata.title?.trim(),
      owner: input.metadata.owner?.trim(),
      lastUpdated: input.metadata.lastUpdated?.trim(),
      version: input.metadata.version?.trim(),
      legend: input.metadata.legend?.trim(),
      workloadCriticality: input.metadata.workloadCriticality,
      regulatoryScope: input.metadata.regulatoryScope,
      environment: input.metadata.environment,
      lifecycleStage: input.metadata.lifecycleStage,
      desiredEngagement: input.metadata.desiredEngagement,
    },
  };

  return bundle;
}