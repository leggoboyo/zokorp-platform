import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { SOFT_LAUNCH_RESPONSE_WINDOWS } from "@/lib/launch-posture";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Support",
  description: "How to get support for ZoKorp account access, billing, software usage, and security questions.",
  path: "/support",
});

const supportTopics = [
  {
    title: "Account access",
    detail: "Sign-in, verification, or account access questions.",
  },
  {
    title: "Billing",
    detail: "Checkout issues, invoices, or subscription follow-up.",
  },
  {
    title: "Tool usage",
    detail: "Upload problems, entitlement questions, result delivery, or unexpected behavior.",
  },
  {
    title: "Security concerns",
    detail: "Suspected account compromise or unexpected access behavior.",
  },
];

const supportPaths = [
  {
    title: "Use support when",
    detail: "You need help with sign-in, billing, delivery, entitlements, or an unexpected platform problem.",
  },
  {
    title: "Use booking when",
    detail: "You need a real conversation about follow-up or scoped consulting.",
  },
  {
    title: "Use services/contact when",
    detail: "You are starting a new engagement.",
  },
] as const;

const intakeChecklist = [
  "Your business email",
  "Product name or service path involved",
  "Estimate reference or service-request tracking code if you have one",
  "Short summary of the problem or request",
] as const;

export default function SupportPage() {
  const architectureBookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${getMarketingSiteUrl()}/services#service-request`,
    utmMedium: "support-page",
  });

  return (
    <div className="marketing-stack">
      <section className="hero-bleed hero-poster py-10 md:py-12 lg:py-16">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="space-y-5">
              <p className="enterprise-kicker">Support</p>
              <h1 className="font-display max-w-[10ch] text-balance text-[3.1rem] font-semibold leading-[0.92] tracking-[-0.05em] text-card-foreground md:text-[5rem] lg:text-[6rem]">
                Platform support.
              </h1>
              <p className="max-w-[34ch] text-base leading-7 text-muted-foreground">
                Account access, billing, and software usage support tied to the app.
              </p>
            </div>

            <section className="plane-dark rounded-[2.2rem] border border-white/8 px-6 py-6 md:px-7">
              <div className="space-y-3">
                <p className="enterprise-kicker text-white/72">Support posture</p>
                <div className="grid gap-3">
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                    {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
                  </div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                    Founder-led support path.
                  </div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                    This is not a 24/7 managed operations desk.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="section-band px-5 py-5 md:px-6">
        {supportTopics.map((topic, index) => (
          <article
            key={topic.title}
            className="grid gap-5 border-t border-border/80 py-5 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.46fr)_minmax(0,1fr)] lg:items-start"
          >
            <div className="hidden lg:block lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
            </div>
            <h2 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">{topic.title}</h2>
            <p className="max-w-[36ch] text-sm leading-7 text-muted-foreground">{topic.detail}</p>
          </article>
        ))}
      </section>

      <section className="section-band px-5 py-5 md:px-6">
        {supportPaths.map((path) => (
          <article key={path.title} className="grid gap-3 border-t border-border/80 py-5 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
            <h2 className="font-display text-xl font-semibold text-card-foreground">{path.title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{path.detail}</p>
          </article>
        ))}
      </section>

      <Card tone="glass" className="rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">How to contact support</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Email <span className="font-medium text-slate-900">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</span> with the product name,
          your account email, and a short description of the issue. {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {SOFT_LAUNCH_RESPONSE_WINDOWS.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">What to include</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {intakeChecklist.map((item) => (
              <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={architectureBookingUrl} className={buttonVariants()}>
            {PUBLIC_LAUNCH_CONTACT.bookingLabel}
          </a>
          <Link href="/refunds" className={buttonVariants({ variant: "secondary" })}>
            Refund posture
          </Link>
          <Link href="/security" className={buttonVariants({ variant: "secondary" })}>
            Security overview
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
            Contact page
          </Link>
        </div>
      </Card>
    </div>
  );
}
