import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  sendToolResultEmail: vi.fn(),
  upsertZohoLead: vi.fn(),
  requireVerifiedFreeToolAccess: vi.fn(),
  upsertLead: vi.fn(),
  recordLeadEvent: vi.fn(),
  archiveToolSubmission: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: mocks.auditCreate,
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: () => ({ allowed: true, retryAfterSeconds: 0 }),
  getRequestFingerprint: () => "test-fingerprint",
}));

vi.mock("@/lib/architecture-review/sender", () => ({
  sendToolResultEmail: mocks.sendToolResultEmail,
}));

vi.mock("@/lib/zoho-crm", () => ({
  upsertZohoLead: mocks.upsertZohoLead,
}));

vi.mock("@/lib/privacy-leads", async () => {
  const actual = await vi.importActual<typeof import("@/lib/privacy-leads")>("@/lib/privacy-leads");
  return {
    ...actual,
    upsertLead: mocks.upsertLead,
    recordLeadEvent: mocks.recordLeadEvent,
    archiveToolSubmission: mocks.archiveToolSubmission,
  };
});

vi.mock("@/lib/free-tool-access", () => ({
  requireVerifiedFreeToolAccess: mocks.requireVerifiedFreeToolAccess,
  isFreeToolAccessError: (error: unknown) => error instanceof Error && error.name === "FreeToolAccessError",
}));

import { POST } from "@/app/api/submit-cloud-cost-leak-finder/route";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    email: "owner@acmecloud.com",
    fullName: "Jordan Rivera",
    companyName: "Acme Cloud",
    roleTitle: "CTO",
    website: "acmecloud.com",
    primaryCloud: "aws",
    narrativeInput:
      "We run a SaaS app on AWS with EC2, RDS, and dev, test, and prod environments. The bill keeps rising even though usage is mostly flat, and I think non-prod is running 24/7.",
    billingSummaryInput: "EC2 $4200\nRDS $2100\nS3 $400",
    adaptiveAnswers: {
      monthlySpendBand: "15k_to_50k",
      workloadScope: "a_few_systems",
      ownershipClarity: "partial",
      budgetsAlerts: "partial",
      customerCriticality: "customer_facing",
      nonProdRuntime: "always_on",
      rightsizingCadence: "rare",
      architectureFlexibility: "cleanup_first",
    },
    ...overrides,
  };
}

describe("submit cloud cost leak finder route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auditCreate.mockResolvedValue({});
    mocks.sendToolResultEmail.mockResolvedValue({ ok: true, provider: "smtp" });
    mocks.upsertZohoLead.mockResolvedValue({ status: "not_configured", error: "ZOHO_CRM_ACCESS_TOKEN_MISSING" });
    mocks.requireVerifiedFreeToolAccess.mockResolvedValue({
      user: { id: "user_123", email: "owner@acmecloud.com", emailVerified: new Date() },
      email: "owner@acmecloud.com",
    });
    mocks.upsertLead.mockResolvedValue({ id: "lead_123" });
    mocks.recordLeadEvent.mockResolvedValue({ id: "event_123" });
    mocks.archiveToolSubmission.mockResolvedValue({ id: "archive_123" });
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit-cloud-cost-leak-finder", {
        method: "POST",
        headers: {
          origin: "http://localhost",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please complete the required fields and try again.",
    });
  });

  it("rejects unverified or unsigned access before any result delivery work", async () => {
    const error = Object.assign(new Error("Sign in with your verified business email to run Cloud Cost Leak Finder."), {
      name: "FreeToolAccessError",
      status: 401,
    });
    mocks.requireVerifiedFreeToolAccess.mockReset();
    mocks.requireVerifiedFreeToolAccess.mockImplementationOnce(() => {
      throw error;
    });

    const response = await POST(
      new Request("http://localhost/api/submit-cloud-cost-leak-finder", {
        method: "POST",
        headers: {
          origin: "http://localhost",
        },
        body: JSON.stringify(validBody()),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Sign in with your verified business email to run Cloud Cost Leak Finder.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).not.toHaveBeenCalled();
  });

  it("rejects cross-site submissions before any auth or persistence work", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit-cloud-cost-leak-finder", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
        },
        body: JSON.stringify(validBody()),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Cross-site requests are not allowed.",
    });
    expect(mocks.requireVerifiedFreeToolAccess).not.toHaveBeenCalled();
    expect(mocks.upsertLead).not.toHaveBeenCalled();
  });

  it("stores only lead metadata by default and skips CRM/archive without consent", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit-cloud-cost-leak-finder", {
        method: "POST",
        headers: {
          origin: "http://localhost",
        },
        body: JSON.stringify(validBody()),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("sent");
    expect(payload.verdictHeadline).toBeTruthy();
    expect(mocks.upsertLead).toHaveBeenCalledTimes(1);
    expect(mocks.recordLeadEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        aggregate: expect.objectContaining({
          source: "cloud-cost",
          saveForFollowUp: false,
          allowCrmFollowUp: false,
        }),
      }),
    );
    expect(mocks.upsertZohoLead).not.toHaveBeenCalled();
    expect(mocks.archiveToolSubmission).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).toHaveBeenCalledTimes(1);
    expect(mocks.auditCreate).toHaveBeenCalledTimes(1);
  });

  it("archives and syncs CRM only when the user opts in", async () => {
    mocks.upsertZohoLead.mockResolvedValueOnce({
      status: "success",
      recordId: "zoho_123",
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/submit-cloud-cost-leak-finder", {
        method: "POST",
        headers: {
          origin: "http://localhost",
        },
        body: JSON.stringify(
          validBody({
            saveForFollowUp: true,
            allowCrmFollowUp: true,
          }),
        ),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.upsertZohoLead).toHaveBeenCalledTimes(1);
    expect(mocks.archiveToolSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        userId: "user_123",
        toolName: "cloud-cost",
      }),
    );
    expect(mocks.recordLeadEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregate: expect.objectContaining({
          saveForFollowUp: true,
          allowCrmFollowUp: true,
          crmSyncState: "synced",
        }),
      }),
    );
  });
});
