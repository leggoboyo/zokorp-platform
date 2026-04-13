import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { SoftwareCatalogShell } from "@/components/software-catalog-shell";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import { buildMarketingPageMetadata } from "@/lib/site";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Software",
  description: "Public software rows, product pricing, and shorter account-access guidance for ZoKorp tools.",
  path: "/software",
});

export default async function SoftwarePage() {
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
            <p className="enterprise-kicker">Software</p>
            <h1 className="font-display max-w-[10ch] text-[clamp(3rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-foreground">
              Public products first.
            </h1>
            <p className="marketing-section-copy max-w-[40ch] text-base leading-7 text-muted-foreground">
              Browse before sign-up. Use an account only when history, billing, or protected actions matter.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className={buttonVariants()}>
                View pricing
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
                Request help
              </Link>
              <Link href="/services" className={buttonVariants({ variant: "ghost" })}>
                See services
              </Link>
            </div>
          </div>

          <aside className="plane-dark rounded-[2.25rem] border border-white/8 px-5 py-5 md:px-6 md:py-6">
            <div className="space-y-4">
              <p className="enterprise-kicker text-white/72">Access model</p>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Public products</span>
                  <span className="font-semibold">{catalogUnavailable ? "Unavailable" : `${products.length}`}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Free browsing</span>
                  <span className="font-semibold">Yes</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/84">
                  <span>Account later</span>
                  <span className="font-semibold">When useful</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {catalogUnavailable ? (
        <Alert tone="warning" className="rounded-2xl border-amber-200 bg-amber-50/70">
          <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
          <AlertDescription>We could not load product data from the catalog right now. Please retry shortly.</AlertDescription>
        </Alert>
      ) : (
        <SoftwareCatalogShell products={products} />
      )}

      <details className="group overflow-hidden rounded-[2rem] border border-border/80 bg-white/72 shadow-[0_20px_80px_rgba(36,71,126,0.06)] backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 md:px-6 md:py-6">
          <div className="space-y-2">
            <p className="enterprise-kicker">How access works</p>
            <h2 className="font-display max-w-[12ch] text-[1.9rem] font-semibold leading-[0.98] text-card-foreground md:text-[2.2rem]">
              Public first. Account when useful.
            </h2>
            <p className="max-w-[40ch] text-sm leading-7 text-muted-foreground">
              Marketing stays open. History, billing, and protected actions move behind sign-in only when needed.
            </p>
          </div>
          <span className="mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-lg text-card-foreground transition group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="border-t border-border/80 px-5 py-5 md:px-6 md:py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/80 bg-background/55 px-4 py-4">
              <p className="enterprise-kicker">Public</p>
              <p className="mt-2 text-sm leading-6 text-card-foreground">
                Buyers can review each tool, compare the price posture, and open the product page first.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-background/55 px-4 py-4">
              <p className="enterprise-kicker">Account</p>
              <p className="mt-2 text-sm leading-6 text-card-foreground">
                Sign-in adds history, billing, and protected actions without changing the public page.
              </p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
