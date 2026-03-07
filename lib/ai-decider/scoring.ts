import type { AiDeciderScores, AiDeciderSignals } from "@/lib/ai-decider/types";

type AnswerMap = Record<string, string>;

export type AiDeciderAssessmentProfile = {
  scores: AiDeciderScores;
  traits: {
    repetitiveWorkScore: number;
    processClarityScore: number;
    dataFoundationScore: number;
    impactScore: number;
    knowledgeFitScore: number;
    documentFitScore: number;
    predictiveFitScore: number;
    analyticsFitScore: number;
    agenticFitScore: number;
    discoveryNeedScore: number;
    systemsComplexityScore: number;
    riskConstraintScore: number;
  };
};

const TASK_FREQUENCY_SCORES = {
  many_times_daily: 95,
  daily: 80,
  weekly: 55,
  monthly: 25,
} as const;

const PROCESS_VARIABILITY_SCORES = {
  highly_standard: 95,
  mostly_standard: 75,
  many_exceptions: 40,
  case_by_case: 15,
} as const;

const DATA_STATE_SCORES = {
  structured_ready: 85,
  mixed_needs_cleanup: 60,
  scattered_manual: 35,
  little_history: 20,
} as const;

const IMPACT_WINDOW_SCORES = {
  minor: 25,
  moderate: 55,
  major: 80,
  strategic: 95,
} as const;

const ERROR_TOLERANCE_SCORES = {
  forgiving: 85,
  human_reviewed: 65,
  low_tolerance: 30,
  near_zero_tolerance: 10,
} as const;

const REGULATORY_EXPOSURE_SCORES = {
  none: 15,
  internal_sensitive: 35,
  customer_or_financial: 65,
  regulated_or_safety: 90,
} as const;

const SYSTEMS_COUNT_SCORES = {
  one_two: 20,
  three_four: 50,
  five_plus: 85,
  unclear: 70,
} as const;

const KNOWLEDGE_SOURCE_SCORES = {
  single_curated: 85,
  few_curated: 65,
  many_conflicting: 35,
  mostly_in_heads: 15,
} as const;

const HISTORICAL_OUTCOME_SCORES = {
  little_history: 15,
  manual_history: 40,
  clean_history: 70,
  labeled_history: 90,
} as const;

const DOCUMENT_CONSISTENCY_SCORES = {
  highly_standard: 85,
  mostly_similar: 65,
  very_variable: 35,
  poor_input_quality: 15,
} as const;

const DECISION_LOGIC_SCORES = {
  clear_rules: 90,
  rules_plus_judgment: 65,
  mostly_judgment: 35,
  goal_not_decided: 10,
} as const;

const RESPONSE_MODE_SCORES = {
  draft_with_human: 55,
  auto_with_review: 70,
  auto_without_review: 85,
  not_sure: 20,
} as const;

const SIGNAL_SCALE_SCORES = {
  unknown: 45,
  low: 30,
  medium: 60,
  high: 85,
} as const;

const SIGNAL_PROCESS_STABILITY_SCORES = {
  unknown: 40,
  stable: 80,
  mixed: 50,
  unstable: 20,
} as const;

const SIGNAL_RISK_SCORES = {
  low: 15,
  medium: 50,
  high: 80,
} as const;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(clamp(value));
}

function hasOutcome(signals: AiDeciderSignals, outcome: string) {
  return signals.desiredOutcomes.includes(outcome);
}

function defaultSystemsComplexity(signals: AiDeciderSignals) {
  if (signals.existingSystems.length >= 5) {
    return 85;
  }

  if (signals.existingSystems.length >= 3) {
    return 60;
  }

  if (signals.existingSystems.length >= 1) {
    return 30;
  }

  return 45;
}

function pickScore<T extends Record<string, number>>(
  answers: AnswerMap,
  questionId: string,
  scoreMap: T,
  fallback: number,
) {
  const value = answers[questionId];
  if (value && value in scoreMap) {
    return scoreMap[value as keyof T];
  }

  return fallback;
}

export function buildAiDeciderAssessmentProfile(input: {
  signals: AiDeciderSignals;
  answers: AnswerMap;
}): AiDeciderAssessmentProfile {
  const { signals, answers } = input;

  const frequencyScore = pickScore(
    answers,
    "task_frequency",
    TASK_FREQUENCY_SCORES,
    SIGNAL_SCALE_SCORES[signals.scale],
  );
  const processScore = pickScore(
    answers,
    "process_variability",
    PROCESS_VARIABILITY_SCORES,
    SIGNAL_PROCESS_STABILITY_SCORES[signals.processStability],
  );
  const dataStateScore = pickScore(
    answers,
    "data_state",
    DATA_STATE_SCORES,
    signals.dataTypes.includes("structured records") ? 70 : 45,
  );
  const impactScore = pickScore(answers, "impact_window", IMPACT_WINDOW_SCORES, 55);
  const errorToleranceScore = pickScore(answers, "error_tolerance", ERROR_TOLERANCE_SCORES, 55);
  const regulatoryScore = pickScore(
    answers,
    "regulatory_exposure",
    REGULATORY_EXPOSURE_SCORES,
    SIGNAL_RISK_SCORES[signals.riskLevel],
  );
  const systemsComplexityScore = pickScore(
    answers,
    "systems_count",
    SYSTEMS_COUNT_SCORES,
    defaultSystemsComplexity(signals),
  );
  const knowledgeSourceScore = pickScore(
    answers,
    "knowledge_source",
    KNOWLEDGE_SOURCE_SCORES,
    signals.dataTypes.includes("knowledge base") ? 55 : 60,
  );
  const historicalOutcomeScore = pickScore(
    answers,
    "historical_outcomes",
    HISTORICAL_OUTCOME_SCORES,
    hasOutcome(signals, "prediction")
      ? signals.dataTypes.includes("structured records")
        ? 55
        : 30
      : 45,
  );
  const documentConsistencyScore = pickScore(
    answers,
    "document_consistency",
    DOCUMENT_CONSISTENCY_SCORES,
    signals.dataTypes.includes("documents") ? 50 : 60,
  );
  const decisionLogicScore = pickScore(
    answers,
    "decision_logic",
    DECISION_LOGIC_SCORES,
    clamp(processScore + 5),
  );
  const responseModeScore = pickScore(answers, "response_mode", RESPONSE_MODE_SCORES, 55);

  const repetitiveWorkScore = round(average([frequencyScore, processScore, decisionLogicScore]));
  const processClarityScore = round(average([processScore, decisionLogicScore]));

  const dataComponents = [dataStateScore];
  if (hasOutcome(signals, "prediction") || hasOutcome(signals, "analytics")) {
    dataComponents.push(historicalOutcomeScore);
  }
  if (signals.dataTypes.includes("documents")) {
    dataComponents.push(documentConsistencyScore);
  }
  if (signals.dataTypes.includes("knowledge base") || hasOutcome(signals, "knowledge answers")) {
    dataComponents.push(knowledgeSourceScore);
  }
  const dataFoundationScore = round(average(dataComponents));

  const riskConstraintScore = round(
    average([
      regulatoryScore,
      100 - errorToleranceScore,
      systemsComplexityScore,
      100 - processScore,
      100 - dataStateScore,
    ]),
  );

  const knowledgeFitScore = round(
    average([
      knowledgeSourceScore,
      dataFoundationScore,
      hasOutcome(signals, "knowledge answers") ? 80 : 40,
      responseModeScore,
    ]),
  );
  const documentFitScore = round(
    average([
      documentConsistencyScore,
      dataStateScore,
      processScore,
      hasOutcome(signals, "document extraction") ? 85 : 40,
    ]),
  );
  const predictiveFitScore = round(
    average([
      historicalOutcomeScore,
      dataFoundationScore,
      impactScore,
      SIGNAL_SCALE_SCORES[signals.scale],
      hasOutcome(signals, "prediction") ? 85 : 35,
    ]),
  );
  const analyticsFitScore = round(
    average([
      historicalOutcomeScore,
      dataFoundationScore,
      impactScore,
      hasOutcome(signals, "analytics") ? 80 : 45,
    ]),
  );
  const agenticFitScore = round(
    average([
      systemsComplexityScore,
      processScore,
      dataFoundationScore,
      responseModeScore,
      hasOutcome(signals, "automation") ? 75 : 45,
    ]),
  );
  const discoveryNeedScore = round(
    average([
      100 - decisionLogicScore,
      100 - processScore,
      100 - dataFoundationScore,
      signals.flags.includes("unclear_problem_statement") ? 90 : 30,
      signals.flags.includes("ai_push_from_leadership") ? 70 : 30,
    ]),
  );

  let aiFitScore = round(
    average([
      dataFoundationScore,
      processScore,
      responseModeScore,
      hasOutcome(signals, "knowledge answers") ? 75 : 45,
      hasOutcome(signals, "document extraction") ? 80 : 45,
      hasOutcome(signals, "prediction") ? 85 : 45,
      hasOutcome(signals, "drafting assistance") ? 75 : 45,
    ]),
  );
  if (decisionLogicScore >= 80 && hasOutcome(signals, "automation")) {
    aiFitScore -= 12;
  }
  if (riskConstraintScore >= 70) {
    aiFitScore -= 10;
  }
  if (discoveryNeedScore >= 70) {
    aiFitScore -= 12;
  }

  let automationFitScore = round(
    average([
      repetitiveWorkScore,
      processClarityScore,
      dataStateScore,
      impactScore,
    ]),
  );
  if (hasOutcome(signals, "automation")) {
    automationFitScore += 10;
  }
  if (hasOutcome(signals, "prediction") || hasOutcome(signals, "knowledge answers")) {
    automationFitScore -= 8;
  }

  const dataReadinessScore = round(dataFoundationScore);

  let implementationRiskScore = round(riskConstraintScore);
  if (signals.flags.includes("multi_system_workflow")) {
    implementationRiskScore += 6;
  }

  let roiPlausibilityScore = round(
    average([
      frequencyScore,
      impactScore,
      processScore,
      dataFoundationScore,
      100 - Math.max(20, systemsComplexityScore - 10),
    ]),
  );
  if (systemsComplexityScore >= 80 && impactScore < 70) {
    roiPlausibilityScore -= 8;
  }

  let confidenceScore = round(
    average([
      Math.min(100, signals.narrativeWordCount * 2),
      processClarityScore,
      dataFoundationScore,
      100 - discoveryNeedScore,
      Math.min(
        100,
        Object.values(signals.matchedKeywords).filter((hits) => hits.length > 0).length * 14,
      ),
    ]),
  );
  if (signals.flags.includes("unclear_problem_statement")) {
    confidenceScore -= 10;
  }

  return {
    scores: {
      aiFitScore: round(aiFitScore),
      automationFitScore: round(automationFitScore),
      dataReadinessScore: round(dataReadinessScore),
      implementationRiskScore: round(implementationRiskScore),
      roiPlausibilityScore: round(roiPlausibilityScore),
      confidenceScore: round(confidenceScore),
    },
    traits: {
      repetitiveWorkScore,
      processClarityScore,
      dataFoundationScore,
      impactScore,
      knowledgeFitScore,
      documentFitScore,
      predictiveFitScore,
      analyticsFitScore,
      agenticFitScore,
      discoveryNeedScore,
      systemsComplexityScore,
      riskConstraintScore,
    },
  };
}
