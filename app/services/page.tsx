import Link from "next/link";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceRequestPanel } from "@/components/service-request-panel";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export const metadata = buildMarketingPageMetadata({
  title: "Services",
  description:
    "Founder-led AWS architecture review, cost audit, landing-zone work, advisory, and scoped follow-through for SMB teams.",
  path: "/services",
});

export const dynamic = "force-dynamic";

const primaryServiceSpanMap: Record<string, string> = {
  "architecture-review": "lg:col-span-7",
  "cloud-cost-optimization-audit": "lg:col-span-5",
  "landing-zone-setup": "lg:col-span-5",
  "advisory-retainer": "lg:col-span-7",
};

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
        eyebrow={SERVICES_PAGE_CONTENT.hero.eyebrow}
        title={SERVICES_PAGE_CONTENT.hero.title}
        lede={SERVICES_PAGE_CONTENT.hero.lede}
        supportingBullets={SERVICES_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "#service-request", label: "Request a quote", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <div className="grid gap-4">
            <section className="marketing-panel-dark rounded-[1.8rem] px-5 py-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">What to expect</p>
                  <h2 className="font-display text-2xl font-semibold">Defined scope, direct founder access, and visible next steps.</h2>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    {PUBLIC_LAUNCH_POLICY_NOTES.services}
                  </div>
                </div>
              </div>
            </section>

            <section className="marketing-panel rounded-[1.8rem] px-5 py-5">
              <div className="space-y-3">
                <p className="enterprise-kicker">Scope posture</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="marketing-kpi border-t border-border">
                    <span className="marketing-kpi-value">4</span>
                    <span className="marketing-kpi-label">Primary offers</span>
                  </div>
                  <div className="marketing-kpi border-t border-border">
                    <span className="marketing-kpi-value">1</span>
                    <span className="marketing-kpi-label">Business-day reply window</span>
                  </div>
                  <div className="marketing-kpi border-t border-border">
                    <span className="marketing-kpi-value">0</span>
                    <span className="marketing-kpi-label">Fake proof signals</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Primary services"
          title={SERVICES_PAGE_CONTENT.primaryTitle}
          description={SERVICES_PAGE_CONTENT.primaryIntro}
          aside={
            <div className="flex flex-wrap gap-2.5">
              <span className="metric-chip">Visible price anchors</span>
              <span className="metric-chip">Founder-led delivery</span>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-12">
          {PRIMARY_CONSULTING_OFFERS.map((service, index) => (
            <article
              key={service.slug}
              className={cn(
                "marketing-panel flex flex-col gap-6 px-5 py-6 md:px-6 md:py-7",
                primaryServiceSpanMap[service.slug],
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="enterprise-kicker">{service.eyebrow}</p>
                  <h3 className="font-display max-w-[13ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                    {service.title}
                  </h3>
                </div>

                <div className="space-y-2 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-label">{`0${index + 1}`}</p>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {service.priceAnchor}
                  </Badge>
                </div>
              </div>

              <p className="measure-copy text-sm leading-7 text-muted-foreground">{service.summary}</p>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)]">
                <div className="space-y-3">
                  <p className="enterprise-kicker">Why teams buy it</p>
                  <ul className="marketing-list">
                    {service.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="marketing-panel-muted rounded-[1.4rem] px-4 py-4">
                  <p className="enterprise-kicker">What you get</p>
                  <div className="mt-3 grid gap-2.5">
                    {service.included.map((item) => (
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-end">
          <div className="space-y-3">
            <p className="enterprise-kicker">How work moves</p>
            <h2 className="font-display max-w-[14ch] text-3xl font-semibold text-foreground md:text-4xl">
              Reviews first. Broader work only when the path is specific enough to scope.
            </h2>
          </div>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            The service model is intentionally narrow because a tighter buying path creates more trust than a broad services menu.
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

      <LearnMore
        title={SERVICES_PAGE_CONTENT.secondaryTitle}
        summary={SERVICES_PAGE_CONTENT.secondarySummary}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {SECONDARY_CONSULTING_OFFERS.map((service) => (
            <article key={service.slug} className="marketing-panel rounded-[1.5rem] px-5 py-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{service.eyebrow}</p>
                    <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-card-foreground">
                      {service.title}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {service.priceAnchor}
                  </Badge>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">{service.summary}</p>
                <ul className="marketing-list">
                  {service.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}

          <article className="marketing-panel rounded-[1.5rem] px-5 py-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="enterprise-kicker">Specialist note</p>
                  <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-card-foreground">
                    {SPECIALIST_ADVISORY.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="normal-case tracking-normal">
                  {SPECIALIST_ADVISORY.priceAnchor}
                </Badge>
              </div>

              <p className="text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
              <ul className="marketing-list">
                {SPECIALIST_ADVISORY.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </LearnMore>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start" id="service-request">
        <div className="space-y-4">
          <p className="enterprise-kicker">{SERVICES_PAGE_CONTENT.requestTitle}</p>
          <h2 className="font-display max-w-[14ch] text-3xl font-semibold text-foreground md:text-4xl">
            Use the structured request form when you already need a scoped response.
          </h2>
          <p className="marketing-section-copy text-base leading-7 text-muted-foreground">
            {SERVICES_PAGE_CONTENT.requestIntro}
          </p>
          <div className="marketing-panel-dark rounded-[1.7rem] px-5 py-5">
            <p className="enterprise-kicker">Fastest path</p>
            <p className="mt-3 text-sm leading-7 text-white/82">
              If the situation is easier to explain live, use the call first. If the scope is already defined, use the form.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants()}>
                Book a call
              </a>
              <Link href="/pricing" className={buttonVariants({ variant: "inverse" })}>
                See pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="marketing-panel rounded-[1.9rem] p-4 md:p-5">
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
