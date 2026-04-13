import Link from "next/link";

import { SoftwareCatalogShell } from "@/components/software-catalog-shell";
import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
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
          <div className="grid gap-4">
            <section className="marketing-panel-dark rounded-[1.8rem] px-5 py-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Access model</p>
                  <h2 className="font-display text-2xl font-semibold">Public first. Account when useful.</h2>
                </div>
                <div className="grid gap-3">
                  {accessNotes.map((note) => (
                    <div key={note} className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="marketing-panel rounded-[1.8rem] px-5 py-5">
              <div className="space-y-3">
                <p className="enterprise-kicker">Catalog state</p>
                <div className="flex flex-wrap gap-2.5">
                  <span className="metric-chip">{activeProductBadge}</span>
                  <span className="metric-chip">{subscriptionBadge}</span>
                </div>
              </div>
            </section>
          </div>
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <div className="space-y-5">
          <MarketingSectionHeading
            eyebrow="Public product paths"
            title={SOFTWARE_PAGE_CONTENT.spotlightTitle}
            description={SOFTWARE_PAGE_CONTENT.spotlightIntro}
            className="block"
          />

          <article className="marketing-panel-dark rounded-[1.9rem] px-6 py-6 md:px-7">
            <div className="space-y-4">
              <p className="enterprise-kicker">Why it matters</p>
              <h2 className="font-display max-w-[14ch] text-3xl font-semibold leading-[1.04]">
                The product pages should answer what the tool does before a buyer ever sees an auth wall.
              </h2>
              <p className="text-sm leading-7 text-white/82">
                Marketing lives on <span className="font-semibold">{new URL(marketingSiteUrl).host}</span> so buyers can understand the company and product outcomes without forced signup. Product use, history, and billing stay on <span className="font-semibold">{new URL(appSiteUrl).host}</span>.
              </p>
            </div>
          </article>
        </div>

        <div className="marketing-card-stack">
          {SOFTWARE_HIGHLIGHTS.map((item) => (
            <article key={item.href} className="marketing-panel grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.76fr)] md:px-6">
              <div className="space-y-3">
                <p className="enterprise-kicker">Outcome-focused</p>
                <h3 className="font-display text-[1.85rem] font-semibold leading-[1.05] text-card-foreground">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.summary}</p>
              </div>

              <div className="space-y-3">
                <div className="marketing-panel-muted rounded-[1.35rem] px-4 py-4">
                  <p className="enterprise-kicker">Who it is for</p>
                  <p className="mt-2 text-sm leading-6 text-card-foreground">{item.audience}</p>
                </div>
                <div className="marketing-panel-muted rounded-[1.35rem] px-4 py-4">
                  <p className="enterprise-kicker">What you get</p>
                  <p className="mt-2 text-sm leading-6 text-card-foreground">{item.outcome}</p>
                </div>
                <Link href={item.href} className={buttonVariants({ variant: "secondary" })}>
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LearnMore
        title="How account access works"
        summary={SOFTWARE_PAGE_CONTENT.accessSummary}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="marketing-panel rounded-[1.5rem] px-5 py-5">
            <p className="text-sm leading-7 text-card-foreground">
              Marketing stays public because buyers should be able to evaluate the product surface without guessing what changes after signup.
            </p>
          </div>
          <div className="grid gap-3">
            {spotlightItems.map((item) => (
              <div key={item.title} className="marketing-panel rounded-[1.35rem] px-4 py-4 text-sm text-card-foreground">
                <span className="font-semibold">{item.title}:</span> {item.summary}
              </div>
            ))}
          </div>
        </div>
      </LearnMore>

      <section className="marketing-panel-dark rounded-[2rem] px-6 py-7 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="space-y-3">
            <p className="enterprise-kicker">Need product help?</p>
            <h2 className="font-display max-w-[13ch] text-[2.2rem] font-semibold leading-[1.02] md:text-[2.8rem]">
              Use the product pages first, then ask for scoped help when the outcome is clear.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={toMarketingSiteUrl("/services#service-request")} className={buttonVariants()}>
              Request product help
            </Link>
            <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "inverse" })}>
              Email ZoKorp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
