import { beforeEach, describe, expect, it, vi } from "vitest";

const { buildArchitectureReviewCtaLinksMock } = vi.hoisted(() => ({
  buildArchitectureReviewCtaLinksMock: vi.fn(),
}));

vi.mock("@/lib/architecture-review/cta-links", () => ({
  buildArchitectureReviewCtaLinks: buildArchitectureReviewCtaLinksMock,
}));

import { buildArchitectureFollowUpEmail } from "@/lib/architecture-review/followup";

describe("architecture review follow-up email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildArchitectureReviewCtaLinksMock.mockResolvedValue({
      bookArchitectureCallUrl: "https://book.zokorp.com/architecture",
      requestRemediationPlanUrl: "https://app.zokorp.com/request-remediation-plan",
    });
  });

  it("renders preference controls when links are provided", async () => {
    const email = await buildArchitectureFollowUpEmail({
      leadId: "lead_123",
      userEmail: "owner@acmecloud.com",
      provider: "aws",
      overallScore: 78,
      topIssues: "aws:iam_roles_and_temporary_credentials:3",
      day: 2,
      emailPreferenceLinks: {
        manageUrl: "https://app.zokorp.com/email-preferences?token=abc",
        marketingUnsubscribeUrl: "https://app.zokorp.com/email-preferences/unsubscribe?token=abc",
      },
    });

    expect(email.text).toContain("Manage operational-result and follow-up email settings");
    expect(email.text).toContain("Stop future marketing follow-up emails");
    expect(email.html).toContain("Email preferences");
    expect(email.html).toContain("Unsubscribe");
  });

  it("omits preference controls when links are not provided", async () => {
    const email = await buildArchitectureFollowUpEmail({
      leadId: "lead_123",
      userEmail: "owner@acmecloud.com",
      provider: "aws",
      overallScore: 78,
      topIssues: "aws:iam_roles_and_temporary_credentials:3",
      day: 7,
    });

    expect(email.text).not.toContain("Manage operational-result and follow-up email settings");
    expect(email.text).not.toContain("Stop future marketing follow-up emails");
    expect(email.html).not.toContain("Email preferences");
    expect(email.html).not.toContain("Unsubscribe");
  });
});
