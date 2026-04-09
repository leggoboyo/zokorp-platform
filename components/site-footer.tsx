import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { getAppSiteUrl } from "@/lib/site";

const platformLinks = [
  { href: "/software", label: "Software" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: `${getAppSiteUrl()}/account`, label: "Account" },
];

const resourceLinks = [
  { href: "/media", label: "Media" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-[#f7f5f1]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6 xl:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <Card tone="plain" className="rounded-[1.4rem] border border-slate-200 bg-white p-6 shadow-none md:col-span-2 xl:col-span-1">
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
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Founder-led AWS architecture, AI/ML advisory, readiness support, and software for teams that need clear next steps.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-900">{PUBLIC_LAUNCH_CONTACT.location}</p>
          <p className="mt-2 text-sm text-slate-600">
            <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className="underline decoration-slate-300 underline-offset-4">
              LinkedIn
            </a>
          </p>
        </Card>

        <section className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Offerings</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Company</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Trust and Support</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-sm font-medium text-slate-700">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</p>
          <p className="text-xs leading-6 text-slate-500">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</p>
        </section>
      </div>
      <div className="section-divider mx-auto w-full max-w-7xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>ZoKorp</p>
        <p>(C) {new Date().getFullYear()} ZoKorp. All rights reserved.</p>
      </div>
    </footer>
  );
}
