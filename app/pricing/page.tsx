import Link from "next/link";

import { AccessModel } from "@prisma/client";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
          <Card tone="plain" className="theme-dark rounded-[1.85rem] border border-border p-6 shadow-none md:p-7">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker">Pricing posture</p>
              <h2 className="font-display text-2xl font-semibold">Visible numbers first. Estimate-first scoping when needed.</h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_POLICY_NOTES.services}
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_POLICY_NOTES.pricing}
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                Email <span className="font-semibold">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</span> when the right number depends on real scope.
              </div>
            </CardContent>
          </Card>
        }
      />

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Consulting</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl">
            {PRICING_PAGE_CONTENT.consultingTitle}
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            {PRICING_PAGE_CONTENT.consultingIntro}
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {PRIMARY_CONSULTING_OFFERS.map((offer) => (
            <Card key={offer.slug} className="rounded-[1.7rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-3 px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{offer.eyebrow}</p>
                    <h3 className="font-display text-3xl font-semibold text-card-foreground">{offer.title}</h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {offer.priceAnchor}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{offer.summary}</p>
              </CardHeader>
              <CardContent className="space-y-2 px-0">
                {offer.included.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <LearnMore
        title="Additional scoped work"
        summary={PRICING_PAGE_CONTENT.secondarySummary}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {SECONDARY_CONSULTING_OFFERS.map((offer) => (
            <Card key={offer.slug} className="rounded-[1.5rem] border border-border bg-background p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{offer.eyebrow}</p>
                    <h3 className="font-display text-2xl font-semibold text-card-foreground">{offer.title}</h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {offer.priceAnchor}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{offer.summary}</p>
              </CardHeader>
              <CardContent className="space-y-2 px-0">
                {offer.included.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="rounded-[1.5rem] border border-border bg-background p-5 shadow-none">
            <CardHeader className="gap-2 px-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Specialist note</p>
                  <h3 className="font-display text-2xl font-semibold text-card-foreground">{SPECIALIST_ADVISORY.title}</h3>
                </div>
                <Badge variant="secondary" className="normal-case tracking-normal">
                  {SPECIALIST_ADVISORY.priceAnchor}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
            </CardHeader>
            <CardContent className="space-y-2 px-0">
              {SPECIALIST_ADVISORY.bullets.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </LearnMore>

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Software</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl">
            {PRICING_PAGE_CONTENT.softwareTitle}
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            Product pricing stays visible where it is ready. Browsing stays public. Accounts become useful when you want usage history, billing, or protected access.
          </p>
        </div>

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
              <Card key={product.slug} className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
                <CardHeader className="gap-3 px-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-2xl font-semibold text-card-foreground">{product.name}</h3>
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {accessLabels[product.accessModel]}
                    </Badge>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="rounded-2xl border border-border bg-muted p-4">
                    {shouldHidePublicProductPricing(product.accessModel) ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-card-foreground">Public subscription pricing is still gated</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          The product is public, but subscription packaging stays private until the billing posture is approved.
                        </p>
                      </div>
                    ) : product.prices.length > 0 ? (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {product.prices.map((price) => (
                          <li key={price.id} className="flex items-center justify-between gap-4">
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
                </CardContent>
                <CardFooter className="px-0">
                  <Link href={`/software/${product.slug}`} className={buttonVariants()}>
                    Open product
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
