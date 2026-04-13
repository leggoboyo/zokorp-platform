import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingHero } from "@/components/marketing/marketing-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
        eyebrow={HOME_PAGE_CONTENT.hero.eyebrow}
        title={HOME_PAGE_CONTENT.hero.title}
        lede={HOME_PAGE_CONTENT.hero.lede}
        supportingBullets={HOME_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <>
            <Card className="overflow-hidden rounded-[1.85rem] border border-border bg-card shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="grid gap-5 p-4 md:grid-cols-[minmax(220px,270px)_1fr] md:p-5">
                <div className="portrait-frame relative min-h-[320px] md:min-h-[360px]">
                  <Image
                    src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                    alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    fill
                    className="object-cover object-[center_12%]"
                    sizes="(max-width: 768px) 100vw, 280px"
                    priority
                  />
                </div>

                <div className="flex flex-col justify-between gap-4 py-2">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="enterprise-kicker">Founder</p>
                      <h2 className="font-display text-3xl font-semibold text-card-foreground">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                      </h2>
                      <p className="text-sm font-medium text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="normal-case tracking-normal">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
                      </Badge>
                      <Badge variant="secondary" className="normal-case tracking-normal">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
                      </Badge>
                    </div>

                    <p className="text-sm leading-7 text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                        <Badge key={credential} variant="secondary" className="normal-case tracking-normal">
                          {credential}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        LinkedIn
                      </a>
                      <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        Email ZoKorp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card tone="plain" className="theme-dark rounded-[1.85rem] border border-border p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Why buyers trust the first conversation</p>
                <h2 className="font-display text-2xl font-semibold">{PUBLIC_LAUNCH_PROOF_ASSET.title}</h2>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                <p className="text-sm leading-7 text-muted-foreground">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
                {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        }
      />

      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-8">
          <div className="space-y-3">
            <p className="enterprise-kicker">Primary services</p>
            <h2 className="font-display max-w-[18ch] text-3xl font-semibold text-foreground md:text-4xl">
              {HOME_PAGE_CONTENT.offersTitle}
            </h2>
            <p className="measure-copy text-base leading-7 text-muted-foreground">
              {HOME_PAGE_CONTENT.offersIntro}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PRIMARY_CONSULTING_OFFERS.map((offer) => (
              <Card key={offer.slug} className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
                <CardHeader className="gap-3 px-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="enterprise-kicker">{offer.eyebrow}</p>
                      <h3 className="font-display text-2xl font-semibold text-card-foreground">{offer.title}</h3>
                    </div>
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {offer.priceAnchor}
                    </Badge>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{offer.summary}</p>
                </CardHeader>
                <CardContent className="space-y-2 px-0">
                  {offer.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
                      {bullet}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card tone="plain" className="theme-dark rounded-[1.8rem] border border-border p-6 shadow-none lg:col-span-4">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker">How work starts</p>
            <h2 className="font-display text-3xl font-semibold">Structured on purpose.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {DELIVERY_PROCESS_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card px-4 py-4">
                <p className="enterprise-kicker">{`0${index + 1}`}</p>
                <h3 className="mt-2 text-lg font-semibold text-card-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-0">
            <Link href="/services" className={buttonVariants({ variant: "inverse" })}>
              See all services
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Software</p>
          <h2 className="font-display max-w-[18ch] text-3xl font-semibold text-foreground md:text-4xl">
            {HOME_PAGE_CONTENT.softwareTitle}
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            {HOME_PAGE_CONTENT.softwareIntro}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {SOFTWARE_HIGHLIGHTS.map((item) => (
            <Card key={item.href} className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Public product</p>
                <h3 className="font-display text-2xl font-semibold text-card-foreground">{item.title}</h3>
              </CardHeader>
              <CardContent className="space-y-4 px-0">
                <p className="text-sm leading-7 text-muted-foreground">{item.summary}</p>
                <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
                  <span className="font-semibold">Who it is for:</span> {item.audience}
                </div>
                <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
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

      <Card tone="plain" className="theme-dark rounded-[1.9rem] border border-border p-6 shadow-none md:p-8">
        <CardHeader className="gap-3 px-0">
          <p className="enterprise-kicker">Next step</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold md:text-4xl">
            {HOME_PAGE_CONTENT.finalCtaTitle}
          </h2>
        </CardHeader>
        <CardContent className="grid gap-3 px-0 md:grid-cols-3">
          {HOME_PAGE_CONTENT.finalCtaBullets.map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
              {item}
            </div>
          ))}
        </CardContent>
        <CardFooter className="px-0">
          <a href={bookingUrl} className={buttonVariants()}>
            Book a call
          </a>
          <Link href="/contact" className={buttonVariants({ variant: "inverse" })}>
            Contact ZoKorp
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
