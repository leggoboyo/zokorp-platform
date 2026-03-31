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

import ContactPage from "@/app/contact/page";
import PrivacyPage from "@/app/privacy/page";
import RefundsPage from "@/app/refunds/page";
import SupportPage from "@/app/support/page";

describe("public contact and policy pages", () => {
  it("keeps consulting@zokorp.com as the primary public support identity", () => {
    const contactHtml = renderToStaticMarkup(<ContactPage />);
    const supportHtml = renderToStaticMarkup(<SupportPage />);
    const privacyHtml = renderToStaticMarkup(<PrivacyPage />);
    const refundsHtml = renderToStaticMarkup(<RefundsPage />);

    expect(contactHtml).toContain("consulting@zokorp.com");
    expect(contactHtml).toContain("Initial response within one business day");
    expect(supportHtml).toContain("consulting@zokorp.com");
    expect(supportHtml).toContain("Book architecture follow-up");
    expect(privacyHtml).toContain("consulting@zokorp.com");
    expect(refundsHtml).toContain("consulting@zokorp.com");
  });
});
