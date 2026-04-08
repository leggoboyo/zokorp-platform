import Image from "next/image";
import Link from "next/link";

import { SiteHeaderShell } from "@/components/site-header-shell";
import { isPasswordAuthEnabled } from "@/lib/auth-config";
import { PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

const primaryLinks = [
  { href: "/services", label: "Services" },
  { href: "/software", label: "Software" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const secondaryLinks = [
  { href: "/media", label: "Insights" },
  { href: "/support", label: "Support" },
  { href: `${getAppSiteUrl()}/account`, label: "Account" },
];

export function SiteHeader() {
  const authRuntimeReady = isPasswordAuthEnabled() && Boolean(process.env.NEXTAUTH_SECRET);
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[rgba(247,245,241,0.92)] backdrop-blur-xl">
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-2 text-center text-xs tracking-[0.12em] text-slate-100">
        Founder-led AWS architecture, AI/ML advisory, and software delivery.
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6">
        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="font-display inline-flex min-w-0 items-center gap-3 text-slate-950">
            <span className="flex items-center">
              <Image
                src={PUBLIC_LAUNCH_FOUNDER_PROFILE.logoPath}
                alt="ZoKorp"
                width={983}
                height={316}
                className="h-12 w-auto"
                sizes="(max-width: 768px) 128px, 160px"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="hidden text-xs uppercase tracking-[0.18em] text-slate-500 lg:block">Architecture-first consulting and software</span>
            </span>
          </Link>

          <SiteHeaderShell
            primaryLinks={primaryLinks}
            secondaryLinks={secondaryLinks}
            isAdmin={false}
            userEmail={null}
            authRuntimeReady={authRuntimeReady}
            loginHref={`${appSiteUrl}/login?callbackUrl=/software`}
            registerHref={`${appSiteUrl}/register`}
            signOutHref={`${appSiteUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(marketingSiteUrl)}`}
          />
        </div>
      </div>
    </header>
  );
}
