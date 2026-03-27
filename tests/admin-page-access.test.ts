import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, redirectMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { requireAdminPageAccess } from "@/lib/admin-page-access";

describe("requireAdminPageAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    requireAdminMock.mockRejectedValue(new Error("UNAUTHORIZED"));

    await expect(requireAdminPageAccess("/admin/leads")).rejects.toThrow("REDIRECT:/login?callbackUrl=/admin/leads");
    expect(redirectMock).toHaveBeenCalledWith("/login?callbackUrl=/admin/leads");
  });

  it("redirects authenticated non-admins to the access denied page", async () => {
    requireAdminMock.mockRejectedValue(new Error("FORBIDDEN"));

    await expect(requireAdminPageAccess("/admin/leads")).rejects.toThrow(
      "REDIRECT:/access-denied?from=%2Fadmin%2Fleads",
    );
    expect(redirectMock).toHaveBeenCalledWith("/access-denied?from=%2Fadmin%2Fleads");
  });
});
