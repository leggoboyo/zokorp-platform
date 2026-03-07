import { aiDeciderReportSchema, type AiDeciderFinding, type AiDeciderLeadInput, type AiDeciderReport } from "@/lib/ai-decider/types";
import { extractAiDeciderSignals } from "@/lib/ai-decider/signals";
import { buildAiDeciderQuestions } from "@/lib/ai-decider/questions";
import { buildAiDeciderAssessmentProfile } from "@/lib/ai-decider/scoring";
import { recommendAiDeciderApproach } from "@/lib/ai-decider/recommendation";
import { buildAiDeciderQuote } from "@/lib/ai-decider/quote";

type AnswerMap = Record<string, string>;

function clampFindings(findings: AiDeciderFinding[]) {
  return findings.slice(0, 12);
}

function buildSummaryParagraph(input: {
  lead: AiDeciderLeadInput;
  recommendationLine: string;
  scores: AiDeciderReport["scores"];
  signals: AiDeciderReport["signals"];
}) {
  const functionLabel = input.signals.businessFunctions[0] ?? "business";
  const outcomeLabel = input.signals.desiredOutcomes[0] ?? "workflow improvement";

  return `Based on the narrative and follow-up answers, this looks like a ${functionLabel} problem centered on ${outcomeLabel}. The current fit scores point to ${input.recommendationLine.toLowerCase()} Data readiness is ${input.scores.dataReadinessScore}/100 and implementation risk is ${input.scores.implementationRiskScore}/100.`;
}

function buildFindings(input: {
  recommendation: AiDeciderReport["recommendation"];
  scores: AiDeciderReport["scores"];
  signals: AiDeciderReport["signals"];
  answers: AnswerMap;
}) {
  const findings: AiDeciderFinding[] = [];

  function addFinding(condition: boolean, finding: AiDeciderFinding) {
    if (!condition) {
      return;
    }

    findings.push(finding);
  }

  addFinding(
    input.signals.flags.includes("unclear_problem_statement") || input.answers.decision_logic === "goal_not_decided",
    {
      category: "problem_definition",
      severity: "high",
      finding: "The business problem is still too broad or fuzzy for a reliable tooling decision.",
      recommendedFix: "Define one target workflow, one measurable KPI, and one clear owner before implementation.",
    },
  );

  addFinding(
    input.scores.dataReadinessScore < 55,
    {
      category: "data_readiness",
      severity: input.scores.dataReadinessScore < 40 ? "high" : "medium",
      finding: "The inputs are not clean or accessible enough for a low-friction implementation.",
      recommendedFix: "Normalize the source data, reduce manual handoffs, and identify one usable system of record.",
    },
  );

  addFinding(
    input.answers.process_variability === "many_exceptions" || input.answers.process_variability === "case_by_case",
    {
      category: "process_design",
      severity: input.answers.process_variability === "case_by_case" ? "high" : "medium",
      finding: "The process has too many exceptions for blind automation or autonomous AI.",
      recommendedFix: "Document the common path first and isolate exceptions into a human-review queue.",
    },
  );

  addFinding(
    input.recommendation === "RULES_AUTOMATION" || input.recommendation === "ANALYTICS_FIRST",
    {
      category: "delivery_scope",
      severity: "medium",
      finding: "AI is not the strongest first tool for this problem as currently framed.",
      recommendedFix: "Start with deterministic automation or analytics so the business case is clearer and cheaper to validate.",
    },
  );

  addFinding(
    input.signals.desiredOutcomes.includes("knowledge answers") &&
      (input.answers.knowledge_source === "many_conflicting" || input.answers.knowledge_source === "mostly_in_heads"),
    {
      category: "systems",
      severity: "medium",
      finding: "The knowledge sources are too fragmented for a trustworthy retrieval experience.",
      recommendedFix: "Choose a source of truth, archive stale content, and define what content can answer user questions.",
    },
  );

  addFinding(
    input.signals.desiredOutcomes.includes("document extraction") &&
      (input.answers.document_consistency === "very_variable" || input.answers.document_consistency === "poor_input_quality"),
    {
      category: "data_readiness",
      severity: "medium",
      finding: "Document formats vary enough that a broad first rollout would be fragile.",
      recommendedFix: "Narrow the first scope to one document family with predictable layouts and acceptance checks.",
    },
  );

  addFinding(
    input.signals.desiredOutcomes.includes("prediction") &&
      (input.answers.historical_outcomes === "little_history" || input.answers.historical_outcomes === "manual_history"),
    {
      category: "data_readiness",
      severity: "high",
      finding: "The predictive goal is ahead of the available historical outcomes data.",
      recommendedFix: "Instrument the workflow, capture outcomes consistently, and start with descriptive analytics first.",
    },
  );

  addFinding(
    input.scores.implementationRiskScore >= 70,
    {
      category: "risk",
      severity: "high",
      finding: "Implementation risk is elevated because the process sensitivity and delivery complexity are both high.",
      recommendedFix: "Use a narrower scope, human review checkpoints, and explicit rollback criteria for any pilot.",
    },
  );

  addFinding(
    input.answers.response_mode === "auto_without_review" &&
      (input.answers.error_tolerance === "low_tolerance" || input.answers.error_tolerance === "near_zero_tolerance"),
    {
      category: "risk",
      severity: "high",
      finding: "Straight-through automation conflicts with the business tolerance for errors.",
      recommendedFix: "Keep a human approval step until the workflow proves stable and measurable in production.",
    },
  );

  addFinding(
    input.signals.flags.includes("multi_system_workflow") || input.answers.systems_count === "five_plus",
    {
      category: "systems",
      severity: "medium",
      finding: "Cross-system coordination will dominate delivery effort unless the process boundary is tightened.",
      recommendedFix: "Map the minimal system path for v1 and delay nonessential integrations until the first win is proven.",
    },
  );

  addFinding(
    input.scores.roiPlausibilityScore < 55,
    {
      category: "economics",
      severity: "medium",
      finding: "The current scope does not yet show a strong short-term return on investment.",
      recommendedFix: "Tie the first release to cycle time, headcount leverage, revenue protection, or error reduction.",
    },
  );

  addFinding(
    input.signals.flags.includes("ai_push_from_leadership"),
    {
      category: "change_management",
      severity: "medium",
      finding: "The request appears to be tool-first rather than KPI-first, which usually weakens adoption.",
      recommendedFix: "Anchor the project around a measurable business outcome instead of an AI label.",
    },
  );

  return clampFindings(findings);
}

function buildBlockers(input: {
  scores: AiDeciderReport["scores"];
  signals: AiDeciderReport["signals"];
  answers: AnswerMap;
}) {
  const blockers = [
    input.signals.flags.includes("unclear_problem_statement")
      ? "The target workflow is not scoped tightly enough yet."
      : "",
    input.scores.dataReadinessScore < 50 ? "The source data needs cleanup or consolidation." : "",
    input.answers.process_variability === "case_by_case" ? "The process is not stable enough for a safe first build." : "",
    input.scores.implementationRiskScore >= 70 ? "Delivery risk is high relative to the current confidence level." : "",
    input.answers.error_tolerance === "near_zero_tolerance" ? "The error tolerance is too low for unsupervised outputs." : "",
  ].filter(Boolean);

  return blockers.slice(0, 5);
}

function buildNextSteps(input: {
  recommendation: AiDeciderReport["recommendation"];
  signals: AiDeciderReport["signals"];
  scores: AiDeciderReport["scores"];
}) {
  const commonSteps = [
    "Baseline the current volume, cycle time, and error cost for one narrow workflow.",
    "Assign one business owner who can approve scope, metrics, and exception handling.",
  ];

  switch (input.recommendation) {
    case "DO_NOT_USE_AI_YET":
      return [
        ...commonSteps,
        "Document the existing process and remove obvious ambiguity before selecting technology.",
      ];
    case "RULES_AUTOMATION":
      return [
        ...commonSteps,
        "Write the current decision rules down and identify the exceptions that still need humans.",
        "Pilot the workflow in one system path before adding extra integrations.",
      ];
    case "ANALYTICS_FIRST":
      return [
        ...commonSteps,
        "Define the KPI dashboard and the historical fields required to measure the problem reliably.",
        "Use analytics to confirm the real bottleneck before funding an AI build.",
      ];
    case "SEARCH_RAG":
      return [
        ...commonSteps,
        "Choose one governed source of truth and remove stale or conflicting content.",
        "Limit the first retrieval experience to the highest-frequency question set.",
      ];
    case "DOCUMENT_INTELLIGENCE":
      return [
        ...commonSteps,
        "Standardize one document family and define acceptance checks for extracted fields.",
        "Keep a human review checkpoint until exception rates are measured.",
      ];
    case "PREDICTIVE_ML":
      return [
        ...commonSteps,
        "Validate that outcome labels and historical records are trustworthy enough for training.",
        "Start with a scored prediction workflow that humans can review before actioning.",
      ];
    case "GENAI_ASSISTANT":
      return [
        ...commonSteps,
        "Constrain the assistant to drafting or summarizing with human approval in the loop.",
        "Publish clear source content and response guardrails before rollout.",
      ];
    case "AGENTIC_WORKFLOW":
      return [
        ...commonSteps,
        "Map the minimum end-to-end system path and define checkpoints where humans can intervene.",
        "Start with one controlled orchestration path before expanding autonomy.",
      ];
    case "NEEDS_DISCOVERY":
    default:
      return [
        ...commonSteps,
        "Run a short discovery to agree on the exact business problem, success metric, and first pilot scope.",
      ];
  }
}

export function buildAiDeciderReport(input: {
  lead: AiDeciderLeadInput;
  answers: AnswerMap;
}): AiDeciderReport {
  const signals = extractAiDeciderSignals(input.lead.narrativeInput);
  const adaptiveQuestions = buildAiDeciderQuestions(signals);
  const profile = buildAiDeciderAssessmentProfile({
    signals,
    answers: input.answers,
  });
  const recommendationDecision = recommendAiDeciderApproach({
    signals,
    profile,
  });
  const quote = buildAiDeciderQuote({
    recommendation: recommendationDecision.recommendation,
    profile,
  });

  const report = {
    reportVersion: "1.0" as const,
    generatedAtISO: new Date().toISOString(),
    verdictHeadline: recommendationDecision.verdictHeadline,
    verdictLine: recommendationDecision.verdictLine,
    summaryParagraph: buildSummaryParagraph({
      lead: input.lead,
      recommendationLine: recommendationDecision.verdictLine,
      scores: profile.scores,
      signals,
    }),
    recommendation: recommendationDecision.recommendation,
    scores: profile.scores,
    findings: buildFindings({
      recommendation: recommendationDecision.recommendation,
      scores: profile.scores,
      signals,
      answers: input.answers,
    }),
    blockers: buildBlockers({
      scores: profile.scores,
      signals,
      answers: input.answers,
    }),
    nextSteps: buildNextSteps({
      recommendation: recommendationDecision.recommendation,
      signals,
      scores: profile.scores,
    }),
    quote,
    signals,
    adaptiveQuestions,
  };

  return aiDeciderReportSchema.parse(report);
}
