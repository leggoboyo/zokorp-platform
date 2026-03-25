import { describe, expect, it, vi } from "vitest";

import { buildEstimateReferenceCode, hashSubmissionFingerprint } from "@/lib/privacy-leads";

describe("privacy lead helpers", () => {
  it("builds a stable estimate reference code from the tool and email", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-24T14:00:00.000Z"));

    const code = buildEstimateReferenceCode({
      source: "landing-zone",
      email: "Owner@AcmeCloud.com",
    });

    expect(code).toMatch(/^ZK-LZ-20260324-[A-F0-9]{6}$/);
  });

  it("creates the same fingerprint hash for the same logical submission payload", () => {
    const first = hashSubmissionFingerprint({
      toolName: "landing-zone",
      email: "owner@acmecloud.com",
      payload: {
        companyName: "Acme Cloud",
        answers: {
          mfa: "yes",
          sso: "yes",
        },
      },
    });

    const second = hashSubmissionFingerprint({
      toolName: "landing-zone",
      email: "OWNER@ACMECLOUD.COM",
      payload: {
        answers: {
          sso: "yes",
          mfa: "yes",
        },
        companyName: "Acme Cloud",
      },
    });

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});
