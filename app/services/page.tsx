import Link from "next/link";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { ServiceRequestPanel } from "@/components/service-request-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
        eyebrow={SERVICES_PAGE_CONTENT.hero.eyebrow}
        title={SERVICES_PAGE_CONTENT.hero.title}
        lede={SERVICES_PAGE_CONTENT.hero.lede}
        supportingBullets={SERVICES_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "#service-request", label: "Request a quote", variant: "secondary" }}
        tertiaryAction={{ href: "/pricing", label: "See pricing", variant: "ghost" }}
        rail={
          <Card tone="plain" className="theme-dark rounded-[1.85rem] border border-border p-6 shadow-none md:p-7">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker">What to expect</p>
              <h2 className="font-display text-2xl font-semibold">Defined scope, direct founder access, and visible next steps.</h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {PUBLIC_LAUNCH_POLICY_NOTES.services}
              </div>
            </CardContent>
          </Card>
        }
      />

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Primary services</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl">
            {SERVICES_PAGE_CONTENT.primaryTitle}
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            {SERVICES_PAGE_CONTENT.primaryIntro}
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {PRIMARY_CONSULTING_OFFERS.map((service) => (
            <Card key={service.slug} className="rounded-[1.7rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-3 px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{service.eyebrow}</p>
                    <h3 className="font-display text-3xl font-semibold text-card-foreground">{service.title}</h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {service.priceAnchor}
                  </Badge>
                </div>
                <p className="measure-copy text-sm leading-7 text-muted-foreground">{service.summary}</p>
              </CardHeader>
              <CardContent className="space-y-5 px-0">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground-label">What you get</h4>
                  <div className="mt-3 grid gap-2">
                    {service.included.map((item) => (
                      <div key={item} className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground-label">Why teams buy it</h4>
                  <div className="mt-3 grid gap-2">
                    {service.bullets.map((item) => (
                      <div key={item} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-card-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <LearnMore
        title={SERVICES_PAGE_CONTENT.secondaryTitle}
        summary={SERVICES_PAGE_CONTENT.secondarySummary}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {SECONDARY_CONSULTING_OFFERS.map((service) => (
            <Card key={service.slug} className="rounded-[1.5rem] border border-border bg-background p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="enterprise-kicker">{service.eyebrow}</p>
                    <h3 className="font-display text-2xl font-semibold text-card-foreground">{service.title}</h3>
                  </div>
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {service.priceAnchor}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{service.summary}</p>
              </CardHeader>
              <CardContent className="space-y-2 px-0">
                {service.bullets.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="rounded-[1.5rem] border border-border bg-background p-5 shadow-none">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker">Specialist note</p>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold text-card-foreground">{SPECIALIST_ADVISORY.title}</h3>
                <Badge variant="secondary" className="normal-case tracking-normal">
                  {SPECIALIST_ADVISORY.priceAnchor}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{SPECIALIST_ADVISORY.summary}</p>
            </CardHeader>
            <CardContent className="space-y-2 px-0">
              {SPECIALIST_ADVISORY.bullets.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </LearnMore>

      <section className="grid gap-4 lg:grid-cols-4">
        {DELIVERY_PROCESS_STEPS.map((step, index) => (
          <Card key={step.title} className="rounded-[1.5rem] border border-border bg-card p-5 shadow-none">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker">{`0${index + 1}`}</p>
              <h2 className="font-display text-2xl font-semibold text-card-foreground">{step.title}</h2>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-sm leading-7 text-muted-foreground">{step.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4" id="service-request">
        <div className="space-y-3">
          <p className="enterprise-kicker">{SERVICES_PAGE_CONTENT.requestTitle}</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl">
            Use the structured request form when you already need a scoped response.
          </h2>
          <p className="measure-copy text-base leading-7 text-muted-foreground">
            {SERVICES_PAGE_CONTENT.requestIntro}
          </p>
        </div>

        <ServiceRequestPanel
          signedIn={Boolean(session?.user?.email)}
          currentEmail={session?.user?.email ?? null}
          loginHref={`${appSiteUrl}/login?callbackUrl=/services`}
          registerHref={`${appSiteUrl}/register`}
          accountHref={`${appSiteUrl}/account`}
        />
      </section>

      <Card tone="plain" className="theme-dark rounded-[1.8rem] border border-border p-6 shadow-none md:p-8">
        <CardHeader className="gap-2 px-0">
          <p className="enterprise-kicker">Need a faster path?</p>
          <h2 className="font-display text-3xl font-semibold">Book a call when the right next step is easier to explain live.</h2>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <p className="measure-copy text-sm leading-7 text-muted-foreground">
            The public catalog is there to reduce ambiguity. The call is there when context matters more than another paragraph.
          </p>
        </CardContent>
        <CardFooter className="px-0">
          <a href={bookingUrl} className={buttonVariants()}>
            Book a call
          </a>
          <Link href="/pricing" className={buttonVariants({ variant: "inverse" })}>
            See pricing
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
