import Link from "next/link";

import { AccessModel } from "@prisma/client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { shouldHidePublicProductPricing } from "@/lib/billing-readiness";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import {
  PRIMARY_CONSULTING_OFFERS,
  SECONDARY_CONSULTING_OFFERS,
  SPECIALIST_ADVISORY,
} from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Pricing",
  description:
    "Public price anchors and shorter product pricing rows for ZoKorp services and tools.",
  path: "/pricing",
});

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

const accessLabels: Record<AccessModel, string> = {
  FREE: "Free",
  ONE_TIME_CREDIT: "Credit-based",
  SUBSCRIPTION: "Subscription",
  METERED: "Metered",
};

const consultingSummary: Record<string, { fit: string; summary: string }> = {
  "architecture-review": {
    fit: "Scope is still forming.",
    summary: "Fast read. Clear next step.",
  },
  "cloud-cost-optimization-audit": {
    fit: "Spend needs a clean pass.",
    summary: "Bounded review of waste and savings.",
  },
  "landing-zone-setup": {
    fit: "Foundation work needs structure.",
    summary: "Clean baseline for structure and security.",
  },
  "advisory-retainer": {
    fit: "You want continuity after the first pass.",
    summary: "Monthly founder access with clear bounds.",
  },
};

const secondarySummary: Record<string, { fit: string; summary: string }> = {
  "aws-readiness-ftr-validation": {
    fit: "The architecture already exists.",
    summary: "Validation when pass/fail clarity matters.",
  },
  "scoped-implementation": {
    fit: "The next step is already specific.",
    summary: "Hands-on follow-through with a stop point.",
  },
};

function getProductPriceSummary(accessModel: AccessModel, prices: Array<{ amount: number; currency: string }>) {
  if (shouldHidePublicProductPricing(accessModel)) {
    return "Gated";
  }

  if (prices.length === 0) {
    return accessModel === AccessModel.FREE ? "No purchase" : "Set after billing";
  }

  if (prices.length === 1) {
    return formatAmount(prices[0].amount, prices[0].currency);
  }

  return `${formatAmount(prices[0].amount, prices[0].currency)} to ${formatAmount(
    prices[prices.length - 1].amount,
    prices[prices.length - 1].currency,
  )}`;
}

function ConsultingOfferRow({
  index,
  eyebrow,
  title,
  priceAnchor,
  summary,
  fit,
  included,
}: {
  index: number;
  eyebrow: string;
  title: string;
  priceAnchor: string;
  summary: string;
  fit: string;
  included: readonly string[];
}) {
  return (
    <article className="grid gap-4 border-b border-border/80 px-5 py-5 last:border-b-0 md:grid-cols-[3rem_minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] md:items-start md:gap-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:pt-2">{`0${index}`}</div>

      <div className="space-y-2">
        <p className="enterprise-kicker">{eyebrow}</p>
        <h3 className="font-display max-w-[12ch] text-[1.6rem] font-semibold leading-[1.02] text-card-foreground md:text-[1.9rem]">
          {title}
        </h3>
        <p className="max-w-[30ch] text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Best for</p>
        <p className="text-sm leading-6 text-card-foreground">{fit}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">What you get</p>
        <ul className="space-y-1 text-sm leading-6 text-card-foreground">
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-start md:justify-end">
        <Badge variant="secondary" className="normal-case tracking-normal">
          {priceAnchor}
        </Badge>
      </div>
    </article>
  );
}

function PricingTableRow({
  index,
  product,
}: {
  index: number;
  product: Awaited<ReturnType<typeof getSoftwareCatalogCached>>[number];
}) {
  const priceSummary = getProductPriceSummary(
    product.accessModel,
    product.prices.map((price) => ({ amount: price.amount, currency: price.currency })),
  );

  return (
    <article className="grid gap-4 border-b border-border/80 px-5 py-5 last:border-b-0 md:grid-cols-[3rem_minmax(0,1.55fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_auto] md:items-start md:gap-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:pt-2">{`0${index}`}</div>

      <div className="space-y-2">
        <p className="enterprise-kicker">Software product</p>
        <h3 className="font-display max-w-[14ch] text-[1.45rem] font-semibold leading-[1.02] text-card-foreground md:text-[1.75rem]">
          {product.name}
        </h3>
        <p className="max-w-[34ch] text-sm leading-6 text-muted-foreground">{product.description}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Access</p>
        <Badge
          variant={
            product.accessModel === AccessModel.FREE
              ? "success"
              : product.accessModel === AccessModel.ONE_TIME_CREDIT
                ? "warning"
                : product.accessModel === AccessModel.SUBSCRIPTION
                  ? "info"
                  : "brand"
          }
          className="w-fit"
        >
          {accessLabels[product.accessModel]}
        </Badge>
        <p className="text-sm leading-6 text-muted-foreground">Public page first.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Price</p>
        <p className="font-display text-[1.65rem] font-semibold leading-none tracking-[-0.04em] text-card-foreground">
          {priceSummary}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {product.accessModel === AccessModel.FREE
            ? "Open browsing."
            : product.prices.length > 0
              ? `${product.prices.length} price${product.prices.length === 1 ? "" : " points"}`
              : "Configured later"}
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
}

export default async function PricingPage() {
  let products: Awaited<ReturnType<typeof getSoftwareCatalogCached>> = [];
  let catalogUnavailable = false;

  try {
    products = await getSoftwareCatalogCached();
  } catch (error) {
    if (error instanceof CatalogUnavailableError) {
      catalogUnavailable = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="marketing-stack">
      <section className="section-band overflow-hidden px-5 py-6 md:px-6 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
          <div className="space-y-5">
            <p className="enterprise-kicker">Pricing</p>
            <h1 className="font-display max-w-[10ch] text-[clamp(3rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-foreground">
              Price anchors first.
            </h1>
            <p className="marketing-section-copy max-w-[42ch] text-base leading-7 text-muted-foreground">
              Use the public numbers first. Quote only when scope needs more definition.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className={buttonVariants()}>
                Request a quote
              </Link>
              <Link href="/software" className={buttonVariants({ variant: "secondary" })}>
                View software
              </Link>
              <Link href="/services" className={buttonVariants({ variant: "ghost" })}>
                See services
              </Link>
            </div>
          </div>

          <aside className="plane-dark rounded-[2.25rem] border border-white/8 px-5 py-5 md:px-6 md:py-6">
            <div className="space-y-4">
              <p className="enterprise-kicker text-white/72">Public anchors</p>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Review</span>
                  <span className="font-semibold">$249</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Cost audit</span>
                  <span className="font-semibold">from $750</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Landing zone</span>
                  <span className="font-semibold">from $2,500</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Response</span>
                  <span className="font-semibold">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</span>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/70">{PUBLIC_LAUNCH_POLICY_NOTES.services}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <div className="space-y-2">
            <p className="enterprise-kicker">Consulting</p>
            <h2 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[0.98] text-foreground md:text-[2.6rem]">
              Four primary offers.
            </h2>
          </div>
          <p className="max-w-[34ch] text-sm leading-7 text-muted-foreground">
            Start with the visible price anchors. Move to secondary work only when the next step is already clear.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2.1rem] border border-border/80 bg-white/72 shadow-[0_20px_80px_rgba(36,71,126,0.08)] backdrop-blur-sm">
          <div className="hidden border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:grid md:grid-cols-[3rem_minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto]">
            <span>#</span>
            <span>Offer</span>
            <span>Best for</span>
            <span>What you get</span>
            <span className="text-right">Price</span>
          </div>

          {PRIMARY_CONSULTING_OFFERS.map((offer, index) => {
            const copy = consultingSummary[offer.slug] ?? {
              fit: "Clear scope before the next step.",
              summary: "Short scoped work with a visible anchor.",
            };

            return (
              <ConsultingOfferRow
                key={offer.slug}
                index={index + 1}
                eyebrow={offer.eyebrow}
                title={offer.title}
                priceAnchor={offer.priceAnchor}
                summary={copy.summary}
                fit={copy.fit}
                included={offer.included}
              />
            );
          })}
        </div>
      </section>

      <details className="group overflow-hidden rounded-[2rem] border border-border/80 bg-white/72 shadow-[0_20px_80px_rgba(36,71,126,0.06)] backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 md:px-6 md:py-6">
          <div className="space-y-2">
            <p className="enterprise-kicker">Additional scoped work</p>
            <h2 className="font-display max-w-[12ch] text-[1.9rem] font-semibold leading-[0.98] text-card-foreground md:text-[2.2rem]">
              Expand only when needed.
            </h2>
            <p className="max-w-[38ch] text-sm leading-7 text-muted-foreground">
              Validation, implementation, and specialist advisory stay secondary.
            </p>
          </div>
          <span className="mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-lg text-card-foreground transition group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="border-t border-border/80 px-5 py-5 md:px-6 md:py-6">
          <div className="grid gap-4">
            {SECONDARY_CONSULTING_OFFERS.map((offer) => {
              const copy = secondarySummary[offer.slug] ?? {
                fit: "Scoped follow-through.",
                summary: "Secondary work kept intentionally narrow.",
              };

              return (
                <article
                  key={offer.slug}
                  className="grid gap-3 rounded-[1.5rem] border border-border/80 bg-background/55 px-4 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-start md:gap-4"
                >
                  <div className="space-y-1">
                    <p className="enterprise-kicker">{offer.eyebrow}</p>
                    <h3 className="font-display text-[1.35rem] font-semibold leading-[1.02] text-card-foreground">
                      {offer.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">{copy.summary}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Best for</p>
                    <p className="text-sm leading-6 text-card-foreground">{copy.fit}</p>
                  </div>

                  <div className="flex items-start md:justify-end">
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {offer.priceAnchor}
                    </Badge>
                  </div>
                </article>
              );
            })}

            <article className="grid gap-3 rounded-[1.5rem] border border-border/80 bg-background/55 px-4 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-start md:gap-4">
              <div className="space-y-1">
                <p className="enterprise-kicker">Specialist advisory</p>
                <h3 className="font-display text-[1.35rem] font-semibold leading-[1.02] text-card-foreground">
                  {SPECIALIST_ADVISORY.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Best for</p>
                <p className="text-sm leading-6 text-card-foreground">A real AI or ML decision.</p>
              </div>

              <div className="flex items-start md:justify-end">
                <Badge variant="secondary" className="normal-case tracking-normal">
                  {SPECIALIST_ADVISORY.priceAnchor}
                </Badge>
              </div>
            </article>
          </div>
        </div>
      </details>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
          <div className="space-y-2">
            <p className="enterprise-kicker">Software pricing</p>
            <h2 className="font-display max-w-[10ch] text-[2rem] font-semibold leading-[0.98] text-foreground md:text-[2.6rem]">
              Product pricing stays visible.
            </h2>
          </div>
          <p className="max-w-[36ch] text-sm leading-7 text-muted-foreground">
            Browse publicly. Use an account only when history, billing, or protected access matters.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2.1rem] border border-border/80 bg-white/72 shadow-[0_20px_80px_rgba(36,71,126,0.06)] backdrop-blur-sm">
          <div className="hidden border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label md:grid md:grid-cols-[minmax(0,1.55fr)_minmax(9rem,0.8fr)_minmax(10rem,0.85fr)_auto]">
            <span>Product</span>
            <span>Access</span>
            <span>Price</span>
            <span className="text-right">Action</span>
          </div>

          {catalogUnavailable ? (
            <Alert tone="warning" className="m-5 rounded-2xl border-amber-200 bg-amber-50/70">
              <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
              <AlertDescription>Product pricing could not be loaded right now. Please retry shortly.</AlertDescription>
            </Alert>
          ) : (
            products.map((product, index) => (
              <PricingTableRow key={product.slug} index={index + 1} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
