import { getAwsArchitectureLaunchV1Rule } from "@/lib/architecture-review/aws-launch-v1-catalog";
import type { ArchitectureEvidenceBundle, ArchitectureFindingDraft } from "@/lib/architecture-review/types";

type RuleOutcome = "pass" | "partial" | "fail" | "na";

type RuleDecision = {
  outcome: RuleOutcome;
  evidence: string;
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
  "cluster",
  "queue",
];

const NON_AWS_PROVIDER_TERMS = [
  "azure",
  "entra",
  "aks",
  "front door",
  "application gateway",
  "gcp",
  "cloud run",
  "gke",
  "cloud sql",
  "cloud armor",
];

const PROVIDER_TOKENS = {
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
    "application gateway",
    "front door",
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
} as const;

const SERVICE_FAMILIES = [
  {
    family: "edge",
    variants: [
      { id: "cloudfront", terms: ["cloudfront"] },
      { id: "api-gateway", terms: ["api gateway"] },
      { id: "alb", terms: ["application load balancer", "alb"] },
    ],
  },
  {
    family: "compute",
    variants: [
      { id: "lambda", terms: ["lambda"] },
      { id: "ec2", terms: ["ec2"] },
      { id: "ecs-fargate", terms: ["ecs", "fargate"] },
      { id: "eks", terms: ["eks", "kubernetes"] },
    ],
  },
  {
    family: "data",
    variants: [
      { id: "rds-aurora", terms: ["rds", "aurora"] },
      { id: "dynamodb", terms: ["dynamodb"] },
      { id: "s3", terms: ["s3", "bucket"] },
      { id: "redis", terms: ["redis", "elasticache"] },
    ],
  },
] as const;

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesTerm(text: string, term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return false;
  }

  if (/\s/.test(normalizedTerm) || normalizedTerm.includes("-") || normalizedTerm.includes("/")) {
    return text.includes(normalizedTerm);
  }

  return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i").test(text);
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => includesTerm(text, term));
}

function countMentions(text: string, terms: string[]) {
  return terms.filter((term) => includesTerm(text, term)).length;
}

function compressWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function isLowSignalParagraph(text: string) {
  const normalized = compressWhitespace(text).toLowerCase();
  if (normalized.length < 20) {
    return true;
  }

  const usefulTerms = countMentions(normalized, [
    "api",
    "service",
    "database",
    "queue",
    "event",
    "request",
    "response",
    "stores",
    "writes",
    "reads",
    "subnet",
    "vpc",
    "cloudfront",
    "alb",
    "lambda",
    "rds",
  ]);

  return usefulTerms < 2;
}

function truncate(input: string, maxLength: number) {
  const normalized = compressWhitespace(input);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function extractAwsRegions(text: string) {
  return new Set(text.match(/\b[a-z]{2}-[a-z]+-\d\b/g) ?? []);
}

function detectInputMismatch(paragraph: string, ocr: string) {
  const nonArchitectureHits = countMentions(ocr, NON_ARCHITECTURE_OCR_TERMS);
  const architectureHits = countMentions(ocr, ARCHITECTURE_HINT_TERMS);
  const nonAwsHits = countMentions(`${paragraph} ${ocr}`, NON_AWS_PROVIDER_TERMS);

  if (nonAwsHits >= 2 && architectureHits <= 2) {
    return "The uploaded content references non-AWS platform terms, which makes this AWS-only launch reviewer unreliable for the current submission.";
  }

  if (nonArchitectureHits >= 3 && architectureHits <= 2) {
    return "The uploaded file looks more like a billing/statement artifact than an AWS architecture diagram.";
  }

  return null;
}

export function detectNonArchitectureEvidence(bundle: ArchitectureEvidenceBundle) {
  const paragraph = compressWhitespace(bundle.paragraph).toLowerCase();
  const ocr = compressWhitespace(bundle.ocrText).toLowerCase();
  const nonArchitectureHits = countMentions(ocr, NON_ARCHITECTURE_OCR_TERMS);
  const architectureHits = countMentions(ocr, ARCHITECTURE_HINT_TERMS);
  const nonAwsHits = countMentions(`${paragraph} ${ocr}`, NON_AWS_PROVIDER_TERMS);
  const mismatchReason = detectInputMismatch(paragraph, ocr);

  if (mismatchReason && nonArchitectureHits >= 3 && architectureHits <= 2) {
    return {
      likely: true,
      confidence: "high" as const,
      reason: mismatchReason,
    };
  }

  if (mismatchReason || nonAwsHits >= 2) {
    return {
      likely: true,
      confidence: "medium" as const,
      reason:
        mismatchReason ??
        "The uploaded file references non-AWS platform terms, so this AWS-only launch reviewer may misread the submission.",
    };
  }

  return {
    likely: false,
    confidence: "low" as const,
    reason: "No strong non-architecture evidence was detected.",
  };
}

function detectFamilyChoices(text: string) {
  return SERVICE_FAMILIES.map((entry) => {
    const matches = entry.variants
      .filter((variant) => variant.terms.some((term) => includesTerm(text, term)))
      .map((variant) => variant.id);

    return {
      family: entry.family,
      matches,
    };
  });
}

function detectCoreComponentMismatch(paragraph: string, ocr: string) {
  const paragraphChoices = detectFamilyChoices(paragraph);
  const ocrChoices = detectFamilyChoices(ocr);

  for (const family of SERVICE_FAMILIES) {
    const fromParagraph = paragraphChoices.find((entry) => entry.family === family.family)?.matches ?? [];
    const fromOcr = ocrChoices.find((entry) => entry.family === family.family)?.matches ?? [];

    if (fromParagraph.length === 0 || fromOcr.length === 0) {
      continue;
    }

    const overlap = fromParagraph.some((value) => fromOcr.includes(value));
    if (!overlap) {
      return `The written narrative and diagram disagree on the ${family.family} layer (${fromParagraph.join(", ")} vs ${fromOcr.join(", ")}).`;
    }
  }

  return null;
}

export function extractServiceTokens(provider: ArchitectureEvidenceBundle["provider"], source: string) {
  const normalized = compressWhitespace(source).toLowerCase();
  const matched = new Set<string>();

  for (const token of PROVIDER_TOKENS[provider]) {
    if (includesTerm(normalized, token)) {
      matched.add(token);
    }
  }

  return [...matched].sort((left, right) => left.localeCompare(right));
}

function buildFinding(ruleId: string, outcome: Exclude<RuleOutcome, "pass" | "na">, evidence: string): ArchitectureFindingDraft | null {
  const rule = getAwsArchitectureLaunchV1Rule(ruleId);
  if (!rule) {
    return null;
  }

  const pointsDeducted =
    outcome === "fail" ? rule.scoreWeight : Math.max(1, rule.scoreWeight - rule.maxPartialCredit);

  return {
    ruleId: rule.id,
    category: rule.category,
    pointsDeducted,
    message: truncate(`${outcome === "fail" ? "Resolve" : "Clarify"}: ${rule.estimateLineItemLabel}`, 120),
    fix: truncate(rule.remediationSummary, 160),
    evidence: truncate(evidence, 240),
  };
}

function pushRuleDecision(findings: ArchitectureFindingDraft[], ruleId: string, decision: RuleDecision) {
  if (decision.outcome === "pass" || decision.outcome === "na") {
    return;
  }

  const finding = buildFinding(ruleId, decision.outcome, decision.evidence);
  if (finding) {
    findings.push(finding);
  }
}

function buildDeterministicReviewFindings(bundle: ArchitectureEvidenceBundle): ArchitectureFindingDraft[] {
  const findings: ArchitectureFindingDraft[] = [];
  const paragraph = compressWhitespace(bundle.paragraph).toLowerCase();
  const ocr = compressWhitespace(bundle.ocrText).toLowerCase();
  const combined = compressWhitespace(`${bundle.paragraph} ${bundle.ocrText}`).toLowerCase();
  const regions = extractAwsRegions(combined);

  const production = bundle.metadata.environment === "prod" || includesAny(combined, ["production", "prod"]);
  const nonProdContext = includesAny(combined, ["dev", "development", "test", "staging", "non-prod", "non production"]);
  const hasInternetEntry = includesAny(combined, [
    "cloudfront",
    "api gateway",
    "application load balancer",
    "alb",
    "internet-facing",
    "internet facing",
    "public endpoint",
    "website",
    "browser",
    "route 53",
  ]);
  const claimsPrivateOnly = includesAny(combined, ["private-only", "private only", "no internet", "internal only"]);
  const claimsMultiRegion = includesAny(combined, ["multi-region", "multi region", "cross-region", "cross region"]);
  const claimsHaOrDr = includesAny(combined, ["high availability", "ha", "disaster recovery", "dr", "resilient"]);
  const sensitiveData =
    (bundle.metadata.regulatoryScope && bundle.metadata.regulatoryScope !== "none") ||
    includesAny(combined, ["sensitive data", "customer data", "pii", "phi", "pci", "regulated", "confidential"]);
  const hasStatefulData = includesAny(combined, ["database", "rds", "aurora", "dynamodb", "s3", "storage", "stateful"]);
  const hasRelationalDb = includesAny(combined, ["rds", "aurora", "postgres", "mysql", "sql server", "mariadb", "oracle"]);
  const hasS3 = includesAny(combined, ["s3", "bucket"]);
  const hasVpcBasedWorkload = includesAny(combined, ["vpc", "subnet", "ec2", "ecs", "eks", "fargate", "alb"]);
  const hasCompute = includesAny(combined, ["ec2", "ecs", "eks", "fargate", "lambda", "compute"]);
  const objectiveStated = includesAny(combined, ["web", "website", "api", "batch", "internal", "portal", "service"]);
  const measurableConstraintCount =
    countMentions(combined, ["latency", "uptime", "availability", "rto", "rpo", "sla", "slo", "qps", "rps", "throughput", "compliance"]) +
    (/\b\d+(\.\d+)?\s?(ms|s|sec|seconds|minutes|hours|rps|qps|users?|%|gb|tb)\b/.test(combined) ? 1 : 0);

  const inputMismatch = detectInputMismatch(paragraph, ocr);
  if (inputMismatch) {
    pushRuleDecision(findings, "diagram_narrative_core_component_mismatch", {
      outcome: "fail",
      evidence: inputMismatch,
    });
    return findings;
  }

  pushRuleDecision(findings, "workload_objective_and_constraints_stated", {
    outcome: objectiveStated && measurableConstraintCount >= 2 ? "pass" : objectiveStated ? "partial" : "fail",
    evidence:
      objectiveStated && measurableConstraintCount >= 2
        ? "The narrative states the workload shape and multiple measurable constraints."
        : objectiveStated
          ? "The workload objective is present, but the narrative does not state at least two measurable operating constraints."
          : "The narrative does not clearly state the workload objective or measurable operating constraints.",
  });

  const hasClassificationLanguage = includesAny(combined, ["data classification", "sensitivity", "restricted", "internal", "public data", "confidential", "pii", "phi", "pci"]);
  const hasComplianceLanguage =
    (bundle.metadata.regulatoryScope && bundle.metadata.regulatoryScope !== "none") ||
    includesAny(combined, ["soc2", "pci", "hipaa", "compliance", "regulated"]) ||
    includesAny(combined, ["no sensitive data", "compliance none"]);
  pushRuleDecision(findings, "data_classification_and_compliance_noted", {
    outcome:
      !hasStatefulData && !sensitiveData
        ? "na"
        : hasClassificationLanguage && hasComplianceLanguage
          ? "pass"
          : sensitiveData
            ? "fail"
            : "partial",
    evidence:
      hasClassificationLanguage && hasComplianceLanguage
        ? "The submission names data sensitivity and compliance scope."
        : sensitiveData
          ? "Sensitive or regulated data is implied, but the submission does not clearly classify it or state the compliance scope."
          : "Stateful or customer data is present, but the submission does not clearly classify the data or state compliance scope.",
  });

  const hasRto = includesTerm(combined, "rto");
  const hasRpo = includesTerm(combined, "rpo");
  pushRuleDecision(findings, "rto_rpo_defined", {
    outcome: !hasStatefulData && !claimsHaOrDr ? "na" : hasRto && hasRpo ? "pass" : hasRto || hasRpo ? "partial" : claimsHaOrDr ? "fail" : "partial",
    evidence:
      hasRto && hasRpo
        ? "Recovery time and recovery point objectives are stated."
        : hasRto || hasRpo
          ? "Only one recovery objective is explicit; both RTO and RPO should be named."
          : claimsHaOrDr
            ? "The submission claims HA/DR outcomes without naming RTO and RPO."
            : "Stateful components are present, but recovery objectives are not shown.",
  });

  const sharedProdNonProd = includesAny(combined, [
    "prod and dev share database",
    "prod and test share database",
    "shared credentials between prod and dev",
    "shared data store for prod and dev",
  ]);
  const hasRegionLabel = regions.size > 0 || includesAny(combined, ["region"]);
  const hasEnvironmentBoundary = Boolean(bundle.metadata.environment) || nonProdContext;
  pushRuleDecision(findings, "region_and_environment_boundaries_identified", {
    outcome: sharedProdNonProd ? "fail" : hasRegionLabel && hasEnvironmentBoundary ? "pass" : hasRegionLabel || hasEnvironmentBoundary ? "partial" : "fail",
    evidence:
      sharedProdNonProd
        ? "Production and non-production boundaries are explicitly shared, which makes the environment boundary unreliable."
        : hasRegionLabel && hasEnvironmentBoundary
          ? "The submission names the AWS Region and environment boundary."
          : hasRegionLabel || hasEnvironmentBoundary
            ? "Only part of the Region/environment boundary is explicit."
            : "The submission does not name the Region or show production/non-production boundaries.",
  });

  const coreMismatch = detectCoreComponentMismatch(paragraph, ocr);
  pushRuleDecision(findings, "diagram_narrative_core_component_mismatch", {
    outcome: coreMismatch ? "fail" : "pass",
    evidence: coreMismatch ?? "The narrative and diagram do not show a material core-component mismatch.",
  });

  const hasReplicationAndFailover = includesAny(combined, ["replication", "replica", "failover", "route 53 failover", "secondary region"]);
  pushRuleDecision(findings, "stated_multi_region_requirement_mismatch", {
    outcome: !claimsMultiRegion ? "na" : regions.size >= 2 && hasReplicationAndFailover ? "pass" : regions.size >= 2 ? "partial" : "fail",
    evidence:
      !claimsMultiRegion
        ? "No Multi-Region requirement was claimed."
        : regions.size >= 2 && hasReplicationAndFailover
          ? "The submission claims Multi-Region and shows at least two Regions with replication/failover signals."
          : regions.size >= 2
            ? "Multiple Regions are shown, but replication/failover is not explicit."
            : "The submission claims Multi-Region behavior but only shows a single Region or no Region failover design.",
  });

  const hasPrivateConnectivity = includesAny(combined, ["privatelink", "private endpoint", "vpc endpoint", "vpn", "direct connect", "transit gateway"]);
  pushRuleDecision(findings, "stated_private_only_requirement_mismatch", {
    outcome: !claimsPrivateOnly ? "na" : hasInternetEntry ? "fail" : hasPrivateConnectivity || !hasInternetEntry ? "pass" : "partial",
    evidence:
      !claimsPrivateOnly
        ? "No private-only requirement was claimed."
        : hasInternetEntry
          ? "The submission claims private-only access but still shows a public ingress path."
          : hasPrivateConnectivity
            ? "The submission claims private-only access and references private connectivity patterns."
            : "The submission claims private-only access, but the private connectivity path is not explicit.",
  });

  const hasTls = includesAny(combined, ["https", "tls", "443", "acm"]);
  const httpOnly = includesAny(combined, ["http-only", "http only", "port 80", "plain http"]) || (includesTerm(combined, "http") && !includesTerm(combined, "https"));
  pushRuleDecision(findings, "internet_facing_endpoint_without_tls", {
    outcome: !hasInternetEntry ? "na" : httpOnly ? "fail" : hasTls ? "pass" : "partial",
    evidence:
      !hasInternetEntry
        ? "No public endpoint is shown."
        : httpOnly
          ? "A public endpoint is described without HTTPS/TLS enforcement."
          : hasTls
            ? "Public traffic is explicitly terminated with HTTPS/TLS."
            : "A public endpoint is present, but TLS enforcement is not explicit.",
  });

  const publicDatabase = includesAny(combined, ["public database", "publicly accessible database", "database in public subnet", "rds in public subnet", "public db"]);
  const privateDatabase = includesAny(combined, ["private subnet", "not publicly accessible", "private database", "db private"]);
  pushRuleDecision(findings, "public_database_exposure", {
    outcome: !hasRelationalDb && !includesTerm(combined, "database") ? "na" : publicDatabase ? "fail" : privateDatabase ? "pass" : "partial",
    evidence:
      publicDatabase
        ? "The submission explicitly places a database on a public path."
        : privateDatabase
          ? "The database is described as private-only."
          : "A database is present, but public/private exposure is not explicit.",
  });

  const publicBucket = includesAny(combined, ["public s3 bucket", "public-read bucket", "public read bucket", "public write bucket", "bucket is public"]);
  const privateBucket = includesAny(combined, ["block public access", "non-public bucket", "private bucket", "origin access control", "origin access identity"]);
  pushRuleDecision(findings, "public_s3_bucket_access", {
    outcome: !hasS3 ? "na" : publicBucket && sensitiveData ? "fail" : privateBucket ? "pass" : "partial",
    evidence:
      !hasS3
        ? "No S3 usage is shown."
        : publicBucket && sensitiveData
          ? "The submission describes public S3 access for non-public or customer data."
          : privateBucket
            ? "S3 access is described as private or fronted by a controlled origin."
            : "S3 is present, but bucket exposure is not explicit.",
  });

  const hasAdminSurface = includesAny(combined, ["ssh", "rdp", "bastion", "session manager", "ec2", "server"]);
  const openAdmin = includesAny(combined, ["ssh 0.0.0.0/0", "rdp 0.0.0.0/0", "ssh from anywhere", "rdp from anywhere", "open ssh", "open rdp"]);
  const controlledAdmin = includesAny(combined, ["session manager", "vpn", "restricted cidr", "allowlisted cidr", "bastion"]);
  pushRuleDecision(findings, "unrestricted_admin_ports_from_internet", {
    outcome: !hasAdminSurface ? "na" : openAdmin ? "fail" : controlledAdmin ? "pass" : "partial",
    evidence:
      !hasAdminSurface
        ? "No administerable server path is shown."
        : openAdmin
          ? "The submission explicitly allows admin access from the internet."
          : controlledAdmin
            ? "Administrative access is described through a controlled path."
            : "Administrative access exists, but the control boundary is not explicit.",
  });

  const requiresSecrets = hasStatefulData || hasInternetEntry || includesAny(combined, ["password", "token", "credential", "secret", "api key"]);
  const hasSecretStore = includesAny(combined, ["secrets manager", "parameter store", "securestring"]);
  const hardcodedSecrets = includesAny(combined, ["hard-coded secret", "hardcoded secret", "secret in code", "access key in config", "credential in image", "embedded key"]);
  pushRuleDecision(findings, "secrets_management_centralized", {
    outcome: !requiresSecrets ? "na" : hardcodedSecrets ? "fail" : hasSecretStore ? "pass" : "partial",
    evidence:
      !requiresSecrets
        ? "No secret-bearing path is obvious from the submission."
        : hardcodedSecrets
          ? "The submission explicitly exposes hard-coded or embedded secrets."
          : hasSecretStore
            ? "The submission explicitly uses a managed AWS secret store."
            : "The workload needs secrets, but the secret storage path is not explicit.",
  });

  const hasAwsIdentityPath = hasCompute || includesAny(combined, ["iam", "identity", "sso", "federation", "aws api"]);
  const hasRoles = includesAny(combined, ["iam role", "execution role", "task role", "instance profile", "assume role"]);
  const hasHumanSso = includesAny(combined, ["iam identity center", "sso", "federation", "federated"]);
  const longTermKeys = includesAny(combined, ["access key", "secret access key", "long-term key", "embedded key", "root key"]);
  pushRuleDecision(findings, "iam_roles_and_temporary_credentials", {
    outcome: !hasAwsIdentityPath ? "na" : longTermKeys ? "fail" : hasRoles && hasHumanSso ? "pass" : "partial",
    evidence:
      !hasAwsIdentityPath
        ? "No AWS identity path is evident."
        : longTermKeys
          ? "The submission explicitly relies on long-term or embedded AWS keys."
          : hasRoles && hasHumanSso
            ? "The submission references role-based app access and human SSO/federation."
            : "AWS identity usage is present, but temporary credentials/SSO are not fully explicit.",
  });

  const hasCloudTrail = includesTerm(combined, "cloudtrail");
  const hasMultiRegionCloudTrail =
    hasCloudTrail &&
    (includesAny(combined, [
      "cloudtrail multi-region",
      "cloudtrail is multi-region",
      "cloudtrail all regions",
      "cloudtrail across all regions",
      "multi-region trail",
      "all-region trail",
      "multi region trail",
    ]) ||
      /cloudtrail.{0,32}(multi-?region|all regions?)/.test(combined));
  const explicitCloudTrailOff = includesAny(combined, ["cloudtrail disabled", "no cloudtrail", "cloudtrail off"]);
  pushRuleDecision(findings, "cloudtrail_multi_region_enabled", {
    outcome: explicitCloudTrailOff ? "fail" : hasMultiRegionCloudTrail ? "pass" : hasCloudTrail ? "partial" : "partial",
    evidence:
      explicitCloudTrailOff
        ? "CloudTrail is explicitly disabled or omitted by design."
        : hasMultiRegionCloudTrail
          ? "A multi-Region CloudTrail posture is explicitly stated."
          : hasCloudTrail
            ? "CloudTrail is mentioned, but multi-Region coverage is not explicit."
            : "CloudTrail coverage is not stated for the AWS account in scope.",
  });

  const explicitNoWaf = includesAny(combined, ["no waf", "without waf", "won't use waf"]);
  const hasWaf = includesAny(combined, ["aws waf", "waf"]);
  pushRuleDecision(findings, "waf_on_public_endpoints", {
    outcome: !hasInternetEntry ? "na" : explicitNoWaf ? "fail" : hasWaf ? "pass" : "partial",
    evidence:
      !hasInternetEntry
        ? "No public endpoint is shown."
        : explicitNoWaf
          ? "The submission explicitly avoids L7 protection for a public entry point."
          : hasWaf
            ? "AWS WAF is attached to the public path."
            : "A public entry point is present, but AWS WAF is not explicit.",
  });

  const publicPrivateSplit = includesAny(combined, ["public subnet"]) && includesAny(combined, ["private subnet"]);
  const internalInPublic = includesAny(combined, ["app in public subnet", "application in public subnet", "database in public subnet", "rds in public subnet"]);
  pushRuleDecision(findings, "vpc_public_private_subnet_separation", {
    outcome: !hasVpcBasedWorkload || !hasInternetEntry ? "na" : internalInPublic ? "fail" : publicPrivateSplit ? "pass" : "partial",
    evidence:
      !hasVpcBasedWorkload || !hasInternetEntry
        ? "No VPC-based internet-facing tier was detected."
        : internalInPublic
          ? "Internal tiers are explicitly placed on a public path."
          : publicPrivateSplit
            ? "The submission separates public ingress from private app/data tiers."
            : "The VPC layout is present, but public vs private tier separation is not explicit.",
  });

  const needsNatReview = hasVpcBasedWorkload && includesAny(combined, ["private subnet", "nat", "egress", "outbound"]) && (includesAny(combined, ["multi-az", "multi az", "two az", "2 az"]) || regions.size >= 1);
  const natPerAz = includesAny(combined, ["nat gateway per az", "nat per az", "one nat per az", "local nat"]);
  const singleNat = includesAny(combined, ["single nat", "one nat gateway", "shared nat gateway"]);
  pushRuleDecision(findings, "nat_gateway_per_az_for_private_egress", {
    outcome: !needsNatReview ? "na" : singleNat ? "fail" : natPerAz ? "pass" : "partial",
    evidence:
      !needsNatReview
        ? "No multi-AZ private egress pattern was detected."
        : singleNat
          ? "The submission routes multi-AZ private egress through a single NAT path."
          : natPerAz
            ? "The submission explicitly uses per-AZ NAT gateways."
            : "Private egress exists, but per-AZ NAT placement is not explicit.",
  });

  const hasAlb = includesAny(combined, ["application load balancer", "alb"]);
  const albMultiAz = hasAlb && includesAny(combined, ["multi-az", "multi az", "two az", "2 az", "two availability zones"]);
  const singleAzAlb = hasAlb && includesAny(combined, ["single-az alb", "single az alb", "one subnet alb"]);
  pushRuleDecision(findings, "alb_in_at_least_two_azs", {
    outcome: !hasAlb ? "na" : singleAzAlb ? "fail" : albMultiAz ? "pass" : "partial",
    evidence:
      !hasAlb
        ? "No ALB is shown."
        : singleAzAlb
          ? "The ALB is explicitly shown in a single-AZ path."
          : albMultiAz
            ? "The ALB is explicitly multi-AZ."
            : "An ALB is present, but multi-AZ placement is not explicit.",
  });

  const singleInstance = includesAny(combined, ["single ec2 instance", "one ec2 instance", "single instance", "single task", "one task"]);
  const redundantCompute = includesAny(combined, ["auto scaling group", "asg", "two instances", "2 instances", "two tasks", "2 tasks", "desired count 2", "redundant compute"]) || includesAny(combined, ["lambda", "serverless"]);
  pushRuleDecision(findings, "single_instance_production_compute", {
    outcome: !hasCompute || !(production || hasInternetEntry || claimsHaOrDr) ? "na" : singleInstance ? "fail" : redundantCompute ? "pass" : "partial",
    evidence:
      !hasCompute || !(production || hasInternetEntry || claimsHaOrDr)
        ? "No production compute tier requiring redundancy is obvious."
        : singleInstance
          ? "The serving tier is explicitly shown as a single instance or task."
          : redundantCompute
            ? "The compute tier shows managed or redundant capacity."
            : "The serving tier exists, but compute redundancy is not explicit.",
  });

  const computeMultiAz = hasCompute && includesAny(combined, ["multi-az", "multi az", "two az", "2 az", "two availability zones"]);
  const singleAzCompute = hasCompute && includesAny(combined, ["single-az compute", "single az compute", "one az compute"]);
  pushRuleDecision(findings, "compute_multi_az_deployment", {
    outcome: !hasVpcBasedWorkload || !hasCompute || !(production || claimsHaOrDr) ? "na" : singleAzCompute ? "fail" : computeMultiAz ? "pass" : "partial",
    evidence:
      !hasVpcBasedWorkload || !hasCompute || !(production || claimsHaOrDr)
        ? "No multi-AZ compute expectation is obvious."
        : singleAzCompute
          ? "The compute tier is explicitly shown in a single AZ."
          : computeMultiAz
            ? "The compute tier is explicitly multi-AZ."
            : "The compute tier exists, but multi-AZ placement is not explicit.",
  });

  const scalingExplicit = includesAny(combined, ["auto scaling", "autoscaling", "serverless", "scale out", "desired count", "target tracking"]);
  const noScaling = includesAny(combined, ["no scaling", "fixed capacity", "manually scale"]);
  pushRuleDecision(findings, "autoscaling_defined_for_variable_load", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noScaling ? "fail" : scalingExplicit ? "pass" : "partial",
    evidence:
      !hasCompute && !hasInternetEntry
        ? "No variable-demand compute path is obvious."
        : noScaling
          ? "The submission explicitly states fixed capacity with no scaling path."
          : scalingExplicit
            ? "A scaling mechanism is explicitly described."
            : "The workload looks user-facing or variable, but a scaling path is not explicit.",
  });

  const hasBackups = includesAny(combined, ["backup", "snapshot"]);
  const hasRestore = includesAny(combined, ["restore", "point-in-time recovery", "pitr"]);
  const noBackups = includesAny(combined, ["no backups", "without backups"]);
  pushRuleDecision(findings, "no_backup_strategy_for_stateful_data", {
    outcome: !hasStatefulData ? "na" : noBackups ? "fail" : hasBackups && hasRestore ? "pass" : "partial",
    evidence:
      !hasStatefulData
        ? "No important stateful data store is obvious."
        : noBackups
          ? "The submission explicitly says important state has no backup path."
          : hasBackups && hasRestore
            ? "Backup and restore signals are explicitly present."
            : "Stateful data is present, but a complete backup and restore path is not explicit.",
  });

  const dbMultiAz = includesAny(combined, ["rds multi-az", "multi-az database", "multi az database", "aurora cluster"]);
  const singleAzDb = includesAny(combined, ["single-az database", "single az database", "single az rds"]);
  pushRuleDecision(findings, "single_az_database_for_production", {
    outcome: !hasRelationalDb || !(production || claimsHaOrDr) ? "na" : singleAzDb ? "fail" : dbMultiAz ? "pass" : "partial",
    evidence:
      !hasRelationalDb || !(production || claimsHaOrDr)
        ? "No production relational database path requiring HA is obvious."
        : singleAzDb
          ? "The relational database is explicitly single-AZ."
          : dbMultiAz
            ? "The relational database is explicitly Multi-AZ or clustered."
            : "A production relational database is present, but Multi-AZ coverage is not explicit.",
  });

  const encryptedAtRest = includesAny(combined, ["encrypted at rest", "kms", "rds encryption", "aurora encryption"]);
  const unencryptedAtRest = includesAny(combined, ["unencrypted at rest", "unencrypted database"]);
  pushRuleDecision(findings, "rds_encryption_at_rest", {
    outcome: !hasRelationalDb || !sensitiveData ? "na" : unencryptedAtRest ? "fail" : encryptedAtRest ? "pass" : "partial",
    evidence:
      !hasRelationalDb || !sensitiveData
        ? "No sensitive relational database path was detected."
        : unencryptedAtRest
          ? "Sensitive relational data is explicitly left unencrypted at rest."
          : encryptedAtRest
            ? "Database encryption at rest is explicitly stated."
            : "Sensitive relational data is present, but encryption at rest is not explicit.",
  });

  const centralizedLogs = includesAny(combined, ["cloudwatch logs", "centralized logs", "log pipeline", "log archive"]);
  const noCentralLogs = includesAny(combined, ["logs only on instance", "no centralized logs", "logs stay local"]);
  pushRuleDecision(findings, "centralized_application_logging", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noCentralLogs ? "fail" : centralizedLogs ? "pass" : production ? "partial" : "na",
    evidence:
      !hasCompute && !hasInternetEntry
        ? "No application workload requiring centralized logs is obvious."
        : noCentralLogs
          ? "The submission explicitly keeps logs only on hosts without central collection."
          : centralizedLogs
            ? "Application/service logs are routed to a centralized destination."
            : "The workload looks production-relevant, but centralized logs are not explicit.",
  });

  const hasAlarming = includesAny(combined, ["alarm", "alert", "cloudwatch alarm"]);
  const hasNotificationPath = includesAny(combined, ["sns", "on-call", "pagerduty", "ticketing", "ticket", "slack"]);
  const noAlerting = includesAny(combined, ["no alarms", "no alerting"]);
  pushRuleDecision(findings, "cloudwatch_alarms_for_key_metrics", {
    outcome: !(production || hasInternetEntry || claimsHaOrDr) ? "na" : noAlerting ? "fail" : hasAlarming && hasNotificationPath ? "pass" : "partial",
    evidence:
      !(production || hasInternetEntry || claimsHaOrDr)
        ? "No production/SLA expectation is obvious."
        : noAlerting
          ? "The submission explicitly lacks alarm/alerting coverage."
          : hasAlarming && hasNotificationPath
            ? "Key alarms and a notification path are explicitly described."
            : "The workload needs alerting, but alarms and notification routing are not fully explicit.",
  });

  const hasFlowLogs = includesAny(combined, ["vpc flow logs"]);
  const explicitNoNetworkLogging = includesAny(combined, ["no flow logs", "no network logging"]);
  pushRuleDecision(findings, "vpc_flow_logs_enabled", {
    outcome: !hasVpcBasedWorkload ? "na" : hasFlowLogs ? "pass" : explicitNoNetworkLogging && (sensitiveData || hasInternetEntry) ? "fail" : "na",
    evidence:
      !hasVpcBasedWorkload
        ? "No VPC-based workload is obvious."
        : hasFlowLogs
          ? "VPC Flow Logs are explicitly enabled."
          : explicitNoNetworkLogging && (sensitiveData || hasInternetEntry)
            ? "The submission explicitly avoids network visibility on a higher-risk VPC path."
            : "VPC Flow Logs are not explicit; leaving this as optional polish instead of a hard deduction.",
  });

  const hasCloudFront = includesTerm(combined, "cloudfront");
  const hasOriginAccessControl = includesAny(combined, ["origin access control", "origin access identity", "oac", "oai"]);
  const bucketBypass = hasCloudFront && hasS3 && includesAny(combined, ["public bucket", "direct s3 access", "bucket public"]);
  pushRuleDecision(findings, "cloudfront_s3_origin_oac_enabled", {
    outcome: !(hasCloudFront && hasS3) ? "na" : bucketBypass ? "fail" : hasOriginAccessControl ? "pass" : "partial",
    evidence:
      !(hasCloudFront && hasS3)
        ? "No CloudFront-to-S3 origin path is shown."
        : bucketBypass
          ? "The CloudFront S3 origin still appears directly reachable."
          : hasOriginAccessControl
            ? "CloudFront origin restriction is explicitly shown."
            : "CloudFront and S3 are both present, but origin restriction is not explicit.",
  });

  const separateAccounts = includesAny(combined, ["separate aws accounts", "separate account", "prod account", "non-prod account", "organizational unit"]);
  pushRuleDecision(findings, "multi_account_prod_isolation", {
    outcome: !(production && nonProdContext) ? "na" : sharedProdNonProd ? "fail" : separateAccounts ? "pass" : "partial",
    evidence:
      !(production && nonProdContext)
        ? "A mixed prod/non-prod estate is not obvious."
        : sharedProdNonProd
          ? "Production and non-production explicitly share data stores or credentials."
          : separateAccounts
            ? "The submission explicitly isolates prod and non-prod accounts."
            : "Production and non-production both exist, but account-level isolation is not explicit.",
  });

  const hasIac = includesAny(combined, ["cloudformation", "cdk", "terraform", "infrastructure as code", "iac"]);
  const manualConsole = includesAny(combined, ["manual console", "created in console", "manually created", "updated in console"]);
  pushRuleDecision(findings, "infrastructure_as_code_indicated", {
    outcome: !production ? "na" : manualConsole ? "fail" : hasIac ? "pass" : "partial",
    evidence:
      !production
        ? "No production environment is obvious."
        : manualConsole
          ? "The submission explicitly relies on manual console changes for production infrastructure."
          : hasIac
            ? "Infrastructure as code is explicitly stated."
            : "Production infrastructure is present, but an IaC path is not explicit.",
  });

  return findings;
}

export { buildDeterministicReviewFindings };

export function buildDeterministicNarrative(bundle: ArchitectureEvidenceBundle) {
  const paragraph = compressWhitespace(bundle.paragraph);
  const normalizedParagraph = paragraph.toLowerCase();
  const normalizedOcr = compressWhitespace(bundle.ocrText).toLowerCase();
  const tokenPreview = bundle.serviceTokens.slice(0, 6).join(", ");
  const inputMismatch = detectInputMismatch(normalizedParagraph, normalizedOcr);

  if (inputMismatch) {
    return `AWS architecture review could not trust the uploaded file as a clean architecture diagram. ${inputMismatch}`.slice(
      0,
      2000,
    );
  }

  if (!paragraph) {
    return `AWS architecture review used the uploaded diagram as the primary evidence source. Detected AWS components include ${tokenPreview || "a limited set of labels"}, but the written narrative was too thin to raise confidence further.`.slice(
      0,
      2000,
    );
  }

  if (isLowSignalParagraph(paragraph)) {
    return `AWS architecture review leaned on diagram evidence because the written narrative was low-signal. Detected components include ${tokenPreview || "a limited set of AWS labels"}. Add a clearer flow description to raise confidence on the next pass.`.slice(
      0,
      2000,
    );
  }

  const lead = `AWS architecture review scored this submission from the diagram plus the written narrative, not from live account access.`;
  const components = tokenPreview
    ? `Detected components include ${tokenPreview}${bundle.serviceTokens.length > 6 ? ", and additional AWS services" : ""}.`
    : "Detected component labels were sparse, so the narrative carried more of the review weight.";

  return `${lead} ${components} Narrative summary: ${paragraph}`.slice(0, 2000);
}
