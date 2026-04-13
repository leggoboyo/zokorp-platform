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

    expect(html).toContain("AWS architecture, validation, and optimization for SMB teams that need a clear next step.");
    expect(html).toContain("Six clear AWS offers. No filler, no vague transformation language.");
    expect(html).toContain("Architecture Review");
    expect(html).toContain("AWS Readiness / FTR Validation");
    expect(html).toContain("Cloud Cost Optimization Audit");
    expect(html).toContain("Landing Zone Setup");
    expect(html).toContain("Scoped Implementation");
    expect(html).toContain("Advisory Retainer");
    expect(html).not.toContain("AI/ML advisory");
  });
});
