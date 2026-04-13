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

    expect(html).toContain("Former AWS. Currently at Microsoft. Operating with direct technical judgment.");
    expect(html).toContain("Signals a buyer can verify without guesswork");
    expect(html).toContain("Approved public proof only");
    expect(html).toContain("Zohaib Khawaja");
    expect(html).toContain("Amazon Web Services");
    expect(html).toContain("Microsoft");
    expect(html).toContain("Nordic Global");
    expect(html).toContain("No fake logos. No invented guarantees.");
    expect(html).toContain("Initial response within one business day");
    expect(html).not.toContain("AI/ML advisory");
  });
});
