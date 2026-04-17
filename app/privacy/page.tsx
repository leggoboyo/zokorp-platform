import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Privacy",
  description: "How ZoKorp minimizes storage, delivers results by email, and handles opt-in follow-up data.",
  path: "/privacy",
});

const sections = [
  {
    title: "Work-email accounts and account data",
    paragraphs: [
      "ZoKorp accounts are intended for business use. Registration, sign-in, and customer support flows are built around work-email accounts rather than personal inbox domains.",
      "The platform stores the minimum account data needed to operate the service, including your business email, verification state, password-auth credentials, billing linkage, service requests, and core audit or usage events.",
      "Security-related account events such as verification requests, password resets, sign-in attempts, and billing changes may be logged so ZoKorp can operate the platform safely.",
    ],
  },
  {
    title: "Tool submissions, results, and account history",
    paragraphs: [
      "ZoKorp tries to keep detailed diagnostic payload retention narrow by default. Tool inputs are processed to generate the result, then detailed submission content is minimized or scrubbed from the normal workflow when the job is complete.",
      "What does remain by default is the operational history needed to support the customer account: tool name, run timestamp, delivery state, broad score or estimate bands, purchases, credits, entitlements, and supportable audit trails.",
      "Architecture review results, Validator runs, forecasting runs, and service requests may appear in account history even when the full uploaded source material is not retained long term.",
    ],
  },
  {
    title: "Optional archival, booked calls, and follow-up storage",
    paragraphs: [
      "Some workflows offer explicit follow-up options such as saving a submission for later review, allowing CRM follow-up, or booking a consultation. Those paths store more operational context than the default no-follow-up path because ZoKorp needs enough information to continue the conversation responsibly.",
      "Architecture review archival is opt-in. If you do not choose follow-up archival, ZoKorp is designed not to keep the detailed diagram narrative, OCR text, or report JSON as a long-term customer record after delivery processing finishes.",
      "Short-lived duplicate protection may store a submission fingerprint hash for a brief period to prevent accidental duplicate sends. This is used for operational safety, not for profiling or marketing.",
    ],
  },
  {
    title: "Email preferences, CRM, and service providers",
    paragraphs: [
      "ZoKorp uses hosted providers for application hosting, database access, authentication, billing, email delivery, scheduling, and optional follow-up workflows. Stripe handles billing workflows, and ZoKorp does not operate a custom credit-card storage system inside the app.",
      "Operational result delivery and future marketing or CRM follow-up are treated separately. Signed-in users can manage email preference controls, and optional CRM follow-up remains an explicit submission-level choice instead of a silent default.",
      "When you choose a workflow that needs a provider, such as Stripe billing, booked-call scheduling, or optional archival or CRM follow-up, the minimum data needed for that workflow may be shared with the relevant provider to complete the requested operation.",
    ],
  },
  {
    title: "Forecasting beta and current platform scope",
    paragraphs: [
      "ZoKorp Forecasting Beta is a narrow forecasting workflow, not a broad MLOps data platform. Uploaded forecasting files are processed to produce the result and supporting audit metadata, but the current launch is not designed as a long-term persistent training-data warehouse.",
      "Live data connectors, broad persistent dataset storage, and general-purpose MLOps claims are intentionally out of scope for the current launch.",
    ],
  },
  {
    title: "Retention enforcement and contact",
    paragraphs: [
      "ZoKorp runs scheduled cleanup to delete expired archives, remove duplicate-protection fingerprints, and scrub sensitive records that should not remain in storage beyond their intended operational window.",
      `Questions about privacy, retention, or data handling can be sent to ${PUBLIC_LAUNCH_CONTACT.primaryEmail}.`,
    ],
  },
];

const summaryCards = [
  {
    title: "Work-email accounts",
    detail: "Customer-facing account flows are built around verified business email addresses, not personal inbox domains.",
  },
  {
    title: "Minimal default retention",
    detail: "Detailed diagnostic payloads are not meant to become a long-term customer archive unless a follow-up workflow explicitly needs that storage.",
  },
  {
    title: "Separate preference controls",
    detail: "Operational result delivery and future CRM or marketing-style follow-up are tracked separately.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card tone="glass" className="animate-fade-up rounded-2xl p-6 md:p-8">
        <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Privacy</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold text-slate-900">Privacy overview</h1>
        <p className="enterprise-copy mt-4 text-sm md:text-base">
          This page summarizes how ZoKorp Platform handles account, billing, diagnostic, and optional follow-up data under a privacy-first storage policy.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
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
        <h2 className="font-display text-2xl font-semibold text-slate-900">Preference and support paths</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          If you already have an account, use the email-preferences page to manage delivery preferences. If you need a privacy or retention clarification, contact ZoKorp directly and include the account email or request context you want reviewed.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/email-preferences" prefetch={false} className={buttonVariants()}>
            Email preferences
          </Link>
          <Link href="/support" className={buttonVariants({ variant: "secondary" })}>
            Contact support
          </Link>
        </div>
      </Card>
    </div>
  );
}
