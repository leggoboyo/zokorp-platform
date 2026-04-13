import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceOfferRow } from "@/components/marketing/service-offer-row";
import { buttonVariants } from "@/components/ui/button";
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
        mode="poster"
        eyebrow={HOME_PAGE_CONTENT.hero.eyebrow}
        title={HOME_PAGE_CONTENT.hero.title}
        lede={HOME_PAGE_CONTENT.hero.lede}
        supportingBullets={HOME_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <div className="grid gap-5 lg:gap-6">
            <section className="plane-dark rounded-[2.4rem] border border-white/8 p-4 shadow-[0_30px_70px_rgba(10,18,34,0.18)] md:p-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)] md:items-end">
                <div className="order-2 space-y-3 md:order-1">
                  <p className="enterprise-kicker text-white/72">Founder</p>
                  <div className="space-y-1">
                    <h2 className="font-display max-w-[8ch] text-[2.2rem] font-semibold leading-[0.96] text-white">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    </h2>
                    <p className="text-sm text-white/68">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                  </div>
                  <p className="max-w-[26ch] text-sm leading-7 text-white/78">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}
                  </p>
                  <div className="grid gap-2">
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/66">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
                    </div>
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/66">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
                    </div>
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/66">
                      {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
                    </div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
                    <Image
                      src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                      alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                      fill
                      className="object-cover object-[center_12%]"
                      sizes="(max-width: 1024px) 70vw, 260px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/20 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
                <div
                  key={item}
                  className="border-t border-border/70 pt-3 text-sm leading-7 text-card-foreground"
                >
                  {item}
                </div>
              ))}
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

        <div className="section-band px-5 py-6 md:px-6 md:py-7">
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

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="space-y-5">
          <p className="enterprise-kicker">How work starts</p>
          <h2 className="font-display max-w-[12ch] text-[2.6rem] font-semibold leading-[0.98] text-foreground md:text-[3.5rem]">
            Reviews first. Clearer scope second. Follow-through only when it is earned.
          </h2>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            The site should make the buying path obvious in seconds: diagnose, narrow, then decide whether implementation is worth buying.
          </p>
        </div>

        <div className="plane-dark rounded-[2.2rem] border border-white/8 px-6 py-6 md:px-7 md:py-7">
          <div className="grid gap-5 md:grid-cols-2">
            {DELIVERY_PROCESS_STEPS.map((step, index) => (
              <article key={step.title} className="border-t border-white/12 pt-4 first:border-t-0 first:pt-0">
                <p className="enterprise-kicker text-white/66">{`0${index + 1}`}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/76">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Software"
          title={HOME_PAGE_CONTENT.softwareTitle}
          description={HOME_PAGE_CONTENT.softwareIntro}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="plane-dark rounded-[2.4rem] border border-white/8 px-6 py-7 md:px-8">
            <div className="space-y-5">
              <p className="enterprise-kicker text-white/72">Public tools</p>
              <h2 className="font-display max-w-[10ch] text-[2.7rem] font-semibold leading-[0.96] text-white md:text-[3.7rem]">
                Product pages should explain the outcome before signup.
              </h2>
              <p className="max-w-[34ch] text-base leading-7 text-white/80">
                The software layer exists to reduce ambiguity, not to hide the service model. Buyers should understand the tool, the fit, and the next step before they ever create an account.
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
          </section>

          <div className="section-band px-5 py-4 md:px-6">
            {SOFTWARE_HIGHLIGHTS.map((item) => (
              <article
                key={item.href}
                className="grid gap-4 border-t border-border/80 py-5 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,0.82fr)_minmax(15rem,0.78fr)] lg:items-start"
              >
                <div className="space-y-2.5">
                  <p className="enterprise-kicker">Public product</p>
                  <h3 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">{item.title}</h3>
                  <p className="max-w-[30ch] text-sm leading-7 text-muted-foreground">{item.summary}</p>
                </div>

                <div className="space-y-3">
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">Who it is for:</span> {item.audience}
                  </div>
                  <div className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    <span className="font-semibold">What you get:</span> {item.outcome}
                  </div>
                  <Link href={item.href} className={buttonVariants({ variant: "secondary" })}>
                    {item.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-bleed plane-dark border-t border-white/8 py-12 md:py-14">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/72">Next step</p>
              <h2 className="font-display max-w-[11ch] text-[2.6rem] font-semibold leading-[0.96] text-white md:text-[3.6rem]">
                Move to a call when the situation is easier to explain live.
              </h2>
            </div>

            <div className="space-y-5">
              <p className="max-w-[38ch] text-base leading-7 text-white/80">
                ZoKorp keeps the promise narrow on purpose: direct technical judgment, approved public proof, and clearer scope before work starts.
              </p>
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
        </div>
      </section>
    </div>
  );
}
