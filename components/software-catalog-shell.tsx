"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getToolDefinition } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";

type CatalogPrice = {
  id: string;
  kind: string;
  amount: number;
  currency: string;
};

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  accessModel: "FREE" | "ONE_TIME_CREDIT" | "SUBSCRIPTION" | "METERED";
  prices: CatalogPrice[];
};

type AccessFilter = "ALL" | CatalogProduct["accessModel"];

type SoftwareCatalogShellProps = {
  products: CatalogProduct[];
};

const accessFilters: Array<{ value: AccessFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "FREE", label: "Free" },
  { value: "ONE_TIME_CREDIT", label: "Credit" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "METERED", label: "Metered" },
];

const accessBadgeVariant: Record<CatalogProduct["accessModel"], React.ComponentProps<typeof Badge>["variant"]> = {
  FREE: "success",
  ONE_TIME_CREDIT: "warning",
  SUBSCRIPTION: "info",
  METERED: "brand",
};

const accessLabel: Record<CatalogProduct["accessModel"], string> = {
  FREE: "Free",
  ONE_TIME_CREDIT: "Credit",
  SUBSCRIPTION: "Subscription",
  METERED: "Metered",
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function getPriceSummary(product: CatalogProduct) {
  if (product.prices.length === 0) {
    return product.accessModel === "FREE" ? "No purchase" : "Pricing later";
  }

  const amounts = product.prices.map((price) => formatAmount(price.amount, price.currency));

  if (amounts.length === 1) {
    return amounts[0];
  }

  return `${amounts[0]} to ${amounts[amounts.length - 1]}`;
}

function getCatalogPresentation(product: CatalogProduct) {
  const toolDefinition = getToolDefinition(product.slug);

  return {
    name: toolDefinition?.displayName ?? product.name,
    description:
      toolDefinition?.productDescription ??
      product.description
        .replaceAll("AWS", "cloud")
        .replaceAll("FTR", "validation")
        .replaceAll("SMB", "small teams"),
  };
}

export function SoftwareCatalogShell({ products }: SoftwareCatalogShellProps) {
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("ALL");
  const deferredQuery = useDeferredValue(query);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return products.filter((product) => {
      const presentation = getCatalogPresentation(product);
      const matchesAccess = accessFilter === "ALL" || product.accessModel === accessFilter;
      if (!matchesAccess) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${presentation.name} ${presentation.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [accessFilter, deferredQuery, products]);

  return (
    <section className="space-y-5">
      <div className="section-band px-5 py-5 md:px-6 md:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
          <div className="space-y-2">
            <p className="enterprise-kicker">Catalog filters</p>
            <h2 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[0.98] text-foreground md:text-[2.6rem]">
              Browse by access model or intent
            </h2>
            <p className="max-w-[42ch] text-sm leading-7 text-muted-foreground">
              Search product names or descriptions, then narrow the list by access model.
            </p>
          </div>

          <div className="w-full">
            <label htmlFor="software-search" className="sr-only">
              Search software catalog
            </label>
            <Input
              id="software-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search software"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter software by access model">
          {accessFilters.map((filter) => {
            const isActive = filter.value === accessFilter;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setAccessFilter(filter.value)}
                className={cn(
                  buttonVariants({ variant: isActive ? "primary" : "secondary", size: "sm" }),
                  !isActive && "bg-card",
                )}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          Showing {filteredProducts.length} of {products.length} product{products.length === 1 ? "" : "s"}.
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="overflow-hidden rounded-[2.1rem] border border-border/80 bg-white/72 shadow-[0_20px_80px_rgba(36,71,126,0.06)] backdrop-blur-sm">
          <div className="hidden border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:grid md:grid-cols-[minmax(0,1.55fr)_minmax(9rem,0.75fr)_minmax(10rem,0.82fr)_auto]">
            <span>Product</span>
            <span>Access</span>
            <span>Price</span>
            <span className="text-right">Action</span>
          </div>

          {filteredProducts.map((product, index) => {
            const presentation = getCatalogPresentation(product);
            const priceSummary = getPriceSummary(product);

            return (
              <article
                key={product.id}
                className="grid gap-4 border-b border-border/80 px-5 py-5 last:border-b-0 md:grid-cols-[3rem_minmax(0,1.55fr)_minmax(9rem,0.75fr)_minmax(10rem,0.82fr)_auto] md:items-start md:gap-5"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:pt-2">{`0${index + 1}`}</div>

                <div className="space-y-2">
                  <p className="enterprise-kicker">Software product</p>
                  <h3 className="font-display max-w-[14ch] text-[1.45rem] font-semibold leading-[1.02] text-card-foreground md:text-[1.75rem]">
                    {presentation.name}
                  </h3>
                  <p className="max-w-[34ch] text-sm leading-6 text-muted-foreground">{presentation.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Access</p>
                  <Badge variant={accessBadgeVariant[product.accessModel]} className="w-fit">
                    {accessLabel[product.accessModel]}
                  </Badge>
                  <p className="text-sm leading-6 text-muted-foreground">Public page first.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Price</p>
                  <p className="font-display text-[1.65rem] font-semibold leading-none tracking-[-0.04em] text-card-foreground">
                    {priceSummary}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {product.accessModel === "FREE"
                      ? "Open access."
                      : product.prices.length > 0
                        ? `${product.prices.length} price${product.prices.length === 1 ? "" : " points"}`
                        : "Set later"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <Link href={`/software/${product.slug}`} className={buttonVariants({ variant: "secondary" })}>
                    Open product
                  </Link>
                  <span className="text-xs uppercase tracking-[0.18em] text-foreground-label">Direct page</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="section-band px-6 py-6">
          <div className="space-y-4">
            <p className="enterprise-kicker">No matches</p>
            <h3 className="font-display text-2xl font-semibold text-card-foreground">No software fits the current filters</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Clear the search term or switch back to all access models to see the full catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setAccessFilter("ALL");
              }}
              className={buttonVariants({ variant: "secondary" })}
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
