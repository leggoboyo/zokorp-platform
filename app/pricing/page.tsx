import Link from "next/link";

import { AccessModel } from "@prisma/client";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { shouldHidePublicProductPricing } from "@/lib/billing-readiness";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import {
  MARKETING_TRUST_CHIPS,
  PRICING_PAGE_CONTENT,
  PRIMARY_CONSULTING_OFFERS,
  SECONDARY_CONSULTING_OFFERS,
  SPECIALIST_ADVISORY,
} from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Pricing",
  description:
    "Public consulting price anchors, software pricing visibility, and estimate-first scoping for ZoKorp services and tools.",
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

export default async function PricingPage() {
  const appSiteUrl = getAppSiteUrl();
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
      <MarketingHero
        eyebrow={PRICING_PAGE_CONTENT.hero.eyebrow}
        title={PRICING_PAGE_CONTENT.hero.title}
        lede={PRICING_PAGE_CONTENT.hero.lede}
        supportingBullets={PRICING_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: "/services#service-request", label: "Request a quote" }}
        secondaryAction={{ href: "/software", label: "Explore software", variant: "secondary" }}
        tertiaryAction={{ href: `${appSiteUrl}/register`, label: "Create account", variant: "ghost" }}
        rail={
          <div className="grid gap-4">
            <section className="marketing-panel-dark rounded-[1.8rem] px-5 py-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Pricing posture</p>
                  <h2 className="font-display text-2xl font-semibold">Visible numbers first. Estimate-first scoping when needed.</h2>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_POLICY_NOTES.services}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_POLICY_NOTES.pricing}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    Email <span className="font-semibold">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</span> when the right number depends on real scope.
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Consulting"
          title={PRICING_PAGE_CONTENT.consultingTitle}
          description={PRICING_PAGE_CONTENT.consultingIntro}
        />

        <div className="grid gap-4">
          {PRIMARY_CONSULTING_OFFERS.map((offer) => (
            <article
              key={offer.slug}
              className="marketing-panel grid gap-5 px-5 py-6 md:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start"
            >
              <div className="space-y-3">
                <p className="enterprise-kicker">{offer.eyebrow}</p>
                <h3 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                  {offer.title}
                </h3>
                <Badge variant="secondary" className="w-fit normal-case tracking-normal">
                  {offer.priceAnchor}
                </Badge>
                <p className="text-sm leading-7 text-muted-foreground">{offer.summary}</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(14rem,0.76fr)]">
                <div className="space-y-3">
                  <p className="enterprise-kicker">What is included</p>
                  <ul className="marketing-list">
                    {offer.included.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="marketing-panel-muted rounded-[1.4rem] px-4 py-4">
                  <p className="enterprise-kicker">Why it exists</p>
                  <div className="mt-3 grid gap-2.5">
                    {offer.bullets.map((item) => (
                      <div key={item} className="text-sm text-card-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LearnMore
        title="Additional scoped work"
        summary={PRICING_PAGE_CONTENT.secondarySummary}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {SECONDARY_CONSULTING_OFFERS.map((offer) => (
            <article key={offer.slug} className="marketing-panel rounded-[1.5rem] px-5 py-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{offer.eyebrow}</p>
                    <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-card-foreground">
                      {offer.title}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {offer.priceAnchor}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{offer.summary}</p>
                <ul className="marketing-list">
                  {offer.included.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}

          <article className="marketing-panel rounded-[1.5rem] px-5 py-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Specialist note</p>
                  <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-card-foreground">
                    {SPECIALIST_ADVISORY.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="normal-case tracking-normal">
                  {SPECIALIST_ADVISORY.priceAnchor}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
              <ul className="marketing-list">
                {SPECIALIST_ADVISORY.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </LearnMore>

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Software"
          title={PRICING_PAGE_CONTENT.softwareTitle}
          description="Product pricing stays visible where it is ready. Browsing stays public. Accounts become useful when you want usage history, billing, or protected access."
        />

        {catalogUnavailable ? (
          <Alert tone="warning" className="rounded-2xl border-amber-200 bg-amber-50/70">
            <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
            <AlertDescription>
              Product pricing could not be loaded right now. Please retry shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <article key={product.slug} className="marketing-panel rounded-[1.6rem] px-5 py-6 md:px-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-card-foreground">
                      {product.name}
                    </h3>
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {accessLabels[product.accessModel]}
                    </Badge>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>

                  <div className="marketing-panel-muted rounded-[1.35rem] px-4 py-4">
                    {shouldHidePublicProductPricing(product.accessModel) ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-card-foreground">Public subscription pricing is still gated</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          The product is public, but subscription packaging stays private until the billing posture is approved.
                        </p>
                      </div>
                    ) : product.prices.length > 0 ? (
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        {product.prices.map((price) => (
                          <li key={price.id} className="flex items-center justify-between gap-4 border-t border-border/70 pt-2.5 first:border-t-0 first:pt-0">
                            <span>{price.kind.replaceAll("_", " ")}</span>
                            <span className="font-semibold text-card-foreground">{formatAmount(price.amount, price.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground">
                        {product.accessModel === AccessModel.FREE
                          ? "No purchase required. Create an account only if you want app-linked history."
                          : "Pricing becomes visible when billing is active for this product."}
                      </p>
                    )}
                  </div>

                  <Link href={`/software/${product.slug}`} className={buttonVariants({ variant: "secondary" })}>
                    Open product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
