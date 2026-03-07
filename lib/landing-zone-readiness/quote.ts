import { DEFAULT_QUOTE_PRICING_CONFIG } from "@/lib/landing-zone-readiness/config";
import { LANDING_ZONE_CORE_CONTROL_RULE_IDS } from "@/lib/landing-zone-readiness/rules";
import type {
  LandingZoneReadinessAnswers,
  LandingZoneReadinessFinding,
  LandingZoneReadinessQuote,
  QuoteConfidence,
  QuoteTier,
  ReadinessCategory,
} from "@/lib/landing-zone-readiness/types";

type QuoteInput = {
  answers: LandingZoneReadinessAnswers;
  overallScore: number;
  findings: LandingZoneReadinessFinding[];
};

type EffortRange = {
  low: number;
  high: number;
};

const FINDING_EFFORT_DAYS: Record<
  ReadinessCategory,
  Record<LandingZoneReadinessFinding["severity"], EffortRange>
> = {
  identity_access: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1 },
    high: { low: 0.75, high: 1.5 },
  },
  org_structure: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1 },
    high: { low: 0.75, high: 1.5 },
  },
  network_foundation: {
    low: { low: 0.25, high: 0.75 },
    medium: { low: 0.75, high: 1.5 },
    high: { low: 1, high: 2.5 },
  },
  security_baseline: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1.25 },
    high: { low: 0.75, high: 2 },
  },
  logging_monitoring: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1 },
    high: { low: 0.75, high: 1.5 },
  },
  backup_dr: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1 },
    high: { low: 0.75, high: 1.5 },
  },
  iac_delivery: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.75, high: 1.5 },
    high: { low: 1, high: 2 },
  },
  cost_governance: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 0.75 },
    high: { low: 0.75, high: 1 },
  },
  environment_separation: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 1 },
    high: { low: 0.75, high: 1.5 },
  },
  operations_readiness: {
    low: { low: 0.25, high: 0.5 },
    medium: { low: 0.5, high: 0.75 },
    high: { low: 0.75, high: 1 },
  },
};

function roundToNearest(value: number, step: number) {
  return Math.round(value / step) * step;
}

function roundToHalfDay(value: number) {
  return Math.max(0.5, Math.round(value * 2) / 2);
}

function formatDayRange(low: number, high: number) {
  if (low === high) {
    return `${low} day${low === 1 ? "" : "s"}`;
  }

  return `${low}-${high} days`;
}

function selectQuoteTier(input: {
  overallScore: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  coreControlsMissing: number;
  findingsCount: number;
  multiCloud: boolean;
  handlesSensitiveData: boolean;
}): QuoteTier {
  const shouldUseCustomScope =
    input.overallScore <= DEFAULT_QUOTE_PRICING_CONFIG.customScopeThresholds.minimumScore &&
    input.highSeverityCount >= DEFAULT_QUOTE_PRICING_CONFIG.customScopeThresholds.minimumHighSeverityFindings &&
    input.coreControlsMissing >= DEFAULT_QUOTE_PRICING_CONFIG.customScopeThresholds.minimumCoreControlsMissing &&
    input.multiCloud &&
    input.handlesSensitiveData;

  if (shouldUseCustomScope) {
    return "Custom Scope Required";
  }

  if (
    input.overallScore >= 90 &&
    input.highSeverityCount === 0 &&
    input.coreControlsMissing === 0 &&
    input.findingsCount <= 3
  ) {
    return "Advisory Review";
  }

  if (
    input.overallScore >= 75 &&
    input.highSeverityCount <= 2 &&
    input.mediumSeverityCount <= 5 &&
    input.coreControlsMissing <= 1 &&
    input.findingsCount <= 6
  ) {
    return "Foundation Fix Sprint";
  }

  return "Landing Zone Hardening";
}

function estimateQuoteConfidence(input: {
  tier: QuoteTier;
  highSeverityCount: number;
  mediumSeverityCount: number;
  coreControlsMissing: number;
  multiCloud: boolean;
  handlesSensitiveData: boolean;
}): QuoteConfidence {
  if (
    input.tier === "Custom Scope Required" ||
    (input.multiCloud && input.handlesSensitiveData && input.highSeverityCount >= 4) ||
    input.coreControlsMissing >= 5
  ) {
    return "low";
  }

  if (
    input.multiCloud ||
    input.handlesSensitiveData ||
    input.highSeverityCount >= 3 ||
    input.mediumSeverityCount >= 5 ||
    input.coreControlsMissing >= 2
  ) {
    return "medium";
  }

  return "high";
}

function estimateEffortDays(input: {
  findings: LandingZoneReadinessFinding[];
  tier: QuoteTier;
  coreControlsMissing: number;
  multiCloud: boolean;
  handlesSensitiveData: boolean;
}) {
  let low = 0;
  let high = 0;

  for (const finding of input.findings) {
    const effort = FINDING_EFFORT_DAYS[finding.category][finding.severity];
    low += effort.low;
    high += effort.high;
  }

  low += input.coreControlsMissing * DEFAULT_QUOTE_PRICING_CONFIG.labor.missingCoreControlDaysLow;
  high += input.coreControlsMissing * DEFAULT_QUOTE_PRICING_CONFIG.labor.missingCoreControlDaysHigh;

  if (input.multiCloud) {
    low += DEFAULT_QUOTE_PRICING_CONFIG.labor.multiCloudDaysLow;
    high += DEFAULT_QUOTE_PRICING_CONFIG.labor.multiCloudDaysHigh;
  }

  if (input.handlesSensitiveData) {
    low += DEFAULT_QUOTE_PRICING_CONFIG.labor.sensitiveDataDaysLow;
    high += DEFAULT_QUOTE_PRICING_CONFIG.labor.sensitiveDataDaysHigh;
  }

  const minimums = DEFAULT_QUOTE_PRICING_CONFIG.tiers[input.tier];
  low = Math.max(low, minimums.minimumDaysLow);
  high = Math.max(high, minimums.minimumDaysHigh);

  return {
    low: roundToHalfDay(low),
    high: roundToHalfDay(Math.max(high, low + 1)),
  };
}

function buildRationaleLines(input: {
  tier: QuoteTier;
  findingsCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  coreControlsMissing: number;
  multiCloud: boolean;
  handlesSensitiveData: boolean;
  estimatedDaysLow: number;
  estimatedDaysHigh: number;
}): string[] {
  const lines = [
    `This estimate maps to about ${formatDayRange(input.estimatedDaysLow, input.estimatedDaysHigh)} of solo consulting effort.`,
  ];

  if (input.coreControlsMissing > 0) {
    lines.push(
      `${input.coreControlsMissing} core control gap${input.coreControlsMissing === 1 ? "" : "s"} and ${input.highSeverityCount} high-severity finding${input.highSeverityCount === 1 ? "" : "s"} drive the scope.`,
    );
  } else if (input.findingsCount > 0) {
    lines.push(
      `${input.highSeverityCount} high-severity and ${input.mediumSeverityCount} medium-severity finding${input.findingsCount === 1 ? "" : "s"} shape the remediation effort.`,
    );
  }

  if (input.multiCloud && input.handlesSensitiveData) {
    lines.push("Multi-cloud scope plus sensitive-data handling adds coordination and control-hardening work.");
  } else if (input.multiCloud) {
    lines.push("Multi-cloud scope adds more standardization and rollout effort than a single-cloud environment.");
  } else if (input.handlesSensitiveData) {
    lines.push("Sensitive-data handling raises the minimum control baseline and verification effort.");
  } else if (input.tier === "Advisory Review") {
    lines.push("The remaining issues fit a targeted advisory pass rather than a longer remediation package.");
  } else if (input.tier === "Foundation Fix Sprint") {
    lines.push("The gaps fit a focused hardening sprint instead of a larger landing-zone rebuild.");
  } else if (input.tier === "Landing Zone Hardening") {
    lines.push("The gaps span multiple foundation layers, so this is better handled as staged hardening work.");
  } else {
    lines.push("The gaps are broad enough that a tighter scope call should happen before locking the final engagement.");
  }

  return lines.slice(0, 3);
}

export function buildLandingZoneQuote(input: QuoteInput): LandingZoneReadinessQuote {
  const highSeverityCount = input.findings.filter((finding) => finding.severity === "high").length;
  const mediumSeverityCount = input.findings.filter((finding) => finding.severity === "medium").length;
  const coreControlsMissing = input.findings.filter((finding) =>
    LANDING_ZONE_CORE_CONTROL_RULE_IDS.has(finding.ruleId),
  ).length;
  const multiCloud = Boolean(input.answers.secondaryCloud);

  const tier = selectQuoteTier({
    overallScore: input.overallScore,
    highSeverityCount,
    mediumSeverityCount,
    coreControlsMissing,
    findingsCount: input.findings.length,
    multiCloud,
    handlesSensitiveData: input.answers.handlesSensitiveData,
  });

  const estimatedDays = estimateEffortDays({
    findings: input.findings,
    tier,
    coreControlsMissing,
    multiCloud,
    handlesSensitiveData: input.answers.handlesSensitiveData,
  });

  const dayRateUsd = DEFAULT_QUOTE_PRICING_CONFIG.labor.dayRateUsd;
  const quoteLow = roundToNearest(estimatedDays.low * dayRateUsd, 500);
  const quoteHigh = roundToNearest(
    Math.max(estimatedDays.high * dayRateUsd, quoteLow + dayRateUsd),
    500,
  );

  return {
    quoteTier: tier,
    quoteLow,
    quoteHigh,
    estimatedDaysLow: estimatedDays.low,
    estimatedDaysHigh: estimatedDays.high,
    confidence: estimateQuoteConfidence({
      tier,
      highSeverityCount,
      mediumSeverityCount,
      coreControlsMissing,
      multiCloud,
      handlesSensitiveData: input.answers.handlesSensitiveData,
    }),
    rationaleLines: buildRationaleLines({
      tier,
      findingsCount: input.findings.length,
      highSeverityCount,
      mediumSeverityCount,
      coreControlsMissing,
      multiCloud,
      handlesSensitiveData: input.answers.handlesSensitiveData,
      estimatedDaysLow: estimatedDays.low,
      estimatedDaysHigh: estimatedDays.high,
    }),
  };
}
