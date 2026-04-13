const CONTENT_MISMATCH_PATTERNS = [
  /expected page marker missing from response body/i,
  /waiting for getbytext\(/i,
];

const OPERATOR_ACCESS_PATTERNS = [
  /no database url found/i,
  /missing \.env\.audit\.local/i,
  /rerun `npm run journey:setup:production`/i,
  /browser-customer-journey-upkeep\.yml/i,
  /cron secret is not configured/i,
  /operator secret/i,
];

function formatStepText(step) {
  return [
    step?.detail,
    step?.error,
    step?.expectedMarker,
    step?.summary,
    step?.message,
  ]
    .filter(Boolean)
    .join(" ");
}

export function collectFailingSteps(summary = {}) {
  return (summary.steps ?? [])
    .filter((step) => step.status === "fail" || step.status === "blocked")
    .map((step) => ({
      id: step.id,
      label: step.label,
      status: step.status,
      detail: step.detail ?? null,
      error: step.error ?? null,
      url: step.url ?? null,
      statusCode: step.statusCode ?? null,
    }));
}

export function classifyAuditSummary(summary = {}) {
  const failingSteps = collectFailingSteps(summary);

  if (failingSteps.length === 0) {
    return {
      kind: "healthy",
      label: "healthy",
      detail: "All recorded public-contract checks passed.",
    };
  }

  const failingTexts = failingSteps.map((step) => formatStepText(step));
  const allContentMismatch = failingSteps.every((step, index) => {
    const text = failingTexts[index];
    const is200ContentMismatch =
      step.statusCode === 200 &&
      CONTENT_MISMATCH_PATTERNS.some((pattern) => pattern.test(text));
    const isJourneyMarkerTimeout =
      step.status === "fail" &&
      typeof step.error === "string" &&
      CONTENT_MISMATCH_PATTERNS.some((pattern) => pattern.test(step.error));

    return is200ContentMismatch || isJourneyMarkerTimeout;
  });

  if (allContentMismatch) {
    return {
      kind: "undeployed content mismatch",
      label: "undeployed content mismatch",
      detail: "Live production returned an older page body than the current repo contract expects.",
    };
  }

  const hasOperatorAccessFailure = failingTexts.some((text) =>
    OPERATOR_ACCESS_PATTERNS.some((pattern) => pattern.test(text)),
  );

  if (hasOperatorAccessFailure) {
    return {
      kind: "missing operator secret/provider access",
      label: "missing operator secret/provider access",
      detail: "The audit could not complete because a required operator secret, local credential, or provider access path is missing.",
    };
  }

  return {
    kind: "true regression",
    label: "true regression",
    detail: "At least one routed, canonical, auth, or runtime contract failed beyond simple deployment drift.",
  };
}

function resolveAuditEnvironment(summary = {}, env = process.env) {
  if (env.AUDIT_RESULTS_ENVIRONMENT?.trim()) {
    return env.AUDIT_RESULTS_ENVIRONMENT.trim();
  }

  const marketingHost = summary.baseUrls?.marketing
    ? new URL(summary.baseUrls.marketing).host
    : "";

  return marketingHost === "www.zokorp.com" ? "production" : "preview";
}

function resolveRunUrl(env = process.env) {
  if (env.AUDIT_RESULTS_RUN_URL?.trim()) {
    return env.AUDIT_RESULTS_RUN_URL.trim();
  }

  if (env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID) {
    return `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;
  }

  return null;
}

export function buildAuditIngestPayload(summary, source, env = process.env) {
  const classification = summary.classification ?? classifyAuditSummary(summary);

  return {
    source,
    environment: resolveAuditEnvironment(summary, env),
    checkedAt: summary.checkedAt,
    outcome: summary.outcome,
    classification,
    totals: summary.totals,
    baseUrls: summary.baseUrls,
    failingSteps: collectFailingSteps(summary).slice(0, 8),
    runUrl: resolveRunUrl(env),
  };
}

export async function postAuditSummaryIfConfigured(summary, source, env = process.env) {
  const ingestUrl =
    env.AUDIT_RESULTS_INGEST_URL?.trim() ||
    env.PUBLIC_CONTRACT_AUDIT_INGEST_URL?.trim() ||
    "";

  if (!ingestUrl) {
    return null;
  }

  const secret =
    env.AUDIT_RESULTS_INGEST_SECRET?.trim() ||
    env.PUBLIC_CONTRACT_AUDIT_INGEST_SECRET?.trim() ||
    env.CRON_SECRET?.trim() ||
    "";

  if (!secret) {
    return {
      ok: false,
      error: "Missing ingest secret",
      url: ingestUrl,
    };
  }

  const payload = buildAuditIngestPayload(summary, source, env);

  try {
    const response = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        url: ingestUrl,
        status: response.status,
        error: await response.text(),
      };
    }

    return {
      ok: true,
      url: ingestUrl,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      url: ingestUrl,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
