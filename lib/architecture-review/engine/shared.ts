import { resolveArchitectureReviewScope, reviewScopeLabel } from "@/lib/architecture-review/scope";
import { getArchitectureReviewRule } from "@/lib/architecture-review/rules";
import type {
  ArchitectureConcreteProvider,
  ArchitectureEvidenceBundle,
  ArchitectureFindingDraft,
  ArchitecturePlatform,
  ArchitectureProvider,
  ArchitectureReviewScope,
} from "@/lib/architecture-review/types";

export type RuleOutcome = "pass" | "partial" | "fail" | "na";

export type RuleDecision = {
  outcome: RuleOutcome;
  evidenceSeen?: string;
  why?: string;
};

const NON_ARCHITECTURE_OCR_TERMS = [
  "tradeline",
  "debt",
  "creditor",
  "billing",
  "balance",
  "account number",
  "invoice",
  "subtotal",
  "interest charge",
  "fico",
  "credit score",
];

const ARCHITECTURE_HINT_TERMS = [
  "architecture",
  "diagram",
  "service",
  "api",
  "gateway",
  "load balancer",
  "database",
  "subnet",
  "vpc",
  "vnet",
  "cluster",
  "queue",
  "warehouse",
];

const PROVIDER_TOKENS: Record<ArchitectureProvider | ArchitecturePlatform, string[]> = {
  aws: [
    "api gateway",
    "lambda",
    "ec2",
    "eks",
    "ecs",
    "fargate",
    "alb",
    "application load balancer",
    "route 53",
    "cloudfront",
    "rds",
    "aurora",
    "dynamodb",
    "s3",
    "sqs",
    "sns",
    "eventbridge",
    "step functions",
    "cloudwatch",
    "cloudtrail",
    "iam",
    "kms",
    "waf",
    "secrets manager",
    "vpc",
  ],
  azure: [
    "front door",
    "application gateway",
    "app service",
    "functions",
    "aks",
    "virtual machine",
    "entra",
    "azure ad",
    "managed identity",
    "key vault",
    "storage account",
    "service bus",
    "event hub",
    "logic app",
    "cosmos db",
    "sql database",
    "azure monitor",
    "log analytics",
    "vnet",
    "nsg",
  ],
  gcp: [
    "cloud run",
    "gke",
    "compute engine",
    "cloud load balancing",
    "api gateway",
    "cloud armor",
    "cloud cdn",
    "cloud storage",
    "spanner",
    "cloud sql",
    "pub/sub",
    "cloud functions",
    "workflows",
    "cloud monitoring",
    "cloud logging",
    "service account",
    "cloud kms",
    "secret manager",
    "vpc",
    "iap",
  ],
  multi: [],
  snowflake: [
    "snowflake",
    "warehouse",
    "virtual warehouse",
    "x-small",
    "small",
    "medium",
    "large",
    "auto-suspend",
    "auto suspend",
    "auto-resume",
    "time travel",
    "fail-safe",
    "clustering",
    "micro-partition",
    "cost controls",
  ],
};

type ServiceFamily = {
  family: string;
  variants: Array<{ id: string; terms: string[] }>;
};

const CLOUD_SERVICE_FAMILIES: ServiceFamily[] = [
  {
    family: "edge",
    variants: [
      { id: "aws-edge", terms: ["cloudfront", "api gateway", "alb", "application load balancer"] },
      { id: "azure-edge", terms: ["front door", "application gateway"] },
      { id: "gcp-edge", terms: ["cloud load balancing", "cloud armor", "cloud cdn", "api gateway"] },
    ],
  },
  {
    family: "compute",
    variants: [
      { id: "aws-compute", terms: ["lambda", "ec2", "ecs", "eks", "fargate"] },
      { id: "azure-compute", terms: ["app service", "functions", "aks", "virtual machine"] },
      { id: "gcp-compute", terms: ["cloud run", "gke", "compute engine", "cloud functions"] },
    ],
  },
  {
    family: "data",
    variants: [
      { id: "aws-data", terms: ["rds", "aurora", "dynamodb", "s3"] },
      { id: "azure-data", terms: ["sql database", "cosmos db", "storage account"] },
      { id: "gcp-data", terms: ["cloud sql", "spanner", "cloud storage"] },
    ],
  },
];

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function compressWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

export function truncate(input: string, maxLength: number) {
  const normalized = compressWhitespace(input);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function includesTerm(text: string, term: string) {
  const normalizedText = text.toLowerCase();
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return false;
  }

  if (/\s/.test(normalizedTerm) || normalizedTerm.includes("-") || normalizedTerm.includes("/")) {
    return normalizedText.includes(normalizedTerm);
  }

  return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i").test(normalizedText);
}

export function includesAny(text: string, terms: string[]) {
  return terms.some((term) => includesTerm(text, term));
}

export function countMentions(text: string, terms: string[]) {
  return terms.filter((term) => includesTerm(text, term)).length;
}

function windowedExcerpt(source: string, term: string) {
  const normalized = compressWhitespace(source);
  const lowered = normalized.toLowerCase();
  const index = lowered.indexOf(term.toLowerCase());
  if (index < 0) {
    return null;
  }

  const start = Math.max(0, index - 48);
  const end = Math.min(normalized.length, index + term.length + 72);
  return truncate(normalized.slice(start, end), 180);
}

function sentenceCandidates(source: string) {
  return compressWhitespace(source)
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function extractEvidenceExcerpt(source: string, terms: string[]) {
  const candidates = sentenceCandidates(source);

  for (const candidate of candidates) {
    if (includesAny(candidate, terms)) {
      return truncate(candidate, 180);
    }
  }

  for (const term of terms) {
    const excerpt = windowedExcerpt(source, term);
    if (excerpt) {
      return excerpt;
    }
  }

  return null;
}

export function fallbackEvidenceExcerpt(bundle: ArchitectureEvidenceBundle) {
  const paragraphExcerpt = truncate(bundle.paragraph, 180);
  if (paragraphExcerpt) {
    return paragraphExcerpt;
  }

  const ocrExcerpt = truncate(bundle.ocrText, 180);
  if (ocrExcerpt) {
    return ocrExcerpt;
  }

  const scope = bundle.reviewScope ?? resolveArchitectureReviewScope({ provider: bundle.provider });
  return truncate(reviewScopeLabel(scope), 180);
}

export function pickEvidenceExcerpt(bundle: ArchitectureEvidenceBundle, terms: string[]) {
  return (
    extractEvidenceExcerpt(bundle.paragraph, terms) ??
    extractEvidenceExcerpt(bundle.ocrText, terms) ??
    fallbackEvidenceExcerpt(bundle)
  );
}

export function pairEvidenceExcerpts(left: string | null, right: string | null) {
  const parts = [left, right].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  return truncate(parts.join(" | "), 240);
}

export function detectCoreComponentMismatch(bundle: ArchitectureEvidenceBundle) {
  const paragraph = compressWhitespace(bundle.paragraph).toLowerCase();
  const ocr = compressWhitespace(bundle.ocrText).toLowerCase();

  for (const family of CLOUD_SERVICE_FAMILIES) {
    const paragraphHits = family.variants.filter((variant) => includesAny(paragraph, variant.terms));
    const ocrHits = family.variants.filter((variant) => includesAny(ocr, variant.terms));

    if (paragraphHits.length === 0 || ocrHits.length === 0) {
      continue;
    }

    const overlap = paragraphHits.some((paragraphHit) =>
      ocrHits.some((ocrHit) => ocrHit.id === paragraphHit.id),
    );

    if (!overlap) {
      const paragraphEvidence = extractEvidenceExcerpt(bundle.paragraph, paragraphHits.flatMap((item) => item.terms));
      const ocrEvidence = extractEvidenceExcerpt(bundle.ocrText, ocrHits.flatMap((item) => item.terms));
      return pairEvidenceExcerpts(paragraphEvidence, ocrEvidence);
    }
  }

  return null;
}

export function extractServiceTokens(
  provider: ArchitectureProvider,
  source: string,
) {
  const normalized = compressWhitespace(source).toLowerCase();
  const matched = new Set<string>();
  const tokenSources =
    provider === "multi"
      ? [
          ...PROVIDER_TOKENS.aws,
          ...PROVIDER_TOKENS.azure,
          ...PROVIDER_TOKENS.gcp,
        ]
      : PROVIDER_TOKENS[provider];

  for (const token of tokenSources) {
    if (includesTerm(normalized, token)) {
      matched.add(token);
    }
  }

  return [...matched].sort((left, right) => left.localeCompare(right));
}

export function extractServiceTokensForScope(
  scope: Pick<ArchitectureReviewScope, "providers" | "platforms">,
  source: string,
) {
  const normalized = compressWhitespace(source).toLowerCase();
  const matched = new Set<string>();
  const tokenSources = [
    ...scope.providers.flatMap((provider) => PROVIDER_TOKENS[provider]),
    ...scope.platforms.flatMap((platform) => PROVIDER_TOKENS[platform]),
  ];

  for (const token of tokenSources) {
    if (includesTerm(normalized, token)) {
      matched.add(token);
    }
  }

  return [...matched].sort((left, right) => left.localeCompare(right));
}

export function detectNonArchitectureEvidence(bundle: ArchitectureEvidenceBundle) {
  const paragraph = compressWhitespace(bundle.paragraph).toLowerCase();
  const ocr = compressWhitespace(bundle.ocrText).toLowerCase();
  const nonArchitectureHits = countMentions(ocr, NON_ARCHITECTURE_OCR_TERMS);
  const architectureHits =
    countMentions(`${paragraph} ${ocr}`, ARCHITECTURE_HINT_TERMS) + bundle.serviceTokens.length;

  if (nonArchitectureHits >= 3 && architectureHits <= 2) {
    return {
      likely: true,
      confidence: "high" as const,
      reason: "The uploaded file looks more like a billing or statement artifact than an architecture diagram.",
    };
  }

  if (nonArchitectureHits >= 2 && architectureHits <= 3) {
    return {
      likely: true,
      confidence: "medium" as const,
      reason: "The uploaded file contains several non-architecture terms and weak infrastructure evidence.",
    };
  }

  return {
    likely: false,
    confidence: "low" as const,
    reason: "",
  };
}

export function buildFindingFromRule(
  ruleId: string,
  outcome: Exclude<RuleOutcome, "pass" | "na">,
  evidenceSeen: string,
  whyOverride?: string,
): ArchitectureFindingDraft | null {
  const rule = getArchitectureReviewRule(ruleId);
  if (!rule) {
    return null;
  }

  const pointsDeducted =
    outcome === "fail" ? rule.scoreWeight : Math.max(0, rule.scoreWeight - rule.maxPartialCredit);
  const recommendationType =
    outcome === "fail"
      ? "fix"
      : rule.estimatePolicyBand === "optional-polish"
        ? "optional"
        : "clarify";
  const why = truncate(whyOverride ?? rule.customerSummarySnippet, 180);
  const howToFix = truncate(rule.remediationSummary, 320);
  const evidence = truncate(evidenceSeen || "Submitted evidence requires clarification.", 240);

  return {
    ruleId: rule.id,
    category: rule.category,
    pointsDeducted,
    recommendationType,
    why,
    evidenceSeen: evidence,
    howToFix,
    officialSourceLinks: rule.officialSourceLinks,
    ruleVersion: rule.ruleVersion,
    message: truncate(`${outcome === "fail" ? "Fix" : recommendationType === "optional" ? "Optional" : "Clarify"}: ${rule.estimateLineItemLabel}`, 160),
    fix: howToFix,
    evidence,
  };
}

export function pushRuleDecision(
  findings: ArchitectureFindingDraft[],
  ruleId: string,
  decision: RuleDecision,
) {
  if (decision.outcome === "pass" || decision.outcome === "na") {
    return;
  }

  const finding = buildFindingFromRule(ruleId, decision.outcome, decision.evidenceSeen ?? "", decision.why);
  if (finding) {
    findings.push(finding);
  }
}

export function buildDeterministicNarrative(bundle: ArchitectureEvidenceBundle) {
  const paragraph = compressWhitespace(bundle.paragraph);
  const tokenPreview = bundle.serviceTokens.slice(0, 6).join(", ");
  const inputMismatch = detectNonArchitectureEvidence(bundle);
  const mismatchEvidence = detectCoreComponentMismatch(bundle);
  const scope = bundle.reviewScope ?? resolveArchitectureReviewScope({ provider: bundle.provider });
  const scopeLabel = reviewScopeLabel(scope);

  if (inputMismatch.likely) {
    return `${scopeLabel} architecture review could not trust the uploaded file as a clean architecture diagram. ${inputMismatch.reason}`.slice(
      0,
      2000,
    );
  }

  if (!paragraph) {
    return `${scopeLabel} architecture review used the uploaded diagram as the primary evidence source. Detected components include ${tokenPreview || "a limited set of platform labels"}, but the written narrative was too thin to raise confidence further.`.slice(
      0,
      2000,
    );
  }

  if (paragraph.length < 20) {
    return `${scopeLabel} architecture review leaned on diagram evidence because the written narrative was low-signal. Detected components include ${tokenPreview || "a limited set of platform labels"}. Add a clearer flow description to raise confidence on the next pass.`.slice(
      0,
      2000,
    );
  }

  const lead = `${scopeLabel} architecture review scored this submission from the diagram plus the written narrative, not from live cloud access.`;
  const components = tokenPreview
    ? `Detected components include ${tokenPreview}${bundle.serviceTokens.length > 6 ? ", and additional labeled services" : ""}.`
    : "Detected component labels were sparse, so the narrative carried more of the review weight.";
  const contradiction = mismatchEvidence
    ? ` A diagram-vs-narrative contradiction was also detected: ${mismatchEvidence}.`
    : "";

  return `${lead} ${components} Narrative summary: ${paragraph}.${contradiction}`.slice(0, 2000);
}

export function isProductionLike(bundle: ArchitectureEvidenceBundle) {
  const combined = compressWhitespace(`${bundle.paragraph} ${bundle.ocrText}`).toLowerCase();
  return bundle.metadata.environment === "prod" || includesAny(combined, ["production", "prod"]);
}

export function hasNonProdSignals(bundle: ArchitectureEvidenceBundle) {
  const combined = compressWhitespace(`${bundle.paragraph} ${bundle.ocrText}`).toLowerCase();
  return includesAny(combined, ["dev", "development", "test", "staging", "non-prod", "non production"]);
}

export function countRegionTokens(source: string) {
  return new Set(source.match(/\b[a-z]{2}-[a-z]+-\d\b/g) ?? []);
}

export type ProviderCommonSignals = {
  combined: string;
  production: boolean;
  nonProdContext: boolean;
  claimsPrivateOnly: boolean;
  claimsMultiRegion: boolean;
  claimsHaOrDr: boolean;
  objectiveStated: boolean;
  measurableConstraintCount: number;
  hasStatefulData: boolean;
  hasRelationalDb: boolean;
  hasObjectStorage: boolean;
  sensitiveData: boolean;
  hasRto: boolean;
  hasRpo: boolean;
};

export function buildCommonSignals(bundle: ArchitectureEvidenceBundle, config: {
  objectiveTerms: string[];
  statefulTerms: string[];
  relationalDbTerms: string[];
  objectStorageTerms: string[];
  sensitiveDataTerms: string[];
}) {
  const combined = compressWhitespace(`${bundle.paragraph} ${bundle.ocrText}`).toLowerCase();
  return {
    combined,
    production: isProductionLike(bundle),
    nonProdContext: hasNonProdSignals(bundle),
    claimsPrivateOnly: includesAny(combined, ["private-only", "private only", "no internet", "internal only"]),
    claimsMultiRegion: includesAny(combined, ["multi-region", "multi region", "cross-region", "cross region"]),
    claimsHaOrDr: includesAny(combined, ["high availability", "ha", "disaster recovery", "dr", "resilient"]),
    objectiveStated: includesAny(combined, config.objectiveTerms),
    measurableConstraintCount:
      countMentions(combined, [
        "latency",
        "uptime",
        "availability",
        "rto",
        "rpo",
        "sla",
        "slo",
        "qps",
        "rps",
        "throughput",
        "compliance",
        "concurrency",
        "retention",
      ]) +
      (/\b\d+(\.\d+)?\s?(ms|s|sec|seconds|minutes|hours|rps|qps|users?|%|gb|tb|days?)\b/.test(combined) ? 1 : 0),
    hasStatefulData: includesAny(combined, config.statefulTerms),
    hasRelationalDb: includesAny(combined, config.relationalDbTerms),
    hasObjectStorage: includesAny(combined, config.objectStorageTerms),
    sensitiveData:
      (bundle.metadata.regulatoryScope && bundle.metadata.regulatoryScope !== "none") ||
      includesAny(combined, config.sensitiveDataTerms),
    hasRto: includesTerm(combined, "rto"),
    hasRpo: includesTerm(combined, "rpo"),
  } satisfies ProviderCommonSignals;
}

export function normalizeProviderList(
  providers: ArchitectureConcreteProvider[],
  platforms: ArchitecturePlatform[],
) {
  return {
    providers,
    platforms,
  };
}
