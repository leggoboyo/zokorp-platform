import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { drainArchitectureReviewQueue } from "@/lib/architecture-review/jobs";
import { isSchemaDriftError } from "@/lib/db-errors";

export const runtime = "nodejs";

function safeSecretEqual(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function configuredSecret() {
  return (
    process.env.ARCH_REVIEW_WORKER_SECRET ??
    process.env.CRON_SECRET ??
    process.env.ARCH_REVIEW_FOLLOWUP_SECRET ??
    process.env.ZOHO_SYNC_SECRET ??
    ""
  );
}

function providedSecret(request: Request) {
  return (
    request.headers.get("x-arch-review-worker-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  );
}

function parseLimit(request: Request) {
  const raw = new URL(request.url).searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.max(1, Math.min(50, parsed));
}

async function runWorker(request: Request) {
  const expected = configuredSecret();
  const provided = providedSecret(request);

  if (!expected || !provided || !safeSecretEqual(expected, provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await drainArchitectureReviewQueue({
      limit: parseLimit(request),
    });
    return NextResponse.json({
      status: "ok",
      ...result,
    });
  } catch (error) {
    if (isSchemaDriftError(error)) {
      return NextResponse.json({ error: "Architecture review queue schema is unavailable." }, { status: 503 });
    }

    return NextResponse.json(
      {
        error: "Architecture review worker run failed.",
        details: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return runWorker(request);
}

export async function GET(request: Request) {
  return runWorker(request);
}
