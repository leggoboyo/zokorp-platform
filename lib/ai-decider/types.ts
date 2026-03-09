import { z } from "zod";

import { quoteLineItemSchema } from "@/lib/quote-line-items";

export const AI_DECIDER_VERSION = "1.0" as const;

const websiteRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

export const aiDeciderRecommendationSchema = z.enum([
  "DO_NOT_USE_AI_YET",
  "RULES_AUTOMATION",
  "ANALYTICS_FIRST",
  "SEARCH_RAG",
  "DOCUMENT_INTELLIGENCE",
  "PREDICTIVE_ML",
  "GENAI_ASSISTANT",
  "AGENTIC_WORKFLOW",
  "NEEDS_DISCOVERY",
]);
export type AiDeciderRecommendation = z.infer<typeof aiDeciderRecommendationSchema>;

export const aiDeciderSignalScaleSchema = z.enum(["unknown", "low", "medium", "high"]);
export type AiDeciderSignalScale = z.infer<typeof aiDeciderSignalScaleSchema>;

export const aiDeciderProcessStabilitySchema = z.enum(["unknown", "stable", "mixed", "unstable"]);
export type AiDeciderProcessStability = z.infer<typeof aiDeciderProcessStabilitySchema>;

export const aiDeciderFindingSeveritySchema = z.enum(["low", "medium", "high"]);
export type AiDeciderFindingSeverity = z.infer<typeof aiDeciderFindingSeveritySchema>;

export const aiDeciderFindingCategorySchema = z.enum([
  "problem_definition",
  "process_design",
  "data_readiness",
  "systems",
  "risk",
  "economics",
  "change_management",
  "delivery_scope",
]);
export type AiDeciderFindingCategory = z.infer<typeof aiDeciderFindingCategorySchema>;

export const aiDeciderQuestionIdSchema = z.enum([
  "task_frequency",
  "process_variability",
  "data_state",
  "impact_window",
  "error_tolerance",
  "regulatory_exposure",
  "systems_count",
  "knowledge_source",
  "historical_outcomes",
  "document_consistency",
  "decision_logic",
  "response_mode",
]);
export type AiDeciderQuestionId = z.infer<typeof aiDeciderQuestionIdSchema>;

export const aiDeciderLeadSchema = z.object({
  email: z.string().trim().email().max(160),
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
  roleTitle: z.string().trim().min(2).max(160),
  website: z
    .string()
    .trim()
    .max(160)
    .optional()
    .default("")
    .superRefine((value, ctx) => {
      if (!value) {
        return;
      }

      if (!websiteRegex.test(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid company website or domain.",
        });
      }
    }),
  narrativeInput: z.string().trim().min(80).max(6000),
});
export type AiDeciderLeadInput = z.infer<typeof aiDeciderLeadSchema>;

export const aiDeciderSubmissionRequestSchema = aiDeciderLeadSchema.extend({
  answers: z.record(z.string(), z.string().trim().min(1).max(40)).default({}),
});
export type AiDeciderSubmissionRequest = z.infer<typeof aiDeciderSubmissionRequestSchema>;

export const aiDeciderQuestionOptionSchema = z.object({
  value: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(180),
});
export type AiDeciderQuestionOption = z.infer<typeof aiDeciderQuestionOptionSchema>;

export const aiDeciderQuestionSchema = z.object({
  id: aiDeciderQuestionIdSchema,
  prompt: z.string().trim().min(1).max(220),
  help: z.string().trim().min(1).max(220),
  whyAsked: z.string().trim().min(1).max(180),
  options: z.array(aiDeciderQuestionOptionSchema).min(3).max(5),
});
export type AiDeciderQuestion = z.infer<typeof aiDeciderQuestionSchema>;

export const aiDeciderSignalsSchema = z.object({
  businessFunctions: z.array(z.string().trim().min(1).max(40)).max(4),
  dataTypes: z.array(z.string().trim().min(1).max(40)).max(5),
  desiredOutcomes: z.array(z.string().trim().min(1).max(40)).max(4),
  scale: aiDeciderSignalScaleSchema,
  riskLevel: z.enum(["low", "medium", "high"]),
  existingSystems: z.array(z.string().trim().min(1).max(40)).max(8),
  processStability: aiDeciderProcessStabilitySchema,
  flags: z.array(z.string().trim().min(1).max(60)).max(12),
  matchedKeywords: z.record(z.string(), z.array(z.string().trim().min(1).max(40)).max(12)),
  narrativeWordCount: z.number().int().min(0).max(4000),
});
export type AiDeciderSignals = z.infer<typeof aiDeciderSignalsSchema>;

export const aiDeciderScoresSchema = z.object({
  aiFitScore: z.number().int().min(0).max(100),
  automationFitScore: z.number().int().min(0).max(100),
  dataReadinessScore: z.number().int().min(0).max(100),
  implementationRiskScore: z.number().int().min(0).max(100),
  roiPlausibilityScore: z.number().int().min(0).max(100),
  confidenceScore: z.number().int().min(0).max(100),
});
export type AiDeciderScores = z.infer<typeof aiDeciderScoresSchema>;

export const aiDeciderFindingSchema = z.object({
  category: aiDeciderFindingCategorySchema,
  severity: aiDeciderFindingSeveritySchema,
  finding: z.string().trim().min(1).max(180),
  recommendedFix: z.string().trim().min(1).max(180),
});
export type AiDeciderFinding = z.infer<typeof aiDeciderFindingSchema>;

export const aiDeciderQuoteSchema = z.object({
  engagementType: z.enum([
    "Clarity Call",
    "Feasibility Memo",
    "Solution Blueprint",
    "Implementation Design Sprint",
  ]),
  priceLow: z.number().int().min(0),
  priceHigh: z.number().int().min(0),
  confidence: z.enum(["high", "medium", "low"]),
  lineItems: z.array(quoteLineItemSchema).min(3).max(5),
  rationaleLines: z.array(z.string().trim().min(1).max(160)).min(2).max(4),
});
export type AiDeciderQuote = z.infer<typeof aiDeciderQuoteSchema>;

export const aiDeciderReportSchema = z.object({
  reportVersion: z.literal(AI_DECIDER_VERSION),
  generatedAtISO: z.string().datetime({ offset: true }),
  verdictHeadline: z.string().trim().min(1).max(120),
  verdictLine: z.string().trim().min(1).max(180),
  summaryParagraph: z.string().trim().min(1).max(420),
  recommendation: aiDeciderRecommendationSchema,
  scores: aiDeciderScoresSchema,
  findings: z.array(aiDeciderFindingSchema).max(12),
  blockers: z.array(z.string().trim().min(1).max(160)).max(5),
  nextSteps: z.array(z.string().trim().min(1).max(160)).min(2).max(5),
  quote: aiDeciderQuoteSchema,
  signals: aiDeciderSignalsSchema,
  adaptiveQuestions: z.array(aiDeciderQuestionSchema).min(4).max(8),
});
export type AiDeciderReport = z.infer<typeof aiDeciderReportSchema>;

export const aiDeciderSubmissionResponseSchema = z.union([
  z.object({
    status: z.literal("sent"),
    verdictLine: z.string().trim().min(1).max(180),
    recommendation: aiDeciderRecommendationSchema,
  }),
  z.object({
    status: z.literal("fallback"),
    verdictLine: z.string().trim().min(1).max(180),
    recommendation: aiDeciderRecommendationSchema,
    reason: z.string().trim().min(1).max(240),
  }),
  z.object({
    error: z.string().trim().min(1).max(240),
  }),
]);
export type AiDeciderSubmissionResponse = z.infer<typeof aiDeciderSubmissionResponseSchema>;
