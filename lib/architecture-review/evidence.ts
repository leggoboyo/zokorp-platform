import { extractServiceTokens } from "@/lib/architecture-review/engine";
import type { ArchitectureEvidenceBundle, ArchitectureProvider } from "@/lib/architecture-review/types";

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
