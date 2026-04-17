/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { ServiceRequestPanel } from "@/components/service-request-panel";

describe("ServiceRequestPanel", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let sessionEmail: string | null;
  let responseBody: {
    id: string;
    trackingCode: string;
    status: string;
    linkedToAccount?: boolean;
  };

  beforeEach(() => {
    sessionEmail = "consulting@zokorp.com";
    responseBody = {
      id: "sr_123",
      trackingCode: "SR-260326-ABCDE",
      status: "SUBMITTED",
      linkedToAccount: true,
    };

    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/auth/session") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            user: sessionEmail
              ? {
                  email: sessionEmail,
                }
              : undefined,
          }),
        } as Response;
      }

      if (url === "/api/services/requests" && init?.method === "POST") {
        return {
          ok: true,
          status: 200,
          json: async () => responseBody,
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("switches into a clear success state after submission and avoids leaving the form active", async () => {
    render(<ServiceRequestPanel signedIn currentEmail="consulting@zokorp.com" />);

    fireEvent.change(screen.getByLabelText(/request title/i), {
      target: { value: "ATLAS-AUDIT-2026-03-26 service request" },
    });
    fireEvent.change(screen.getByLabelText(/what do you need/i), {
      target: { value: "Need a production-readiness consultation for an AWS delivery and tooling launch plan." },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit service request/i }));

    await waitFor(() => expect(screen.getByText(/request recorded/i)).toBeTruthy());
    const successAlert = screen
      .getAllByRole("alert")
      .find((element) => element.textContent?.includes("Request recorded"));

    expect(successAlert).toBeTruthy();
    expect(screen.getByText(/SR-260326-ABCDE/i)).toBeTruthy();
    expect(successAlert?.textContent).toContain("current status of submitted");
    expect(screen.getByRole("link", { name: /open account timeline/i }).getAttribute("href")).toBe("/account");
    expect(screen.getByRole("button", { name: /submit another request/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /submit service request/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /submit another request/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /submit service request/i })).toBeTruthy());
  });

  it("supports a public submission without requiring sign-in and offers account creation after success", async () => {
    sessionEmail = null;
    responseBody = {
      id: "sr_public",
      trackingCode: "SR-260326-PUBLIC",
      status: "SUBMITTED",
      linkedToAccount: false,
    };

    render(<ServiceRequestPanel signedIn={false} currentEmail={null} />);

    expect(screen.getByText(/already have an account\?/i)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "founder@zokorp.com" },
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Zohaib" },
    });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: "ZoKorp" },
    });
    fireEvent.change(screen.getByLabelText(/what do you need/i), {
      target: { value: "Need a production-readiness consultation for an AWS delivery and tooling launch plan." },
    });
    expect(screen.getByText(/company/i).textContent).toContain("Optional");
    expect(screen.getByText(/budget range/i).textContent).toContain("Optional");

    fireEvent.click(screen.getByRole("button", { name: /submit service request/i }));

    await waitFor(() => expect(screen.getByText(/request recorded/i)).toBeTruthy());
    expect(screen.getByRole("link", { name: /create account later/i }).getAttribute("href")).toBe("/register");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/services/requests",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"requesterEmail\":\"founder@zokorp.com\""),
      }),
    );
  });
});
