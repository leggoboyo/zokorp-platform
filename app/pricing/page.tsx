import Link from "next/link";

import { AccessModel } from "@prisma/client";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceOfferRow } from "@/components/marketing/service-offer-row";
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
        mode="poster"
        eyebrow={PRICING_PAGE_CONTENT.hero.eyebrow}
        title={PRICING_PAGE_CONTENT.hero.title}
        lede={PRICING_PAGE_CONTENT.hero.lede}
        supportingBullets={PRICING_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: "/services#service-request", label: "Request a quote" }}
        secondaryAction={{ href: "/software", label: "Explore software", variant: "secondary" }}
        tertiaryAction={{ href: `${appSiteUrl}/register`, label: "Create account", variant: "ghost" }}
        rail={
          <div className="grid gap-5">
            <section className="plane-dark rounded-[2.3rem] border border-white/8 px-5 py-5 md:px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker text-white/72">Pricing posture</p>
                  <h2 className="font-display max-w-[9ch] text-[2.2rem] font-semibold leading-[0.96] text-white">
                    Visible numbers first. Estimate-first scoping when needed.
                  </h2>
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

            <section className="section-band px-5 py-5 md:px-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">$249</p>
                  <p className="marketing-kpi-label">Review entry point</p>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">$750</p>
                  <p className="marketing-kpi-label">Cost audit starting point</p>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">1 day</p>
                  <p className="marketing-kpi-label">Initial response target</p>
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

        <div className="section-band px-5 py-5 md:px-6">
          {PRIMARY_CONSULTING_OFFERS.map((offer, index) => (
            <ServiceOfferRow
              key={offer.slug}
              eyebrow={offer.eyebrow}
              title={offer.title}
              priceAnchor={offer.priceAnchor}
              summary={offer.summary}
              bullets={offer.bullets}
              included={offer.included}
              index={index + 1}
              compact
            />
          ))}
        </div>
      </section>

      <LearnMore
        title="Additional scoped work"
        summary={PRICING_PAGE_CONTENT.secondarySummary}
      >
        <div className="section-band px-5 py-5 md:px-6">
          {SECONDARY_CONSULTING_OFFERS.map((offer) => (
            <ServiceOfferRow
              key={offer.slug}
              eyebrow={offer.eyebrow}
              title={offer.title}
              priceAnchor={offer.priceAnchor}
              summary={offer.summary}
              bullets={offer.bullets}
              included={offer.included}
              compact
            />
          ))}

          <article className="grid gap-6 border-t border-border/80 py-6 lg:grid-cols-[auto_minmax(0,0.48fr)_minmax(0,1fr)_auto] lg:items-start">
            <div className="hidden lg:block lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Note</p>
            </div>
            <div className="space-y-2">
              <p className="enterprise-kicker">Specialist note</p>
              <h3 className="font-display max-w-[12ch] text-[1.8rem] font-semibold leading-[1.02] text-card-foreground">
                {SPECIALIST_ADVISORY.title}
              </h3>
              <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
            </div>
            <ul className="marketing-list">
              {SPECIALIST_ADVISORY.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="flex items-start lg:justify-end">
              <Badge variant="secondary" className="normal-case tracking-normal">
                {SPECIALIST_ADVISORY.priceAnchor}
              </Badge>
            </div>
          </article>
        </div>
      </LearnMore>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="space-y-5">
          <p className="enterprise-kicker">Software pricing</p>
          <h2 className="font-display max-w-[11ch] text-[2.5rem] font-semibold leading-[0.98] text-foreground md:text-[3.4rem]">
            Product pricing should orient the buyer without pretending the catalog is bigger than it is.
          </h2>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            Product pricing stays visible where it is ready. Browsing stays public. Accounts become useful when you want usage history, billing, or protected access.
          </p>
        </div>

        <div className="plane-dark rounded-[2.2rem] border border-white/8 px-6 py-6 md:px-7 md:py-7">
          <div className="space-y-4">
            <p className="enterprise-kicker text-white/72">{PRICING_PAGE_CONTENT.softwareTitle}</p>
            <div className="grid gap-3">
              <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                Free tools stay public when possible.
              </div>
              <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                Subscription packaging stays private until the billing posture is approved.
              </div>
              <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                Product pages still explain the outcome before a buyer ever signs in.
              </div>
            </div>
          </div>
        </div>
      </section>

      {catalogUnavailable ? (
        <Alert tone="warning" className="rounded-2xl border-amber-200 bg-amber-50/70">
          <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
          <AlertDescription>
            Product pricing could not be loaded right now. Please retry shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="section-band px-5 py-5 md:px-6">
          {products.map((product, index) => (
            <article
              key={product.slug}
              className="grid gap-6 border-t border-border/80 py-6 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.54fr)_minmax(0,1fr)_auto] lg:items-start"
            >
              <div className="hidden lg:block lg:pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
              </div>
              <div className="space-y-2">
                <p className="enterprise-kicker">Software product</p>
                <h3 className="font-display max-w-[12ch] text-[1.9rem] font-semibold leading-[1.02] text-card-foreground">
                  {product.name}
                </h3>
                <p className="max-w-[34ch] text-sm leading-7 text-muted-foreground">{product.description}</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.78fr)]">
                <div className="grid gap-3">
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">Access:</span> {accessLabels[product.accessModel]}
                  </div>
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    {shouldHidePublicProductPricing(product.accessModel) ? (
                      <>
                        <span className="font-semibold">Pricing:</span> Public subscription pricing is still gated
                      </>
                    ) : product.prices.length > 0 ? (
                      <>
                        <span className="font-semibold">Pricing:</span>{" "}
                        {product.prices.map((price) => formatAmount(price.amount, price.currency)).join(" / ")}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Pricing:</span>{" "}
                        {product.accessModel === AccessModel.FREE
                          ? "No purchase required. Create an account only if you want app-linked history."
                          : "Pricing becomes visible when billing is active for this product."}
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-3 rounded-[1.35rem] border border-border/80 bg-white/55 px-4 py-4 backdrop-blur-sm">
                  <Badge variant="secondary" className="w-fit normal-case tracking-normal">
                    {accessLabels[product.accessModel]}
                  </Badge>
                  <Link href={`/software/${product.slug}`} className={buttonVariants({ variant: "secondary" })}>
                    Open product
                  </Link>
                </div>
              </div>
              <div className="flex items-start lg:justify-end">
                <span className="metric-chip">
                  {shouldHidePublicProductPricing(product.accessModel)
                    ? "Pricing gated"
                    : product.prices.length > 0
                      ? formatAmount(product.prices[0].amount, product.prices[0].currency)
                      : "Public page first"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
