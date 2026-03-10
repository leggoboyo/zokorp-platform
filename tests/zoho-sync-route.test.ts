import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  auditCreateMock,
  ensureLeadLogSchemaReadyMock,
  fetchWithTimeoutMock,
  leadFindManyMock,
  leadUpdateMock,
  MockFetchTimeoutError,
} = vi.hoisted(() => ({
  auditCreateMock: vi.fn(),
  ensureLeadLogSchemaReadyMock: vi.fn(),
  fetchWithTimeoutMock: vi.fn(),
  leadFindManyMock: vi.fn(),
  leadUpdateMock: vi.fn(),
  MockFetchTimeoutError: class extends Error {},
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: auditCreateMock,
    },
    leadLog: {
      findMany: leadFindManyMock,
      update: leadUpdateMock,
    },
  },
}));

vi.mock("@/lib/db-errors", () => ({
  isSchemaDriftError: () => false,
}));

vi.mock("@/lib/http", () => ({
  FetchTimeoutError: MockFetchTimeoutError,
  fetchWithTimeout: fetchWithTimeoutMock,
}));

vi.mock("@/lib/lead-log-schema", () => ({
  ensureLeadLogSchemaReady: ensureLeadLogSchemaReadyMock,
}));

import { GET, POST } from "@/app/api/zoho/sync-leads/route";

describe("zoho sync route", () => {
  const originalSyncSecret = process.env.ZOHO_SYNC_SECRET;
  const originalAccessToken = process.env.ZOHO_CRM_ACCESS_TOKEN;
  const originalApiDomain = process.env.ZOHO_CRM_API_DOMAIN;
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    auditCreateMock.mockResolvedValue({});
    ensureLeadLogSchemaReadyMock.mockResolvedValue(true);
    leadFindManyMock.mockResolvedValue([
      {
        id: "lead_123",
        userEmail: "owner@acmecloud.com",
        userName: "Jordan Rivera",
        architectureProvider: "aws",
        overallScore: 82,
        analysisConfidence: 0.91,
        quoteTier: "core",
        emailDeliveryMode: "smtp",
        leadStage: "New Review",
        leadScore: 80,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: null,
        referrer: null,
        ctaClicks: 0,
        topIssues: "IAM",
        authProvider: "credentials",
        workdriveUploadStatus: "archived",
        createdAt: new Date("2026-03-01T12:00:00.000Z"),
      },
    ]);
    leadUpdateMock.mockResolvedValue({});
    fetchWithTimeoutMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              status: "success",
              code: "SUCCESS",
              details: {
                id: "zoho_123",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    process.env.ZOHO_SYNC_SECRET = "zoho-secret";
    process.env.ZOHO_CRM_ACCESS_TOKEN = "zoho-access-token";
    process.env.ZOHO_CRM_API_DOMAIN = "https://www.zohoapis.com";
  });

  afterEach(() => {
    if (originalSyncSecret === undefined) {
      delete process.env.ZOHO_SYNC_SECRET;
    } else {
      process.env.ZOHO_SYNC_SECRET = originalSyncSecret;
    }

    if (originalAccessToken === undefined) {
      delete process.env.ZOHO_CRM_ACCESS_TOKEN;
    } else {
      process.env.ZOHO_CRM_ACCESS_TOKEN = originalAccessToken;
    }

    if (originalApiDomain === undefined) {
      delete process.env.ZOHO_CRM_API_DOMAIN;
    } else {
      process.env.ZOHO_CRM_API_DOMAIN = originalApiDomain;
    }
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns 503 when the sync secret is not configured", async () => {
    delete process.env.ZOHO_SYNC_SECRET;

    const response = await POST(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Zoho sync secret is not configured.",
    });
  });

  it("returns unauthorized without a valid secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects GET requests and requires POST", async () => {
    const response = await GET(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Method not allowed" });
  });

  it("returns 503 when the lead log schema is unavailable", async () => {
    ensureLeadLogSchemaReadyMock.mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "POST",
        headers: {
          "x-zoho-sync-secret": "zoho-secret",
        },
      }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Zoho sync is unavailable.",
    });
    expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
  });

  it("does not expose raw upstream errors before a response exists", async () => {
    fetchWithTimeoutMock.mockRejectedValueOnce(new Error("socket hang up: token expired"));

    const response = await POST(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "POST",
        headers: {
          "x-zoho-sync-secret": "zoho-secret",
        },
      }),
    );

    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Zoho sync request failed.",
    });
  });

  it("returns the job summary when the sync succeeds", async () => {
    const response = await POST(
      new Request("http://localhost/api/zoho/sync-leads", {
        method: "POST",
        headers: {
          "x-zoho-sync-secret": "zoho-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      synced: 1,
      skipped: 0,
      failed: 0,
    });
    expect(leadUpdateMock).toHaveBeenCalledTimes(1);
  });
});
