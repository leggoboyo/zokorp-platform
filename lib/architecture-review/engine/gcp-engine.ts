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
  pushRuleDecision(findings, `gcp:${ruleId}`, decision);
}

export function buildGcpDeterministicFindings(bundle: ArchitectureEvidenceBundle) {
  const findings: ArchitectureFindingDraft[] = [];
  const signals = buildCommonSignals(bundle, {
    objectiveTerms: ["web", "website", "api", "batch", "internal", "portal", "service", "application"],
    statefulTerms: ["database", "cloud sql", "spanner", "cloud storage", "storage", "stateful"],
    relationalDbTerms: ["cloud sql", "postgres", "mysql", "sql server", "database"],
    objectStorageTerms: ["cloud storage", "bucket", "gcs"],
    sensitiveDataTerms: ["sensitive data", "customer data", "pii", "phi", "pci", "regulated", "confidential"],
  });
  const regions = countRegionTokens(signals.combined);
  const hasInternetEntry = includesAny(signals.combined, [
    "cloud load balancing",
    "load balancer",
    "cloud armor",
    "cloud cdn",
    "api gateway",
    "public endpoint",
    "website",
    "browser",
  ]);
  const hasNetworkWorkload = includesAny(signals.combined, ["vpc", "subnet", "gke", "compute engine", "cloud nat"]);
  const hasCompute = includesAny(signals.combined, ["cloud run", "gke", "compute engine", "cloud functions"]);
  const sharedProdNonProd = includesAny(signals.combined, [
    "prod and dev share database",
    "prod and test share database",
    "shared credentials between prod and dev",
    "shared project",
  ]);

  push(findings, "workload_objective_and_constraints_stated", {
    outcome:
      signals.objectiveStated && signals.measurableConstraintCount >= 2
        ? "pass"
        : signals.objectiveStated
          ? "partial"
          : "fail",
    evidenceSeen: signals.objectiveStated
      ? ruleEvidence(bundle, ["web", "api", "batch", "portal", "service", "application"])
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
    evidenceSeen: ruleEvidence(bundle, ["pii", "phi", "pci", "confidential", "cloud sql", "cloud storage", "database"]),
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
    evidenceSeen: ruleEvidence(bundle, ["rto", "rpo", "high availability", "disaster recovery", "cloud sql", "cloud storage"]),
  });

  const hasRegionLabel = regions.size > 0 || includesAny(signals.combined, ["region", "project"]);
  const hasEnvironmentBoundary = Boolean(bundle.metadata.environment) || signals.nonProdContext;
  push(findings, "region_and_environment_boundaries_identified", {
    outcome: sharedProdNonProd ? "fail" : hasRegionLabel && hasEnvironmentBoundary ? "pass" : hasRegionLabel || hasEnvironmentBoundary ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["region", "project", "prod", "production", "staging", "dev"]),
  });

  const hasReplicationAndFailover = includesAny(signals.combined, ["replication", "replica", "failover", "secondary region", "cross-region"]);
  push(findings, "stated_multi_region_requirement_mismatch", {
    outcome: !signals.claimsMultiRegion ? "na" : regions.size >= 2 && hasReplicationAndFailover ? "pass" : regions.size >= 2 ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["multi-region", "multi region", "secondary region", "replication", "failover"]),
  });

  const hasPrivateConnectivity = includesAny(signals.combined, ["private service connect", "vpn", "interconnect", "private endpoint", "private google access"]);
  push(findings, "stated_private_only_requirement_mismatch", {
    outcome: !signals.claimsPrivateOnly ? "na" : hasInternetEntry ? "fail" : hasPrivateConnectivity ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["private-only", "private only", "public endpoint", "cloud load balancing", "private service connect", "vpn", "interconnect"]),
  });

  const hasTls = includesAny(signals.combined, ["https", "tls", "443"]);
  const httpOnly = includesAny(signals.combined, ["http-only", "http only", "port 80", "plain http"]) ||
    (includesTerm(signals.combined, "http") && !includesTerm(signals.combined, "https"));
  push(findings, "internet_facing_endpoint_without_tls", {
    outcome: !hasInternetEntry ? "na" : httpOnly ? "fail" : hasTls ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["http-only", "http", "https", "tls", "cloud load balancing", "api gateway"]),
  });

  const publicDatabase = includesAny(signals.combined, ["public database", "publicly accessible database", "cloud sql public ip", "database public"]);
  const privateDatabase = includesAny(signals.combined, ["private ip", "private database", "private service connect"]);
  push(findings, "public_database_exposure", {
    outcome: !signals.hasRelationalDb && !includesTerm(signals.combined, "database") ? "na" : publicDatabase ? "fail" : privateDatabase ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["cloud sql public ip", "public database", "private ip", "private service connect", "cloud sql", "database"]),
  });

  const hasAdminSurface = includesAny(signals.combined, ["ssh", "rdp", "bastion", "compute engine", "vm", "iap"]);
  const openAdmin = includesAny(signals.combined, [
    "ssh 0.0.0.0/0",
    "rdp 0.0.0.0/0",
    "ssh from anywhere",
    "rdp from anywhere",
    "open ssh",
    "open rdp",
  ]);
  const controlledAdmin = includesAny(signals.combined, ["iap", "bastion", "vpn", "restricted cidr", "allowlisted cidr"]);
  push(findings, "unrestricted_admin_ports_from_internet", {
    outcome: !hasAdminSurface ? "na" : openAdmin ? "fail" : controlledAdmin ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["ssh 0.0.0.0/0", "rdp 0.0.0.0/0", "iap", "bastion", "vpn", "ssh", "rdp"]),
  });

  const requiresSecrets = signals.hasStatefulData || hasInternetEntry || includesAny(signals.combined, ["password", "token", "credential", "secret", "api key"]);
  const hasSecretStore = includesAny(signals.combined, ["secret manager"]);
  const hardcodedSecrets = includesAny(signals.combined, ["hard-coded secret", "hardcoded secret", "secret in code", "service account key", "embedded key"]);
  push(findings, "secret_manager_secrets_management", {
    outcome: !requiresSecrets ? "na" : hardcodedSecrets ? "fail" : hasSecretStore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["hard-coded secret", "secret in code", "service account key", "secret manager", "api key", "credential"]),
  });

  const hasIdentityPath = hasCompute || includesAny(signals.combined, ["service account", "workload identity", "iam", "identity"]);
  const hasManagedIdentity = includesAny(signals.combined, ["workload identity", "attached service account", "service account"]);
  const longTermCredentials = includesAny(signals.combined, ["service account key", "json key", "embedded key"]);
  const leastPrivilege = includesAny(signals.combined, ["least privilege", "minimal iam", "iam role", "iam binding"]);
  push(findings, "service_account_keyless_identity", {
    outcome: !hasIdentityPath ? "na" : longTermCredentials ? "fail" : hasManagedIdentity && leastPrivilege ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["service account key", "json key", "workload identity", "service account", "least privilege", "iam"]),
  });

  const explicitNoWaf = includesAny(signals.combined, ["no waf", "without cloud armor", "without waf"]);
  const hasWaf = includesAny(signals.combined, ["cloud armor", "waf"]);
  push(findings, "waf_on_public_endpoints", {
    outcome: !hasInternetEntry ? "na" : explicitNoWaf ? "fail" : hasWaf ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no waf", "without cloud armor", "cloud armor", "waf", "cloud load balancing", "api gateway"]),
  });

  const publicPrivateSplit = includesAny(signals.combined, ["public subnet"]) && includesAny(signals.combined, ["private subnet"]);
  const internalInPublic = includesAny(signals.combined, ["app in public subnet", "database in public subnet"]);
  push(findings, "vpc_public_private_subnet_separation", {
    outcome: !hasNetworkWorkload || !hasInternetEntry ? "na" : internalInPublic ? "fail" : publicPrivateSplit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public subnet", "private subnet", "database in public subnet", "vpc", "subnet"]),
  });

  const zoneRedundantCompute = includesAny(signals.combined, ["multi-zone", "multi zone", "zonal", "regional", "two zones", "2 zones"]);
  const singleZoneCompute = includesAny(signals.combined, ["single zone", "one zone"]);
  push(findings, "zone_redundant_compute", {
    outcome: !hasCompute || !(signals.production || signals.claimsHaOrDr) ? "na" : singleZoneCompute ? "fail" : zoneRedundantCompute ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single zone", "one zone", "multi-zone", "multi zone", "regional", "gke", "compute engine", "cloud run"]),
  });

  const singleInstance = includesAny(signals.combined, ["single instance", "one vm", "single vm", "single cloud run instance"]);
  const redundantCompute = includesAny(signals.combined, ["autoscaling", "managed instance group", "two instances", "2 instances", "gke", "cloud run", "cloud functions"]);
  push(findings, "single_instance_production_compute", {
    outcome: !hasCompute || !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : singleInstance ? "fail" : redundantCompute ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single instance", "one vm", "single vm", "managed instance group", "autoscaling", "gke", "cloud run"]),
  });

  const scalingExplicit = includesAny(signals.combined, ["autoscaling", "serverless", "scale out", "managed instance group", "cloud run"]);
  const noScaling = includesAny(signals.combined, ["no scaling", "fixed capacity", "manually scale"]);
  push(findings, "autoscaling_defined_for_variable_load", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noScaling ? "fail" : scalingExplicit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no scaling", "fixed capacity", "autoscaling", "managed instance group", "cloud run", "serverless"]),
  });

  const hasBackups = includesAny(signals.combined, ["backup", "snapshot"]);
  const hasRestore = includesAny(signals.combined, ["restore", "point-in-time recovery", "pitr"]);
  const noBackups = includesAny(signals.combined, ["no backups", "without backups"]);
  push(findings, "backup_restore_plan_for_stateful_data", {
    outcome: !signals.hasStatefulData ? "na" : noBackups ? "fail" : hasBackups && hasRestore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no backups", "without backups", "backup", "snapshot", "restore", "point-in-time recovery"]),
  });

  const dbHa = includesAny(signals.combined, ["regional", "high availability", "read replica", "failover replica", "multi-zone"]);
  const singleZoneDb = includesAny(signals.combined, ["single zone database", "single zone sql", "single zone"]);
  push(findings, "zone_redundant_database", {
    outcome: !signals.hasRelationalDb || !(signals.production || signals.claimsHaOrDr) ? "na" : singleZoneDb ? "fail" : dbHa ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single zone database", "regional", "read replica", "failover replica", "cloud sql"]),
  });

  const centralizedLogs = includesAny(signals.combined, ["cloud logging", "centralized logs", "log sink"]);
  const noCentralLogs = includesAny(signals.combined, ["logs only on vm", "no centralized logs", "logs stay local"]);
  push(findings, "centralized_application_logging", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noCentralLogs ? "fail" : centralizedLogs ? "pass" : signals.production ? "partial" : "na",
    evidenceSeen: ruleEvidence(bundle, ["logs only on vm", "no centralized logs", "cloud logging", "centralized logs", "log sink"]),
  });

  const hasAlarming = includesAny(signals.combined, ["alert", "alerts", "alarm"]);
  const hasNotificationPath = includesAny(signals.combined, ["email", "sms", "slack", "pagerduty", "ticket", "on-call"]);
  const noAlerting = includesAny(signals.combined, ["no alerts", "no alerting"]);
  push(findings, "monitor_alerts_for_key_metrics", {
    outcome: !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : noAlerting ? "fail" : hasAlarming && hasNotificationPath ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no alerts", "no alerting", "alerts", "cloud monitoring", "pagerduty", "slack", "ticket"]),
  });

  const hasFlowLogs = includesAny(signals.combined, ["vpc flow logs"]);
  const explicitNoNetworkLogging = includesAny(signals.combined, ["no flow logs", "no network logging"]);
  push(findings, "vpc_flow_logs_enabled", {
    outcome: !hasNetworkWorkload ? "na" : hasFlowLogs ? "pass" : explicitNoNetworkLogging && (signals.sensitiveData || hasInternetEntry) ? "fail" : "na",
    evidenceSeen: ruleEvidence(bundle, ["vpc flow logs", "no flow logs", "no network logging", "vpc"]),
  });

  const hasVersioning = includesAny(signals.combined, ["object versioning", "versioning", "bucket versioning"]);
  push(findings, "cloud_storage_versioning_enabled", {
    outcome: !signals.hasObjectStorage ? "na" : hasVersioning ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["object versioning", "bucket versioning", "versioning", "cloud storage", "bucket"]),
  });

  const hasLifecycle = includesAny(signals.combined, ["lifecycle", "retention policy", "tiering"]);
  push(findings, "cloud_storage_lifecycle_management_configured", {
    outcome: !signals.hasObjectStorage ? "na" : hasLifecycle ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["lifecycle", "retention policy", "tiering", "cloud storage", "bucket"]),
  });

  const productionIsolation = includesAny(signals.combined, ["separate project", "prod project", "non-prod project"]);
  push(findings, "production_environment_isolated", {
    outcome: !(signals.production && signals.nonProdContext) ? "na" : sharedProdNonProd ? "fail" : productionIsolation ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["shared project", "separate project", "prod project", "non-prod project"]),
  });

  const hasIac = includesAny(signals.combined, ["terraform", "deployment manager", "infrastructure as code", "iac"]);
  const manualConsole = includesAny(signals.combined, ["manual console", "created in console", "manually created", "updated in console"]);
  push(findings, "infrastructure_as_code_indicated", {
    outcome: !signals.production ? "na" : manualConsole ? "fail" : hasIac ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["manual console", "created in console", "terraform", "deployment manager", "iac"]),
  });

  return findings;
}
