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

import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("keeps the founder-led soft-launch and proof posture explicit", () => {
    const html = renderToStaticMarkup(<AboutPage />);

    expect(html).toContain("Founder-led by design");
    expect(html).toContain("Representative proof mode");
    expect(html).toContain("Current launch scope");
    expect(html).toContain("Public proof posture");
    expect(html).toContain("Founder profile");
    expect(html).toContain("Zohaib Khawaja");
    expect(html).toContain("Operational proof verified March 30, 2026");
  });
});
