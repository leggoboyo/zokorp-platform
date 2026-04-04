export type ToolVariant = "architecture-reviewer" | "validator" | "mlops-forecast-beta";

export type ToolDefinition = {
  slug: string;
  variant: ToolVariant;
  displayName: string;
  productDescription: string;
  softwareHubStatus: string;
  softwareHubSummary: string;
  requiresVerifiedFreeToolAccount: boolean;
  betaLabel?: string;
};

const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  "architecture-diagram-reviewer": {
    slug: "architecture-diagram-reviewer",
    variant: "architecture-reviewer",
    displayName: "Architecture Diagram Reviewer",
    productDescription:
      "Architecture review for AWS diagrams with deterministic findings, source-backed guidance, consultation-first handling for broken designs, and bounded remediation estimates for workable submissions.",
    softwareHubStatus: "Architecture review",
    softwareHubSummary:
      "Upload an architecture PNG, JPG, PDF, or SVG and receive score-based findings, source-backed guidance, and a consultation-first or bounded-remediation next step.",
    requiresVerifiedFreeToolAccount: true,
  },
  "zokorp-validator": {
    slug: "zokorp-validator",
    variant: "validator",
    displayName: "ZoKorpValidator",
    productDescription:
      "FTR-first validation workflow with deterministic scoring, exact rewrite help where possible, email delivery, and estimate-first follow-up.",
    softwareHubStatus: "FTR-first launch",
    softwareHubSummary:
      "Use credit-based validation for FTR evidence today, with on-screen findings, email delivery, and actionable rewrite guidance.",
    requiresVerifiedFreeToolAccount: false,
  },
  "mlops-foundation-platform": {
    slug: "mlops-foundation-platform",
    variant: "mlops-forecast-beta",
    displayName: "ZoKorp Forecasting Beta",
    productDescription:
      "Forecasting beta for SMB teams. Upload CSV or XLSX revenue history, review a deterministic forecast, and treat this as a narrow beta instead of a full MLOps platform.",
    softwareHubStatus: "Forecasting beta",
    softwareHubSummary:
      "Upload spreadsheet data, run a narrow revenue-forecast workflow, and expand only if your team actually needs more modules.",
    requiresVerifiedFreeToolAccount: false,
    betaLabel: "Forecasting beta only",
  },
};

export function getToolDefinition(slug: string) {
  return TOOL_DEFINITIONS[slug] ?? null;
}

export function getToolDefinitions() {
  return Object.values(TOOL_DEFINITIONS);
}
