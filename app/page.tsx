import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import {
  DELIVERY_PROCESS_STEPS,
  HOME_PAGE_CONTENT,
  MARKETING_TRUST_CHIPS,
  PRIMARY_CONSULTING_OFFERS,
  SOFTWARE_HIGHLIGHTS,
} from "@/lib/marketing-content";
import {
  PUBLIC_LAUNCH_CONTACT,
  PUBLIC_LAUNCH_FOUNDER_PROFILE,
  PUBLIC_LAUNCH_PROOF_ASSET,
} from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "Founder-Led AWS Architecture, Validation, and Optimization",
  description:
    "Founder-led AWS architecture reviews, cost audits, landing-zone work, and advisory for SMB teams that need a clear next step.",
  path: "/",
});

const offerSpanMap: Record<string, string> = {
  "architecture-review": "lg:col-span-7",
  "cloud-cost-optimization-audit": "lg:col-span-5",
  "landing-zone-setup": "lg:col-span-5",
  "advisory-retainer": "lg:col-span-7",
};

const founderSignals = [
  PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel,
  PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel,
  PUBLIC_LAUNCH_CONTACT.responseWindowLabel,
] as const;

export default function HomePage() {
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "homepage",
  });

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: marketingSiteUrl,
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
        eyebrow={HOME_PAGE_CONTENT.hero.eyebrow}
        title={HOME_PAGE_CONTENT.hero.title}
        lede={HOME_PAGE_CONTENT.hero.lede}
        supportingBullets={HOME_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <div className="grid gap-4">
            <section className="marketing-panel overflow-hidden rounded-[2rem]">
              <div className="grid gap-5 p-5 md:grid-cols-[minmax(220px,260px)_1fr] md:p-6">
                <div className="portrait-frame relative min-h-[320px] md:min-h-[360px]">
                  <Image
                    src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                    alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    fill
                    className="object-cover object-[center_12%]"
                    sizes="(max-width: 768px) 100vw, 260px"
                    priority
                  />
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <p className="enterprise-kicker">Founder</p>
                    <div className="space-y-1.5">
                      <h2 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                      </h2>
                      <p className="text-sm font-medium text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {founderSignals.map((signal) => (
                        <Badge key={signal} variant="secondary" className="normal-case tracking-normal">
                          {signal}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                        <span key={credential} className="metric-chip">
                          {credential}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="marketing-panel-dark rounded-[1.8rem] px-5 py-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Trust posture</p>
                  <h2 className="font-display text-2xl font-semibold">{PUBLIC_LAUNCH_PROOF_ASSET.title}</h2>
                </div>
                <p className="text-sm leading-7 text-white/80">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
                    <div key={item} className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Primary services"
          title={HOME_PAGE_CONTENT.offersTitle}
          description={HOME_PAGE_CONTENT.offersIntro}
          aside={
            <div className="flex flex-wrap gap-2.5">
              <span className="metric-chip">Fixed-scope entry points</span>
              <span className="metric-chip">Founder-led review model</span>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-12">
          {PRIMARY_CONSULTING_OFFERS.map((offer, index) => (
            <article
              key={offer.slug}
              className={cn(
                "marketing-panel flex h-full flex-col gap-6 px-5 py-6 md:px-6 md:py-7",
                offerSpanMap[offer.slug],
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">{offer.eyebrow}</p>
                  <h3 className="font-display max-w-[13ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                    {offer.title}
                  </h3>
                </div>

                <div className="space-y-2 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-label">{`0${index + 1}`}</p>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {offer.priceAnchor}
                  </Badge>
                </div>
              </div>

              <p className="measure-copy text-sm leading-7 text-muted-foreground">{offer.summary}</p>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)]">
                <ul className="marketing-list">
                  {offer.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className="marketing-panel-muted rounded-[1.4rem] px-4 py-4">
                  <p className="enterprise-kicker">What you get</p>
                  <div className="mt-3 grid gap-2">
                    {offer.included.map((item) => (
                      <div key={item} className="text-sm font-medium text-card-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band px-5 py-6 md:px-6 md:py-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-end">
          <div className="space-y-3">
            <p className="enterprise-kicker">How work starts</p>
            <h2 className="font-display max-w-[14ch] text-3xl font-semibold text-foreground md:text-4xl">
              Structured on purpose, not dressed up as infinite consulting.
            </h2>
          </div>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            Reviews come first. Scope gets clearer. Only then does ZoKorp move into validation, remediation, or implementation.
          </p>
        </div>

        <div className="band-divider mt-6" />

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {DELIVERY_PROCESS_STEPS.map((step, index) => (
            <article key={step.title} className="space-y-3">
              <p className="enterprise-kicker">{`0${index + 1}`}</p>
              <h3 className="font-display text-2xl font-semibold text-card-foreground">{step.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="space-y-5">
          <MarketingSectionHeading
            eyebrow="Software"
            title={HOME_PAGE_CONTENT.softwareTitle}
            description={HOME_PAGE_CONTENT.softwareIntro}
            className="block"
          />

          <div className="marketing-panel-dark rounded-[1.9rem] px-6 py-6 md:px-7 md:py-7">
            <div className="space-y-4">
              <p className="enterprise-kicker">Why it exists</p>
              <h3 className="font-display max-w-[14ch] text-3xl font-semibold leading-[1.04]">
                The product side should remove ambiguity, not add another sales layer.
              </h3>
              <p className="text-sm leading-7 text-white/82">
                ZoKorp software is designed to show the outcome, the buyer fit, and the next action in seconds. That keeps the public site honest and keeps signup out of the first step.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/software" className={buttonVariants()}>
                  Explore software
                </Link>
                <Link href="/pricing" className={buttonVariants({ variant: "inverse" })}>
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="marketing-card-stack">
          {SOFTWARE_HIGHLIGHTS.map((item) => (
            <article key={item.href} className="marketing-panel grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)] md:px-6">
              <div className="space-y-3">
                <p className="enterprise-kicker">Public product</p>
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

      <section className="marketing-panel-dark rounded-[2rem] px-6 py-7 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="space-y-3">
            <p className="enterprise-kicker">Next step</p>
            <h2 className="font-display max-w-[13ch] text-[2.35rem] font-semibold leading-[1] md:text-[3rem]">
              {HOME_PAGE_CONTENT.finalCtaTitle}
            </h2>
          </div>

          <div className="space-y-5">
            <ul className="marketing-list text-white">
              {HOME_PAGE_CONTENT.finalCtaBullets.map((bullet) => (
                <li key={bullet} className="text-white/82">
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants()}>
                Book a call
              </a>
              <Link href="/services" className={buttonVariants({ variant: "inverse" })}>
                View services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
