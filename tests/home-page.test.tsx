/* @vitest-environment node */

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("keeps the founder-led AWS offer model explicit on the public homepage", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Clear AWS architecture help for SMB teams that need the next move.");
    expect(html).toContain("Former AWS. Currently at Microsoft.");
    expect(html).toContain("Initial response within one business day");
    expect(html).toContain("Architecture Review");
    expect(html).toContain("Cloud Cost Optimization Audit");
    expect(html).toContain("Landing Zone Setup");
    expect(html).toContain("Advisory Retainer");
    expect(html).toContain("Direct founder access when a call is the faster path");
    expect(html).not.toContain("AWS Readiness / FTR Validation");
    expect(html).not.toContain("Scoped Implementation");
    expect(html).not.toContain("AI/ML advisory");
  });
});
