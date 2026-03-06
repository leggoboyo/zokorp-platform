import { buildDeterministicNarrative, buildDeterministicReviewFindings, extractServiceTokens } from "@/lib/architecture-review/engine";
import { buildArchitectureReviewReport } from "@/lib/architecture-review/report";
import type { ArchitectureQuoteContext } from "@/lib/architecture-review/quote";
import {
  architectureFindingDraftSchema,
  llmRefinementSchema,
  type ArchitectureDiagramFormat,
  type ArchitectureEvidenceBundle,
  type ArchitectureProvider,
  type ArchitectureReviewReport,
  type LlmRefinement,
} from "@/lib/architecture-review/types";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAX_DIAGRAM_FILE_BYTES = 8 * 1024 * 1024;

function isPngBytes(bytes: Uint8Array) {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

function parseSvgLabelText(rawSvg: string) {
  const textFragments: string[] = [];

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(rawSvg, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");
    if (!parserError) {
      for (const node of doc.querySelectorAll("text, title, desc")) {
        const value = node.textContent?.trim();
        if (value) {
          textFragments.push(value);
        }
      }
    }
  }

  if (textFragments.length === 0) {
    const regex = /<(?:text|title|desc)\b[^>]*>([\s\S]*?)<\/(?:text|title|desc)>/gi;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(rawSvg)) !== null) {
      const value = match[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (value) {
        textFragments.push(value);
      }
    }
  }

  return textFragments.join(" ").replace(/\s+/g, " ").trim();
}

function parseSvgSizeAttribute(value: string | null) {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value.replace(/px$/i, "").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function parseSvgDimensions(rawSvg: string) {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(rawSvg, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");
    if (!parserError) {
      const svg = doc.querySelector("svg");
      if (svg) {
        const width = parseSvgSizeAttribute(svg.getAttribute("width"));
        const height = parseSvgSizeAttribute(svg.getAttribute("height"));
        const viewBox = svg.getAttribute("viewBox");

        if (width && height) {
          return { width, height };
        }

        if (viewBox) {
          const values = viewBox
            .split(/[\s,]+/)
            .map((value) => Number.parseFloat(value))
            .filter((value) => Number.isFinite(value));
          if (values.length === 4 && values[2] > 0 && values[3] > 0) {
            return { width: values[2], height: values[3] };
          }
        }
      }
    }
  }

  const viewBoxMatch = rawSvg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch?.[1]) {
    const values = viewBoxMatch[1]
      .split(/[\s,]+/)
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));
    if (values.length === 4 && values[2] > 0 && values[3] > 0) {
      return { width: values[2], height: values[3] };
    }
  }

  return null;
}

function validateSvgMarkup(rawSvg: string) {
  const normalized = rawSvg.trim();
  if (!/<svg\b/i.test(normalized)) {
    return {
      ok: false,
      error: "Invalid SVG payload.",
    } as const;
  }

  if (/<script\b/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with script tags is not allowed.",
    } as const;
  }

  if (/\son[a-z]+\s*=/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with inline event handlers is not allowed.",
    } as const;
  }

  if (/javascript:/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with javascript: links is not allowed.",
    } as const;
  }

  if (/<foreignObject\b/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with foreignObject is not allowed.",
    } as const;
  }

  return {
    ok: true,
  } as const;
}

export async function extractSvgEvidence(file: File) {
  const rawSvg = await file.text();
  const validation = validateSvgMarkup(rawSvg);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const text = parseSvgLabelText(rawSvg);
  const dimensions = parseSvgDimensions(rawSvg);
  return {
    text,
    dimensions,
  };
}

export async function isStrictDiagramFile(file: File): Promise<
  | { ok: true; format: ArchitectureDiagramFormat; mimeType: "image/png" | "image/svg+xml" }
  | { ok: false; error: string }
> {
  const lowerName = file.name.toLowerCase();
  const isPngName = lowerName.endsWith(".png");
  const isSvgName = lowerName.endsWith(".svg");

  if (!isPngName && !isSvgName) {
    return {
      ok: false,
      error: "File name must end with .png or .svg.",
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      error: "Uploaded file is empty.",
    };
  }

  if (file.size > MAX_DIAGRAM_FILE_BYTES) {
    return {
      ok: false,
      error: "File is too large. Upload a file up to 8MB.",
    };
  }

  if (isPngName) {
    const bytes = new Uint8Array(await file.slice(0, PNG_SIGNATURE.length).arrayBuffer());
    if (bytes.length < PNG_SIGNATURE.length || !isPngBytes(bytes)) {
      return {
        ok: false,
        error: "Invalid PNG signature.",
      };
    }

    return {
      ok: true,
      format: "png",
      mimeType: "image/png",
    };
  }

  const rawSvg = await file.text();
  const svgValidation = validateSvgMarkup(rawSvg);
  if (!svgValidation.ok) {
    return svgValidation;
  }

  if (file.type && !["image/svg+xml", "application/xml", "text/xml"].includes(file.type)) {
    return {
      ok: false,
      error: "SVG file type is invalid.",
    };
  }

  return {
    ok: true,
    format: "svg",
    mimeType: "image/svg+xml",
  };
}

export async function isStrictPngFile(file: File) {
  const result = await isStrictDiagramFile(file);
  if (!result.ok) {
    return result;
  }

  if (result.format !== "png") {
    return {
      ok: false,
      error: "Only PNG files are allowed.",
    } as const;
  }

  return {
    ok: true,
  } as const;
}

export function createEvidenceBundle(input: {
  provider: ArchitectureProvider;
  paragraph: string;
  ocrText: string;
  metadata: {
    diagramFormat?: ArchitectureDiagramFormat;
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
  quoteContext?: ArchitectureQuoteContext;
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
    quoteContext: input.quoteContext,
  });
}
