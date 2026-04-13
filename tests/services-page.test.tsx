/* @vitest-environment node */

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const { authMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

import ServicesPage from "@/app/services/page";

describe("ServicesPage", () => {
  const originalBookingUrl = process.env.ARCH_REVIEW_BOOK_CALL_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ARCH_REVIEW_BOOK_CALL_URL = "https://calendly.com/zokorp/architecture-follow-up";
    authMock.mockResolvedValue({
      user: {
        email: "consulting@zokorp.com",
      },
    });
  });

  afterEach(() => {
    if (originalBookingUrl === undefined) {
      delete process.env.ARCH_REVIEW_BOOK_CALL_URL;
    } else {
      process.env.ARCH_REVIEW_BOOK_CALL_URL = originalBookingUrl;
    }
  });

  it("renders the productized AWS services model with signed-in request handling", async () => {
    const html = renderToStaticMarkup(await ServicesPage());

    expect(html).toContain("utm_source=zokorp");
    expect(html).toContain("utm_medium=services-page");
    expect(html).toContain("utm_campaign=architecture-follow-up");
    expect(html).toContain("Signed in as");
    expect(html).toContain("consulting@zokorp.com");
    expect(html).toContain("Four AWS offers up front.");
    expect(html).toContain("Choose the starting point, not a generic bundle.");
    expect(html).toContain("Architecture Review");
    expect(html).toContain("$249");
    expect(html).toContain("Cloud Cost Optimization Audit");
    expect(html).toContain("from $750");
    expect(html).toContain("Landing Zone Setup");
    expect(html).toContain("from $2,500");
    expect(html).toContain("Advisory Retainer");
    expect(html).toContain("from $1,500/month");
    expect(html).toContain("Additional scoped work");
    expect(html).toContain("AWS Readiness / FTR Validation");
    expect(html).toContain("Scoped Implementation");
    expect(html).toContain("from $1,250 per sprint or $149/hr");
    expect(html).toContain("AI / ML Advisory");
    expect(html).toContain("from $3,500");
    expect(html).toContain("Defined scope, direct founder access, and visible next steps.");
    expect(html).toContain("Scope is confirmed before paid consulting, remediation, or implementation work is accepted.");
    expect(html).toContain("Initial response within one business day");
    expect(html).toContain("Request a quote");
    expect(html).toContain("Use the structured request form when you already need a scoped response.");
    expect(html).not.toContain("Sign in to submit a request and track milestones from your account.");
    expect(html).not.toContain("Broad-launch replacement slot");
  });
});
