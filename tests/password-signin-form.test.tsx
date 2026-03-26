/* @vitest-environment node */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

import { PasswordSignInForm } from "@/components/password-signin-form";

describe("PasswordSignInForm", () => {
  it("renders empty credentials by default", () => {
    const html = renderToStaticMarkup(<PasswordSignInForm callbackUrl="/account" />);

    expect(html).toContain('type="email"');
    expect(html).toContain('type="password"');
    expect(html).toContain('value=""');
    expect(html).not.toContain("zkhawaja@zokorp.com");
    expect(html).not.toContain("consulting@zokorp.com");
  });
});
