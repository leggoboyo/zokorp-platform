import Link from "next/link";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceOfferRow } from "@/components/marketing/service-offer-row";
import { ServiceRequestPanel } from "@/components/service-request-panel";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import {
  DELIVERY_PROCESS_STEPS,
  MARKETING_TRUST_CHIPS,
  PRIMARY_CONSULTING_OFFERS,
  SECONDARY_CONSULTING_OFFERS,
  SERVICES_PAGE_CONTENT,
  SPECIALIST_ADVISORY,
} from "@/lib/marketing-content";
import {
  PUBLIC_LAUNCH_CONTACT,
  PUBLIC_LAUNCH_FOUNDER_PROFILE,
  PUBLIC_LAUNCH_POLICY_NOTES,
} from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Services",
  description:
    "Founder-led AWS architecture review, cost audit, landing-zone work, advisory, and scoped follow-through for SMB teams.",
  path: "/services",
});

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await auth();
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "services-page",
  });

  return (
    <div className="marketing-stack">
      <MarketingHero
        mode="poster"
        eyebrow={SERVICES_PAGE_CONTENT.hero.eyebrow}
        title={SERVICES_PAGE_CONTENT.hero.title}
        lede={SERVICES_PAGE_CONTENT.hero.lede}
        supportingBullets={SERVICES_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "#service-request", label: "Request a quote", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <div className="grid gap-5">
            <section className="plane-dark rounded-[2.3rem] border border-white/8 px-5 py-5 md:px-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="space-y-3">
                  <p className="enterprise-kicker text-white/72">Scope posture</p>
                  <h2 className="font-display max-w-[9ch] text-[2.2rem] font-semibold leading-[0.96] text-white">
                    Defined scope, direct founder access, and visible next steps.
                  </h2>
                </div>
                <div className="grid gap-2 text-sm text-white/74">
                  <div className="border-t border-white/12 pt-2">{PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}</div>
                  <div className="border-t border-white/12 pt-2">{PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}</div>
                  <div className="border-t border-white/12 pt-2">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</div>
                </div>
              </div>
            </section>

            <section className="section-band px-5 py-5 md:px-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">4</p>
                  <p className="marketing-kpi-label">Primary offers</p>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">1</p>
                  <p className="marketing-kpi-label">Business-day reply window</p>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <p className="marketing-kpi-value text-card-foreground">0</p>
                  <p className="marketing-kpi-label">Open-ended fluff</p>
                </div>
              </div>
            </section>
          </div>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Primary services"
          title="Choose the starting point, not a generic bundle."
          description={SERVICES_PAGE_CONTENT.primaryIntro}
          aside={
            <div className="flex flex-wrap gap-2.5">
              <span className="metric-chip">Visible price anchors</span>
              <span className="metric-chip">Founder-led delivery</span>
            </div>
          }
        />

        <div className="section-band px-5 py-6 md:px-6 md:py-7">
          {PRIMARY_CONSULTING_OFFERS.map((service, index) => (
            <ServiceOfferRow
              key={service.slug}
              eyebrow={service.eyebrow}
              title={service.title}
              priceAnchor={service.priceAnchor}
              summary={service.summary}
              bullets={service.bullets}
              included={service.included}
              index={index + 1}
              compact
            />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="space-y-5">
          <p className="enterprise-kicker">How work moves</p>
          <h2 className="font-display max-w-[12ch] text-[2.5rem] font-semibold leading-[0.98] text-foreground md:text-[3.4rem]">
            Reviews first. Broader work only when the path is specific enough to scope.
          </h2>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            The service model stays narrow because a tighter buying path creates more trust than a long services menu.
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

      <LearnMore
        title={SERVICES_PAGE_CONTENT.secondaryTitle}
        summary={SERVICES_PAGE_CONTENT.secondarySummary}
      >
        <div className="section-band px-5 py-5 md:px-6">
          {SECONDARY_CONSULTING_OFFERS.map((service) => (
            <ServiceOfferRow
              key={service.slug}
              eyebrow={service.eyebrow}
              title={service.title}
              priceAnchor={service.priceAnchor}
              summary={service.summary}
              bullets={service.bullets}
              included={service.included}
              compact
            />
          ))}

          <article className="grid gap-6 border-t border-border/80 py-6 lg:grid-cols-[auto_minmax(0,0.48fr)_minmax(0,1fr)_auto] lg:items-start">
            <div className="hidden lg:block lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">Note</p>
            </div>
            <div className="space-y-2">
              <p className="enterprise-kicker">Specialist note</p>
              <h3 className="font-display max-w-[12ch] text-[1.8rem] font-semibold leading-[1.02] text-card-foreground">
                {SPECIALIST_ADVISORY.title}
              </h3>
              <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
            </div>
            <ul className="marketing-list">
              {SPECIALIST_ADVISORY.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="flex items-start lg:justify-end">
              <span className="metric-chip">{SPECIALIST_ADVISORY.priceAnchor}</span>
            </div>
          </article>
        </div>
      </LearnMore>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start" id="service-request">
        <div className="space-y-4">
          <p className="enterprise-kicker">{SERVICES_PAGE_CONTENT.requestTitle}</p>
          <h2 className="font-display max-w-[12ch] text-[2.5rem] font-semibold leading-[0.98] text-foreground md:text-[3.4rem]">
            Use the structured request form when you already need a scoped response.
          </h2>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            {SERVICES_PAGE_CONTENT.requestIntro}
          </p>
          <div className="plane-dark rounded-[2rem] border border-white/8 px-5 py-5">
            <p className="enterprise-kicker text-white/72">Fastest path</p>
            <p className="mt-3 text-sm leading-7 text-white/80">
              If the situation is easier to explain live, use the call first. If the scope is already defined, use the form.
            </p>
            <p className="mt-3 text-sm leading-7 text-white/80">{PUBLIC_LAUNCH_POLICY_NOTES.services}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants()}>
                Book a call
              </a>
              <Link href="/pricing" className={buttonVariants({ variant: "inverse" })}>
                See pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="section-band p-4 md:p-5">
          <ServiceRequestPanel
            signedIn={Boolean(session?.user?.email)}
            currentEmail={session?.user?.email ?? null}
            loginHref={`${appSiteUrl}/login?callbackUrl=/services`}
            registerHref={`${appSiteUrl}/register`}
            accountHref={`${appSiteUrl}/account`}
          />
        </div>
      </section>
    </div>
  );
}
