import { z } from "zod";

import {
  createInternalAuditLog,
  jsonNoStore,
  methodNotAllowedJson,
  safeSecretEqual,
} from "@/lib/internal-route";

export const runtime = "nodejs";

const classificationSchema = z.object({
  kind: z.enum([
    "healthy",
    "undeployed content mismatch",
    "true regression",
    "missing operator secret/provider access",
  ]),
  label: z.string().trim().min(1).max(120),
  detail: z.string().trim().min(1).max(600),
});

const payloadSchema = z.object({
  source: z.enum(["production_smoke_check", "browser_customer_journey_audit"]),
  environment: z.string().trim().min(1).max(40),
  checkedAt: z.string().trim().min(1).max(80),
  outcome: z.enum(["pass", "fail", "blocked"]),
  classification: classificationSchema,
  totals: z.object({
    pass: z.number().int().min(0),
    fail: z.number().int().min(0),
    skipped: z.number().int().min(0).optional(),
    blocked: z.number().int().min(0).optional(),
  }),
  baseUrls: z.object({
    apex: z.string().trim().url().nullable().optional(),
    marketing: z.string().trim().url().optional(),
    app: z.string().trim().url().optional(),
  }),
  failingSteps: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(160),
        label: z.string().trim().min(1).max(200),
        status: z.enum(["fail", "blocked"]),
        detail: z.string().trim().max(600).nullable().optional(),
        error: z.string().trim().max(1000).nullable().optional(),
        url: z.string().trim().url().nullable().optional(),
        statusCode: z.number().int().nullable().optional(),
      }),
    )
    .max(8)
    .default([]),
  runUrl: z.string().trim().url().nullable().optional(),
});

function providedSecret(request: Request) {
  return (
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  );
}

function auditActionForSource(source: z.infer<typeof payloadSchema>["source"]) {
  return source === "production_smoke_check"
    ? "internal.production_smoke_audit.run"
    : "internal.browser_customer_journey_audit.run";
}

export async function POST(request: Request) {
  const configuredSecret = process.env.CRON_SECRET ?? "";
  const receivedSecret = providedSecret(request);

  if (!configuredSecret) {
    return jsonNoStore({ error: "Cron secret is not configured." }, { status: 503 });
  }

  if (!receivedSecret || !safeSecretEqual(configuredSecret, receivedSecret)) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonNoStore({ error: "Invalid public-contract audit payload." }, { status: 400 });
  }

  const payload = parsed.data;
  await createInternalAuditLog(auditActionForSource(payload.source), {
    environment: payload.environment,
    checkedAt: payload.checkedAt,
    outcome: payload.outcome,
    classificationKind: payload.classification.kind,
    classificationLabel: payload.classification.label,
    classificationDetail: payload.classification.detail,
    passCount: payload.totals.pass,
    failCount: payload.totals.fail,
    skippedCount: payload.totals.skipped ?? 0,
    blockedCount: payload.totals.blocked ?? 0,
    baseUrls: payload.baseUrls,
    failingStepLabels: payload.failingSteps.map((step) => step.label),
    failingSteps: payload.failingSteps,
    runUrl: payload.runUrl ?? null,
  });

  return jsonNoStore({ ok: true });
}

export async function GET() {
  return methodNotAllowedJson("POST");
}
