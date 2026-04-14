import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { FounderProfileCard } from "@/components/marketing/founder-profile-card";
import { FounderProofBlock } from "@/components/marketing/founder-proof-block";
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
import { FOUNDER_PROOF_PAGE_CONTENT } from "@/lib/marketing-proof";
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
  const softwareTableColumns = {
    "--table-columns": "minmax(0,1.28fr) minmax(0,0.95fr) minmax(15rem,0.9fr) auto",
  } as CSSProperties;

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
        bodyColumnClassName="lg:col-span-6"
        railColumnClassName="lg:col-span-6"
        rail={
          <FounderProfileCard
            eyebrow="Founder"
            name={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
            role={PUBLIC_LAUNCH_FOUNDER_PROFILE.role}
            summary={HOME_PAGE_CONTENT.founderSummary}
            imageSrc={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
            imageAlt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
            details={[
              { label: "Location", value: "Houston, TX" },
              { label: "Response", value: PUBLIC_LAUNCH_CONTACT.responseWindowLabel },
              {
                label: "Credential",
                value: PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0],
                fullWidth: true,
              },
              {
                label: "LinkedIn",
                value: (
                  <a
                    href={PUBLIC_LAUNCH_CONTACT.linkedInUrl}
                    className="marketing-inline-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open profile
                  </a>
                ),
              },
            ]}
          />
        }
      />

      <FounderProofBlock
        mode="strip"
        eyebrow={FOUNDER_PROOF_PAGE_CONTENT.home.eyebrow}
        statement={FOUNDER_PROOF_PAGE_CONTENT.home.statement}
        support={FOUNDER_PROOF_PAGE_CONTENT.home.support}
        sectorLine={FOUNDER_PROOF_PAGE_CONTENT.home.sectorLine}
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Services"
          title={HOME_PAGE_CONTENT.offersTitle}
          description={HOME_PAGE_CONTENT.offersIntro}
        />

        <div className="table-band px-5 py-5 md:px-6">
          <div className="table-head">
            <span>Offer</span>
            <span>Best for</span>
            <span>What you get</span>
            <span className="text-right">Price</span>
          </div>
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

        <div
          className="table-band px-5 py-5 md:px-6"
          style={softwareTableColumns}
        >
          <div className="table-head">
            <span>Product</span>
            <span>Who it is for</span>
            <span>What you get</span>
            <span className="text-right">Action</span>
          </div>
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
                <p className="table-cell-label">Who it is for</p>
                <p className="text-sm leading-7 text-card-foreground">{item.audience}</p>
              </div>

              <div className="table-cell-panel space-y-3">
                <p className="table-cell-label">What you get</p>
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
