import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createInternalAuditLogMock = vi.hoisted(() => vi.fn());
const jsonNoStoreMock = vi.hoisted(() =>
  vi.fn((body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)),
);
const methodNotAllowedJsonMock = vi.hoisted(() =>
  vi.fn(() => new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 })),
);
const safeSecretEqualMock = vi.hoisted(() => vi.fn());
const runZohoServiceRequestSyncMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/internal-route", () => ({
  createInternalAuditLog: createInternalAuditLogMock,
  jsonNoStore: jsonNoStoreMock,
  methodNotAllowedJson: methodNotAllowedJsonMock,
  safeSecretEqual: safeSecretEqualMock,
}));

vi.mock("@/lib/zoho-service-request-sync", () => ({
  runZohoServiceRequestSync: runZohoServiceRequestSyncMock,
}));

import { GET, POST } from "@/app/api/internal/cron/zoho-sync-service-requests/route";

describe("internal zoho service request sync route", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  it("rejects requests with the wrong secret", async () => {
    process.env.CRON_SECRET = "cron-secret";
    safeSecretEqualMock.mockReturnValue(false);

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-service-requests", {
        headers: {
          authorization: "Bearer wrong-secret",
        },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns sync results when the cron secret matches", async () => {
    process.env.CRON_SECRET = "cron-secret";
    safeSecretEqualMock.mockReturnValue(true);
    runZohoServiceRequestSyncMock.mockResolvedValue({
      status: "ok",
      attempted: 4,
      synced: 3,
      failed: 1,
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-service-requests", {
        headers: {
          "x-cron-secret": "cron-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      attempted: 4,
      synced: 3,
      failed: 1,
    });
  });

  it("returns 503 when Zoho CRM is not configured", async () => {
    process.env.CRON_SECRET = "cron-secret";
    safeSecretEqualMock.mockReturnValue(true);
    runZohoServiceRequestSyncMock.mockResolvedValue({
      status: "not_configured",
      error: "Zoho CRM sync is not configured.",
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-service-requests", {
        headers: {
          "x-cron-secret": "cron-secret",
        },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Zoho CRM sync is not configured.",
    });
  });

  it("keeps the route GET-only", async () => {
    const response = await POST(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-service-requests", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(405);
  });
});
