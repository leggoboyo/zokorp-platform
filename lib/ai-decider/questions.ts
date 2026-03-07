import type { AiDeciderQuestion, AiDeciderQuestionId, AiDeciderSignals } from "@/lib/ai-decider/types";

const QUESTION_BANK: Record<AiDeciderQuestionId, AiDeciderQuestion> = {
  task_frequency: {
    id: "task_frequency",
    prompt: "How often does this work happen when the business is operating normally?",
    help: "Frequency is one of the fastest ways to tell whether a solution could pay for itself.",
    whyAsked: "High-frequency work can justify automation even when AI is unnecessary.",
    options: [
      { value: "many_times_daily", label: "Many times per day", description: "This shows up constantly or in a shared queue." },
      { value: "daily", label: "At least daily", description: "It is part of the team’s normal daily workload." },
      { value: "weekly", label: "A few times per week", description: "It matters, but the volume is moderate." },
      { value: "monthly", label: "Occasionally", description: "The work exists, but it is not frequent." },
    ],
  },
  process_variability: {
    id: "process_variability",
    prompt: "How consistent is the current process from one case to the next?",
    help: "AI and automation both perform better when the real process is stable enough to define.",
    whyAsked: "If every case is different, the first step is usually process cleanup, not tooling.",
    options: [
      { value: "highly_standard", label: "Highly standard", description: "The team follows almost the same steps every time." },
      { value: "mostly_standard", label: "Mostly standard", description: "There are a few exceptions, but the flow is mostly consistent." },
      { value: "many_exceptions", label: "Many exceptions", description: "Important edge cases regularly change how the team handles it." },
      { value: "case_by_case", label: "Case by case", description: "There is no stable process yet." },
    ],
  },
  data_state: {
    id: "data_state",
    prompt: "What is the condition of the data or content this workflow depends on?",
    help: "Readiness matters more than ambition. Bad inputs produce bad outputs.",
    whyAsked: "This tells me whether the problem is ready for AI, automation, analytics, or just cleanup work.",
    options: [
      { value: "structured_ready", label: "Mostly clean and accessible", description: "The data lives in systems we can actually work with." },
      { value: "mixed_needs_cleanup", label: "Usable but messy", description: "There is enough signal, but cleanup work is clearly needed." },
      { value: "scattered_manual", label: "Scattered across tools", description: "People stitch it together manually from several places." },
      { value: "little_history", label: "Thin or incomplete", description: "We do not have much reliable history yet." },
    ],
  },
  impact_window: {
    id: "impact_window",
    prompt: "If this got noticeably better in the next 90 days, what would the business impact look like?",
    help: "This is about real value, not whether the idea sounds innovative.",
    whyAsked: "A compelling outcome usually points to a better first engagement and a more believable ROI.",
    options: [
      { value: "minor", label: "Nice to have", description: "Helpful, but not important enough to fight for budget." },
      { value: "moderate", label: "Meaningful", description: "It would save time or reduce frustration for a team." },
      { value: "major", label: "Major", description: "It would materially improve revenue, cost, or service delivery." },
      { value: "strategic", label: "Strategic", description: "Leadership would care immediately if this improved." },
    ],
  },
  error_tolerance: {
    id: "error_tolerance",
    prompt: "How much room is there for an imperfect output before it becomes a business problem?",
    help: "This often separates helpful AI assistance from workflows that should stay deterministic.",
    whyAsked: "Low error tolerance pushes the recommendation toward rules, analytics, or human review.",
    options: [
      { value: "forgiving", label: "Forgiving", description: "Minor mistakes are acceptable and easy to correct." },
      { value: "human_reviewed", label: "Human reviewed", description: "Outputs can be imperfect because a person checks them." },
      { value: "low_tolerance", label: "Low tolerance", description: "Mistakes are painful, expensive, or customer-facing." },
      { value: "near_zero_tolerance", label: "Near zero tolerance", description: "A wrong answer could create compliance, safety, or major financial risk." },
    ],
  },
  regulatory_exposure: {
    id: "regulatory_exposure",
    prompt: "Which of these best describes the regulatory or sensitivity level around this work?",
    help: "This sizes implementation risk before any architecture decision gets made.",
    whyAsked: "High-risk work can still use AI, but the path is narrower and more controlled.",
    options: [
      { value: "none", label: "Low sensitivity", description: "No regulated data and no serious compliance constraints." },
      { value: "internal_sensitive", label: "Internal sensitive", description: "There is business-sensitive or employee-sensitive context." },
      { value: "customer_or_financial", label: "Customer or financial", description: "It touches customer records, money, or contractual data." },
      { value: "regulated_or_safety", label: "Regulated or safety critical", description: "This sits inside a tightly controlled or high-consequence process." },
    ],
  },
  systems_count: {
    id: "systems_count",
    prompt: "How many systems usually have to participate for this workflow to finish cleanly?",
    help: "This is a good predictor of integration effort and whether an agentic workflow is even realistic.",
    whyAsked: "More systems increase delivery complexity and can change the recommended engagement type.",
    options: [
      { value: "one_two", label: "One or two", description: "The work mostly lives in one system, maybe with one handoff." },
      { value: "three_four", label: "Three or four", description: "The team jumps across a few tools to finish the job." },
      { value: "five_plus", label: "Five or more", description: "This is a cross-system process with several dependencies." },
      { value: "unclear", label: "Still unclear", description: "We do not have a clean system map yet." },
    ],
  },
  knowledge_source: {
    id: "knowledge_source",
    prompt: "Where do the answers or reference material usually come from today?",
    help: "Search, RAG, and assistant patterns depend heavily on how source knowledge is organized.",
    whyAsked: "If the knowledge base is fragmented or mostly tribal, retrieval quality will suffer.",
    options: [
      { value: "single_curated", label: "One curated source", description: "There is a clear source of truth." },
      { value: "few_curated", label: "A few maintained sources", description: "The content is split across a small number of usable systems." },
      { value: "many_conflicting", label: "Many conflicting sources", description: "Different documents disagree or drift over time." },
      { value: "mostly_in_heads", label: "Mostly in people’s heads", description: "The best answers still live in Slack, inboxes, and expert memory." },
    ],
  },
  historical_outcomes: {
    id: "historical_outcomes",
    prompt: "If you want predictions, how much usable history do you have for past outcomes?",
    help: "Predictive work usually fails because the label history is weaker than expected.",
    whyAsked: "This helps separate a predictive ML case from an analytics-first recommendation.",
    options: [
      { value: "little_history", label: "Very little", description: "We do not really track outcomes yet." },
      { value: "manual_history", label: "Some manual history", description: "There is history, but it is patchy or difficult to trust." },
      { value: "clean_history", label: "Clean enough", description: "We have a decent amount of historical examples in systems." },
      { value: "labeled_history", label: "Strong labeled history", description: "We can point to reliable past outcomes with confidence." },
    ],
  },
  document_consistency: {
    id: "document_consistency",
    prompt: "When documents arrive, how consistent are the formats and fields?",
    help: "Document intelligence is strongest when the inputs look similar enough to normalize.",
    whyAsked: "Inconsistent documents usually need controlled intake or a narrower first scope.",
    options: [
      { value: "highly_standard", label: "Highly standard", description: "The layouts are very similar and the fields are predictable." },
      { value: "mostly_similar", label: "Mostly similar", description: "There are some variations, but patterns are still obvious." },
      { value: "very_variable", label: "Very variable", description: "Formats differ a lot by sender, team, or source." },
      { value: "poor_input_quality", label: "Poor input quality", description: "The files are messy, incomplete, or hard to read." },
    ],
  },
  decision_logic: {
    id: "decision_logic",
    prompt: "How clearly can the team explain the decision logic behind the current work?",
    help: "If the decision is explainable, rules or analytics often beat AI on speed and reliability.",
    whyAsked: "This distinguishes rule-driven automation from work that genuinely needs model judgment.",
    options: [
      { value: "clear_rules", label: "Clear rules", description: "The team can write the decision logic down without much debate." },
      { value: "rules_plus_judgment", label: "Rules plus judgment", description: "There are rules, but humans still resolve gray areas." },
      { value: "mostly_judgment", label: "Mostly judgment", description: "Experts rely on tacit knowledge more than explicit rules." },
      { value: "goal_not_decided", label: "Goal not decided", description: "The problem is still too fuzzy to define the logic." },
    ],
  },
  response_mode: {
    id: "response_mode",
    prompt: "If a machine helps here, what role should it realistically play first?",
    help: "This keeps the recommendation grounded in adoption risk, not hype.",
    whyAsked: "A drafting assistant and a fully autonomous workflow are very different bets.",
    options: [
      { value: "draft_with_human", label: "Draft with human review", description: "A person remains the decision-maker." },
      { value: "auto_with_review", label: "Automate with oversight", description: "The system can do most of the work if humans monitor exceptions." },
      { value: "auto_without_review", label: "Run on its own", description: "The goal is straight-through execution." },
      { value: "not_sure", label: "Still not sure", description: "We have not decided the right operating model yet." },
    ],
  },
};

const CONDITIONAL_QUESTION_IDS: Array<{
  id: AiDeciderQuestionId;
  when: (signals: AiDeciderSignals) => boolean;
}> = [
  {
    id: "regulatory_exposure",
    when: (signals) => signals.riskLevel !== "low",
  },
  {
    id: "systems_count",
    when: (signals) => signals.existingSystems.length > 1 || signals.flags.includes("multi_system_workflow"),
  },
  {
    id: "knowledge_source",
    when: (signals) =>
      signals.desiredOutcomes.includes("knowledge answers") ||
      signals.dataTypes.includes("knowledge base") ||
      signals.businessFunctions.includes("support"),
  },
  {
    id: "historical_outcomes",
    when: (signals) =>
      signals.desiredOutcomes.includes("prediction") || signals.desiredOutcomes.includes("analytics"),
  },
  {
    id: "document_consistency",
    when: (signals) => signals.dataTypes.includes("documents"),
  },
  {
    id: "decision_logic",
    when: (signals) =>
      signals.desiredOutcomes.includes("automation") ||
      signals.processStability === "unknown" ||
      signals.processStability === "unstable" ||
      signals.flags.includes("unclear_problem_statement"),
  },
  {
    id: "response_mode",
    when: (signals) =>
      signals.desiredOutcomes.includes("drafting assistance") ||
      signals.desiredOutcomes.includes("knowledge answers") ||
      signals.flags.includes("ai_push_from_leadership"),
  },
];

export function buildAiDeciderQuestions(signals: AiDeciderSignals): AiDeciderQuestion[] {
  const selected: AiDeciderQuestionId[] = [
    "task_frequency",
    "process_variability",
    "data_state",
    "impact_window",
    "error_tolerance",
  ];

  for (const rule of CONDITIONAL_QUESTION_IDS) {
    if (rule.when(signals) && !selected.includes(rule.id)) {
      selected.push(rule.id);
    }
  }

  return selected.slice(0, 8).map((id) => QUESTION_BANK[id]);
}

export function validateAiDeciderAnswers(questions: AiDeciderQuestion[], answers: Record<string, string>) {
  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) {
      return {
        ok: false as const,
        error: `Please answer the follow-up question: ${question.prompt}`,
      };
    }

    const validValues = new Set(question.options.map((option) => option.value));
    if (!validValues.has(answer)) {
      return {
        ok: false as const,
        error: `Invalid answer for follow-up question: ${question.prompt}`,
      };
    }
  }

  return {
    ok: true as const,
  };
}
