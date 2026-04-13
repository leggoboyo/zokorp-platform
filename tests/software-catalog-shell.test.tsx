/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SoftwareCatalogShell } from "@/components/software-catalog-shell";

const products = [
  {
    id: "prod-1",
    slug: "architecture-diagram-reviewer",
    name: "Architecture Diagram Reviewer",
    description: "Free review for architecture diagrams.",
    accessModel: "FREE" as const,
    prices: [],
  },
  {
    id: "prod-2",
    slug: "zokorp-validator",
    name: "ZoKorpValidator",
    description: "Credit-based validation for evidence-heavy reviews.",
    accessModel: "ONE_TIME_CREDIT" as const,
    prices: [
      {
        id: "price-1",
        kind: "CREDIT_PACK",
        amount: 5000,
        currency: "usd",
      },
    ],
  },
  {
    id: "prod-3",
    slug: "mlops-foundation-platform",
    name: "ZoKorp Forecasting Beta",
    description: "Subscription forecasting beta workflow for small teams.",
    accessModel: "SUBSCRIPTION" as const,
    prices: [
      {
        id: "price-2",
        kind: "SUBSCRIPTION",
        amount: 10000,
        currency: "usd",
      },
    ],
  },
];

describe("SoftwareCatalogShell", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("filters by search query across product names and descriptions", () => {
    render(<SoftwareCatalogShell products={products} />);

    expect(screen.getByRole("heading", { name: /Browse by access model or intent/i })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/search software catalog/i), {
      target: { value: "forecast" },
    });

    expect(screen.getByText(/ZoKorp Forecasting Beta/i)).toBeTruthy();
    expect(screen.queryByText(/^ZoKorpValidator$/i)).toBeNull();
    expect(screen.queryByText(/^Architecture Diagram Reviewer$/i)).toBeNull();
  });

  it("filters by access model and can clear back to the full list", () => {
    render(<SoftwareCatalogShell products={products} />);

    fireEvent.click(screen.getByRole("button", { name: /^Credit$/i }));

    expect(screen.getByText(/^ZoKorpValidator$/i)).toBeTruthy();
    expect(screen.queryByText(/^Architecture Diagram Reviewer$/i)).toBeNull();

    fireEvent.change(screen.getByLabelText(/search software catalog/i), {
      target: { value: "no-match" },
    });

    expect(screen.getByText(/No software fits the current filters/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(screen.getByText(/^ZoKorpValidator$/i)).toBeTruthy();
    expect(screen.getByText(/^Architecture Diagram Reviewer$/i)).toBeTruthy();
    expect(screen.getByText(/ZoKorp Forecasting Beta/i)).toBeTruthy();
  });

  it("renders the table-like column labels on larger screens", () => {
    render(<SoftwareCatalogShell products={products} />);

    expect(screen.getAllByText("Product").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Access").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Price").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Action").length).toBeGreaterThan(0);
  });
});
