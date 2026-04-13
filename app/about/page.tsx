import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
        tertiaryAction={{ href: PUBLIC_LAUNCH_CONTACT.linkedInUrl, label: "LinkedIn", variant: "ghost", external: true }}
        rail={
          <section className="table-band rounded-[2rem] p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgb(230_237_247),rgb(204_216_232))]">
                <Image
                  src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                  alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 768px) 120px, 112px"
                  priority
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="enterprise-kicker">Founder</p>
                  <h2 className="font-display text-[2rem] font-semibold leading-[0.98] text-card-foreground">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                </div>

                <div className="grid gap-2 border-t border-border/70 pt-3 text-sm text-card-foreground sm:grid-cols-2">
                  <div>{PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0]}</div>
                  <div>{PUBLIC_LAUNCH_CONTACT.location.replace("Texas", "TX")}</div>
                </div>
              </div>
            </div>
          </section>
        }
      />

      <section className="table-band px-5 py-5 md:px-6">
        {ABOUT_PAGE_CONTENT.proofRows.map((row) => (
          <article key={row.title} className="table-row">
            <div className="space-y-2">
              <p className="enterprise-kicker">Proof</p>
              <h3 className="font-display max-w-[11ch] text-[1.9rem] font-semibold leading-[1.02] text-card-foreground">
                {row.title}
              </h3>
            </div>
            <p className="max-w-[40ch] text-sm leading-7 text-muted-foreground">{row.detail}</p>
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
