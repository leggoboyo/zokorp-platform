import { AI_DECIDER_QUOTE_PRICING_CONFIG } from "@/lib/ai-decider/config";
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

  return {
    engagementType,
    priceLow: pricing.low[complexityBucket],
    priceHigh: pricing.high[complexityBucket],
    confidence: toConfidence(profile),
    rationaleLines: [
      `Recommendation type: ${recommendation.replaceAll("_", " ").toLowerCase()}.`,
      `Complexity is driven by ${profile.traits.systemsComplexityScore >= 60 ? "multi-system coordination" : "manageable system scope"} and ${profile.scores.implementationRiskScore >= 65 ? "meaningful delivery risk" : "moderate delivery risk"}.`,
      `Data readiness is ${profile.scores.dataReadinessScore}/100, which ${profile.scores.dataReadinessScore >= 60 ? "supports design work now" : "suggests more discovery before implementation"}.`,
    ],
  };
}
