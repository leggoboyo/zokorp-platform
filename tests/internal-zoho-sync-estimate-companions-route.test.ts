import { beforeEach, describe, expect, it, vi } from "vitest";

const createInternalAuditLogMock = vi.hoisted(() => vi.fn());
const jsonNoStoreMock = vi.hoisted(() =>
  vi.fn((body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)),
);
const methodNotAllowedJsonMock = vi.hoisted(() =>
  vi.fn(() => new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 })),
);
const safeSecretEqualMock = vi.hoisted(() => vi.fn());
const runEstimateCompanionSyncMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/internal-route", () => ({
  createInternalAuditLog: createInternalAuditLogMock,
  jsonNoStore: jsonNoStoreMock,
  methodNotAllowedJson: methodNotAllowedJsonMock,
  safeSecretEqual: safeSecretEqualMock,
}));

vi.mock("@/lib/estimate-companion-sync", () => ({
  runEstimateCompanionSync: runEstimateCompanionSyncMock,
}));

import { GET, POST } from "@/app/api/internal/cron/zoho-sync-estimate-companions/route";

describe("internal zoho estimate companion sync route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests with the wrong secret", async () => {
    process.env.CRON_SECRET = "cron-secret";
    safeSecretEqualMock.mockReturnValue(false);

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-estimate-companions", {
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
    runEstimateCompanionSyncMock.mockResolvedValue({
      status: "ok",
      scanned: 3,
      updated: 2,
      unchanged: 1,
      failed: 0,
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-estimate-companions", {
        headers: {
          "x-cron-secret": "cron-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      scanned: 3,
      updated: 2,
      unchanged: 1,
      failed: 0,
    });
    expect(createInternalAuditLogMock).toHaveBeenCalledWith("internal.zoho_sync_estimate_companions.run", {
      scanned: 3,
      updated: 2,
      unchanged: 1,
      failed: 0,
    });
  });

  it("records a failed sync signal when the provider path is not configured", async () => {
    process.env.CRON_SECRET = "cron-secret";
    safeSecretEqualMock.mockReturnValue(true);
    runEstimateCompanionSyncMock.mockResolvedValue({
      status: "not_configured",
      error: "ZOHO_INVOICE_NOT_CONFIGURED",
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-estimate-companions", {
        headers: {
          "x-cron-secret": "cron-secret",
        },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "ZOHO_INVOICE_NOT_CONFIGURED",
    });
    expect(createInternalAuditLogMock).toHaveBeenCalledWith("internal.zoho_sync_estimate_companions.failed", {
      status: "not_configured",
      error: "ZOHO_INVOICE_NOT_CONFIGURED",
    });
  });

  it("keeps the route GET-only", async () => {
    const response = await POST(
      new Request("https://app.zokorp.com/api/internal/cron/zoho-sync-estimate-companions", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(405);
  });
});
