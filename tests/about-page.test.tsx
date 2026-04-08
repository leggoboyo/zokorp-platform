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
  it("keeps the founder-led positioning and proof posture explicit", () => {
    const html = renderToStaticMarkup(<AboutPage />);

    expect(html).toContain("Built by a technical founder");
    expect(html).toContain("Founder-led by default");
    expect(html).toContain("Specific claims only");
    expect(html).toContain("Software and services stay connected");
    expect(html).toContain("Public proof posture");
    expect(html).toContain("Zohaib Khawaja");
    expect(html).toContain("Amazon Web Services");
    expect(html).toContain("Microsoft");
    expect(html).toContain("Concrete founder credibility without fake proof");
  });
});
