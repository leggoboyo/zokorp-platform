import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createArchitectureRemediationCheckoutSessionMock,
  requireVerifiedFreeToolAccessMock,
  requireSameOriginMock,
  getSiteOriginFromRequestMock,
} = vi.hoisted(() => ({
  createArchitectureRemediationCheckoutSessionMock: vi.fn(),
  requireVerifiedFreeToolAccessMock: vi.fn(),
  requireSameOriginMock: vi.fn(),
  getSiteOriginFromRequestMock: vi.fn(),
}));

vi.mock("@/lib/architecture-review/checkout", () => ({
  createArchitectureRemediationCheckoutSession: createArchitectureRemediationCheckoutSessionMock,
}));

vi.mock("@/lib/free-tool-access", () => ({
  requireVerifiedFreeToolAccess: requireVerifiedFreeToolAccessMock,
}));

vi.mock("@/lib/request-origin", () => ({
  requireSameOrigin: requireSameOriginMock,
}));

vi.mock("@/lib/site-origin", () => ({
  getSiteOriginFromRequest: getSiteOriginFromRequestMock,
}));

vi.mock("@/lib/stripe-customer", () => ({
  StripeCustomerBindingError: class StripeCustomerBindingError extends Error {
    status: number;

    constructor(message: string, status = 409) {
      super(message);
      this.status = status;
    }
  },
}));

import { GET, POST } from "@/app/api/architecture-review/create-checkout-session/route";

describe("architecture remediation checkout session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSameOriginMock.mockReturnValue(null);
    getSiteOriginFromRequestMock.mockReturnValue("https://app.zokorp.com");
    requireVerifiedFreeToolAccessMock.mockResolvedValue({
      user: { id: "user_123" },
      email: "owner@acmecloud.com",
    });
    createArchitectureRemediationCheckoutSessionMock.mockResolvedValue({
      session: {
        url: "https://checkout.stripe.com/c/pay_arch_123",
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects GET requests", async () => {
    const response = GET();

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({ error: "Method not allowed" });
  });

  it("creates a checkout session for a payable remediation quote", async () => {
    const response = await POST(
      new Request("https://app.zokorp.com/api/architecture-review/create-checkout-session", {
        method: "POST",
        headers: {
          origin: "https://app.zokorp.com",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jobId: "ck1234567890123456789012",
          estimateReferenceCode: "ARCH-12345",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.com/c/pay_arch_123",
    });
    expect(createArchitectureRemediationCheckoutSessionMock).toHaveBeenCalledWith({
      userId: "user_123",
      requestOrigin: "https://app.zokorp.com",
      jobId: "ck1234567890123456789012",
      estimateReferenceCode: "ARCH-12345",
    });
  });

  it("returns 404 when the remediation quote is not payable", async () => {
    createArchitectureRemediationCheckoutSessionMock.mockRejectedValueOnce(new Error("CHECKOUT_NOT_PAYABLE"));

    const response = await POST(
      new Request("https://app.zokorp.com/api/architecture-review/create-checkout-session", {
        method: "POST",
        headers: {
          origin: "https://app.zokorp.com",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jobId: "ck1234567890123456789012",
          estimateReferenceCode: "ARCH-12345",
        }),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "This remediation quote is not available for checkout.",
    });
  });
});
