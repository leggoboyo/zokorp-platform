export function withSingleConnection(url) {
  const trimmed = (url ?? "").trim();
  if (!trimmed) {
    return "";
  }

  const nextUrl = new URL(trimmed);
  if (!nextUrl.searchParams.has("connection_limit")) {
    nextUrl.searchParams.set("connection_limit", "1");
  }
  return nextUrl.toString();
}

export function resolveAuditDatabaseUrl({
  auditEnv = {},
  runtimeEnv = process.env,
  pulledEnv = {},
} = {}) {
  const candidates = [
    auditEnv.PRODUCTION_DIRECT_DATABASE_URL,
    auditEnv.PRODUCTION_DATABASE_URL,
    runtimeEnv.PRODUCTION_DIRECT_DATABASE_URL,
    runtimeEnv.PRODUCTION_DATABASE_URL,
    runtimeEnv.DIRECT_DATABASE_URL,
    runtimeEnv.DATABASE_URL,
    pulledEnv.DIRECT_DATABASE_URL,
    pulledEnv.DATABASE_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return withSingleConnection(trimmed);
    }
  }

  return "";
}

export function diagnoseAuditCredentialFailure({ currentUrl = "", responseFailures = [] } = {}) {
  const credentialFailure = responseFailures.find(
    (item) =>
      item?.status === 401 &&
      typeof item.url === "string" &&
      item.url.includes("/api/auth/callback/credentials"),
  );

  if (credentialFailure) {
    return "Configured JOURNEY_EMAIL/JOURNEY_PASSWORD were rejected by the live app (401 at /api/auth/callback/credentials). Local browser-audit credentials are likely stale; trigger `browser-customer-journey-upkeep.yml` for the normal rotation path or rerun `npm run journey:setup:production` for manual local recovery.";
  }

  if (currentUrl.includes("/login?error=")) {
    return "Configured JOURNEY_EMAIL/JOURNEY_PASSWORD were rejected by the live app during sign-in. Local browser-audit credentials are likely stale; trigger `browser-customer-journey-upkeep.yml` for the normal rotation path or rerun `npm run journey:setup:production` for manual local recovery.";
  }

  return "Configured JOURNEY_EMAIL/JOURNEY_PASSWORD did not establish a local authenticated session.";
}
