import type { ArchitectureEvidenceBundle, ArchitectureFindingDraft } from "@/lib/architecture-review/types";
import {
  buildCommonSignals,
  countRegionTokens,
  fallbackEvidenceExcerpt,
  includesAny,
  includesTerm,
  pickEvidenceExcerpt,
  pushRuleDecision,
  type RuleDecision,
} from "@/lib/architecture-review/engine/shared";

function ruleEvidence(bundle: ArchitectureEvidenceBundle, terms: string[]) {
  return pickEvidenceExcerpt(bundle, terms);
}

function push(findings: ArchitectureFindingDraft[], ruleId: string, decision: RuleDecision) {
  pushRuleDecision(findings, `aws:${ruleId}`, decision);
}

export function buildAwsDeterministicFindings(bundle: ArchitectureEvidenceBundle) {
  const findings: ArchitectureFindingDraft[] = [];
  const signals = buildCommonSignals(bundle, {
    objectiveTerms: ["web", "website", "api", "batch", "internal", "portal", "service"],
    statefulTerms: ["database", "rds", "aurora", "dynamodb", "s3", "storage", "stateful"],
    relationalDbTerms: ["rds", "aurora", "postgres", "mysql", "sql server", "mariadb", "oracle"],
    objectStorageTerms: ["s3", "bucket"],
    sensitiveDataTerms: ["sensitive data", "customer data", "pii", "phi", "pci", "regulated", "confidential"],
  });
  const regions = countRegionTokens(signals.combined);
  const hasInternetEntry = includesAny(signals.combined, [
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
  const hasVpcBasedWorkload = includesAny(signals.combined, ["vpc", "subnet", "ec2", "ecs", "eks", "fargate", "alb"]);
  const hasCompute = includesAny(signals.combined, ["ec2", "ecs", "eks", "fargate", "lambda", "compute"]);
  const sharedProdNonProd = includesAny(signals.combined, [
    "prod and dev share database",
    "prod and test share database",
    "shared credentials between prod and dev",
    "shared data store for prod and dev",
  ]);

  push(findings, "workload_objective_and_constraints_stated", {
    outcome:
      signals.objectiveStated && signals.measurableConstraintCount >= 2
        ? "pass"
        : signals.objectiveStated
          ? "partial"
          : "fail",
    evidenceSeen: signals.objectiveStated
      ? ruleEvidence(bundle, ["web", "api", "batch", "portal", "service", "internal"])
      : fallbackEvidenceExcerpt(bundle),
  });

  const hasClassificationLanguage = includesAny(signals.combined, [
    "data classification",
    "sensitivity",
    "restricted",
    "internal",
    "public data",
    "confidential",
    "pii",
    "phi",
    "pci",
  ]);
  const hasComplianceLanguage =
    (bundle.metadata.regulatoryScope && bundle.metadata.regulatoryScope !== "none") ||
    includesAny(signals.combined, ["soc2", "pci", "hipaa", "compliance", "regulated", "no sensitive data"]);
  push(findings, "data_classification_and_compliance_noted", {
    outcome:
      !signals.hasStatefulData && !signals.sensitiveData
        ? "na"
        : hasClassificationLanguage && hasComplianceLanguage
          ? "pass"
          : signals.sensitiveData
            ? "fail"
            : "partial",
    evidenceSeen: ruleEvidence(bundle, ["pii", "phi", "pci", "confidential", "customer data", "database", "rds", "s3"]),
  });

  push(findings, "rto_rpo_defined", {
    outcome:
      !signals.hasStatefulData && !signals.claimsHaOrDr
        ? "na"
        : signals.hasRto && signals.hasRpo
          ? "pass"
          : signals.hasRto || signals.hasRpo
            ? "partial"
            : signals.claimsHaOrDr
              ? "fail"
              : "partial",
    evidenceSeen: ruleEvidence(bundle, ["rto", "rpo", "high availability", "disaster recovery", "database", "rds"]),
  });

  const hasRegionLabel = regions.size > 0 || includesAny(signals.combined, ["region"]);
  const hasEnvironmentBoundary = Boolean(bundle.metadata.environment) || signals.nonProdContext;
  push(findings, "region_and_environment_boundaries_identified", {
    outcome: sharedProdNonProd ? "fail" : hasRegionLabel && hasEnvironmentBoundary ? "pass" : hasRegionLabel || hasEnvironmentBoundary ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["us-east-1", "us-west-2", "prod", "production", "staging", "dev", "region"]),
  });

  const hasReplicationAndFailover = includesAny(signals.combined, [
    "replication",
    "replica",
    "failover",
    "route 53 failover",
    "secondary region",
  ]);
  push(findings, "stated_multi_region_requirement_mismatch", {
    outcome: !signals.claimsMultiRegion ? "na" : regions.size >= 2 && hasReplicationAndFailover ? "pass" : regions.size >= 2 ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["multi-region", "multi region", "secondary region", "replication", "failover"]),
  });

  const hasPrivateConnectivity = includesAny(signals.combined, [
    "privatelink",
    "private endpoint",
    "vpc endpoint",
    "vpn",
    "direct connect",
    "transit gateway",
  ]);
  push(findings, "stated_private_only_requirement_mismatch", {
    outcome: !signals.claimsPrivateOnly ? "na" : hasInternetEntry ? "fail" : hasPrivateConnectivity || !hasInternetEntry ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["private-only", "private only", "public endpoint", "alb", "api gateway", "vpn", "privatelink"]),
  });

  const hasTls = includesAny(signals.combined, ["https", "tls", "443", "acm"]);
  const httpOnly = includesAny(signals.combined, ["http-only", "http only", "port 80", "plain http"]) ||
    (includesTerm(signals.combined, "http") && !includesTerm(signals.combined, "https"));
  push(findings, "internet_facing_endpoint_without_tls", {
    outcome: !hasInternetEntry ? "na" : httpOnly ? "fail" : hasTls ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["http-only", "http", "https", "tls", "alb", "cloudfront", "api gateway"]),
  });

  const publicDatabase = includesAny(signals.combined, [
    "public database",
    "publicly accessible database",
    "database in public subnet",
    "rds in public subnet",
    "public db",
  ]);
  const privateDatabase = includesAny(signals.combined, [
    "private subnet",
    "not publicly accessible",
    "private database",
    "db private",
  ]);
  push(findings, "public_database_exposure", {
    outcome: !signals.hasRelationalDb && !includesTerm(signals.combined, "database") ? "na" : publicDatabase ? "fail" : privateDatabase ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["rds in public subnet", "public database", "private subnet", "not publicly accessible", "rds", "database"]),
  });

  const hasS3 = signals.hasObjectStorage;
  const publicBucket = includesAny(signals.combined, [
    "public s3 bucket",
    "public-read bucket",
    "public read bucket",
    "public write bucket",
    "bucket is public",
  ]);
  const privateBucket = includesAny(signals.combined, [
    "block public access",
    "non-public bucket",
    "private bucket",
    "origin access control",
    "origin access identity",
  ]);
  push(findings, "public_s3_bucket_access", {
    outcome: !hasS3 ? "na" : publicBucket && signals.sensitiveData ? "fail" : privateBucket ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public s3 bucket", "bucket is public", "block public access", "origin access control", "s3", "bucket"]),
  });

  const hasAdminSurface = includesAny(signals.combined, ["ssh", "rdp", "bastion", "session manager", "ec2", "server"]);
  const openAdmin = includesAny(signals.combined, [
    "ssh 0.0.0.0/0",
    "rdp 0.0.0.0/0",
    "ssh from anywhere",
    "rdp from anywhere",
    "open ssh",
    "open rdp",
  ]);
  const controlledAdmin = includesAny(signals.combined, ["session manager", "vpn", "restricted cidr", "allowlisted cidr", "bastion"]);
  push(findings, "unrestricted_admin_ports_from_internet", {
    outcome: !hasAdminSurface ? "na" : openAdmin ? "fail" : controlledAdmin ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["ssh 0.0.0.0/0", "rdp 0.0.0.0/0", "session manager", "vpn", "bastion", "ssh", "rdp"]),
  });

  const requiresSecrets = signals.hasStatefulData || hasInternetEntry || includesAny(signals.combined, ["password", "token", "credential", "secret", "api key"]);
  const hasSecretStore = includesAny(signals.combined, ["secrets manager", "parameter store", "securestring"]);
  const hardcodedSecrets = includesAny(signals.combined, [
    "hard-coded secret",
    "hardcoded secret",
    "secret in code",
    "access key in config",
    "credential in image",
    "embedded key",
  ]);
  push(findings, "secrets_management_centralized", {
    outcome: !requiresSecrets ? "na" : hardcodedSecrets ? "fail" : hasSecretStore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["hard-coded secret", "secret in code", "access key in config", "secrets manager", "parameter store", "api key", "credential"]),
  });

  const hasAwsIdentityPath = hasCompute || includesAny(signals.combined, ["iam", "identity", "sso", "federation", "aws api"]);
  const hasRoles = includesAny(signals.combined, ["iam role", "execution role", "task role", "instance profile", "assume role"]);
  const hasHumanSso = includesAny(signals.combined, ["iam identity center", "sso", "federation", "federated"]);
  const longTermKeys = includesAny(signals.combined, ["access key", "secret access key", "long-term key", "embedded key", "root key"]);
  push(findings, "iam_roles_and_temporary_credentials", {
    outcome: !hasAwsIdentityPath ? "na" : longTermKeys ? "fail" : hasRoles && hasHumanSso ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["access key", "secret access key", "embedded key", "iam role", "instance profile", "sso", "federation"]),
  });

  const hasCloudTrail = includesTerm(signals.combined, "cloudtrail");
  const hasMultiRegionCloudTrail =
    hasCloudTrail &&
    (includesAny(signals.combined, [
      "cloudtrail multi-region",
      "cloudtrail is multi-region",
      "cloudtrail all regions",
      "cloudtrail across all regions",
      "multi-region trail",
      "all-region trail",
      "multi region trail",
    ]) || /cloudtrail.{0,32}(multi-?region|all regions?)/.test(signals.combined));
  const explicitCloudTrailOff = includesAny(signals.combined, ["cloudtrail disabled", "no cloudtrail", "cloudtrail off"]);
  push(findings, "cloudtrail_multi_region_enabled", {
    outcome: explicitCloudTrailOff ? "fail" : hasMultiRegionCloudTrail ? "pass" : hasCloudTrail ? "partial" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["cloudtrail disabled", "no cloudtrail", "cloudtrail multi-region", "multi-region trail", "cloudtrail"]),
  });

  const explicitNoWaf = includesAny(signals.combined, ["no waf", "without waf", "won't use waf"]);
  const hasWaf = includesAny(signals.combined, ["aws waf", "waf"]);
  push(findings, "waf_on_public_endpoints", {
    outcome: !hasInternetEntry ? "na" : explicitNoWaf ? "fail" : hasWaf ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no waf", "without waf", "aws waf", "waf", "cloudfront", "alb", "api gateway"]),
  });

  const publicPrivateSplit = includesAny(signals.combined, ["public subnet"]) && includesAny(signals.combined, ["private subnet"]);
  const internalInPublic = includesAny(signals.combined, [
    "app in public subnet",
    "application in public subnet",
    "database in public subnet",
    "rds in public subnet",
  ]);
  push(findings, "vpc_public_private_subnet_separation", {
    outcome: !hasVpcBasedWorkload || !hasInternetEntry ? "na" : internalInPublic ? "fail" : publicPrivateSplit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public subnet", "private subnet", "app in public subnet", "database in public subnet", "vpc"]),
  });

  const needsNatReview =
    hasVpcBasedWorkload &&
    includesAny(signals.combined, ["private subnet", "nat", "egress", "outbound"]) &&
    (includesAny(signals.combined, ["multi-az", "multi az", "two az", "2 az"]) || regions.size >= 1);
  const natPerAz = includesAny(signals.combined, ["nat gateway per az", "nat per az", "one nat per az", "local nat"]);
  const singleNat = includesAny(signals.combined, ["single nat", "one nat gateway", "shared nat gateway"]);
  push(findings, "nat_gateway_per_az_for_private_egress", {
    outcome: !needsNatReview ? "na" : singleNat ? "fail" : natPerAz ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single nat", "one nat gateway", "shared nat gateway", "nat gateway per az", "nat per az", "nat"]),
  });

  const hasAlb = includesAny(signals.combined, ["application load balancer", "alb"]);
  const albMultiAz = hasAlb && includesAny(signals.combined, ["multi-az", "multi az", "two az", "2 az", "two availability zones"]);
  const singleAzAlb = hasAlb && includesAny(signals.combined, ["single-az alb", "single az alb", "one subnet alb"]);
  push(findings, "alb_in_at_least_two_azs", {
    outcome: !hasAlb ? "na" : singleAzAlb ? "fail" : albMultiAz ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single-az alb", "single az alb", "one subnet alb", "multi-az", "two availability zones", "alb"]),
  });

  const singleInstance = includesAny(signals.combined, [
    "single ec2 instance",
    "one ec2 instance",
    "single instance",
    "single task",
    "one task",
  ]);
  const redundantCompute = includesAny(signals.combined, [
    "auto scaling group",
    "asg",
    "two instances",
    "2 instances",
    "two tasks",
    "2 tasks",
    "desired count 2",
    "redundant compute",
    "lambda",
  ]);
  push(findings, "single_instance_production_compute", {
    outcome: !hasCompute || !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : singleInstance ? "fail" : redundantCompute ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single ec2 instance", "one task", "auto scaling group", "desired count 2", "lambda", "ec2", "ecs"]),
  });

  const computeMultiAz = hasCompute && includesAny(signals.combined, ["multi-az", "multi az", "two az", "2 az", "two availability zones"]);
  const singleAzCompute = hasCompute && includesAny(signals.combined, ["single-az compute", "single az compute", "one az compute"]);
  push(findings, "compute_multi_az_deployment", {
    outcome: !hasVpcBasedWorkload || !hasCompute || !(signals.production || signals.claimsHaOrDr) ? "na" : singleAzCompute ? "fail" : computeMultiAz ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single-az compute", "one az compute", "multi-az", "two availability zones", "ec2", "ecs", "eks"]),
  });

  const scalingExplicit = includesAny(signals.combined, ["auto scaling", "autoscaling", "serverless", "scale out", "desired count", "target tracking"]);
  const noScaling = includesAny(signals.combined, ["no scaling", "fixed capacity", "manually scale"]);
  push(findings, "autoscaling_defined_for_variable_load", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noScaling ? "fail" : scalingExplicit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no scaling", "fixed capacity", "auto scaling", "autoscaling", "serverless", "target tracking"]),
  });

  const hasBackups = includesAny(signals.combined, ["backup", "snapshot"]);
  const hasRestore = includesAny(signals.combined, ["restore", "point-in-time recovery", "pitr"]);
  const noBackups = includesAny(signals.combined, ["no backups", "without backups"]);
  push(findings, "no_backup_strategy_for_stateful_data", {
    outcome: !signals.hasStatefulData ? "na" : noBackups ? "fail" : hasBackups && hasRestore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no backups", "without backups", "backup", "snapshot", "restore", "point-in-time recovery"]),
  });

  const dbMultiAz = includesAny(signals.combined, ["rds multi-az", "multi-az database", "multi az database", "aurora cluster"]);
  const singleAzDb = includesAny(signals.combined, ["single-az database", "single az database", "single az rds"]);
  push(findings, "single_az_database_for_production", {
    outcome: !signals.hasRelationalDb || !(signals.production || signals.claimsHaOrDr) ? "na" : singleAzDb ? "fail" : dbMultiAz ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single-az database", "single az rds", "rds multi-az", "aurora cluster", "database", "rds"]),
  });

  const encryptedAtRest = includesAny(signals.combined, ["encrypted at rest", "kms", "rds encryption", "aurora encryption"]);
  const unencryptedAtRest = includesAny(signals.combined, ["unencrypted at rest", "unencrypted database"]);
  push(findings, "rds_encryption_at_rest", {
    outcome: !signals.hasRelationalDb || !signals.sensitiveData ? "na" : unencryptedAtRest ? "fail" : encryptedAtRest ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["unencrypted at rest", "unencrypted database", "encrypted at rest", "kms", "rds encryption", "aurora"]),
  });

  const centralizedLogs = includesAny(signals.combined, ["cloudwatch logs", "centralized logs", "log pipeline", "log archive"]);
  const noCentralLogs = includesAny(signals.combined, ["logs only on instance", "no centralized logs", "logs stay local"]);
  push(findings, "centralized_application_logging", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noCentralLogs ? "fail" : centralizedLogs ? "pass" : signals.production ? "partial" : "na",
    evidenceSeen: ruleEvidence(bundle, ["logs only on instance", "no centralized logs", "cloudwatch logs", "centralized logs", "log archive"]),
  });

  const hasAlarming = includesAny(signals.combined, ["alarm", "alert", "cloudwatch alarm"]);
  const hasNotificationPath = includesAny(signals.combined, ["sns", "on-call", "pagerduty", "ticketing", "ticket", "slack"]);
  const noAlerting = includesAny(signals.combined, ["no alarms", "no alerting"]);
  push(findings, "cloudwatch_alarms_for_key_metrics", {
    outcome: !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : noAlerting ? "fail" : hasAlarming && hasNotificationPath ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no alarms", "no alerting", "cloudwatch alarm", "alarm", "alert", "sns", "pagerduty", "slack"]),
  });

  const hasFlowLogs = includesAny(signals.combined, ["vpc flow logs"]);
  const explicitNoNetworkLogging = includesAny(signals.combined, ["no flow logs", "no network logging"]);
  push(findings, "vpc_flow_logs_enabled", {
    outcome: !hasVpcBasedWorkload ? "na" : hasFlowLogs ? "pass" : explicitNoNetworkLogging && (signals.sensitiveData || hasInternetEntry) ? "fail" : "na",
    evidenceSeen: ruleEvidence(bundle, ["vpc flow logs", "no flow logs", "no network logging", "vpc"]),
  });

  const hasCloudFront = includesTerm(signals.combined, "cloudfront");
  const hasOriginAccessControl = includesAny(signals.combined, ["origin access control", "origin access identity", "oac", "oai"]);
  const bucketBypass = hasCloudFront && hasS3 && includesAny(signals.combined, ["public bucket", "direct s3 access", "bucket public"]);
  push(findings, "cloudfront_s3_origin_oac_enabled", {
    outcome: !(hasCloudFront && hasS3) ? "na" : bucketBypass ? "fail" : hasOriginAccessControl ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public bucket", "direct s3 access", "origin access control", "origin access identity", "cloudfront", "s3"]),
  });

  const separateAccounts = includesAny(signals.combined, [
    "separate aws accounts",
    "separate account",
    "prod account",
    "non-prod account",
    "organizational unit",
  ]);
  push(findings, "multi_account_prod_isolation", {
    outcome: !(signals.production && signals.nonProdContext) ? "na" : sharedProdNonProd ? "fail" : separateAccounts ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["prod and dev share database", "shared credentials", "separate aws accounts", "prod account", "non-prod account"]),
  });

  const hasIac = includesAny(signals.combined, ["cloudformation", "cdk", "terraform", "infrastructure as code", "iac"]);
  const manualConsole = includesAny(signals.combined, ["manual console", "created in console", "manually created", "updated in console"]);
  push(findings, "infrastructure_as_code_indicated", {
    outcome: !signals.production ? "na" : manualConsole ? "fail" : hasIac ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["manual console", "created in console", "updated in console", "cloudformation", "terraform", "iac"]),
  });

  return findings;
}
