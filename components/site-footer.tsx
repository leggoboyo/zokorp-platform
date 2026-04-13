import Image from "next/image";
import Link from "next/link";

import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { getAppSiteUrl, toMarketingSiteUrl } from "@/lib/site";

const platformLinks = [
  { href: "/software", label: "Software" },
  { href: toMarketingSiteUrl("/services"), label: "Services" },
  { href: toMarketingSiteUrl("/pricing"), label: "Pricing" },
  { href: `${getAppSiteUrl()}/account`, label: "Account" },
];

const companyLinks = [
  { href: toMarketingSiteUrl("/about"), label: "About" },
  { href: toMarketingSiteUrl("/contact"), label: "Contact" },
  { href: toMarketingSiteUrl("/media"), label: "Insights" },
];

const trustLinks = [
  { href: toMarketingSiteUrl("/security"), label: "Security" },
  { href: toMarketingSiteUrl("/privacy"), label: "Privacy" },
  { href: toMarketingSiteUrl("/refunds"), label: "Refunds" },
  { href: toMarketingSiteUrl("/terms"), label: "Terms" },
  { href: toMarketingSiteUrl("/support"), label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(243,247,251,0.92))]">
      <div className="marketing-container px-4 py-12 md:px-6 xl:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))] lg:gap-8">
          <section className="space-y-4">
            <Image
              src={PUBLIC_LAUNCH_FOUNDER_PROFILE.logoPath}
              alt="ZoKorp"
              width={983}
              height={316}
              className="h-10 w-auto"
              sizes="128px"
            />
            <p className="measure-copy text-sm leading-6 text-muted-foreground">
              AWS reviews, validation, and scoped follow-through.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <span className="metric-chip">{PUBLIC_LAUNCH_CONTACT.location}</span>
              <span className="metric-chip">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</p>
              <a
                href={PUBLIC_LAUNCH_CONTACT.linkedInUrl}
                className="inline-flex text-sm underline decoration-border underline-offset-4 transition hover:text-foreground"
              >
                LinkedIn
              </a>
            </div>
          </section>

          <section className="space-y-3">
            <p className="enterprise-kicker">Offerings</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <p className="enterprise-kicker">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <p className="enterprise-kicker">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {trustLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="section-divider mx-auto w-full max-w-[1440px]" />
      <div className="marketing-container flex flex-col gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6 xl:px-8">
        <p>ZoKorp</p>
        <p>(C) {new Date().getFullYear()} ZoKorp. All rights reserved.</p>
      </div>
    </footer>
  );
}
