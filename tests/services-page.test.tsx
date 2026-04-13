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
    expect(html).toContain("ZoKorp is a founder-led AWS architecture consultancy.");
    expect(html).toContain("Scoped AWS architecture services you can actually buy.");
    expect(html).toContain("Architecture Review");
    expect(html).toContain("$249");
    expect(html).toContain("AWS Readiness / FTR Validation");
    expect(html).toContain("from $1,500");
    expect(html).toContain("Cloud Cost Optimization Audit");
    expect(html).toContain("from $750");
    expect(html).toContain("Landing Zone Setup");
    expect(html).toContain("from $2,500");
    expect(html).toContain("Implementation (Scoped Work)");
    expect(html).toContain("from $1,250 per sprint or $149/hr");
    expect(html).toContain("Advisory Retainer (Light Support)");
    expect(html).toContain("from $1,500/month");
    expect(html).toContain("AI / ML Advisory");
    expect(html).toContain("from $3,500");
    expect(html).toContain("Start here before any larger engagement");
    expect(html).toContain("All work is scoped before execution. No unlimited or ongoing work without agreement.");
    expect(html).toContain("Not a managed service. No strict SLA. Business-hours response only.");
    expect(html).toContain("How ZoKorp Works");
    expect(html).toContain("No all-you-can-eat support.");
    expect(html).toContain("Advisory-first approach, not managed services.");
    expect(html).not.toContain("Sign in to submit a request and track milestones from your account.");
    expect(html).not.toContain("Broad-launch replacement slot");
  });
});
