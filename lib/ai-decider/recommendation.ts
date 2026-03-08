import type { AiDeciderRecommendation, AiDeciderSignals } from "@/lib/ai-decider/types";
import type { AiDeciderAssessmentProfile } from "@/lib/ai-decider/scoring";

type RecommendationDecision = {
  recommendation: AiDeciderRecommendation;
  verdictHeadline: string;
  verdictLine: string;
};

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasOutcome(signals: AiDeciderSignals, outcome: string) {
  return signals.desiredOutcomes.includes(outcome);
}

function decisionText(recommendation: AiDeciderRecommendation): RecommendationDecision {
  switch (recommendation) {
    case "DO_NOT_USE_AI_YET":
      return {
        recommendation,
        verdictHeadline: "Do not start with AI.",
        verdictLine: "Clean up the process and inputs first before spending money on AI.",
      };
    case "RULES_AUTOMATION":
      return {
        recommendation,
        verdictHeadline: "Start with rules automation.",
        verdictLine: "This looks more like repeatable workflow automation than an AI problem.",
      };
    case "ANALYTICS_FIRST":
      return {
        recommendation,
        verdictHeadline: "Start with analytics first.",
        verdictLine: "You need better measurement and cleaner history before model-heavy work.",
      };
    case "SEARCH_RAG":
      return {
        recommendation,
        verdictHeadline: "This is mainly a search and retrieval problem.",
        verdictLine: "A grounded retrieval layer is a better first AI move than a free-form chatbot.",
      };
    case "DOCUMENT_INTELLIGENCE":
      return {
        recommendation,
        verdictHeadline: "Use document intelligence on a narrow scope.",
        verdictLine: "The strongest fit is extracting and validating repeatable documents with human review.",
      };
    case "PREDICTIVE_ML":
      return {
        recommendation,
        verdictHeadline: "This looks like a predictive ML use case.",
        verdictLine: "There appears to be enough historical signal for a scoped forecasting or scoring model.",
      };
    case "GENAI_ASSISTANT":
      return {
        recommendation,
        verdictHeadline: "Use AI as an assistant, not an autonomous worker.",
        verdictLine: "A human-reviewed assistant is the safest high-leverage first step here.",
      };
    case "AGENTIC_WORKFLOW":
      return {
        recommendation,
        verdictHeadline: "A controlled agentic workflow could fit.",
        verdictLine: "This process spans enough systems that orchestration matters, but it still needs guardrails.",
      };
    case "NEEDS_DISCOVERY":
    default:
      return {
        recommendation: "NEEDS_DISCOVERY",
        verdictHeadline: "Run a short discovery before choosing tooling.",
        verdictLine: "The problem statement is still too fuzzy to responsibly recommend AI or automation.",
      };
  }
}

export function recommendAiDeciderApproach(input: {
  signals: AiDeciderSignals;
  profile: AiDeciderAssessmentProfile;
}): RecommendationDecision {
  const { signals, profile } = input;
  const { scores, traits } = profile;

  const needsDiscoveryScore = average([
    traits.discoveryNeedScore,
    100 - scores.confidenceScore,
    100 - traits.processClarityScore,
  ]);

  const doNotUseScore = average([
    100 - scores.aiFitScore,
    100 - scores.dataReadinessScore,
    scores.implementationRiskScore,
    100 - scores.roiPlausibilityScore,
  ]);

  if (needsDiscoveryScore >= 70) {
    return decisionText("NEEDS_DISCOVERY");
  }

  if (doNotUseScore >= 72 && scores.automationFitScore < 62 && traits.analyticsFitScore < 62) {
    return decisionText("DO_NOT_USE_AI_YET");
  }

  const candidateScores: Record<
    Exclude<AiDeciderRecommendation, "DO_NOT_USE_AI_YET" | "NEEDS_DISCOVERY">,
    number
  > = {
    RULES_AUTOMATION:
      average([
        traits.repetitiveWorkScore,
        traits.processClarityScore,
        scores.automationFitScore,
        scores.roiPlausibilityScore,
      ]) +
      (hasOutcome(signals, "automation") ? 10 : 0) +
      (signals.dataTypes.includes("structured records") || signals.dataTypes.includes("documents") ? 6 : 0),
    ANALYTICS_FIRST:
      average([
        traits.analyticsFitScore,
        scores.dataReadinessScore,
        traits.impactScore,
        scores.confidenceScore,
      ]) +
      (hasOutcome(signals, "analytics") ? 10 : 0) +
      (hasOutcome(signals, "prediction") && scores.dataReadinessScore < 60 ? 8 : 0),
    SEARCH_RAG:
      average([
        traits.knowledgeFitScore,
        scores.aiFitScore,
        scores.dataReadinessScore,
        traits.impactScore,
      ]) + (hasOutcome(signals, "knowledge answers") ? 12 : 0),
    DOCUMENT_INTELLIGENCE:
      average([
        traits.documentFitScore,
        scores.aiFitScore,
        scores.dataReadinessScore,
        traits.impactScore,
      ]) + (hasOutcome(signals, "document extraction") ? 12 : 0),
    PREDICTIVE_ML:
      average([
        traits.predictiveFitScore,
        scores.aiFitScore,
        scores.dataReadinessScore,
        traits.impactScore,
        100 - scores.implementationRiskScore,
      ]) + (hasOutcome(signals, "prediction") ? 12 : 0),
    GENAI_ASSISTANT:
      average([
        scores.aiFitScore,
        traits.impactScore,
        scores.confidenceScore,
        traits.knowledgeFitScore,
      ]) + (hasOutcome(signals, "drafting assistance") ? 10 : 0),
    AGENTIC_WORKFLOW:
      average([
        traits.agenticFitScore,
        scores.aiFitScore,
        scores.automationFitScore,
        scores.dataReadinessScore,
        traits.impactScore,
      ]) +
      (signals.flags.includes("multi_system_workflow") ? 10 : 0) +
      (hasOutcome(signals, "automation") ? 6 : 0),
  };

  if (hasOutcome(signals, "prediction") && scores.dataReadinessScore < 60 && candidateScores.ANALYTICS_FIRST >= 60) {
    return decisionText("ANALYTICS_FIRST");
  }

  if (
    candidateScores.PREDICTIVE_ML >= 70 &&
    hasOutcome(signals, "prediction") &&
    scores.dataReadinessScore >= 60 &&
    scores.implementationRiskScore <= 72
  ) {
    return decisionText("PREDICTIVE_ML");
  }

  if (
    candidateScores.AGENTIC_WORKFLOW >= 72 &&
    traits.systemsComplexityScore >= 50 &&
    traits.processClarityScore >= 55 &&
    scores.dataReadinessScore >= 55
  ) {
    return decisionText("AGENTIC_WORKFLOW");
  }

  if (candidateScores.DOCUMENT_INTELLIGENCE >= 68 && signals.dataTypes.includes("documents")) {
    return decisionText("DOCUMENT_INTELLIGENCE");
  }

  if (candidateScores.SEARCH_RAG >= 66 && hasOutcome(signals, "knowledge answers")) {
    return decisionText("SEARCH_RAG");
  }

  const biasedCandidates = {
    RULES_AUTOMATION: candidateScores.RULES_AUTOMATION + 6,
    ANALYTICS_FIRST: candidateScores.ANALYTICS_FIRST + 6,
    SEARCH_RAG: candidateScores.SEARCH_RAG,
    DOCUMENT_INTELLIGENCE: candidateScores.DOCUMENT_INTELLIGENCE,
    PREDICTIVE_ML: candidateScores.PREDICTIVE_ML,
    GENAI_ASSISTANT: candidateScores.GENAI_ASSISTANT,
    AGENTIC_WORKFLOW: candidateScores.AGENTIC_WORKFLOW,
  };

  const [bestRecommendation] = Object.entries(biasedCandidates).sort((left, right) => right[1] - left[1])[0] ?? [
    "NEEDS_DISCOVERY",
    0,
  ];

  if (bestRecommendation === "SEARCH_RAG" && scores.dataReadinessScore < 45) {
    return decisionText("NEEDS_DISCOVERY");
  }

  if (bestRecommendation === "GENAI_ASSISTANT" && scores.implementationRiskScore >= 75) {
    return decisionText("RULES_AUTOMATION");
  }

  return decisionText(bestRecommendation as AiDeciderRecommendation);
}
