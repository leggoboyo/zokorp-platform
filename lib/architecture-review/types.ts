import { z } from "zod";

export const ARCHITECTURE_REVIEW_VERSION = "1.0" as const;

export const architectureProviderSchema = z.enum(["aws", "azure", "gcp"]);
export type ArchitectureProvider = z.infer<typeof architectureProviderSchema>;

export const architectureDiagramFormatSchema = z.enum(["png", "svg"]);
export type ArchitectureDiagramFormat = z.infer<typeof architectureDiagramFormatSchema>;

export const architectureCategorySchema = z.enum([
  "clarity",
  "security",
  "reliability",
  "operations",
  "performance",
  "cost",
  "sustainability",
]);
export type ArchitectureCategory = z.infer<typeof architectureCategorySchema>;

export const architectureWorkloadCriticalitySchema = z.enum(["low", "standard", "mission-critical"]);
export type ArchitectureWorkloadCriticality = z.infer<typeof architectureWorkloadCriticalitySchema>;

export const architectureRegulatoryScopeSchema = z.enum(["none", "soc2", "pci", "hipaa", "other"]);
export type ArchitectureRegulatoryScope = z.infer<typeof architectureRegulatoryScopeSchema>;

export const architectureEnvironmentSchema = z.enum(["dev", "test", "prod"]);
export type ArchitectureEnvironment = z.infer<typeof architectureEnvironmentSchema>;

export const architectureLifecycleStageSchema = z.enum(["early-design", "pre-prod", "production"]);
export type ArchitectureLifecycleStage = z.infer<typeof architectureLifecycleStageSchema>;

export const architectureEngagementPreferenceSchema = z.enum([
  "review-call-only",
  "hands-on-remediation",
  "diagram-rebuild",
  "ongoing-quarterly-reviews",
  "architect-on-call",
]);
export type ArchitectureEngagementPreference = z.infer<typeof architectureEngagementPreferenceSchema>;

export const architectureFindingSchema = z.object({
  ruleId: z.string().trim().min(1).max(80),
  category: architectureCategorySchema,
  pointsDeducted: z.number().int().min(0).max(100),
  message: z.string().trim().min(1).max(120),
  fix: z.string().trim().min(1).max(160),
  evidence: z.string().trim().min(1).max(240),
  fixCostUSD: z.number().int().min(0),
});
export type ArchitectureFinding = z.infer<typeof architectureFindingSchema>;

export const architectureFindingDraftSchema = architectureFindingSchema.omit({
  fixCostUSD: true,
});
export type ArchitectureFindingDraft = z.infer<typeof architectureFindingDraftSchema>;

export const architectureReviewReportSchema = z.object({
  reportVersion: z.literal(ARCHITECTURE_REVIEW_VERSION),
  provider: architectureProviderSchema,
  overallScore: z.number().int().min(0).max(100),
  flowNarrative: z.string().trim().min(1).max(2000),
  findings: z.array(architectureFindingSchema).max(20),
  consultationQuoteUSD: z.number().int().min(0),
  generatedAtISO: z.string().datetime({ offset: true }),
  userEmail: z.string().email(),
});
export type ArchitectureReviewReport = z.infer<typeof architectureReviewReportSchema>;

export const architectureReviewMetadataSchema = z.object({
  diagramFormat: architectureDiagramFormatSchema.optional(),
  title: z.string().trim().max(160).optional(),
  owner: z.string().trim().max(160).optional(),
  lastUpdated: z.string().trim().max(60).optional(),
  version: z.string().trim().max(60).optional(),
  legend: z.string().trim().max(600).optional(),
  paragraphInput: z.string().trim().min(1).max(2000).optional(),
  tokenCount: z.number().int().min(0).max(5000).optional(),
  ocrCharacterCount: z.number().int().min(0).max(50000).optional(),
  mode: z.enum(["rules-only", "webllm"]).optional(),
  workloadCriticality: architectureWorkloadCriticalitySchema.optional(),
  regulatoryScope: architectureRegulatoryScopeSchema.optional(),
  environment: architectureEnvironmentSchema.optional(),
  lifecycleStage: architectureLifecycleStageSchema.optional(),
  desiredEngagement: architectureEngagementPreferenceSchema.optional(),
});
export type ArchitectureReviewMetadata = z.infer<typeof architectureReviewMetadataSchema>;

export const submitArchitectureReviewMetadataSchema = architectureReviewMetadataSchema.extend({
  provider: architectureProviderSchema,
  paragraphInput: z.string().trim().min(1).max(2000),
});
export type SubmitArchitectureReviewMetadata = z.infer<typeof submitArchitectureReviewMetadataSchema>;

export const submitArchitectureReviewPayloadSchema = z.object({
  report: architectureReviewReportSchema,
  metadata: architectureReviewMetadataSchema,
});
export type SubmitArchitectureReviewPayload = z.infer<typeof submitArchitectureReviewPayloadSchema>;

export const llmRefinementSchema = z.object({
  flowNarrative: z.string().trim().min(1).max(2000),
  findings: z.array(architectureFindingDraftSchema).max(20),
});
export type LlmRefinement = z.infer<typeof llmRefinementSchema>;

export type ArchitectureEvidenceBundle = {
  provider: ArchitectureProvider;
  paragraph: string;
  ocrText: string;
  serviceTokens: string[];
  metadata: {
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
};