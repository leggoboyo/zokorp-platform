/* @vitest-environment node */

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("keeps the founder-led offer model explicit on the public homepage", async () => {
    authMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Clear cloud help for SMB teams.");
    expect(html).toContain("Small practice. Clear scope. Direct follow-through.");
    expect(html).toContain("Selected background");
    expect(html).toContain(
      "Experience includes work involving organizations such as D.R. Horton, SiriusXM, Warner Bros., JE Dunn, Cohere, Glean, Anthropic, and the National Hockey League.",
    );
    expect(html).toContain(
      "That background shows up here as tighter scope, clearer reviews, cleaner follow-through, and less generic advice.",
    );
    expect(html).toContain("Across homebuilding, construction, media, enterprise software, frontier AI, and sports.");
    expect(html).toContain("Initial response within one business day");
    expect(html).toContain("Architecture Review");
    expect(html).toContain("Cloud Cost Optimization Audit");
    expect(html).toContain("Landing Zone Setup");
    expect(html).toContain("Advisory Retainer");
    expect(html).toContain("Public tools first");
    expect(html).toContain("Request a call");
    expect(html).not.toContain("Microsoft");
    expect(html).not.toContain("AWS Readiness / FTR Validation");
    expect(html).not.toContain("Scoped Implementation");
    expect(html).not.toContain("AI/ML advisory");
  });
});
