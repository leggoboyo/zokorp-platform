import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Refunds",
  description: "Conservative refund posture for ZoKorp software, credits, subscriptions, and scoped services.",
  path: "/refunds",
});

const sections = [
  {
    title: "Architecture Diagram Reviewer",
    paragraphs: [
      "Architecture Diagram Reviewer itself is currently a free software workflow. There is no software purchase to refund for the review submission itself.",
      "If a later human remediation or consultation scope is proposed, that commercial work is handled under the estimate, proposal, or invoice terms tied to that follow-up rather than under the free-review workflow.",
    ],
  },
  {
    title: "Software credits and one-time purchases",
    paragraphs: [
      "Unused credit purchases are generally reviewed case by case within 7 calendar days when no meaningful tool consumption has occurred.",
      "Once a credit-backed run has been consumed or a result package has been delivered, that purchase is normally treated as fulfilled unless ZoKorp confirms a platform-side failure.",
    ],
  },
  {
    title: "Subscriptions",
    paragraphs: [
      "Subscription charges are reviewed against actual activation state and platform availability. Partial-period refunds are not promised by default, and cancellation normally stops future renewal rather than automatically unwinding the current period.",
      "If ZoKorp determines that access failed because of a platform-side issue rather than normal customer usage, a corrective credit, adjustment, or refund may be issued.",
    ],
  },
  {
    title: "Consulting and remediation work",
    paragraphs: [
      "Scoped consulting, remediation, or implementation work follows the written estimate, proposal, or invoice terms attached to that engagement.",
      "Deposits, reserved delivery slots, and already-performed consulting time are normally non-refundable unless otherwise stated in writing.",
    ],
  },
];

const reviewCards = [
  {
    title: "Review-first posture",
    detail: "Refunds are reviewed against actual usage, delivery state, and whether the issue was caused by the platform or normal customer use.",
  },
  {
    title: "Stripe for software billing",
    detail: "Software charges, payment methods, and customer receipts are handled through Stripe-hosted billing workflows.",
  },
  {
    title: "Estimate-first services",
    detail: "ZoKorp does not promise blind instant refunds for custom consulting because that work is scoped and accepted separately.",
  },
] as const;

export default function RefundsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card tone="glass" className="animate-fade-up rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Refunds</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold text-slate-900">Refund posture</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
          ZoKorp uses a conservative review-first refund posture. Software, credits, subscriptions, and scoped services are handled differently, and any exception depends on actual usage and delivery state.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {reviewCards.map((card) => (
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
        <h2 className="font-display text-2xl font-semibold text-slate-900">How to request a billing review</h2>
        <p className="text-sm leading-6 text-slate-600">
          For billing questions or a refund review request, include your account email, product name, purchase context, and the reason you believe a corrective adjustment is warranted. Send the request to{" "}
          <span className="font-medium text-slate-900">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</span> and expect an initial response within one business day.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/support" className={buttonVariants()}>
            Contact support
          </Link>
          <Link href="/terms" className={buttonVariants({ variant: "secondary" })}>
            Review terms
          </Link>
        </div>
      </Card>
    </div>
  );
}
