import type { AiDeciderRecommendation } from "@/lib/ai-decider/types";

export const AI_DECIDER_BLOCKED_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "msn.com",
  "yandex.com",
] as const;

export const AI_DECIDER_RECOMMENDATION_LABELS: Record<AiDeciderRecommendation, string> = {
  DO_NOT_USE_AI_YET: "Do not use AI yet",
  RULES_AUTOMATION: "Rules automation",
  ANALYTICS_FIRST: "Analytics first",
  SEARCH_RAG: "Search or RAG",
  DOCUMENT_INTELLIGENCE: "Document intelligence",
  PREDICTIVE_ML: "Predictive ML",
  GENAI_ASSISTANT: "GenAI assistant",
  AGENTIC_WORKFLOW: "Agentic workflow",
  NEEDS_DISCOVERY: "Needs discovery",
};

export const AI_DECIDER_FINDING_CATEGORY_LABELS = {
  problem_definition: "Problem definition",
  process_design: "Process design",
  data_readiness: "Data readiness",
  systems: "Systems",
  risk: "Risk",
  economics: "Economics",
  change_management: "Change management",
  delivery_scope: "Delivery scope",
} as const;

export type AiDeciderQuotePricingConfig = Record<
  "Clarity Call" | "Feasibility Memo" | "Solution Blueprint" | "Implementation Design Sprint",
  {
    low: [number, number, number];
    high: [number, number, number];
  }
>;

export const AI_DECIDER_QUOTE_PRICING_CONFIG: AiDeciderQuotePricingConfig = {
  "Clarity Call": {
    low: [149, 199, 249],
    high: [199, 249, 299],
  },
  "Feasibility Memo": {
    low: [350, 500, 650],
    high: [600, 750, 900],
  },
  "Solution Blueprint": {
    low: [900, 1400, 1900],
    high: [1600, 2100, 2500],
  },
  "Implementation Design Sprint": {
    low: [2000, 3000, 4200],
    high: [3200, 4500, 5500],
  },
};

export const CONSULTATION_CTA_PATH = "/services#service-request";
