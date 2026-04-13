import Image from "next/image";
import Link from "next/link";

import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSectionHeading } from "@/components/marketing/section-heading";
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
        mode="poster"
        eyebrow={ABOUT_PAGE_CONTENT.hero.eyebrow}
        title={ABOUT_PAGE_CONTENT.hero.title}
        lede={ABOUT_PAGE_CONTENT.hero.lede}
        supportingBullets={ABOUT_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{ href: PUBLIC_LAUNCH_CONTACT.linkedInUrl, label: "LinkedIn", variant: "ghost", external: true }}
        rail={
          <div className="grid gap-5">
            <section className="plane-dark rounded-[2.4rem] border border-white/8 p-4 shadow-[0_30px_70px_rgba(10,18,34,0.18)] md:p-5">
              <div className="grid gap-5 md:grid-cols-[minmax(220px,260px)_1fr] md:items-end">
                <div className="portrait-frame relative min-h-[320px] overflow-hidden rounded-[2rem] md:min-h-[390px]">
                  <Image
                    src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                    alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    fill
                    className="object-cover object-[center_12%]"
                    sizes="(max-width: 768px) 100vw, 280px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/18 via-transparent to-transparent" />
                </div>
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="enterprise-kicker text-white/72">Founder</p>
                      <h2 className="font-display text-[2.2rem] font-semibold leading-[0.98] text-white">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                      </h2>
                      <p className="text-sm font-medium text-white/66">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                    </div>

                    <p className="text-sm leading-7 text-white/80">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                  </div>

                  <div className="grid gap-2">
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/68">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel}
                    </div>
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/68">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.currentRoleLabel}
                    </div>
                    <div className="border-t border-white/12 pt-2 text-xs uppercase tracking-[0.14em] text-white/68">
                      {PUBLIC_LAUNCH_CONTACT.location}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section-band px-5 py-5 md:px-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                  <div key={credential} className="border-t border-border/80 pt-3 text-sm leading-6 text-card-foreground">
                    {credential}
                  </div>
                ))}
              </div>
            </section>
          </div>
        }
      />

      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow="Credibility stack"
          title={ABOUT_PAGE_CONTENT.credibilityTitle}
          description="The public proof stays intentionally narrow: named founder, named background, visible certifications, a real location, and a direct human path."
        />

        <div className="section-band px-5 py-5 md:px-6">
          {ABOUT_PAGE_CONTENT.credibilityCards.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-5 border-t border-border/80 py-5 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.58fr)_minmax(0,1fr)] lg:items-start"
            >
              <div className="hidden lg:block lg:pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
              </div>
              <div className="space-y-2">
                <p className="enterprise-kicker">Verified signal</p>
                <h3 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                  {item.title}
                </h3>
              </div>
              <p className="max-w-[40ch] text-sm leading-7 text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="section-band px-5 py-6 md:px-6 md:py-7">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="enterprise-kicker">Background</p>
              <h2 className="font-display max-w-[12ch] text-[2.5rem] font-semibold leading-[0.98] text-foreground md:text-[3.4rem]">
                Named employers, visible certifications, and a small operating model.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {PUBLIC_LAUNCH_FOUNDER_PROFILE.backgroundCompanies.map((company) => (
                <div key={company} className="border-t border-border/80 pt-3 text-sm font-semibold text-card-foreground">
                  {company}
                </div>
              ))}
            </div>

            <p className="marketing-section-copy text-sm leading-7 text-muted-foreground">
              ZoKorp stays intentionally small so the public site, service model, and product layer all align around the same promise: direct technical judgment and clearer scope before work begins.
            </p>
          </div>
        </article>

        <article className="plane-dark rounded-[2.1rem] border border-white/8 px-6 py-6 md:px-7">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="enterprise-kicker text-white/72">Response posture</p>
              <h2 className="font-display max-w-[10ch] text-[2.35rem] font-semibold leading-[0.98] text-white">
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

      <section className="plane-dark rounded-[2.3rem] border border-white/8 px-6 py-7 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-3">
            <p className="enterprise-kicker text-white/72">{PUBLIC_LAUNCH_PROOF_ASSET.title}</p>
            <h2 className="font-display max-w-[11ch] text-[2.3rem] font-semibold leading-[0.98] text-white md:text-[3rem]">
              The trust model stays intentionally narrow and directly stated.
            </h2>
            <p className="max-w-[36ch] text-sm leading-7 text-white/80">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
          </div>

          <div className="grid gap-3">
            {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
              <div key={item} className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-bleed plane-dark border-t border-white/8 py-12 md:py-14">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/72">Next step</p>
              <h2 className="font-display max-w-[13ch] text-[2.4rem] font-semibold leading-[0.98] text-white md:text-[3.4rem]">
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
        </div>
      </section>
    </div>
  );
}
