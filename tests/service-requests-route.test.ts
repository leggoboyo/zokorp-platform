import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireSameOriginMock,
  consumeRateLimitMock,
  getRequestFingerprintMock,
  requireUserMock,
  createServiceRequestMock,
  auditCreateMock,
  isSchemaDriftErrorMock,
} = vi.hoisted(() => ({
  requireSameOriginMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getRequestFingerprintMock: vi.fn(),
  requireUserMock: vi.fn(),
  createServiceRequestMock: vi.fn(),
  auditCreateMock: vi.fn(),
  isSchemaDriftErrorMock: vi.fn(),
}));

vi.mock("@/lib/request-origin", () => ({
  requireSameOrigin: requireSameOriginMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  getRequestFingerprint: getRequestFingerprintMock,
}));

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/service-requests", () => ({
  createServiceRequest: createServiceRequestMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: auditCreateMock,
    },
  },
}));

vi.mock("@/lib/db-errors", () => ({
  isSchemaDriftError: isSchemaDriftErrorMock,
}));

import { POST } from "@/app/api/services/requests/route";

describe("service requests route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireSameOriginMock.mockReturnValue(null);
    consumeRateLimitMock.mockResolvedValue({ allowed: true });
    getRequestFingerprintMock.mockReturnValue("fingerprint");
    requireUserMock.mockResolvedValue({
      id: "user_123",
      email: "consulting@zokorp.com",
    });
    createServiceRequestMock.mockResolvedValue({
      id: "sr_123",
      trackingCode: "SR-260326-ABCDE",
      status: "OPEN",
      type: "CONSULTATION",
      title: "ATLAS-AUDIT-2026-03-26 service request",
    });
    auditCreateMock.mockRejectedValue(new Error("audit unavailable"));
    isSchemaDriftErrorMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success even when audit logging fails after the request is created", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(
      new Request("https://app.zokorp.com/api/services/requests", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://app.zokorp.com",
        },
        body: JSON.stringify({
          type: "CONSULTATION",
          title: "ATLAS-AUDIT-2026-03-26 service request",
          summary: "Need a production-readiness consultation for an AWS delivery and tooling launch plan.",
          budgetRange: "Undecided",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      id: "sr_123",
      trackingCode: "SR-260326-ABCDE",
      status: "OPEN",
    });
    expect(createServiceRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        type: "CONSULTATION",
      }),
    );
    expect(auditCreateMock).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("marks validation errors as non-cacheable", async () => {
    const response = await POST(
      new Request("https://app.zokorp.com/api/services/requests", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://app.zokorp.com",
        },
        body: JSON.stringify({
          type: "CONSULTATION",
          title: "short",
          summary: "too short",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Invalid service request input.",
    });
  });
});
