import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { CONSULTING_OFFERS, DELIVERY_PROCESS_STEPS, SOFTWARE_HIGHLIGHTS } from "@/lib/marketing-content";
import {
  PUBLIC_LAUNCH_CONTACT,
  PUBLIC_LAUNCH_FOUNDER_PROFILE,
  PUBLIC_LAUNCH_PROOF_ASSET,
} from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "Founder-Led AWS Architecture, Validation, and Optimization",
  description:
    "Founder-led AWS architecture, validation, optimization, and software for SMB teams that need a clear next step without forced signup.",
  path: "/",
});

const trustSignals = [
  "Founder-led AWS architecture guidance",
  "AWS SA Pro, ML Specialty, Security Specialty",
  "Direct founder involvement instead of a sales handoff chain",
  "Public browsing on www, protected tool runs on app",
];

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
    <div className="enterprise-shell space-y-12 md:space-y-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="rounded-[2rem] border border-[rgb(var(--z-border)/0.55)] bg-[image:var(--z-gradient-hero)] px-6 py-8 shadow-[var(--z-shadow-panel)] md:px-8 md:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-start">
          <div
            data-surface="hero-copy"
            className="rounded-[1.75rem] bg-[rgb(var(--z-panel))] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)] md:p-7"
          >
            <Badge variant="secondary" className="border-slate-200 bg-white/90 text-slate-700">
              Founder-led AWS consultancy + software
            </Badge>
            <h1 className="font-display mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] text-slate-950 md:text-[4.25rem]">
              AWS architecture, validation, and optimization for SMB teams that need a clear next step.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-[1.1rem]">
              ZoKorp helps teams move from architecture questions to a tighter next step: a review, a fixed-scope
              validation, a cost audit, a landing-zone setup, a scoped implementation task, or a light advisory
              retainer. Public browsing stays open, and software supports the work instead of replacing it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="/software" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Explore software
              </Link>
              <Link href="/services#service-request" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Get a quote
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-[rgb(var(--z-border)/0.45)] bg-white/88 px-4 py-3 text-sm font-medium text-[rgb(var(--z-ink-soft))] backdrop-blur-sm"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card tone="plain" className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-[0_24px_44px_rgba(15,23,42,0.08)]">
              <div className="grid gap-5 p-4 md:grid-cols-[minmax(240px,300px)_1fr] md:p-5">
                <div className="portrait-frame relative min-h-[340px] overflow-hidden rounded-[1.45rem] bg-[linear-gradient(180deg,#e2e8f4_0%,#cad4e5_100%)] md:min-h-[420px]">
                  <Image
                    src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                    alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    fill
                    className="object-cover object-[center_12%]"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-between py-2 pr-2">
                  <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Founder</p>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-700">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                  <p className="enterprise-kicker mt-1 text-[rgb(var(--z-ink-label))]">{PUBLIC_LAUNCH_CONTACT.location}</p>
                  <p className="enterprise-copy mt-4 text-sm">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                      <Badge key={credential} variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                        {credential}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={PUBLIC_LAUNCH_CONTACT.linkedInUrl}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      LinkedIn
                    </a>
                    <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      {PUBLIC_LAUNCH_CONTACT.primaryEmail}
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card tone="plain" className="enterprise-dark rounded-[1.85rem] p-6 shadow-[0_24px_44px_rgba(15,23,42,0.14)]">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker text-white/72">Why buyers trust it</p>
                <h2 className="font-display text-2xl font-semibold">{PUBLIC_LAUNCH_PROOF_ASSET.title}</h2>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                <p className="text-sm leading-7 text-slate-200">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
                {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-slate-100">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Flagship offer</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Architecture review first. Remediation when the next step is obvious.
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <p className="enterprise-copy text-sm md:text-base">
              ZoKorp is built for teams that need a serious technical review, a fixed-scope validation path, and
              founder-led follow-through when the work is worth doing. The entry point stays intentionally narrow:
              start with the review, then buy only the next service that fits the real issue.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CONSULTING_OFFERS.slice(0, 3).map((offer) => (
                <div key={offer.slug} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">{offer.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{offer.title}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-700">{offer.priceAnchor}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="px-0">
            <Link href="/services" className={buttonVariants()}>
              View services
            </Link>
          </CardFooter>
        </Card>

        <Card tone="plain" className="enterprise-dark rounded-[1.8rem] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-white/72">Public pricing posture</p>
            <h2 className="font-display text-3xl font-semibold">Visible anchors without pretending every job is fixed-scope.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {CONSULTING_OFFERS.map((offer) => (
              <div key={offer.slug} className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-100">{offer.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{offer.summary}</p>
                </div>
                <p className="text-sm font-semibold text-white sm:max-w-[13rem] sm:text-right">{offer.priceAnchor}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-0">
            <Link href="/pricing" className={buttonVariants({ variant: "inverse" })}>
              Review pricing
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Services</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Six clear AWS offers. No filler, no vague transformation language.</h2>
          </div>
          <a href={bookingUrl} className={buttonVariants({ variant: "secondary" })}>
            Book a call
          </a>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {CONSULTING_OFFERS.map((offer) => (
            <Card tone="plain" key={offer.slug} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">{offer.eyebrow}</p>
                <h3 className="font-display text-2xl font-semibold text-slate-950">{offer.title}</h3>
                <p className="text-sm font-medium text-slate-700">{offer.priceAnchor}</p>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                <p className="enterprise-copy text-sm">{offer.summary}</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {offer.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Software</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Software stays visible, but it does not replace the consulting story.</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <p className="enterprise-copy text-sm md:text-base">
              The software side of ZoKorp exists to remove repetitive review work, preserve account-linked history,
              and make follow-through easier to understand. It supports the consulting model instead of pretending to
              replace it.
            </p>
            <div className="space-y-3">
              {SOFTWARE_HIGHLIGHTS.map((item) => (
                <div key={item.href} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <p className="enterprise-copy mt-1 text-sm">{item.summary}</p>
                    </div>
                    <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      {item.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">How engagements run</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Lower SLA, tighter scope, and direct founder involvement.</h2>
          </CardHeader>
          <CardContent className="grid gap-4 px-0 md:grid-cols-2">
            {DELIVERY_PROCESS_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="enterprise-copy mt-2 text-sm">{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
