import Image from "next/image";
import Link from "next/link";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ABOUT_PAGE_CONTENT, MARKETING_TRUST_CHIPS } from "@/lib/marketing-content";
import {
  PUBLIC_LAUNCH_CONTACT,
  PUBLIC_LAUNCH_FOUNDER_PROFILE,
  PUBLIC_LAUNCH_PROOF_ASSET,
} from "@/lib/public-launch-contract";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { buildMarketingPageMetadata, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "About ZoKorp",
  description:
    "Former AWS. Currently at Microsoft. Founder-led AWS architecture and software for SMB teams that need direct technical judgment.",
  path: "/about",
});

export default function AboutPage() {
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${getMarketingSiteUrl()}/services#service-request`,
    utmMedium: "about-page",
  });

  return (
    <div className="marketing-stack">
      <MarketingHero
        eyebrow={ABOUT_PAGE_CONTENT.hero.eyebrow}
        title={ABOUT_PAGE_CONTENT.hero.title}
        lede={ABOUT_PAGE_CONTENT.hero.lede}
        supportingBullets={ABOUT_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{ href: PUBLIC_LAUNCH_CONTACT.linkedInUrl, label: "LinkedIn", variant: "ghost", external: true }}
        rail={
          <section className="marketing-panel overflow-hidden rounded-[2rem]">
            <div className="grid gap-5 p-5 md:grid-cols-[minmax(220px,280px)_1fr] md:p-6">
              <div className="portrait-frame relative min-h-[320px] md:min-h-[390px]">
                <Image
                  src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                  alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 768px) 100vw, 280px"
                  priority
                />
              </div>

              <div className="flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <p className="enterprise-kicker">Founder</p>
                    <h2 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
                    </Badge>
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
                    </Badge>
                    <Badge variant="secondary" className="normal-case tracking-normal">
                      {PUBLIC_LAUNCH_CONTACT.location}
                    </Badge>
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
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Credibility stack"
          title={ABOUT_PAGE_CONTENT.credibilityTitle}
          description="The public proof stays intentionally narrow: named founder, named background, visible certifications, a real location, and a direct human path."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {ABOUT_PAGE_CONTENT.credibilityCards.map((item) => (
            <article key={item.title} className="marketing-panel h-full px-5 py-6 md:px-6">
              <div className="space-y-4">
                <p className="enterprise-kicker">Verified signal</p>
                <h3 className="font-display max-w-[12ch] text-[1.9rem] font-semibold leading-[1.04] text-card-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="section-band px-5 py-6 md:px-6 md:py-7">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="enterprise-kicker">Background</p>
              <h2 className="font-display max-w-[14ch] text-3xl font-semibold text-foreground md:text-4xl">
                Named employers, visible certifications, and a small operating model.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {PUBLIC_LAUNCH_FOUNDER_PROFILE.backgroundCompanies.map((company) => (
                <div key={company} className="marketing-panel rounded-[1.35rem] px-4 py-4 text-sm font-semibold text-card-foreground">
                  {company}
                </div>
              ))}
            </div>

            <p className="marketing-section-copy text-sm leading-7 text-muted-foreground">
              ZoKorp stays intentionally small so the public site, service model, and product layer all align around the same promise: direct technical judgment and clearer scope before work begins.
            </p>
          </div>
        </article>

        <article className="marketing-panel-dark rounded-[1.9rem] px-6 py-6 md:px-7">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="enterprise-kicker">Response posture</p>
              <h2 className="font-display max-w-[12ch] text-3xl font-semibold leading-[1.04]">
                Direct contact stays part of the trust model.
              </h2>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                {PUBLIC_LAUNCH_CONTACT.primaryHumanPathLabel}
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                {PUBLIC_LAUNCH_CONTACT.primaryEmail}
              </div>
            </div>
          </div>
        </article>
      </section>

      <LearnMore
        title={PUBLIC_LAUNCH_PROOF_ASSET.title}
        summary="Secondary detail belongs behind disclosure, not in the first scan of the page."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="marketing-panel rounded-[1.5rem] px-5 py-5">
            <p className="text-sm leading-7 text-card-foreground">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
          </div>
          <div className="grid gap-3">
            {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
              <div key={item} className="marketing-panel rounded-[1.35rem] px-4 py-4 text-sm text-card-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </LearnMore>

      <section className="marketing-panel-dark rounded-[2rem] px-6 py-7 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="space-y-3">
            <p className="enterprise-kicker">Next step</p>
            <h2 className="font-display max-w-[13ch] text-[2.2rem] font-semibold leading-[1.02] md:text-[2.8rem]">
              If the operating model fits, move to the service catalog or book the first call.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/services" className={buttonVariants()}>
              View services
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "inverse" })}>
              Contact ZoKorp
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
