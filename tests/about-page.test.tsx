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

import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("keeps the founder-led positioning and proof posture explicit", async () => {
    authMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await AboutPage());

    expect(html).toContain("Signals you can verify fast.");
    expect(html).toContain("Signals you can verify fast");
    expect(html).toContain("Proof");
    expect(html).toContain("Zohaib Khawaja");
    expect(html).toContain("Former AWS Partner Solutions Architect");
    expect(html).toContain("Microsoft");
    expect(html).toContain("AWS Solutions Architect Professional");
    expect(html).toContain("Initial response within one business day");
    expect(html.match(/Microsoft/g)?.length ?? 0).toBe(1);
    expect(html).not.toContain("AI/ML advisory");
  });
});
