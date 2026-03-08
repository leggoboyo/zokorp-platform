import { afterEach, describe, expect, it } from "vitest";

import { getAuthSecret } from "@/lib/auth-secret";

const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;
const originalAuthSecret = process.env.AUTH_SECRET;
const originalArchReviewEmlSecret = process.env.ARCH_REVIEW_EML_SECRET;

describe("getAuthSecret", () => {
  afterEach(() => {
    if (originalNextAuthSecret === undefined) {
      delete process.env.NEXTAUTH_SECRET;
    } else {
      process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
    }

    if (originalAuthSecret === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = originalAuthSecret;
    }

    if (originalArchReviewEmlSecret === undefined) {
      delete process.env.ARCH_REVIEW_EML_SECRET;
    } else {
      process.env.ARCH_REVIEW_EML_SECRET = originalArchReviewEmlSecret;
    }
  });

  it("prefers NEXTAUTH_SECRET over AUTH_SECRET", () => {
    process.env.NEXTAUTH_SECRET = "nextauth-secret";
    process.env.AUTH_SECRET = "auth-secret";
    process.env.ARCH_REVIEW_EML_SECRET = "eml-secret";

    expect(getAuthSecret()).toBe("nextauth-secret");
  });

  it("falls back to AUTH_SECRET when NEXTAUTH_SECRET is absent", () => {
    delete process.env.NEXTAUTH_SECRET;
    process.env.AUTH_SECRET = "auth-secret";
    process.env.ARCH_REVIEW_EML_SECRET = "eml-secret";

    expect(getAuthSecret()).toBe("auth-secret");
  });

  it("does not reuse ARCH_REVIEW_EML_SECRET as an auth secret", () => {
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.AUTH_SECRET;
    process.env.ARCH_REVIEW_EML_SECRET = "eml-secret";

    expect(getAuthSecret()).toBeUndefined();
  });
});
