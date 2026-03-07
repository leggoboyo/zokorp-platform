import { describe, expect, it } from "vitest";

import { resolveAuthRedirectUrl, sanitizeAuthCallbackUrl } from "@/lib/auth-callback-url";

describe("sanitizeAuthCallbackUrl", () => {
  it("uses the default path when callback is missing or invalid", () => {
    expect(sanitizeAuthCallbackUrl(undefined)).toBe("/account");
    expect(sanitizeAuthCallbackUrl("https://evil.example/path")).toBe("/account");
    expect(sanitizeAuthCallbackUrl("javascript:alert(1)")).toBe("/account");
    expect(sanitizeAuthCallbackUrl("//evil.example/path")).toBe("/account");
    expect(sanitizeAuthCallbackUrl("/%2F%2Fevil.example/path")).toBe("/account");
    expect(sanitizeAuthCallbackUrl("/\\evil.example/path")).toBe("/account");
  });

  it("keeps safe in-app relative paths", () => {
    expect(sanitizeAuthCallbackUrl("/account/billing")).toBe("/account/billing");
    expect(sanitizeAuthCallbackUrl("/software/zokorp-validator?tab=overview#pricing")).toBe(
      "/software/zokorp-validator?tab=overview#pricing",
    );
  });
});

describe("resolveAuthRedirectUrl", () => {
  const baseUrl = "https://app.zokorp.com";

  it("returns same-origin redirects and blocks cross-origin redirects", () => {
    expect(resolveAuthRedirectUrl("/account", baseUrl)).toBe("https://app.zokorp.com/account");
    expect(resolveAuthRedirectUrl("https://app.zokorp.com/services?view=active", baseUrl)).toBe(
      "https://app.zokorp.com/services?view=active",
    );
    expect(resolveAuthRedirectUrl("https://evil.example/phish", baseUrl)).toBe("https://app.zokorp.com/account");
    expect(resolveAuthRedirectUrl("//evil.example/phish", baseUrl)).toBe("https://app.zokorp.com/account");
  });
});
