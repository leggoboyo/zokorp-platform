import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceOfferRow } from "@/components/marketing/service-offer-row";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  HOME_PAGE_CONTENT,
  PRIMARY_CONSULTING_OFFERS,
  SOFTWARE_HIGHLIGHTS,
} from "@/lib/marketing-content";
import { getConsultationCta } from "@/lib/marketing-cta";
import {
  PUBLIC_LAUNCH_CONTACT,
  PUBLIC_LAUNCH_FOUNDER_PROFILE,
} from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "Founder-Led Cloud Architecture and Product Guidance",
  description:
    "Founder-led cloud reviews, cost work, setup, and product guidance for SMB teams that need a clear next step.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.email);
  const primaryCta = getConsultationCta({
    signedIn,
    utmMedium: "homepage",
  });

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: getMarketingSiteUrl(),
      email: PUBLIC_LAUNCH_CONTACT.primaryEmail,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
      sameAs: [PUBLIC_LAUNCH_CONTACT.linkedInUrl],
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: PUBLIC_LAUNCH_FOUNDER_PROFILE.name,
      jobTitle: PUBLIC_LAUNCH_FOUNDER_PROFILE.role,
      worksFor: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      sameAs: [PUBLIC_LAUNCH_CONTACT.linkedInUrl],
    },
  ];

  return (
    <div className="marketing-stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <MarketingHero
        mode="poster"
        eyebrow={HOME_PAGE_CONTENT.hero.eyebrow}
        title={HOME_PAGE_CONTENT.hero.title}
        lede={HOME_PAGE_CONTENT.hero.lede}
        supportingBullets={HOME_PAGE_CONTENT.hero.supportingBullets}
        primaryAction={primaryCta}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        rail={
          <section className="table-band rounded-[2rem] p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgb(230_237_247),rgb(204_216_232))]">
                <Image
                  src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                  alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 768px) 120px, 112px"
                  priority
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="enterprise-kicker">{HOME_PAGE_CONTENT.founderTitle}</p>
                  <h2 className="font-display text-[2rem] font-semibold leading-[0.98] text-card-foreground">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{HOME_PAGE_CONTENT.founderSummary}</p>
                </div>

                <div className="grid gap-2 border-t border-border/70 pt-3 text-sm text-card-foreground sm:grid-cols-2">
                  <div>Houston, TX</div>
                  <div>{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</div>
                  <div>{PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0]}</div>
                  <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className="marketing-inline-link">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Services"
          title={HOME_PAGE_CONTENT.offersTitle}
          description={HOME_PAGE_CONTENT.offersIntro}
        />

        <div className="table-band px-5 py-5 md:px-6">
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
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Software"
          title={HOME_PAGE_CONTENT.softwareTitle}
          description={HOME_PAGE_CONTENT.softwareIntro}
        />

        <div className="table-band px-5 py-5 md:px-6">
          {SOFTWARE_HIGHLIGHTS.map((item, index) => (
            <article key={item.href} className="table-row">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="table-kicker">{`0${index + 1}`}</p>
                  <p className="enterprise-kicker">Product</p>
                </div>
                <h3 className="font-display max-w-[12ch] text-[1.95rem] font-semibold leading-[1.02] text-card-foreground">
                  {item.title}
                </h3>
                <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">{item.summary}</p>
              </div>

              <div className="space-y-3">
                <p className="table-kicker">Who it is for</p>
                <p className="text-sm leading-7 text-card-foreground">{item.audience}</p>
              </div>

              <div className="space-y-3 rounded-[1.2rem] border border-border/80 bg-white/78 px-4 py-4">
                <p className="table-kicker">What you get</p>
                <p className="text-sm leading-7 text-card-foreground">{item.outcome}</p>
              </div>

              <div className="flex items-start lg:justify-end">
                <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
