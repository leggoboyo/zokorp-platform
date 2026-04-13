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
      "Review a cloud architecture diagram and get findings, guidance, and a clear next step.",
    softwareHubStatus: "Architecture review",
    softwareHubSummary:
      "Upload a diagram and get findings, guidance, and a scoped next step.",
    requiresVerifiedFreeToolAccount: true,
  },
  "zokorp-validator": {
    slug: "zokorp-validator",
    variant: "validator",
    displayName: "ZoKorpValidator",
    productDescription:
      "FTR-first validation with deterministic scoring and estimate-first follow-up.",
    softwareHubStatus: "FTR-first launch",
    softwareHubSummary:
      "Use credit-based validation for FTR evidence with on-screen findings and follow-up guidance.",
    requiresVerifiedFreeToolAccount: false,
  },
  "mlops-foundation-platform": {
    slug: "mlops-foundation-platform",
    variant: "mlops-forecast-beta",
    displayName: "ZoKorp Forecasting Beta",
    productDescription:
      "Upload revenue history and review a deterministic forecast in a narrow beta workflow.",
    softwareHubStatus: "Forecasting beta",
    softwareHubSummary:
      "Upload spreadsheet data and run a narrow revenue-forecast workflow.",
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
