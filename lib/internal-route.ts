import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

export function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export function methodNotAllowedJson(allow = "POST") {
  const headers = new Headers({
    Allow: allow,
  });
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(
    {
      error: "Method not allowed",
    },
    {
      status: 405,
      headers,
    },
  );
}

export function safeSecretEqual(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function createInternalAuditLog(
  action: string,
  metadataJson: Prisma.JsonObject | null = null,
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        ...(metadataJson === null ? {} : { metadataJson }),
      },
    });
  } catch (error) {
    console.error("Failed to write internal audit log", action, error);
  }
}
