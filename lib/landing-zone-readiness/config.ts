import type {
  QuoteTier,
  ReadinessCategory,
} from "@/lib/landing-zone-readiness/types";

export const LANDING_ZONE_BLOCKED_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "msn.com",
  "yandex.com",
] as const;

export const READINESS_CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  identity_access: "Identity and access",
  org_structure: "Organization and tenancy",
  network_foundation: "Network foundation",
  security_baseline: "Security baseline",
  logging_monitoring: "Logging and monitoring",
  backup_dr: "Backup and disaster recovery",
  iac_delivery: "IaC and delivery controls",
  cost_governance: "Cost governance",
  environment_separation: "Environment separation",
  operations_readiness: "Operations readiness",
};

export const READINESS_CATEGORY_WEIGHTS: Record<ReadinessCategory, number> = {
  identity_access: 15,
  org_structure: 10,
  network_foundation: 15,
  security_baseline: 15,
  logging_monitoring: 10,
  backup_dr: 10,
  iac_delivery: 10,
  cost_governance: 7,
  environment_separation: 5,
  operations_readiness: 3,
};

export type QuotePricingConfig = {
  tiers: Record<
    QuoteTier,
    {
      minimumDaysLow: number;
      minimumDaysHigh: number;
    }
  >;
  labor: {
    dayRateUsd: number;
    multiCloudDaysLow: number;
    multiCloudDaysHigh: number;
    sensitiveDataDaysLow: number;
    sensitiveDataDaysHigh: number;
    missingCoreControlDaysLow: number;
    missingCoreControlDaysHigh: number;
  };
  customScopeThresholds: {
    minimumScore: number;
    minimumHighSeverityFindings: number;
    minimumCoreControlsMissing: number;
  };
};

export const DEFAULT_QUOTE_PRICING_CONFIG: QuotePricingConfig = {
  tiers: {
    "Advisory Review": { minimumDaysLow: 1, minimumDaysHigh: 2 },
    "Foundation Fix Sprint": { minimumDaysLow: 3, minimumDaysHigh: 5.5 },
    "Landing Zone Hardening": { minimumDaysLow: 6, minimumDaysHigh: 10 },
    "Custom Scope Required": { minimumDaysLow: 10, minimumDaysHigh: 16 },
  },
  labor: {
    dayRateUsd: 1800,
    multiCloudDaysLow: 0.5,
    multiCloudDaysHigh: 1.5,
    sensitiveDataDaysLow: 0.5,
    sensitiveDataDaysHigh: 1.5,
    missingCoreControlDaysLow: 0.25,
    missingCoreControlDaysHigh: 0.5,
  },
  customScopeThresholds: {
    minimumScore: 40,
    minimumHighSeverityFindings: 6,
    minimumCoreControlsMissing: 4,
  },
};

export const CONSULTATION_CTA_PATH = "/services#service-request";
