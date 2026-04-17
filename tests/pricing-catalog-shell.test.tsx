/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { PricingCatalogShell } from "@/components/marketing/pricing-catalog-shell";

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
    prices: [{ amount: 5000, currency: "usd" }],
  },
  {
    id: "prod-3",
    slug: "mlops-foundation-platform",
    name: "ZoKorp Forecasting Beta",
    description: "Subscription forecasting beta workflow for small teams.",
    accessModel: "SUBSCRIPTION" as const,
    prices: [{ amount: 1000, currency: "usd" }, { amount: 10000, currency: "usd" }],
  },
];

const primaryOffers = [
  {
    slug: "architecture-review",
    eyebrow: "Start here",
    title: "Architecture Review",
    priceAnchor: "$249",
    summary: "A fast technical read with a clear next step.",
    prominence: "primary" as const,
  },
];

const secondaryOffers = [
  {
    slug: "scoped-implementation",
    eyebrow: "Additional scoped work",
    title: "Scoped Implementation",
    priceAnchor: "from $1,250 per sprint or $149/hr",
    summary: "Hands-on follow-through once the next step is already clear.",
    prominence: "secondary" as const,
  },
];

describe("PricingCatalogShell", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("defaults to the unified All view showing both software and services, and narrows on filter click", () => {
    render(<PricingCatalogShell products={products} primaryOffers={primaryOffers} secondaryOffers={secondaryOffers} />);

    expect(screen.getByText(/Architecture Diagram Reviewer/i)).toBeTruthy();
    expect(screen.getByText(/^Architecture Review$/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Primary services/i }));

    expect(screen.getByText(/^Architecture Review$/i)).toBeTruthy();
    expect(screen.queryByText(/ZoKorp Forecasting Beta/i)).toBeNull();
  });

  it("applies the software access filter while keeping the unified pricing layout", () => {
    render(<PricingCatalogShell products={products} primaryOffers={primaryOffers} secondaryOffers={secondaryOffers} />);

    fireEvent.click(
      within(screen.getByRole("group", { name: /filter pricing by surface/i })).getByRole("button", { name: /^Software$/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Credit$/i }));

    expect(screen.getByText(/^ZoKorpValidator$/i)).toBeTruthy();
    expect(screen.queryByText(/Architecture Diagram Reviewer/i)).toBeNull();

    fireEvent.click(
      within(screen.getByRole("group", { name: /filter pricing by surface/i })).getByRole("button", { name: /^All$/i }),
    );

    expect(screen.getByText(/^Architecture Review$/i)).toBeTruthy();
    expect(screen.getByText(/^Scoped Implementation$/i)).toBeTruthy();
    expect(screen.getByText(/^ZoKorpValidator$/i)).toBeTruthy();
  });
});
