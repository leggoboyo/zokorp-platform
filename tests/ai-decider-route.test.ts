import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  sendToolResultEmail: vi.fn(),
  upsertZohoLead: vi.fn(),
  consumeRateLimit: vi.fn(),
  getRequestFingerprint: vi.fn(),
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
  consumeRateLimit: mocks.consumeRateLimit,
  getRequestFingerprint: mocks.getRequestFingerprint,
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

import { POST } from "@/app/api/submit-ai-decider/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/submit-ai-decider", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
    },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    email: "owner@acmeops.com",
    fullName: "Jordan Rivera",
    companyName: "Acme Ops",
    roleTitle: "COO",
    website: "acmeops.com",
    narrativeInput:
      "Our support team answers the same questions repeatedly across email and Slack. The best answers are spread across SharePoint, old docs, and a few senior reps. We want faster response times and more consistent answers for customers.",
    answers: {
      task_frequency: "daily",
      process_variability: "mostly_standard",
      data_state: "mixed_needs_cleanup",
      impact_window: "major",
      error_tolerance: "human_reviewed",
      systems_count: "three_four",
      knowledge_source: "many_conflicting",
      decision_logic: "rules_plus_judgment",
    },
    ...overrides,
  };
}

describe("submit ai decider route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auditCreate.mockResolvedValue({ id: "audit_123" });
    mocks.sendToolResultEmail.mockResolvedValue({ ok: true, provider: "smtp" });
    mocks.upsertZohoLead.mockResolvedValue({ status: "not_configured", error: "ZOHO_CRM_ACCESS_TOKEN_MISSING" });
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
    mocks.getRequestFingerprint.mockReturnValue("203.0.113.10");
    mocks.requireVerifiedFreeToolAccess.mockResolvedValue({
      user: { id: "user_123", email: "owner@acmeops.com", emailVerified: new Date() },
      email: "owner@acmeops.com",
    });
    mocks.upsertLead.mockResolvedValue({ id: "lead_123" });
    mocks.recordLeadEvent.mockResolvedValue({ id: "event_123" });
    mocks.archiveToolSubmission.mockResolvedValue({ id: "archive_123" });
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please complete the required fields and try again.",
    });
  });

  it("rejects cross-site submissions before any persistence work", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit-ai-decider", {
        method: "POST",
        headers: {
          "content-type": "application/json",
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

  it("rejects unverified or unsigned access before storing or emailing results", async () => {
    const error = Object.assign(new Error("Sign in with your verified business email to run AI Decider."), {
      name: "FreeToolAccessError",
      status: 401,
    });
    mocks.requireVerifiedFreeToolAccess.mockRejectedValueOnce(error);

    const response = await POST(makeRequest(validBody()));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Sign in with your verified business email to run AI Decider.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).not.toHaveBeenCalled();
  });

  it("stores only the lead event by default and skips CRM/archive work without consent", async () => {
    const response = await POST(makeRequest(validBody()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("sent");
    expect(payload.verdictLine).toBeTruthy();
    expect(mocks.upsertLead).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        email: "owner@acmeops.com",
      }),
    );
    expect(mocks.recordLeadEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        aggregate: expect.objectContaining({
          source: "ai-decider",
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

  it("archives and syncs CRM only when explicit follow-up consent is enabled", async () => {
    mocks.upsertZohoLead.mockResolvedValueOnce({
      status: "success",
      recordId: "zoho_123",
      error: null,
    });

    const response = await POST(
      makeRequest(
        validBody({
          saveForFollowUp: true,
          allowCrmFollowUp: true,
        }),
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.upsertZohoLead).toHaveBeenCalledTimes(1);
    expect(mocks.archiveToolSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        userId: "user_123",
        toolName: "ai-decider",
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
