import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Terms",
  description: "Core terms for using ZoKorp software, services, and billing surfaces.",
  path: "/terms",
});

const sections = [
  {
    title: "Business use and work-email posture",
    paragraphs: [
      "ZoKorp is provided for legitimate business use related to software evaluation, purchase, service requests, and delivery operations.",
      "Customer-facing access is designed around business email addresses and business workflows. ZoKorp may reject, flag, or limit usage that does not fit the platform's intended work-email posture.",
      "You are responsible for the accuracy of information you submit and for the activity that occurs under your account.",
    ],
  },
  {
    title: "Accounts and access",
    paragraphs: [
      "Business-email accounts must complete verification before platform access is activated.",
      "ZoKorp may suspend or restrict access where abuse, fraudulent activity, unauthorized access, file-upload misuse, payment abuse, or other policy violations are detected.",
    ],
  },
  {
    title: "Software outputs and launch scope",
    paragraphs: [
      "Architecture Diagram Reviewer, ZoKorp Validator, and the forecasting beta are operational tools intended to support decisions and workflow readiness. They are not a promise of acceptance by AWS, a guarantee of production success, or a substitute for deeper human review where that review is required.",
      "Public launch scope remains intentionally narrow. ZoKorp does not claim that the current reviewer is a live multi-cloud implementation service, and it does not market the forecasting workflow as a broad general-purpose MLOps platform.",
      "Any human consulting, remediation, or implementation work that follows a software result is separately scoped and is not automatically included in a tool run unless stated in writing.",
    ],
  },
  {
    title: "Billing and purchases",
    paragraphs: [
      "Pricing, subscriptions, and credit-based purchases are presented in the platform and processed through Stripe-hosted billing workflows.",
      "Access to paid software depends on successful payment, account status, and the entitlement model configured for the purchased product.",
      "Refund handling follows the published refund posture and may differ for one-time credits, subscriptions, and scoped consulting work.",
    ],
  },
  {
    title: "Service requests",
    paragraphs: [
      "Submitting a service request or booking a follow-up call does not create a guaranteed engagement or delivery commitment on its own. Scope, timing, and any paid work are finalized separately.",
      "ZoKorp's current launch posture is estimate-first for consulting and remediation work. Quotes, invoices, and written engagement terms control the actual delivery commitment.",
    ],
  },
  {
    title: "Availability, support, and disclaimers",
    paragraphs: [
      "Unless otherwise agreed in writing, platform materials and tool outputs are provided on an as-is basis for operational guidance and workflow support.",
      "The founder-led soft launch includes real support and follow-up, but it is not presented as a 24/7 managed operations desk or unlimited on-demand consulting retainer.",
      `Questions about these short-form launch terms can be sent to ${PUBLIC_LAUNCH_CONTACT.primaryEmail}.`,
    ],
  },
];

const termsCards = [
  {
    title: "Business use only",
    detail: "The platform is built for real business buyers, operators, and consulting workflows rather than anonymous consumer use.",
  },
  {
    title: "Decision support, not a guarantee",
    detail: "Tool outputs are meant to help customers move faster and more clearly, not to promise acceptance or production success by themselves.",
  },
  {
    title: "Estimate-first services",
    detail: "Software and consulting are connected, but custom delivery work still requires explicit scope confirmation.",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card tone="glass" className="animate-fade-up rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Terms</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold text-slate-900">Platform terms</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
          These short-form launch terms describe the core operating rules for using ZoKorp during the founder-led launch.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {termsCards.map((card) => (
          <Card key={card.title} className="rounded-2xl p-5">
            <h2 className="font-display text-xl font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-slate-700 md:text-base">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Card>

      <Card tone="muted" className="rounded-2xl p-6">
        <p className="text-sm leading-6 text-slate-600">
          These launch terms are meant to explain the current platform posture clearly. If a paid service engagement, estimate, or invoice includes more specific written terms, those engagement-specific terms control that work.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/refunds" className={buttonVariants()}>
            Refund posture
          </Link>
          <Link href="/support" className={buttonVariants({ variant: "secondary" })}>
            Support paths
          </Link>
        </div>
      </Card>
    </div>
  );
}
