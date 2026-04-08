import Link from "next/link";

import { SoftwareCatalogShell } from "@/components/software-catalog-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { isPublicSubscriptionPricingApproved } from "@/lib/billing-readiness";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import { SOFTWARE_HIGHLIGHTS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";
import { getToolDefinitions } from "@/lib/tool-registry";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Software",
  description:
    "Public software catalog for ZoKorp tools, product explanations, and app-linked access when you are ready to create an account.",
  path: "/software",
});

const spotlightItems = getToolDefinitions().map((tool) => ({
  title: tool.displayName,
  status: tool.softwareHubStatus,
  summary: tool.softwareHubSummary,
  cta: tool.slug === "zokorp-validator" ? "Open validator" : "Open product",
  href: `/software/${tool.slug}`,
}));

const productModelNotes = [
  {
    title: "Public first look",
    detail: "You can understand what the software does before creating an account.",
  },
  {
    title: "Account when useful",
    detail: "Create an account when you want usage history, protected access, or billing inside the app.",
  },
  {
    title: "Consulting bridge",
    detail: "If a product surfaces the real work to do, ZoKorp can turn that into a scoped consulting next step.",
  },
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
    <div className="space-y-10 md:space-y-12">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f5f1_100%)] px-6 py-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">ZoKorp software</p>
            <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Software that supports the consulting model instead of pretending to replace it.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              The product side of ZoKorp exists to remove repetitive review work, make findings easier to act on, and
              give buyers a self-serve way to understand the company before committing to a call.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`${appSiteUrl}/register`} className={buttonVariants({ size: "lg" })}>
                Create account
              </Link>
              <Link href="/pricing" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Review pricing
              </Link>
              <Link href="/services" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                View services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white text-slate-700">
                {activeProductBadge}
              </Badge>
              <Badge variant="secondary" className="bg-white text-slate-700">
                {subscriptionBadge}
              </Badge>
              <Badge variant="secondary" className="bg-white text-slate-700">
                Marketing on {new URL(marketingSiteUrl).host}
              </Badge>
            </div>
          </div>

          <Card className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="gap-2 px-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">How to use this page</p>
              <h2 className="font-display text-3xl font-semibold text-slate-950">Browse publicly. Use the app when you are ready.</h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              {productModelNotes.map((note) => (
                <div key={note.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <h3 className="text-lg font-semibold text-slate-950">{note.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{note.detail}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="px-0">
              <Link href={`${appSiteUrl}/login?callbackUrl=/software`} className={buttonVariants({ variant: "secondary" })}>
                Sign in
              </Link>
              <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "ghost" })}>
                Email ZoKorp
              </a>
            </CardFooter>
          </Card>
        </div>
      </section>

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

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current product surfaces</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Three public product paths, one company narrative.</h2>
          </div>
          <Link href="/services#service-request" className={buttonVariants({ variant: "secondary" })}>
            Request product help
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {spotlightItems.map((item) => (
            <Card key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.status}</p>
                <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-sm leading-7 text-slate-600">{item.summary}</p>
              </CardContent>
              <CardFooter className="px-0">
                <Link href={item.href} className={buttonVariants()}>
                  {item.cta}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Software bridge</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">What each product is for right now.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {SOFTWARE_HIGHLIGHTS.map((item) => (
              <div key={item.href} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                  </div>
                  <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    {item.cta}
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-slate-200 bg-[#111827] p-6 text-slate-50 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Why the split matters</p>
            <h2 className="font-display text-3xl font-semibold">Marketing lives on `www`. The app stays on `app`.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <p className="text-sm leading-7 text-slate-200">
              That means the software can stay product-oriented, while the public site explains the company, the
              services, and the founder-led delivery model without forcing login just to browse.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
              If you are ready to use a product, create an account on <span className="font-semibold">{new URL(appSiteUrl).host}</span>.
              If you are still evaluating, stay on the public site and keep reading.
            </div>
          </CardContent>
          <CardFooter className="px-0">
            <Link href={`${appSiteUrl}/register`} className={buttonVariants({ variant: "secondary" })}>
              Create account
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>
              Contact ZoKorp
            </Link>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
