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

import CaseStudiesPage from "@/app/case-studies/page";

describe("CaseStudiesPage", () => {
  it("keeps representative proof messaging explicit", () => {
    const html = renderToStaticMarkup(<CaseStudiesPage />);

    expect(html).toContain("Safe placeholder proof mode");
    expect(html).toContain("not named client endorsements");
    expect(html).toContain("Representative delivery patterns");
    expect(html).toContain("Broad-launch replacement slot");
  });
});
