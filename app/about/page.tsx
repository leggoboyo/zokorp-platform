import Image from "next/image";
import Link from "next/link";

import { LearnMore } from "@/components/marketing/learn-more";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { ABOUT_PAGE_CONTENT, MARKETING_TRUST_CHIPS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE, PUBLIC_LAUNCH_PROOF_ASSET } from "@/lib/public-launch-contract";
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
          <Card className="overflow-hidden rounded-[1.85rem] border border-border bg-card shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="grid gap-5 p-4 md:grid-cols-[minmax(220px,280px)_1fr] md:p-5">
              <div className="portrait-frame relative min-h-[320px] md:min-h-[380px]">
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
                  <div className="flex items-center gap-3">
                    <Image
                      src={PUBLIC_LAUNCH_FOUNDER_PROFILE.logoPath}
                      alt="ZoKorp"
                      width={983}
                      height={316}
                      className="h-10 w-auto"
                      sizes="148px"
                    />
                    <div>
                      <p className="enterprise-kicker">Founder</p>
                      <h2 className="font-display text-3xl font-semibold text-card-foreground">
                        {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
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
                      <Badge key={credential} variant="secondary" className="normal-case tracking-normal">
                        {credential}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        }
      />

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="enterprise-kicker">Credibility stack</p>
          <h2 className="font-display max-w-[18ch] text-3xl font-semibold text-foreground md:text-4xl">
            {ABOUT_PAGE_CONTENT.credibilityTitle}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {ABOUT_PAGE_CONTENT.credibilityCards.map((item) => (
            <Card key={item.title} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Verified signal</p>
                <h3 className="font-display text-2xl font-semibold text-card-foreground">{item.title}</h3>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-sm leading-7 text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.7rem] border border-border bg-card p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker">Background</p>
            <h2 className="font-display text-3xl font-semibold text-card-foreground">Named employers, visible certifications, and a small operating model.</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="grid gap-3 sm:grid-cols-3">
              {PUBLIC_LAUNCH_FOUNDER_PROFILE.backgroundCompanies.map((company) => (
                <div key={company} className="rounded-2xl border border-border bg-muted px-4 py-4 text-sm font-semibold text-card-foreground">
                  {company}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-7 text-card-foreground">
              ZoKorp is intentionally small. The public site is there to make scope, trust, and product intent obvious before a buyer has to guess.
            </div>
          </CardContent>
        </Card>

        <Card tone="plain" className="theme-dark rounded-[1.7rem] border border-border p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker">Response posture</p>
            <h2 className="font-display text-3xl font-semibold">Direct contact stays part of the trust model.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
              {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
              {PUBLIC_LAUNCH_CONTACT.primaryHumanPathLabel}
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
              {PUBLIC_LAUNCH_CONTACT.primaryEmail}
            </div>
          </CardContent>
        </Card>
      </section>

      <LearnMore
        title={PUBLIC_LAUNCH_PROOF_ASSET.title}
        summary="Secondary detail belongs behind disclosure, not in the first scan of the page."
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-7 text-card-foreground">
            {PUBLIC_LAUNCH_PROOF_ASSET.summary}
          </div>
          <div className="grid gap-3">
            {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </LearnMore>

      <Card className="rounded-[1.7rem] border border-border bg-card p-6 shadow-none md:p-8">
        <CardHeader className="gap-2 px-0">
          <p className="enterprise-kicker">Next step</p>
          <h2 className="font-display text-3xl font-semibold text-card-foreground">If the trust posture fits, move to the service catalog or book the first call.</h2>
        </CardHeader>
        <CardFooter className="px-0">
          <Link href="/services" className={buttonVariants()}>
            View services
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
            Contact ZoKorp
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
