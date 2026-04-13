import Image from "next/image";
import Link from "next/link";

import { SiteHeaderShell } from "@/components/site-header-shell";
import { isPasswordAuthEnabled } from "@/lib/auth-config";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { getAppSiteUrl, getMarketingSiteUrl, toMarketingSiteUrl } from "@/lib/site";

const primaryLinks = [
  { href: toMarketingSiteUrl("/services"), label: "Services" },
  { href: "/software", label: "Software" },
  { href: toMarketingSiteUrl("/pricing"), label: "Pricing" },
  { href: toMarketingSiteUrl("/about"), label: "About" },
  { href: toMarketingSiteUrl("/contact"), label: "Contact" },
];

const secondaryLinks = [
  { href: toMarketingSiteUrl("/media"), label: "Insights" },
  { href: toMarketingSiteUrl("/support"), label: "Support" },
  { href: `${getAppSiteUrl()}/account`, label: "Account" },
];

export function SiteHeader() {
  const authRuntimeReady = isPasswordAuthEnabled() && Boolean(process.env.NEXTAUTH_SECRET);
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookCallHref = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "header",
  });

  return (
    <header className="sticky top-0 z-50 isolate border-b border-[rgb(var(--z-border)/0.28)] bg-[rgba(247,250,253,0.82)] backdrop-blur-xl">
      <div className="border-b border-white/6 bg-[rgb(var(--z-bg))] px-4 py-2 text-center text-[0.68rem] tracking-[0.16em] text-[rgb(var(--z-text))]">
        Founder-led AWS architecture for SMB teams
      </div>

      <div className="marketing-container px-4 py-4 md:px-6 xl:px-8">
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-border/70 py-3">
          <Link href="/" className="font-display inline-flex min-w-0 items-center gap-3 text-[rgb(var(--z-ink))]">
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
              <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground lg:block">
                Clear scope. Direct technical judgment.
              </span>
            </span>
          </Link>

          <SiteHeaderShell
            primaryLinks={primaryLinks}
            secondaryLinks={secondaryLinks}
            authRuntimeReady={authRuntimeReady}
            bookCallHref={bookCallHref}
            loginHref={`${appSiteUrl}/login?callbackUrl=/software`}
            registerHref={`${appSiteUrl}/register`}
          />
        </div>
      </div>
    </header>
  );
}
