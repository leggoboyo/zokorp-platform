import Link from "next/link";

import { SoftwareCatalogShell } from "@/components/software-catalog-shell";
import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { isPublicSubscriptionPricingApproved } from "@/lib/billing-readiness";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import { MARKETING_TRUST_CHIPS, SOFTWARE_HIGHLIGHTS, SOFTWARE_PAGE_CONTENT } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl, toMarketingSiteUrl } from "@/lib/site";
import { getToolDefinitions } from "@/lib/tool-registry";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Software",
  description:
    "Public software catalog for ZoKorp tools, product explanations, and account-linked access when you are ready to use the app.",
  path: "/software",
});

const spotlightItems = getToolDefinitions().map((tool) => ({
  title: tool.displayName,
  status: tool.softwareHubStatus,
  summary: tool.softwareHubSummary,
  cta: tool.slug === "zokorp-validator" ? "Open validator" : "Open product",
  href: `/software/${tool.slug}`,
}));

const accessNotes = [
  "Browse publicly before creating an account.",
  "Create an account when you want product access, usage history, or billing.",
  "If a product surfaces the real work to do, ZoKorp can turn that into a scoped next step.",
] as const;

export default async function SoftwarePage() {
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();
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

  const activeProductBadge = catalogUnavailable ? "Catalog unavailable" : `${products.length} public products`;
  const subscriptionBadge = isPublicSubscriptionPricingApproved()
    ? "Subscription pricing visible where approved"
    : "Subscription pricing stays gated until approved";

  return (
    <div className="marketing-stack">
      <MarketingHero
        eyebrow={SOFTWARE_PAGE_CONTENT.hero.eyebrow}
        title={SOFTWARE_PAGE_CONTENT.hero.title}
        lede={SOFTWARE_PAGE_CONTENT.hero.lede}
        supportingBullets={SOFTWARE_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: `${appSiteUrl}/register`, label: "Create account" }}
        secondaryAction={{ href: "/pricing", label: "See pricing", variant: "secondary" }}
        tertiaryAction={{ href: "/services", label: "View services", variant: "ghost" }}
        rail={
          <Card tone="plain" className="theme-dark rounded-[1.85rem] border border-border p-6 shadow-none md:p-7">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker">Access model</p>
              <h2 className="font-display text-2xl font-semibold">Public first. Account when useful.</h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              {accessNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                  {note}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <span className="metric-chip">{activeProductBadge}</span>
                <span className="metric-chip">{subscriptionBadge}</span>
              </div>
            </CardContent>
          </Card>
        }
      />

      {catalogUnavailable ? (
        <Alert tone="warning" className="rounded-2xl border-amber-200 bg-amber-50/70">
          <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
          <AlertDescription>
            We could not load product data from the catalog right now. Please retry shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <SoftwareCatalogShell products={products} />
      )}

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Public product paths</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl">
            {SOFTWARE_PAGE_CONTENT.spotlightTitle}
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            {SOFTWARE_PAGE_CONTENT.spotlightIntro}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {SOFTWARE_HIGHLIGHTS.map((item) => (
            <Card key={item.href} className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Outcome-focused</p>
                <h3 className="font-display text-2xl font-semibold text-card-foreground">{item.title}</h3>
              </CardHeader>
              <CardContent className="space-y-4 px-0">
                <p className="text-sm leading-7 text-muted-foreground">{item.summary}</p>
                <div className="rounded-2xl border border-border bg-muted px-4 py-4 text-sm text-card-foreground">
                  <span className="font-semibold">Who it is for:</span> {item.audience}
                </div>
                <div className="rounded-2xl border border-border bg-muted px-4 py-4 text-sm text-card-foreground">
                  <span className="font-semibold">What you get:</span> {item.outcome}
                </div>
              </CardContent>
              <CardFooter className="px-0">
                <Link href={item.href} className={buttonVariants({ variant: "secondary" })}>
                  {item.cta}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <LearnMore
        title="How account access works"
        summary={SOFTWARE_PAGE_CONTENT.accessSummary}
      >
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-7 text-card-foreground">
            Marketing lives on <span className="font-semibold">{new URL(marketingSiteUrl).host}</span> so buyers can understand the company and product outcomes without forced signup. Product use, history, and billing stay on <span className="font-semibold">{new URL(appSiteUrl).host}</span>.
          </div>
          <div className="grid gap-3">
            {spotlightItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                <span className="font-semibold">{item.title}:</span> {item.summary}
              </div>
            ))}
          </div>
        </div>
      </LearnMore>

      <Card tone="plain" className="theme-dark rounded-[1.8rem] border border-border p-6 shadow-none md:p-8">
        <CardHeader className="gap-2 px-0">
          <p className="enterprise-kicker">Need product help?</p>
          <h2 className="font-display text-3xl font-semibold">Use the public product pages first, then ask for scoped help when the outcome is clear.</h2>
        </CardHeader>
        <CardFooter className="px-0">
          <Link href={toMarketingSiteUrl("/services#service-request")} className={buttonVariants()}>
            Request product help
          </Link>
          <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "inverse" })}>
            Email ZoKorp
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
