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
    detail: "Use support for sign-in issues, verification problems, or account access questions.",
  },
  {
    title: "Billing",
    detail: "Use support for checkout issues, invoice questions, or subscription management follow-up.",
  },
  {
    title: "Tool usage",
    detail: "Use support for upload problems, entitlement questions, result-delivery issues, or unexpected product behavior.",
  },
  {
    title: "Security concerns",
    detail: "Use support immediately for suspected account compromise or unexpected access behavior.",
  },
];

const supportPaths = [
  {
    title: "Use support when",
    detail: "You need help with sign-in, billing context, result delivery, entitlements, or an unexpected platform problem.",
  },
  {
    title: "Use booking when",
    detail: "You want to discuss architecture-review follow-up, scoped consulting, or a service request that needs a real conversation.",
  },
  {
    title: "Use services/contact when",
    detail: "You are starting a new engagement and want ZoKorp to triage the request before any paid scope is accepted.",
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
    <div className="space-y-8">
      <section className="hero-surface animate-fade-up px-6 py-9 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Support</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold">Support lives with the platform</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100 md:text-base">
          ZoKorp support covers account access, billing context, and software usage questions tied to the app.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          This is a founder-led software and consulting support path, not a 24/7 managed operations desk.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {supportTopics.map((topic) => (
          <article key={topic.title} className="surface lift-card rounded-2xl p-6">
            <h2 className="font-display text-2xl font-semibold text-slate-900">{topic.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{topic.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {supportPaths.map((path) => (
          <Card key={path.title} className="rounded-2xl p-5">
            <h2 className="font-display text-xl font-semibold text-slate-900">{path.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{path.detail}</p>
          </Card>
        ))}
      </section>

      <Card tone="glass" className="rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">How to contact support</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Email <span className="font-medium text-slate-900">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</span> with the product name,
          your account email, and a short description of the issue. For billing issues, include the product and
          purchase context. For security issues, mark the subject line as urgent. For Architecture Reviewer or Validator follow-up, include the estimate reference if one was generated.
          {" "}{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}.
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
