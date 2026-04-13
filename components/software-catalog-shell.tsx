"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { MarketingSectionHeading } from "@/components/marketing/section-heading";
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
    return product.accessModel === "FREE" ? "No purchase required" : "Pricing available after account setup";
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
    description: toolDefinition?.productDescription ?? product.description,
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
          <MarketingSectionHeading
            eyebrow="Catalog filters"
            title="Browse by access model or intent"
            description="Search product names and descriptions, then narrow the list to the pricing model your team wants."
            className="block"
            titleClassName="max-w-[14ch] text-3xl"
            descriptionClassName="text-sm"
          />

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

        <div className="band-divider mt-5" />

        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter software by access model">
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
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {filteredProducts.length} of {products.length} product{products.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="section-band px-5 py-5 md:px-6">
          {filteredProducts.map((product, index) => (
            <article
              key={product.id}
              className="grid gap-6 border-t border-border/80 py-6 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.52fr)_minmax(0,1fr)_auto] lg:items-start"
            >
              <div className="hidden lg:block lg:pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <p className="enterprise-kicker">Software product</p>
                  <h3 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                    {getCatalogPresentation(product).name}
                  </h3>
                  <p className="measure-copy max-w-[34ch] text-sm leading-7 text-muted-foreground">
                    {getCatalogPresentation(product).description}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.84fr)]">
                <div className="grid gap-3">
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">Access:</span> {accessLabel[product.accessModel]}
                  </div>
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">Pricing:</span> {getPriceSummary(product)}
                  </div>
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">Path:</span> Public page first
                  </div>
                  {product.prices.length > 0 ? (
                    <div className="border-t border-border/80 pt-3">
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        {product.prices.slice(0, 3).map((price) => (
                          <li key={price.id} className="flex items-center justify-between gap-4">
                            <span>{price.kind.replaceAll("_", " ")}</span>
                            <span className="font-semibold text-card-foreground">{formatAmount(price.amount, price.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="border-t border-border/80 pt-3 text-sm leading-6 text-muted-foreground">
                      {product.accessModel === "FREE"
                        ? "Launch the tool directly. Account sign-in adds usage history where supported."
                        : "Pricing is configured per product in the admin dashboard."}
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-[1.35rem] border border-border/80 bg-white/55 px-4 py-4 backdrop-blur-sm">
                  <Badge variant={accessBadgeVariant[product.accessModel]} className="w-fit">
                    {accessLabel[product.accessModel]}
                  </Badge>
                  <p className="font-display text-[2.2rem] font-semibold leading-none tracking-[-0.05em] text-card-foreground">
                    {getPriceSummary(product)}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href={`/software/${product.slug}`} className={buttonVariants()}>
                      Open product
                    </Link>
                    <Link href="/account" className={buttonVariants({ variant: "secondary" })}>
                      View account access
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-start lg:justify-end">
                <span className="metric-chip">{accessLabel[product.accessModel]}</span>
              </div>
            </article>
          ))}
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
