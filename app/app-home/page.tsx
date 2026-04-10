import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { buildAppPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata: Metadata = buildAppPageMetadata({
  title: "ZoKorp Platform",
  description:
    "The ZoKorp app host is for account access, billing, and product runs. Marketing, services, and trust pages stay on www.zokorp.com.",
  path: "/",
});

const appHostUses = [
  "Account access, billing, and product history",
  "Protected tool runs tied to a verified business email",
  "Software exploration without mixing in the full marketing site",
];

const marketingHostUses = [
  "Services, pricing, and founder background",
  "Privacy, terms, refunds, security, and support pages",
  "Public company browsing without app-account assumptions",
];

export default function AppHomePage() {
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();

  return (
    <div className="enterprise-shell space-y-10 md:space-y-12">
      <section className="overflow-hidden rounded-[2rem] border border-[rgb(var(--z-border)/0.55)] bg-[radial-gradient(circle_at_top_left,#eff6ff_0%,#ffffff_46%,#eef2ff_100%)] px-6 py-8 shadow-[var(--z-shadow-panel)] md:px-8 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:items-start">
          <div>
            <Badge variant="secondary" className="border-slate-200 bg-white text-slate-800">
              ZoKorp app host
            </Badge>
            <h1 className="font-display mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] text-slate-950 md:text-[4rem]">
              Account access and software live here. Company browsing and services stay on{" "}
              <span className="whitespace-nowrap">{new URL(marketingSiteUrl).host}</span>.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-[1.08rem]">
              The app host is intentionally narrower than the marketing site. Use it for sign-in, billing, and
              account-linked tools. Use the public site when you need services, pricing context, founder background,
              or trust-center documentation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/software" className={buttonVariants({ size: "lg" })}>
                Explore software
              </Link>
              <Link href={`${appSiteUrl}/login?callbackUrl=/account`} className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Sign in
              </Link>
              <Link href={`${appSiteUrl}/register`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Create account
              </Link>
              <Link href={`${marketingSiteUrl}/services`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                View services
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card tone="plain" className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-none">
                <CardHeader className="gap-2 px-0">
                  <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">On this host</p>
                  <h2 className="font-display text-2xl font-semibold text-slate-950">App-first surfaces</h2>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                  {appHostUses.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card tone="plain" className="enterprise-dark rounded-[1.5rem] p-5 shadow-none">
                <CardHeader className="gap-2 px-0">
                  <p className="enterprise-kicker text-white/72">On the public site</p>
                  <h2 className="font-display text-2xl font-semibold">Company and services</h2>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                  {marketingHostUses.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-100">
                      {item}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="px-0">
                  <Link href={marketingSiteUrl} className={buttonVariants({ variant: "inverse" })}>
                    Open www.zokorp.com
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          <Card tone="plain" className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
            <div className="grid gap-5 p-5 md:grid-cols-[minmax(240px,300px)_1fr]">
              <div className="portrait-frame relative min-h-[320px] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#dbeafe_0%,#cbd5e1_100%)] md:min-h-[420px]">
                <Image
                  src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                  alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 768px) 100vw, 280px"
                  priority
                />
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Founder</p>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-800">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                  <p className="enterprise-kicker mt-1 text-[rgb(var(--z-ink-label))]">
                    {PUBLIC_LAUNCH_CONTACT.location}
                  </p>
                  <p className="enterprise-copy mt-4 text-sm">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                    <Badge key={credential} variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-800">
                      {credential}
                    </Badge>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Background</p>
                  <p className="mt-2 text-sm leading-7 text-slate-800">
                    {PUBLIC_LAUNCH_FOUNDER_PROFILE.backgroundCompanies.join(" · ")}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={PUBLIC_LAUNCH_CONTACT.linkedInUrl}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    LinkedIn
                  </a>
                  <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    {PUBLIC_LAUNCH_CONTACT.primaryEmail}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
