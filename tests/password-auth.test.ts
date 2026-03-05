import { describe, expect, it } from "vitest";

import { hashOpaqueToken, hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/password-auth";

describe("password auth helpers", () => {
  it("validates strong password requirements", () => {
    expect(validatePasswordStrength("weak").success).toBe(false);
    expect(validatePasswordStrength("StrongEnough#123").success).toBe(true);
  });

  it("hashes and verifies passwords", async () => {
    const password = "SecurePass#2026";
    const hash = await hashPassword(password);

    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("WrongPass#2026", hash)).toBe(false);
  });

  it("hashes opaque tokens deterministically", () => {
    expect(hashOpaqueToken("abc")).toBe(hashOpaqueToken("abc"));
    expect(hashOpaqueToken("abc")).not.toBe(hashOpaqueToken("abcd"));
  });
});
