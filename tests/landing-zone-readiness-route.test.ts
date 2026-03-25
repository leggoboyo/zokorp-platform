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
  findRecentSubmissionFingerprint: vi.fn(),
  hashSubmissionFingerprint: vi.fn(),
  rememberSubmissionFingerprint: vi.fn(),
  leadEventFindFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: mocks.auditCreate,
    },
    leadEvent: {
      findFirst: mocks.leadEventFindFirst,
    },
  },
}));

vi.mock("@/lib/architecture-review/sender", () => ({
  sendToolResultEmail: mocks.sendToolResultEmail,
}));

vi.mock("@/lib/zoho-crm", () => ({
  upsertZohoLead: mocks.upsertZohoLead,
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
  getRequestFingerprint: mocks.getRequestFingerprint,
}));

vi.mock("@/lib/privacy-leads", async () => {
  const actual = await vi.importActual<typeof import("@/lib/privacy-leads")>("@/lib/privacy-leads");
  return {
    ...actual,
    upsertLead: mocks.upsertLead,
    recordLeadEvent: mocks.recordLeadEvent,
    archiveToolSubmission: mocks.archiveToolSubmission,
    findRecentSubmissionFingerprint: mocks.findRecentSubmissionFingerprint,
    hashSubmissionFingerprint: mocks.hashSubmissionFingerprint,
    rememberSubmissionFingerprint: mocks.rememberSubmissionFingerprint,
  };
});

vi.mock("@/lib/free-tool-access", () => ({
  requireVerifiedFreeToolAccess: mocks.requireVerifiedFreeToolAccess,
  isFreeToolAccessError: (error: unknown) => error instanceof Error && error.name === "FreeToolAccessError",
}));

import { POST } from "@/app/api/submit-landing-zone-readiness/route";
import { landingZoneReadinessAnswersSchema, type LandingZoneReadinessAnswers } from "@/lib/landing-zone-readiness/types";

function makeAnswers(overrides: Partial<LandingZoneReadinessAnswers> = {}) {
  return landingZoneReadinessAnswersSchema.parse({
    email: "owner@acmecloud.com",
    fullName: "Jordan Rivera",
    companyName: "Acme Cloud",
    roleTitle: "CTO",
    website: "acmecloud.com",
    primaryCloud: "aws",
    secondaryCloud: undefined,
    numberOfEnvironments: "3",
    numberOfRegions: "2_3",
    employeeCount: "26_100",
    engineeringTeamSize: "6_20",
    handlesSensitiveData: false,
    hasSso: "yes",
    enforcesMfa: "yes",
    centralizedIdentity: "yes",
    breakGlassProcess: "yes",
    documentedRbac: "yes",
    serviceAccountHygiene: "yes",
    usesOrgHierarchy: "yes",
    separateCloudAccounts: "yes",
    sharedServicesModel: "yes",
    guardrailsPolicy: "yes",
    standardNetworkArchitecture: "yes",
    productionIsolation: "yes",
    ingressEgressControls: "yes",
    privateConnectivity: "yes",
    documentedDnsStrategy: "yes",
    networkCleanup: "yes",
    secretsManagement: "yes",
    keyManagement: "yes",
    baselineSecurityLogging: "yes",
    vulnerabilityScanning: "yes",
    privilegeReviews: "yes",
    patchingOwnership: "yes",
    centralizedLogs: "yes",
    metricsDashboards: "yes",
    alertingCoverage: "yes",
    backupCoverage: "yes",
    restoreTesting: "yes",
    definedRecoveryTargets: "yes",
    crossRegionResilience: "yes",
    drDocumentation: "yes",
    infrastructureAsCode: "yes",
    changesViaCiCd: "yes",
    manualProductionChanges: "blocked",
    codeReviewRequired: "yes",
    driftDetection: "yes",
    taggingStandard: "yes",
    budgetAlerts: "yes",
    resourceOwnership: "yes",
    lifecycleCleanup: "yes",
    nonProdShutdown: "yes",
    clearEnvironmentSeparation: "yes",
    runbooks: "yes",
    onCallOwnership: "yes",
    incidentResponseProcess: "yes",
    biggestChallenge: "",
    ...overrides,
  });
}

function makeRequest(body: string, contentType = "application/json") {
  return new Request("https://app.zokorp.com/api/submit-landing-zone-readiness", {
    method: "POST",
    headers: {
      "content-type": contentType,
      origin: "https://app.zokorp.com",
      "x-forwarded-for": "203.0.113.10",
      "user-agent": "vitest",
    },
    body,
  });
}

describe("submit landing zone readiness route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auditCreate.mockResolvedValue({ id: "audit_123" });
    mocks.sendToolResultEmail.mockResolvedValue({ ok: true, provider: "smtp" });
    mocks.upsertZohoLead.mockResolvedValue({
      status: "not_configured",
      error: "ZOHO_CRM_ACCESS_TOKEN_MISSING",
    });
    mocks.consumeRateLimit.mockImplementation(() => ({
      allowed: true,
      remaining: 7,
      retryAfterSeconds: 3600,
    }));
    mocks.getRequestFingerprint.mockReturnValue("203.0.113.10");
    mocks.requireVerifiedFreeToolAccess.mockResolvedValue({
      user: { id: "user_123", email: "owner@acmecloud.com", emailVerified: new Date() },
      email: "owner@acmecloud.com",
    });
    mocks.upsertLead.mockResolvedValue({ id: "lead_123" });
    mocks.recordLeadEvent.mockResolvedValue({ id: "event_123" });
    mocks.archiveToolSubmission.mockResolvedValue({ id: "archive_123" });
    mocks.findRecentSubmissionFingerprint.mockResolvedValue(null);
    mocks.hashSubmissionFingerprint.mockReturnValue("fingerprint_123");
    mocks.rememberSubmissionFingerprint.mockResolvedValue({ id: "fp_123" });
    mocks.leadEventFindFirst.mockResolvedValue(null);
  });

  it("rejects non-json submissions before any persistence work", async () => {
    const response = await POST(
      makeRequest("email=owner@acmecloud.com", "application/x-www-form-urlencoded"),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: "Submissions must be sent as JSON.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).not.toHaveBeenCalled();
  });

  it("rejects cross-site submissions before any persistence work", async () => {
    const response = await POST(
      new Request("https://app.zokorp.com/api/submit-landing-zone-readiness", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
        },
        body: JSON.stringify(makeAnswers()),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Cross-site requests are not allowed.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.requireVerifiedFreeToolAccess).not.toHaveBeenCalled();
  });

  it("rejects personal email domains on the server", async () => {
    const response = await POST(
      makeRequest(JSON.stringify(makeAnswers({ email: "someone@gmail.com" }))),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Personal email domains are not allowed. Use your business email.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
  });

  it("throttles repeated submissions for the same email", async () => {
    mocks.consumeRateLimit
      .mockReturnValueOnce({
        allowed: true,
        remaining: 7,
        retryAfterSeconds: 3600,
      })
      .mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 3600,
      });

    const response = await POST(makeRequest(JSON.stringify(makeAnswers())));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many submissions were sent for this email. Please wait and try again.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
  });

  it("rejects unverified or unsigned access before any persistence or email send", async () => {
    const error = Object.assign(
      new Error("Sign in with your verified business email to run Landing Zone Readiness Checker."),
      {
        name: "FreeToolAccessError",
        status: 401,
      },
    );
    mocks.requireVerifiedFreeToolAccess.mockRejectedValueOnce(error);

    const response = await POST(makeRequest(JSON.stringify(makeAnswers())));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Sign in with your verified business email to run Landing Zone Readiness Checker.",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).not.toHaveBeenCalled();
  });

  it("stores only lead metadata by default and skips CRM/archive without consent", async () => {
    const response = await POST(makeRequest(JSON.stringify(makeAnswers())));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("sent");
    expect(body.maturityBand).toBe("Strong Foundation");
    expect(mocks.upsertLead).toHaveBeenCalledTimes(1);
    expect(mocks.recordLeadEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        aggregate: expect.objectContaining({
          source: "landing-zone",
          saveForFollowUp: false,
          allowCrmFollowUp: false,
        }),
      }),
    );
    expect(mocks.upsertZohoLead).not.toHaveBeenCalled();
    expect(mocks.archiveToolSubmission).not.toHaveBeenCalled();
    expect(mocks.rememberSubmissionFingerprint).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        toolName: "landing-zone",
        fingerprintHash: "fingerprint_123",
      }),
    );
  });

  it("archives and syncs CRM only when explicit follow-up consent is enabled", async () => {
    mocks.upsertZohoLead.mockResolvedValueOnce({
      status: "success",
      recordId: "zoho_123",
      error: null,
    });

    const response = await POST(
      makeRequest(
        JSON.stringify(
          makeAnswers({
            saveForFollowUp: true,
            allowCrmFollowUp: true,
          }),
        ),
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.upsertZohoLead).toHaveBeenCalledTimes(1);
    expect(mocks.archiveToolSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead_123",
        userId: "user_123",
        toolName: "landing-zone",
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

  it("returns the prior result instead of resending a duplicate recent submission", async () => {
    const duplicateAnswers = makeAnswers({ handlesSensitiveData: true, enforcesMfa: "no" });
    mocks.findRecentSubmissionFingerprint.mockResolvedValue({
      id: "fp_123",
      leadId: "lead_123",
    });
    mocks.leadEventFindFirst.mockResolvedValue({
      deliveryState: "sent",
    });

    const response = await POST(makeRequest(JSON.stringify(duplicateAnswers)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "sent",
      overallScore: 96,
      maturityBand: "Strong Foundation",
      quoteTier: "Foundation Fix Sprint",
    });
    expect(mocks.upsertLead).not.toHaveBeenCalled();
    expect(mocks.sendToolResultEmail).not.toHaveBeenCalled();
  });
});
