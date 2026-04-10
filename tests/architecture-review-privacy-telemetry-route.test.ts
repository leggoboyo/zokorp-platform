import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireSameOriginMock,
  requireVerifiedFreeToolAccessMock,
  consumeRateLimitMock,
} = vi.hoisted(() => ({
  requireSameOriginMock: vi.fn(),
  requireVerifiedFreeToolAccessMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
}));

vi.mock("@/lib/request-origin", () => ({
  requireSameOrigin: requireSameOriginMock,
}));

vi.mock("@/lib/free-tool-access", () => ({
  requireVerifiedFreeToolAccess: requireVerifiedFreeToolAccessMock,
  isFreeToolAccessError: () => false,
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  getRequestFingerprint: () => "203.0.113.20",
}));

import { POST } from "@/app/api/architecture-review/privacy-telemetry/route";

describe("architecture review privacy telemetry route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSameOriginMock.mockReturnValue(null);
    requireVerifiedFreeToolAccessMock.mockResolvedValue({
      user: { id: "user_123", name: "Owner" },
      email: "owner@acmecloud.com",
    });
  });

  it("blocks second free-tier privacy runs from the same business domain within 24 hours", async () => {
    consumeRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 86_400,
    });

    const response = await POST(
      new Request("https://app.zokorp.com/api/architecture-review/privacy-telemetry", {
        method: "POST",
        headers: {
          origin: "https://app.zokorp.com",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          provider: "multi",
          additionalProviders: ["aws", "azure"],
          additionalPlatforms: ["snowflake"],
          submissionFingerprintHash: "hash_123",
          scoreBand: "60-79",
          emailDeliveryRequested: false,
        }),
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: "This business domain has already used its free architecture review for the current 24-hour window.",
    });
    expect(consumeRateLimitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "arch-review-domain:acmecloud.com",
        limit: 1,
      }),
    );
  });
});
