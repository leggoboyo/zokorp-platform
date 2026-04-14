import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { FounderProfileCard } from "@/components/marketing/founder-profile-card";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getConsultationCta } from "@/lib/marketing-cta";
import { ABOUT_PAGE_CONTENT } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "About ZoKorp",
  description:
    "Founder-led cloud architecture and software for SMB teams that need direct technical judgment.",
  path: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const session = await auth();
  const primaryCta = getConsultationCta({
    signedIn: Boolean(session?.user?.email),
    utmMedium: "about-page",
  });
  const proofTableColumns = {
    "--table-columns": "minmax(0,0.9fr) minmax(0,1.4fr)",
  } as CSSProperties;

  return (
    <div className="marketing-stack">
      <MarketingHero
        mode="poster"
        eyebrow={ABOUT_PAGE_CONTENT.hero.eyebrow}
        title={ABOUT_PAGE_CONTENT.hero.title}
        lede="One founder. Named background. Visible certifications. Houston, TX."
        supportingBullets={[
          PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel,
          PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0],
          PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[1],
          "Small operating model",
        ]}
        primaryAction={primaryCta}
        secondaryAction={{ href: "/services", label: "View services", variant: "secondary" }}
        tertiaryAction={{
          href: PUBLIC_LAUNCH_CONTACT.linkedInUrl,
          label: "LinkedIn",
          variant: "ghost",
          external: true,
          openInNewTab: true,
        }}
        bodyColumnClassName="lg:col-span-6"
        railColumnClassName="lg:col-span-6"
        rail={
          <FounderProfileCard
            eyebrow="Founder"
            name={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
            role={PUBLIC_LAUNCH_FOUNDER_PROFILE.role}
            imageSrc={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
            imageAlt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
            details={[
              {
                label: "Former role",
                value: PUBLIC_LAUNCH_FOUNDER_PROFILE.formerRoleLabel,
                fullWidth: true,
              },
              {
                label: "Credential",
                value: PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0],
                fullWidth: true,
              },
              {
                label: "Location",
                value: PUBLIC_LAUNCH_CONTACT.location.replace("Texas", "TX"),
              },
            ]}
          />
        }
      />

      <section
        className="table-band px-5 py-5 md:px-6"
        style={proofTableColumns}
      >
        <div className="table-head">
          <span>Signal</span>
          <span>Details</span>
        </div>
        {ABOUT_PAGE_CONTENT.proofRows.map((row) => (
          <article key={row.title} className="table-row">
            <div className="space-y-2">
              <h3 className="font-display max-w-[11ch] text-[1.9rem] font-semibold leading-[1.02] text-card-foreground">
                {row.title}
              </h3>
            </div>
            <p className="max-w-[44ch] text-base leading-8 text-card-foreground/86 md:text-[1.08rem]">{row.detail}</p>
          </article>
        ))}
      </section>

      <section className="section-band grid gap-6 px-5 py-6 md:px-6 md:py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-2">
          <p className="enterprise-kicker">Contact</p>
          <h2 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">
            Use the contact form for first reach-out.
          </h2>
          <p className="max-w-[42ch] text-sm leading-7 text-muted-foreground">
            {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
          </p>
        </div>
        <Link href="/contact" className={buttonVariants()}>
          Request a call
        </Link>
      </section>
    </div>
  );
}
