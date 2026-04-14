import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { PricingCatalogShell } from "@/components/marketing/pricing-catalog-shell";
import { CatalogUnavailableError, getSoftwareCatalogCached } from "@/lib/catalog";
import {
  PRIMARY_CONSULTING_OFFERS,
  SECONDARY_CONSULTING_OFFERS,
} from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const revalidate = 300;

export const metadata = buildMarketingPageMetadata({
  title: "Pricing",
  description:
    "Public price anchors and shorter product pricing rows for ZoKorp services and tools.",
  path: "/pricing",
});

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
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="section-band overflow-hidden px-5 py-5 md:px-6 md:py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,32rem)] lg:items-start">
          <div className="space-y-4">
            <p className="enterprise-kicker">Pricing</p>
            <h1 className="font-display max-w-[8ch] text-[clamp(2.9rem,5vw,4.6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-foreground">
              See the prices first.
            </h1>
            <p className="max-w-[42ch] text-base leading-7 text-muted-foreground">
              Software pricing stays visible. Services stay public and filterable from the same table.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className={buttonVariants()}>
                Request a quote
              </Link>
            </div>
          </div>

          <aside className="plane-dark rounded-[2.3rem] border border-white/8 px-6 py-6 md:px-7">
            <div className="space-y-4">
              <p className="enterprise-kicker" style={{ color: "rgba(255, 255, 255, 0.78)" }}>
                Public anchors
              </p>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/88">
                  <span>Review</span>
                  <span className="font-semibold">$249</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/88">
                  <span>Cost audit</span>
                  <span className="font-semibold">from $750</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/88">
                  <span>Landing zone</span>
                  <span className="font-semibold">from $2,500</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-3 text-sm leading-6 text-white/88">
                  <span>Response</span>
                  <span className="font-semibold">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {catalogUnavailable ? (
        <Alert tone="warning" className="rounded-2xl border-amber-200 bg-amber-50/70">
          <AlertTitle>Software catalog temporarily unavailable</AlertTitle>
          <AlertDescription>Software pricing could not be loaded right now. Service pricing remains visible below.</AlertDescription>
        </Alert>
      ) : null}

      <PricingCatalogShell
        products={products}
        primaryOffers={PRIMARY_CONSULTING_OFFERS}
        secondaryOffers={SECONDARY_CONSULTING_OFFERS}
      />
    </div>
  );
}
