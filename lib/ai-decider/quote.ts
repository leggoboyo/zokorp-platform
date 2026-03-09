import { AI_DECIDER_QUOTE_PRICING_CONFIG } from "@/lib/ai-decider/config";
import { scaleQuoteLineItems, type QuoteLineItem } from "@/lib/quote-line-items";
import type { AiDeciderQuote, AiDeciderRecommendation } from "@/lib/ai-decider/types";
import type { AiDeciderAssessmentProfile } from "@/lib/ai-decider/scoring";

function bucket(value: number) {
  if (value >= 75) {
    return 2;
  }

  if (value >= 50) {
    return 1;
  }

  return 0;
}

function toConfidence(profile: AiDeciderAssessmentProfile): AiDeciderQuote["confidence"] {
  if (profile.scores.confidenceScore >= 75 && profile.scores.dataReadinessScore >= 60) {
    return "high";
  }

  if (profile.scores.confidenceScore >= 55) {
    return "medium";
  }

  return "low";
}

function pickEngagementType(
  recommendation: AiDeciderRecommendation,
  profile: AiDeciderAssessmentProfile,
): AiDeciderQuote["engagementType"] {
  const { scores, traits } = profile;

  if (recommendation === "AGENTIC_WORKFLOW") {
    return "Implementation Design Sprint";
  }

  if (recommendation === "DO_NOT_USE_AI_YET" || recommendation === "NEEDS_DISCOVERY") {
    return traits.impactScore >= 70 ? "Feasibility Memo" : "Clarity Call";
  }

  if (recommendation === "RULES_AUTOMATION" || recommendation === "ANALYTICS_FIRST") {
    return scores.dataReadinessScore >= 60 && scores.implementationRiskScore < 65
      ? "Solution Blueprint"
      : "Feasibility Memo";
  }

  if (scores.dataReadinessScore < 55 || scores.implementationRiskScore >= 70) {
    return "Feasibility Memo";
  }

  return "Solution Blueprint";
}

function baseEngagementReason(engagementType: AiDeciderQuote["engagementType"]) {
  switch (engagementType) {
    case "Clarity Call":
      return "Covers a short decision-making session to frame the workflow, KPI, and next safe move.";
    case "Feasibility Memo":
      return "Covers a written feasibility pass before any build commitment is made.";
    case "Solution Blueprint":
      return "Covers the core design block to define the target workflow, data path, and implementation shape.";
    case "Implementation Design Sprint":
      return "Covers the base design sprint needed before a higher-risk agentic or multi-system build.";
  }
}

function buildLineItems(input: {
  engagementType: AiDeciderQuote["engagementType"];
  recommendation: AiDeciderRecommendation;
  profile: AiDeciderAssessmentProfile;
  priceLow: number;
  priceHigh: number;
}) {
  const processWeight = 14 + Math.max(0, 65 - input.profile.traits.processClarityScore) * 0.12;
  const dataWeight = 14 + Math.max(0, 65 - input.profile.scores.dataReadinessScore) * 0.12;
  const systemsWeight =
    14 +
    Math.max(input.profile.traits.systemsComplexityScore, input.profile.scores.implementationRiskScore) * 0.08;
  const baseWeight = Math.max(38, 100 - processWeight - dataWeight - systemsWeight);

  const rawItems: QuoteLineItem[] = [
    {
      code: `ai-base-${input.engagementType.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
      label: `${input.engagementType} base scope`,
      amountLow: Math.round(baseWeight * 10),
      amountHigh: Math.round(baseWeight * 12),
      reason: baseEngagementReason(input.engagementType),
    },
    {
      code: "ai-workflow-definition",
      label:
        input.recommendation === "DO_NOT_USE_AI_YET" || input.recommendation === "NEEDS_DISCOVERY"
          ? "Workflow clarification and KPI framing"
          : "Workflow mapping and KPI alignment",
      amountLow: Math.round(processWeight * 10),
      amountHigh: Math.round(processWeight * 12),
      reason:
        input.profile.traits.processClarityScore >= 65
          ? "The workflow is reasonably stable, but it still needs a clean target path and business metric."
          : "Process ambiguity is still material enough that clarification work should stay in scope.",
    },
    {
      code: "ai-data-readiness",
      label:
        input.profile.scores.dataReadinessScore >= 60
          ? "Data and source validation"
          : "Data cleanup and readiness planning",
      amountLow: Math.round(dataWeight * 10),
      amountHigh: Math.round(dataWeight * 12),
      reason:
        input.profile.scores.dataReadinessScore >= 60
          ? "The current sources look usable, but they still need validation against the first release scope."
          : "The current data foundation is weak enough that readiness work should be quoted explicitly.",
    },
    {
      code: "ai-systems-risk",
      label:
        input.profile.scores.implementationRiskScore >= 65 ||
        input.profile.traits.systemsComplexityScore >= 60
          ? "Systems coordination and rollout safeguards"
          : "Implementation planning and review loop",
      amountLow: Math.round(systemsWeight * 10),
      amountHigh: Math.round(systemsWeight * 12),
      reason:
        input.profile.scores.implementationRiskScore >= 65
          ? "Delivery risk is high enough that rollout boundaries and human review need explicit planning."
          : "The implementation still needs a bounded rollout plan, system mapping, and review checkpoints.",
    },
  ];

  return scaleQuoteLineItems(rawItems, input.priceLow, input.priceHigh);
}

export function buildAiDeciderQuote(input: {
  recommendation: AiDeciderRecommendation;
  profile: AiDeciderAssessmentProfile;
}): AiDeciderQuote {
  const { recommendation, profile } = input;
  const engagementType = pickEngagementType(recommendation, profile);
  const complexityScore =
    profile.traits.systemsComplexityScore * 0.35 +
    profile.scores.implementationRiskScore * 0.35 +
    (100 - profile.scores.dataReadinessScore) * 0.15 +
    profile.traits.discoveryNeedScore * 0.15;
  const complexityBucket = bucket(complexityScore);
  const pricing = AI_DECIDER_QUOTE_PRICING_CONFIG[engagementType];
  const priceLow = pricing.low[complexityBucket];
  const priceHigh = pricing.high[complexityBucket];

  return {
    engagementType,
    priceLow,
    priceHigh,
    confidence: toConfidence(profile),
    lineItems: buildLineItems({
      engagementType,
      recommendation,
      profile,
      priceLow,
      priceHigh,
    }),
    rationaleLines: [
      `Recommendation type: ${recommendation.replaceAll("_", " ").toLowerCase()}.`,
      `Complexity is driven by ${profile.traits.systemsComplexityScore >= 60 ? "multi-system coordination" : "manageable system scope"} and ${profile.scores.implementationRiskScore >= 65 ? "meaningful delivery risk" : "moderate delivery risk"}.`,
      `Data readiness is ${profile.scores.dataReadinessScore}/100, which ${profile.scores.dataReadinessScore >= 60 ? "supports design work now" : "suggests more discovery before implementation"}.`,
    ],
  };
}
