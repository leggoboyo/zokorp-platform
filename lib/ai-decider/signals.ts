import type { AiDeciderSignals, AiDeciderSignalScale, AiDeciderProcessStability } from "@/lib/ai-decider/types";

const BUSINESS_FUNCTION_KEYWORDS = {
  support: ["support", "help desk", "service desk", "ticket", "tickets", "customer service", "faq"],
  finance: ["invoice", "invoices", "billing", "accounts payable", "accounts receivable", "accounting", "expense"],
  sales: ["crm", "lead", "pipeline", "quote", "proposal", "sales", "opportunity"],
  operations: ["operations", "order", "fulfillment", "dispatch", "warehouse", "scheduling", "inventory", "shipment"],
  hr: ["resume", "resumes", "candidate", "candidates", "recruit", "hiring", "onboarding", "employee"],
  legal: ["contract", "contracts", "nda", "legal", "clause", "policy", "policies"],
  it: ["incident", "monitoring", "provisioning", "access request", "service request", "change request"],
  leadership: ["leadership", "executive", "board", "strategy", "management team"],
  marketing: ["campaign", "content", "seo", "ads", "marketing"],
} as const;

const DATA_TYPE_KEYWORDS = {
  documents: ["document", "documents", "pdf", "form", "forms", "contract", "contracts", "invoice", "invoices", "scan"],
  emails: ["email", "emails", "mailbox", "inbox"],
  tickets: ["ticket", "tickets", "case", "cases", "support request", "service request"],
  chat_messages: ["chat", "slack", "teams", "chatbot", "chatbots"],
  structured_records: ["spreadsheet", "spreadsheets", "excel", "csv", "database", "table", "tables", "crm", "erp", "record", "records"],
  knowledge_base: ["knowledge base", "wiki", "faq", "faqs", "handbook", "handbooks", "sharepoint", "confluence", "notion"],
  audio: ["call", "calls", "voicemail", "recording", "recordings", "meeting transcript"],
  images: ["image", "images", "photo", "photos", "screenshot", "screenshots"],
  telemetry: ["log", "logs", "telemetry", "sensor", "sensors", "event stream"],
} as const;

const DESIRED_OUTCOME_KEYWORDS = {
  automation: ["automate", "automation", "manual", "manually", "repetitive", "repeat", "copy and paste", "route", "routing", "sync", "enter into"],
  analytics: ["dashboard", "reporting", "analytics", "analyze", "analysis", "kpi", "trend", "visibility", "measure"],
  knowledge_answers: [
    "answer the same questions",
    "answers the same questions",
    "answer questions",
    "consistent answers",
    "search",
    "lookup",
    "retrieve",
    "faq",
    "knowledge",
    "find information",
  ],
  document_extraction: ["extract", "parse", "ocr", "capture fields", "classify documents", "document review", "read invoices"],
  prediction: ["predict", "prediction", "forecast", "churn", "propensity", "risk score", "likelihood", "demand planning"],
  drafting_assistance: ["summarize", "summary", "draft", "rewrite", "assistant", "copilot", "generate responses", "write responses"],
  discovery: ["not sure why", "not sure", "figure out if ai", "should use ai", "explore ai", "leadership wants ai", "leadership wants an ai chatbot"],
} as const;

const EXISTING_SYSTEM_KEYWORDS = {
  CRM: ["crm", "salesforce", "hubspot", "zoho crm"],
  ERP: ["erp", "netsuite", "sap", "oracle", "quickbooks", "dynamics 365"],
  Ticketing: ["zendesk", "servicenow", "freshdesk", "jira service management", "ticket", "help desk", "service desk"],
  Email: ["email", "mailbox", "outlook"],
  KnowledgeBase: ["sharepoint", "confluence", "notion", "wiki", "knowledge base"],
  Chat: ["slack", "teams"],
  Files: ["google drive", "onedrive", "dropbox", "box"],
  DataWarehouse: ["snowflake", "bigquery", "redshift", "warehouse"],
  Spreadsheets: ["excel", "spreadsheet", "spreadsheets", "google sheets", "csv"],
} as const;

const HIGH_SCALE_KEYWORDS = [
  "thousands",
  "hundreds per day",
  "daily",
  "every day",
  "multiple teams",
  "across locations",
  "high volume",
  "24/7",
];
const MEDIUM_SCALE_KEYWORDS = ["weekly", "dozens", "department", "several times", "many", "shared queue"];
const LOW_SCALE_KEYWORDS = ["monthly", "occasionally", "ad hoc", "few times", "rarely"];

const STABLE_PROCESS_KEYWORDS = [
  "same questions",
  "repeatable",
  "standard",
  "template",
  "consistent",
  "documented",
  "routine",
  "every time",
  "same process",
];
const UNSTABLE_PROCESS_KEYWORDS = [
  "ad hoc",
  "varies",
  "different every time",
  "every case is different",
  "exceptions",
  "unclear",
  "not sure",
  "changing",
  "moving target",
  "undefined",
];

const HIGH_RISK_KEYWORDS = [
  "hipaa",
  "phi",
  "pii",
  "pci",
  "sox",
  "gdpr",
  "medical",
  "patient",
  "fraud",
  "regulated",
  "compliance",
  "safety",
  "payroll",
  "security incident",
];
const MEDIUM_RISK_KEYWORDS = [
  "invoice",
  "contract",
  "employee",
  "billing",
  "finance",
  "hr",
  "customer data",
  "personal data",
  "legal",
];

function normalize(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function unique<T>(input: T[]) {
  return [...new Set(input)];
}

function limit<T>(input: T[], max: number) {
  return input.slice(0, max);
}

function matchPhrases(source: string, phrases: readonly string[]) {
  return unique(phrases.filter((phrase) => source.includes(phrase)));
}

function collectLabels<T extends Record<string, readonly string[]>>(source: string, dictionary: T) {
  const labels: string[] = [];
  const hits: string[] = [];

  for (const [label, phrases] of Object.entries(dictionary)) {
    const matched = matchPhrases(source, phrases);
    if (matched.length > 0) {
      labels.push(label);
      hits.push(...matched);
    }
  }

  return {
    labels,
    hits: unique(hits),
  };
}

function detectScale(source: string): {
  scale: AiDeciderSignalScale;
  hits: string[];
} {
  const highHits = matchPhrases(source, HIGH_SCALE_KEYWORDS);
  const mediumHits = matchPhrases(source, MEDIUM_SCALE_KEYWORDS);
  const lowHits = matchPhrases(source, LOW_SCALE_KEYWORDS);
  const numericMatches = [...source.matchAll(/\b(\d{2,6})\b/g)].map((match) => Number(match[1]));

  if (highHits.length > 0 || numericMatches.some((value) => value >= 500)) {
    return { scale: "high", hits: unique([...highHits, ...numericMatches.filter((value) => value >= 500).map(String)]) };
  }

  if (mediumHits.length > 0 || numericMatches.some((value) => value >= 50)) {
    return { scale: "medium", hits: unique([...mediumHits, ...numericMatches.filter((value) => value >= 50).map(String)]) };
  }

  if (lowHits.length > 0) {
    return { scale: "low", hits: lowHits };
  }

  return { scale: "unknown", hits: [] };
}

function detectProcessStability(source: string): {
  processStability: AiDeciderProcessStability;
  stableHits: string[];
  unstableHits: string[];
} {
  const stableHits = matchPhrases(source, STABLE_PROCESS_KEYWORDS);
  const unstableHits = matchPhrases(source, UNSTABLE_PROCESS_KEYWORDS);

  if (stableHits.length > 0 && unstableHits.length > 0) {
    return { processStability: "mixed", stableHits, unstableHits };
  }

  if (unstableHits.length > 0) {
    return { processStability: "unstable", stableHits, unstableHits };
  }

  if (stableHits.length > 0) {
    return { processStability: "stable", stableHits, unstableHits };
  }

  return { processStability: "unknown", stableHits, unstableHits };
}

function detectRiskLevel(source: string) {
  const highHits = matchPhrases(source, HIGH_RISK_KEYWORDS);
  if (highHits.length > 0) {
    return { riskLevel: "high" as const, hits: highHits };
  }

  const mediumHits = matchPhrases(source, MEDIUM_RISK_KEYWORDS);
  if (mediumHits.length > 0) {
    return { riskLevel: "medium" as const, hits: mediumHits };
  }

  return { riskLevel: "low" as const, hits: [] };
}

function humanizeLabel(label: string) {
  return label.replaceAll("_", " ");
}

export function extractAiDeciderSignals(narrativeInput: string): AiDeciderSignals {
  const source = normalize(narrativeInput);
  const businessFunctions = collectLabels(source, BUSINESS_FUNCTION_KEYWORDS);
  const dataTypes = collectLabels(source, DATA_TYPE_KEYWORDS);
  const desiredOutcomes = collectLabels(source, DESIRED_OUTCOME_KEYWORDS);
  const systems = collectLabels(source, EXISTING_SYSTEM_KEYWORDS);
  const scale = detectScale(source);
  const process = detectProcessStability(source);
  const risk = detectRiskLevel(source);
  const wordCount = source ? source.split(/\s+/).filter(Boolean).length : 0;

  const flags = unique([
    desiredOutcomes.labels.includes("discovery") ? "unclear_problem_statement" : "",
    source.includes("leadership wants ai") || source.includes("leadership wants an ai chatbot")
      ? "ai_push_from_leadership"
      : "",
    process.processStability === "stable" ? "repeatable_work_detected" : "",
    systems.labels.length >= 3 ? "multi_system_workflow" : "",
    desiredOutcomes.labels.includes("prediction") ? "predictive_goal_detected" : "",
    desiredOutcomes.labels.includes("knowledge_answers") ? "knowledge_lookup_pattern" : "",
    desiredOutcomes.labels.includes("document_extraction") || dataTypes.labels.includes("documents")
      ? "document_processing_pattern"
      : "",
  ]).filter(Boolean);

  const normalizedDesiredOutcomes =
    desiredOutcomes.labels.length > 0
      ? desiredOutcomes.labels.map(humanizeLabel)
      : source.includes("ai")
        ? ["discovery"]
        : [];

  return {
    businessFunctions: limit(businessFunctions.labels.map(humanizeLabel), 4),
    dataTypes: limit(dataTypes.labels.map(humanizeLabel), 5),
    desiredOutcomes: limit(normalizedDesiredOutcomes, 4),
    scale: scale.scale,
    riskLevel: risk.riskLevel,
    existingSystems: limit(systems.labels, 8),
    processStability: process.processStability,
    flags: limit(flags, 12),
    matchedKeywords: {
      business_functions: limit(businessFunctions.hits, 12),
      data_types: limit(dataTypes.hits, 12),
      desired_outcomes: limit(desiredOutcomes.hits, 12),
      systems: limit(systems.hits, 12),
      scale: limit(scale.hits, 12),
      stable_markers: limit(process.stableHits, 12),
      unstable_markers: limit(process.unstableHits, 12),
      risk: limit(risk.hits, 12),
    },
    narrativeWordCount: wordCount,
  };
}
