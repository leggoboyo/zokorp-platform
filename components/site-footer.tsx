import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { getAppSiteUrl, toMarketingSiteUrl } from "@/lib/site";

const platformLinks = [
  { href: "/software", label: "Software" },
  { href: toMarketingSiteUrl("/services"), label: "Services" },
  { href: toMarketingSiteUrl("/pricing"), label: "Pricing" },
  { href: `${getAppSiteUrl()}/account`, label: "Account" },
];

const resourceLinks = [
  { href: toMarketingSiteUrl("/media"), label: "Media" },
  { href: toMarketingSiteUrl("/about"), label: "About" },
  { href: toMarketingSiteUrl("/contact"), label: "Contact" },
];

const legalLinks = [
  { href: toMarketingSiteUrl("/security"), label: "Security" },
  { href: toMarketingSiteUrl("/privacy"), label: "Privacy" },
  { href: toMarketingSiteUrl("/refunds"), label: "Refunds" },
  { href: toMarketingSiteUrl("/terms"), label: "Terms" },
  { href: toMarketingSiteUrl("/support"), label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[rgb(var(--z-border)/0.55)] bg-[rgb(var(--z-panel))]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6 xl:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <Card tone="plain" className="rounded-[1.4rem] border border-[rgb(var(--z-border)/0.55)] bg-white p-6 shadow-[var(--z-shadow-card)] md:col-span-2 xl:col-span-1">
          <div>
            <Image
              src={PUBLIC_LAUNCH_FOUNDER_PROFILE.logoPath}
              alt="ZoKorp"
              width={983}
              height={316}
              className="h-10 w-auto"
              sizes="128px"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[rgb(var(--z-ink-soft))]">
            Founder-led AWS architecture, AI/ML advisory, readiness support, and software for teams that need clear next steps.
          </p>
          <p className="mt-4 text-sm font-medium text-[rgb(var(--z-ink))]">{PUBLIC_LAUNCH_CONTACT.location}</p>
          <p className="mt-2 text-sm text-[rgb(var(--z-ink-soft))]">
            <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className="underline decoration-[rgb(var(--z-border))] underline-offset-4">
              LinkedIn
            </a>
          </p>
        </Card>

        <section className="space-y-3 rounded-[1.4rem] border border-[rgb(var(--z-border)/0.55)] bg-white p-5 shadow-[var(--z-shadow-card)]">
          <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Offerings</p>
          <ul className="space-y-2 text-sm text-[rgb(var(--z-ink-soft))]">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-[rgb(var(--z-ink))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-[1.4rem] border border-[rgb(var(--z-border)/0.55)] bg-white p-5 shadow-[var(--z-shadow-card)]">
          <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Company</p>
          <ul className="space-y-2 text-sm text-[rgb(var(--z-ink-soft))]">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-[rgb(var(--z-ink))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-[1.4rem] border border-[rgb(var(--z-border)/0.55)] bg-white p-5 shadow-[var(--z-shadow-card)]">
          <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Trust and Support</p>
          <ul className="space-y-2 text-sm text-[rgb(var(--z-ink-soft))]">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-[rgb(var(--z-ink))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-sm font-medium text-[rgb(var(--z-ink))]">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</p>
          <p className="text-xs leading-6 text-[rgb(var(--z-ink-soft))]">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</p>
        </section>
      </div>
      <div className="section-divider mx-auto w-full max-w-7xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-[rgb(var(--z-ink-soft))] md:flex-row md:items-center md:justify-between md:px-6">
        <p>ZoKorp</p>
        <p>(C) {new Date().getFullYear()} ZoKorp. All rights reserved.</p>
      </div>
    </footer>
  );
}
