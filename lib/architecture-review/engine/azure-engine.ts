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
  pushRuleDecision(findings, `azure:${ruleId}`, decision);
}

export function buildAzureDeterministicFindings(bundle: ArchitectureEvidenceBundle) {
  const findings: ArchitectureFindingDraft[] = [];
  const signals = buildCommonSignals(bundle, {
    objectiveTerms: ["web", "website", "api", "batch", "internal", "portal", "service", "application"],
    statefulTerms: ["database", "sql database", "cosmos db", "storage account", "blob", "storage", "stateful"],
    relationalDbTerms: ["sql database", "postgres", "mysql", "sql managed instance", "database"],
    objectStorageTerms: ["storage account", "blob", "blob storage"],
    sensitiveDataTerms: ["sensitive data", "customer data", "pii", "phi", "pci", "regulated", "confidential"],
  });
  const regions = countRegionTokens(signals.combined);
  const hasInternetEntry = includesAny(signals.combined, [
    "front door",
    "application gateway",
    "public endpoint",
    "website",
    "browser",
    "internet-facing",
    "internet facing",
  ]);
  const hasNetworkWorkload = includesAny(signals.combined, ["vnet", "subnet", "application gateway", "aks", "virtual machine"]);
  const hasCompute = includesAny(signals.combined, ["app service", "functions", "aks", "virtual machine", "vm", "container apps"]);
  const sharedProdNonProd = includesAny(signals.combined, [
    "prod and dev share database",
    "prod and test share database",
    "shared credentials between prod and dev",
    "shared resource group",
    "shared subscription",
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
    evidenceSeen: ruleEvidence(bundle, ["pii", "phi", "pci", "confidential", "database", "storage account", "blob"]),
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
    evidenceSeen: ruleEvidence(bundle, ["rto", "rpo", "high availability", "disaster recovery", "database", "storage account"]),
  });

  const hasRegionLabel = regions.size > 0 || includesAny(signals.combined, ["region"]);
  const hasEnvironmentBoundary = Boolean(bundle.metadata.environment) || signals.nonProdContext;
  push(findings, "region_and_environment_boundaries_identified", {
    outcome: sharedProdNonProd ? "fail" : hasRegionLabel && hasEnvironmentBoundary ? "pass" : hasRegionLabel || hasEnvironmentBoundary ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["region", "prod", "production", "staging", "dev", "subscription", "resource group"]),
  });

  const hasReplicationAndFailover = includesAny(signals.combined, ["replication", "replica", "failover", "secondary region", "geo-redundant"]);
  push(findings, "stated_multi_region_requirement_mismatch", {
    outcome: !signals.claimsMultiRegion ? "na" : regions.size >= 2 && hasReplicationAndFailover ? "pass" : regions.size >= 2 ? "partial" : "fail",
    evidenceSeen: ruleEvidence(bundle, ["multi-region", "multi region", "secondary region", "replication", "failover", "geo-redundant"]),
  });

  const hasPrivateConnectivity = includesAny(signals.combined, ["private link", "private endpoint", "vpn", "expressroute"]);
  push(findings, "stated_private_only_requirement_mismatch", {
    outcome: !signals.claimsPrivateOnly ? "na" : hasInternetEntry ? "fail" : hasPrivateConnectivity ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["private-only", "private only", "public endpoint", "front door", "application gateway", "private link", "expressroute"]),
  });

  const hasTls = includesAny(signals.combined, ["https", "tls", "443", "https only"]);
  const httpOnly = includesAny(signals.combined, ["http-only", "http only", "port 80", "plain http"]) ||
    (includesTerm(signals.combined, "http") && !includesTerm(signals.combined, "https"));
  push(findings, "internet_facing_endpoint_without_tls", {
    outcome: !hasInternetEntry ? "na" : httpOnly ? "fail" : hasTls ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["http-only", "http", "https", "tls", "front door", "application gateway"]),
  });

  const publicDatabase = includesAny(signals.combined, ["public database", "publicly accessible database", "public sql database", "database public"]);
  const privateDatabase = includesAny(signals.combined, ["private endpoint", "private database", "private access"]);
  push(findings, "public_database_exposure", {
    outcome: !signals.hasRelationalDb && !includesTerm(signals.combined, "database") ? "na" : publicDatabase ? "fail" : privateDatabase ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public database", "public sql database", "private endpoint", "database", "sql database"]),
  });

  const hasAdminSurface = includesAny(signals.combined, ["ssh", "rdp", "bastion", "virtual machine", "vm"]);
  const openAdmin = includesAny(signals.combined, [
    "ssh 0.0.0.0/0",
    "rdp 0.0.0.0/0",
    "ssh from anywhere",
    "rdp from anywhere",
    "open ssh",
    "open rdp",
  ]);
  const controlledAdmin = includesAny(signals.combined, ["bastion", "vpn", "restricted cidr", "allowlisted cidr"]);
  push(findings, "unrestricted_admin_ports_from_internet", {
    outcome: !hasAdminSurface ? "na" : openAdmin ? "fail" : controlledAdmin ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["ssh 0.0.0.0/0", "rdp 0.0.0.0/0", "bastion", "vpn", "ssh", "rdp"]),
  });

  const requiresSecrets = signals.hasStatefulData || hasInternetEntry || includesAny(signals.combined, ["password", "token", "credential", "secret", "api key"]);
  const hasSecretStore = includesAny(signals.combined, ["key vault"]);
  const hardcodedSecrets = includesAny(signals.combined, ["hard-coded secret", "hardcoded secret", "secret in code", "credential in app settings", "embedded key"]);
  push(findings, "key_vault_secrets_management", {
    outcome: !requiresSecrets ? "na" : hardcodedSecrets ? "fail" : hasSecretStore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["hard-coded secret", "secret in code", "credential in app settings", "key vault", "api key", "credential"]),
  });

  const hasIdentityPath = hasCompute || includesAny(signals.combined, ["managed identity", "entra", "azure ad", "rbac", "identity"]);
  const hasManagedIdentity = includesAny(signals.combined, ["managed identity"]);
  const longTermCredentials = includesAny(signals.combined, ["client secret", "service principal secret", "embedded credential", "access key"]);
  const leastPrivilege = includesAny(signals.combined, ["least privilege", "rbac", "reader role", "contributor role"]);
  push(findings, "managed_identity_least_privilege", {
    outcome: !hasIdentityPath ? "na" : longTermCredentials ? "fail" : hasManagedIdentity && leastPrivilege ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["client secret", "service principal secret", "managed identity", "rbac", "least privilege", "entra"]),
  });

  const explicitNoWaf = includesAny(signals.combined, ["no waf", "without waf"]);
  const hasWaf = includesAny(signals.combined, ["waf", "front door waf"]);
  push(findings, "waf_on_public_endpoints", {
    outcome: !hasInternetEntry ? "na" : explicitNoWaf ? "fail" : hasWaf ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no waf", "without waf", "waf", "front door waf", "front door", "application gateway"]),
  });

  const publicPrivateSplit = includesAny(signals.combined, ["public subnet"]) && includesAny(signals.combined, ["private subnet"]);
  const internalInPublic = includesAny(signals.combined, ["app in public subnet", "database in public subnet", "public app service"]);
  push(findings, "vnet_public_private_subnet_separation", {
    outcome: !hasNetworkWorkload || !hasInternetEntry ? "na" : internalInPublic ? "fail" : publicPrivateSplit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["public subnet", "private subnet", "public app service", "vnet", "subnet"]),
  });

  const zoneRedundantCompute = includesAny(signals.combined, ["availability zone", "zones", "zone redundant", "multi-zone", "multi zone"]);
  const singleZoneCompute = includesAny(signals.combined, ["single zone", "one zone"]);
  push(findings, "zone_redundant_compute", {
    outcome: !hasCompute || !(signals.production || signals.claimsHaOrDr) ? "na" : singleZoneCompute ? "fail" : zoneRedundantCompute ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single zone", "one zone", "availability zone", "zone redundant", "multi-zone", "aks", "app service"]),
  });

  const singleInstance = includesAny(signals.combined, ["single instance", "one vm", "single vm", "single app service instance"]);
  const redundantCompute = includesAny(signals.combined, ["autoscale", "scale set", "two instances", "2 instances", "aks", "functions"]);
  push(findings, "single_instance_production_compute", {
    outcome: !hasCompute || !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : singleInstance ? "fail" : redundantCompute ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single instance", "one vm", "single vm", "autoscale", "scale set", "aks", "functions"]),
  });

  const scalingExplicit = includesAny(signals.combined, ["autoscale", "autoscaling", "serverless", "scale out", "elastic"]);
  const noScaling = includesAny(signals.combined, ["no scaling", "fixed capacity", "manually scale"]);
  push(findings, "autoscaling_defined_for_variable_load", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noScaling ? "fail" : scalingExplicit ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no scaling", "fixed capacity", "autoscale", "autoscaling", "serverless"]),
  });

  const hasBackups = includesAny(signals.combined, ["backup", "snapshot"]);
  const hasRestore = includesAny(signals.combined, ["restore", "point-in-time restore"]);
  const noBackups = includesAny(signals.combined, ["no backups", "without backups"]);
  push(findings, "backup_restore_plan_for_stateful_data", {
    outcome: !signals.hasStatefulData ? "na" : noBackups ? "fail" : hasBackups && hasRestore ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no backups", "without backups", "backup", "restore", "snapshot", "database", "storage account"]),
  });

  const dbHa = includesAny(signals.combined, ["zone redundant", "high availability", "geo-redundant", "active geo-replication"]);
  const singleZoneDb = includesAny(signals.combined, ["single zone database", "single zone sql", "single zone"]);
  push(findings, "zone_redundant_database", {
    outcome: !signals.hasRelationalDb || !(signals.production || signals.claimsHaOrDr) ? "na" : singleZoneDb ? "fail" : dbHa ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["single zone database", "zone redundant", "geo-redundant", "active geo-replication", "sql database"]),
  });

  const centralizedLogs = includesAny(signals.combined, ["azure monitor", "log analytics", "centralized logs"]);
  const noCentralLogs = includesAny(signals.combined, ["logs only on vm", "no centralized logs", "logs stay local"]);
  push(findings, "centralized_application_logging", {
    outcome: !hasCompute && !hasInternetEntry ? "na" : noCentralLogs ? "fail" : centralizedLogs ? "pass" : signals.production ? "partial" : "na",
    evidenceSeen: ruleEvidence(bundle, ["logs only on vm", "no centralized logs", "azure monitor", "log analytics", "centralized logs"]),
  });

  const hasAlarming = includesAny(signals.combined, ["alert", "alerts", "alarm"]);
  const hasNotificationPath = includesAny(signals.combined, ["email", "sms", "teams", "on-call", "pagerduty", "ticket"]);
  const noAlerting = includesAny(signals.combined, ["no alerts", "no alerting"]);
  push(findings, "monitor_alerts_for_key_metrics", {
    outcome: !(signals.production || hasInternetEntry || signals.claimsHaOrDr) ? "na" : noAlerting ? "fail" : hasAlarming && hasNotificationPath ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["no alerts", "no alerting", "alerts", "azure monitor", "pagerduty", "teams", "ticket"]),
  });

  const hasFlowLogs = includesAny(signals.combined, ["flow logs", "network watcher"]);
  const explicitNoNetworkLogging = includesAny(signals.combined, ["no flow logs", "no network logging"]);
  push(findings, "network_watcher_flow_logs_enabled", {
    outcome: !hasNetworkWorkload ? "na" : hasFlowLogs ? "pass" : explicitNoNetworkLogging && (signals.sensitiveData || hasInternetEntry) ? "fail" : "na",
    evidenceSeen: ruleEvidence(bundle, ["flow logs", "network watcher", "no flow logs", "no network logging"]),
  });

  const hasVersioning = includesAny(signals.combined, ["versioning", "blob versioning"]);
  push(findings, "blob_versioning_enabled", {
    outcome: !signals.hasObjectStorage ? "na" : hasVersioning ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["blob versioning", "versioning", "blob", "storage account"]),
  });

  const hasLifecycle = includesAny(signals.combined, ["lifecycle", "retention policy", "tiering"]);
  push(findings, "blob_lifecycle_management_configured", {
    outcome: !signals.hasObjectStorage ? "na" : hasLifecycle ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["lifecycle", "retention policy", "tiering", "blob", "storage account"]),
  });

  const productionIsolation = includesAny(signals.combined, ["separate subscription", "separate resource group", "separate prod", "prod subscription"]);
  push(findings, "production_environment_isolated", {
    outcome: !(signals.production && signals.nonProdContext) ? "na" : sharedProdNonProd ? "fail" : productionIsolation ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["shared resource group", "shared subscription", "separate subscription", "separate resource group", "prod subscription"]),
  });

  const hasIac = includesAny(signals.combined, ["terraform", "bicep", "arm template", "infrastructure as code", "iac"]);
  const manualConsole = includesAny(signals.combined, ["manual portal", "created in portal", "manually created", "updated in portal"]);
  push(findings, "infrastructure_as_code_indicated", {
    outcome: !signals.production ? "na" : manualConsole ? "fail" : hasIac ? "pass" : "partial",
    evidenceSeen: ruleEvidence(bundle, ["manual portal", "created in portal", "terraform", "bicep", "arm template", "iac"]),
  });

  return findings;
}
