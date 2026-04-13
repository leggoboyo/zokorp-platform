import Link from "next/link";

import { AccessModel } from "@prisma/client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { shouldHidePublicProductPricing } from "@/lib/billing-readiness";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import { CONSULTING_OFFERS, CONSULTING_PRICE_OPTIONS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Pricing",
  description:
    "Public consulting price anchors and software pricing for ZoKorp services, tools, and account-linked access.",
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

const pricingNotes = [
  "No login is required to browse consulting or software pricing.",
  "Consulting anchors reduce ambiguity, but broader work is still scoped before acceptance.",
  "Forecasting remains a narrow beta beside the core AWS architecture and validation offering.",
] as const;

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
    <div className="enterprise-shell space-y-10 md:space-y-12">
      <section className="rounded-[2rem] border border-[rgb(var(--z-border)/0.55)] bg-[image:var(--z-gradient-hero)] px-6 py-8 shadow-[var(--z-shadow-panel)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Pricing</p>
            <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Public price anchors for consulting, and straightforward pricing for the software that is ready.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-lg">
              ZoKorp shows enough pricing to help buyers make a decision without pretending every engagement is fixed,
              or every product is already mature enough for public subscription packaging.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services#service-request" className={buttonVariants({ size: "lg" })}>
                Get a quote
              </Link>
              <Link href="/software" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Explore software
              </Link>
              <Link href={`${appSiteUrl}/register`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Create account
              </Link>
            </div>
          </div>

          <Card className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Pricing posture</p>
              <h2 className="font-display text-3xl font-semibold text-slate-950">Visible enough to be useful, bounded enough to stay honest.</h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              {pricingNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {note}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Consulting</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Public consulting pricing</h2>
          </div>
          <p className="enterprise-copy max-w-xl text-sm">
            {PUBLIC_LAUNCH_POLICY_NOTES.services} Contact{" "}
            <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className="font-medium text-slate-900">
              {PUBLIC_LAUNCH_CONTACT.primaryEmail}
            </a>
            {" "}for anything that needs custom scoping.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {CONSULTING_PRICE_OPTIONS.map((item) => (
            <Card key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="text-sm font-semibold text-slate-700">{item.price}</p>
              </CardHeader>
              <CardContent className="px-0">
                <p className="enterprise-copy text-sm">{item.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {CONSULTING_OFFERS.map((offer) => (
            <div key={offer.slug} className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">{offer.eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">{offer.title}</h3>
              <p className="mt-2 text-sm font-medium text-slate-700">{offer.priceAnchor}</p>
              <p className="enterprise-copy mt-3 text-sm">{offer.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Software</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Software pricing and access</h2>
          </div>
          <p className="enterprise-copy max-w-xl text-sm">
            Products stay public. Account creation becomes useful when you want usage history, billing, or protected access inside the app.
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
          <section className="grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <Card key={product.slug} className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-none">
                <CardHeader className="gap-3 px-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-2xl font-semibold text-slate-950">{product.name}</h3>
                    <Badge variant="secondary">{accessLabels[product.accessModel]}</Badge>
                  </div>
                  <p className="enterprise-copy text-sm">{product.description}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {shouldHidePublicProductPricing(product.accessModel) ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900">Public subscription pricing is still gated</p>
                        <p className="text-sm leading-6 text-slate-700">
                          This product is live enough to explain publicly, but subscription packaging remains private until the billing posture is approved.
                        </p>
                      </div>
                    ) : product.prices.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-700">
                        {product.prices.map((price) => (
                          <li key={price.id} className="flex items-center justify-between gap-4">
                            <span>{price.kind.replaceAll("_", " ")}</span>
                            <span className="font-semibold">{formatAmount(price.amount, price.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm leading-6 text-slate-700">
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
          </section>
        )}
      </section>

      <Card className="enterprise-dark rounded-[1.8rem] p-6 shadow-none md:p-8">
        <CardHeader className="gap-2 px-0">
          <p className="enterprise-kicker text-white/72">Need help deciding?</p>
          <h2 className="font-display text-3xl font-semibold">Use the pricing page to orient yourself, not to skip the scoping conversation.</h2>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <p className="text-sm leading-7 text-slate-200">
            Architecture advisory, remediation, and readiness work all benefit from a quick review of the real context.
            That is why ZoKorp shows enough pricing to be useful while still routing broader work through quotes and calls.
          </p>
        </CardContent>
        <CardFooter className="px-0">
          <Link href="/services#service-request" className={buttonVariants()}>
            Request services
          </Link>
          <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "inverse" })}>
            Email ZoKorp
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
