import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

const {
  auditCreateMock,
  consumeEmailVerificationTokenMock,
  getSiteOriginFromRequestMock,
} = vi.hoisted(() => ({
  auditCreateMock: vi.fn(),
  consumeEmailVerificationTokenMock: vi.fn(),
  getSiteOriginFromRequestMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: auditCreateMock,
    },
  },
}));

vi.mock("@/lib/email-verification", () => ({
  consumeEmailVerificationToken: consumeEmailVerificationTokenMock,
}));

vi.mock("@/lib/site-origin", () => ({
  getSiteOriginFromRequest: getSiteOriginFromRequestMock,
}));

import { GET } from "@/app/api/auth/verify-email/confirm/route";

describe("verify-email confirm route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSiteOriginFromRequestMock.mockReturnValue("https://app.zokorp.com");
    auditCreateMock.mockResolvedValue({});
  });

  it("redirects to invalid when the token is missing", async () => {
    const response = await GET(new Request("https://app.zokorp.com/api/auth/verify-email/confirm"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.zokorp.com/register/verify-email?status=invalid",
    );
    expect(consumeEmailVerificationTokenMock).not.toHaveBeenCalled();
  });

  it("redirects verified users to login after a successful confirmation", async () => {
    consumeEmailVerificationTokenMock.mockResolvedValue({
      status: "verified",
      userId: "user_123",
      email: "consulting+atlas1@zokorp.com",
      role: Role.USER,
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/auth/verify-email/confirm?token=valid-token"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.zokorp.com/login?verified=1");
    expect(auditCreateMock).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        action: "auth.email_verified",
        metadataJson: {
          email: "consulting+atlas1@zokorp.com",
          role: Role.USER,
        },
      },
    });
  });

  it("still redirects to login when audit logging fails after verification", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consumeEmailVerificationTokenMock.mockResolvedValue({
      status: "verified",
      userId: "user_123",
      email: "consulting+atlas1@zokorp.com",
      role: Role.USER,
    });
    auditCreateMock.mockRejectedValueOnce(new Error("audit unavailable"));

    const response = await GET(
      new Request("https://app.zokorp.com/api/auth/verify-email/confirm?token=valid-token"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.zokorp.com/login?verified=1");
    expect(auditCreateMock).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("redirects expired tokens back to the resend screen with the email prefilled", async () => {
    consumeEmailVerificationTokenMock.mockResolvedValue({
      status: "expired",
      email: "consulting+atlas1@zokorp.com",
    });

    const response = await GET(
      new Request("https://app.zokorp.com/api/auth/verify-email/confirm?token=expired-token"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.zokorp.com/register/verify-email?status=expired&email=consulting%2Batlas1%40zokorp.com",
    );
  });
});
