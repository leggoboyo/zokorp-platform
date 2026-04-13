import Link from "next/link";

import { ServiceRequestPanel } from "@/components/service-request-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Services",
  description:
    "Focused AWS architecture, validation, optimization, and scoped implementation services for SMB teams that need expert guidance without enterprise pricing.",
  path: "/services",
});

export const dynamic = "force-dynamic";

const positioningPoints = [
  "Focused on AWS architecture, validation, and optimization.",
  "Designed for SMBs that need expert guidance without enterprise pricing.",
  "Lower SLA, faster access, and direct founder involvement.",
] as const;

const operatingModel = [
  {
    title: "Advisory-first",
    detail:
      "ZoKorp is built for reviews, validation, and bounded follow-through. It is not a 24/7 managed service desk.",
  },
  {
    title: "Repeatable scope",
    detail:
      "The default path is a fixed-scope review or audit first. Hourly implementation is only used when the next step is already clear.",
  },
  {
    title: "Lean delivery",
    detail:
      "You work directly with the founder. There is no bench, no account-manager layer, and no padded statement of work.",
  },
] as const;

const serviceOffers = [
  {
    eyebrow: "Starting point",
    title: "Architecture Review",
    pricing: "Free browser-first reviewer or low-cost founder review",
    what:
      "A fast architecture assessment that turns an AWS design or problem statement into a prioritized next step.",
    deliverables: [
      "Clear findings and risk notes",
      "Recommended remediation order",
      "Guidance on whether you need validation, setup, or implementation next",
    ],
    buyWhen:
      "Buy this first when you know something is off, but you do not want to fund a larger project before the priorities are obvious.",
    emphasis: "primary" as const,
  },
  {
    eyebrow: "Fixed-scope validation",
    title: "AWS Readiness / FTR Validation",
    pricing: "Productized validation package",
    what:
      "A structured readiness check for AWS Foundational Technical Review and similar validation work where pass/fail clarity matters.",
    deliverables: [
      "Pass or fail decision by control area",
      "Issue list with remediation guidance",
      "Evidence-focused notes for the next review cycle",
    ],
    buyWhen:
      "Buy this when you are preparing for partner, readiness, or control validation work and need a repeatable process instead of ad hoc checking.",
    emphasis: "standard" as const,
  },
  {
    eyebrow: "One-time audit",
    title: "Cloud Cost Optimization Audit",
    pricing: "Fixed-scope audit with ROI focus",
    what:
      "A targeted review of AWS spend, waste patterns, and cost controls aimed at practical savings rather than generic cost-cutting slides.",
    deliverables: [
      "Savings opportunities ranked by impact",
      "Inefficiency notes across compute, storage, and data transfer patterns",
      "Recommendations with estimated business value",
    ],
    buyWhen:
      "Buy this when AWS costs are rising faster than expected or when you need a founder-level second opinion before changing production workloads.",
    emphasis: "standard" as const,
  },
  {
    eyebrow: "Baseline setup",
    title: "Landing Zone Setup",
    pricing: "Tight setup scope",
    what:
      "A clean AWS starting point for teams that need IAM, networking, and security basics set correctly before they build further.",
    deliverables: [
      "Account and access baseline recommendations",
      "Networking and security guardrail setup",
      "A clean handoff with clear boundaries on what was configured",
    ],
    buyWhen:
      "Buy this when your AWS environment is new, messy, or inconsistent enough that future work will be slower until the basics are fixed.",
    emphasis: "standard" as const,
  },
  {
    eyebrow: "Bounded delivery",
    title: "Implementation (Scoped / Hourly)",
    pricing: "Scoped project or hourly follow-through",
    what:
      "Direct technical execution for the fixes that come out of the review, readiness, or cost work. This is intentionally not open-ended staff augmentation.",
    deliverables: [
      "A defined task list tied to prior findings",
      "Direct implementation or repair work",
      "A stop point, handoff, and clear next recommendation",
    ],
    buyWhen:
      "Buy this when the issue is clear enough to scope and you want hands-on help finishing the next technical step without turning it into a vague engagement.",
    emphasis: "standard" as const,
  },
  {
    eyebrow: "Light support",
    title: "Advisory Retainer",
    pricing: "Monthly guidance, limited support",
    what:
      "A light-touch monthly retainer for SMB teams that need ongoing AWS guidance by email or Slack without paying for a full managed-services model.",
    deliverables: [
      "Founder access for questions and lightweight reviews",
      "Limited monthly support within a clear cap",
      "Guidance on changes, follow-up decisions, and escalation points",
    ],
    buyWhen:
      "Buy this when you want continuity after a project, but you do not need strict SLA coverage, on-call operations, or a full MSP relationship.",
    emphasis: "standard" as const,
  },
] as const;

const serviceFaq = [
  {
    question: "Do I need an account before requesting services?",
    answer:
      "No. The services page stays public. Use the request form or book a call first, then create an account later if you want tracked history inside the app.",
  },
  {
    question: "Is ZoKorp a managed service provider?",
    answer:
      "No. ZoKorp is an advisory-first consultancy with light support options. The model is direct expert guidance, scoped validation, and bounded implementation rather than full outsourced operations.",
  },
  {
    question: "How is pricing handled?",
    answer:
      "The entry point stays accessible, fixed-scope services stay in a practical mid-tier range, and implementation is scoped or hourly only when the work is well defined.",
  },
  {
    question: "Where should I start if I am unsure?",
    answer:
      "Start with the architecture review. It is the fastest way to decide whether you need validation, cost work, landing-zone cleanup, or a small implementation project.",
  },
] as const;

export default async function ServicesPage() {
  const session = await auth();
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "services-page",
  });

  return (
    <div className="enterprise-shell space-y-10 md:space-y-12">
      <section className="rounded-[2rem] border border-[rgb(var(--z-border)/0.55)] bg-[image:var(--z-gradient-hero)] px-6 py-8 shadow-[var(--z-shadow-panel)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div>
            <Badge variant="secondary" className="border-slate-200 bg-white text-slate-700">
              ZoKorp services
            </Badge>
            <h1 className="font-display mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Focused AWS architecture, validation, and optimization services for SMB teams that need a clear next step.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-lg">
              ZoKorp offers productized consulting for teams that need experienced AWS judgment without enterprise
              pricing, padded scope, or a forced managed-services contract. The model is simple: start with a review,
              buy only the next scoped service that makes sense, and keep direct founder involvement throughout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="#service-request" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Request services
              </Link>
              <Link href="/software/architecture-diagram-reviewer" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Start with the reviewer
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {positioningPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card
            tone="plain"
            className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
          >
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Operating model</p>
              <h2 className="font-display text-3xl font-semibold text-slate-950">
                High-end expertise, lean delivery, direct founder access.
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}. Lower SLA, faster access, and direct founder involvement
                remain part of the model.
              </div>
              <div className="space-y-3">
                {operatingModel.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="enterprise-copy mt-2 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                  <Badge key={credential} variant="secondary" className="bg-slate-100 text-slate-700">
                    {credential}
                  </Badge>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                Contact:{" "}
                <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className="font-medium text-slate-950">
                  {PUBLIC_LAUNCH_CONTACT.primaryEmail}
                </a>
                {" · "}
                {PUBLIC_LAUNCH_CONTACT.location}
              </div>
            </CardContent>
            <CardFooter className="px-0">
              <Link href={`${appSiteUrl}/register`} className={buttonVariants({ variant: "secondary" })}>
                Create account
              </Link>
              <Link href="/software" className={buttonVariants({ variant: "ghost" })}>
                Explore software
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Service catalog</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Six clear AWS offers. No filler, no vague transformation language.
            </h2>
          </div>
          <p className="enterprise-copy max-w-2xl text-sm">
            Each offer answers three questions before you buy: what it is, what you get, and when it makes sense to
            engage. If the next step is still unclear, start with the architecture review.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {serviceOffers.map((offer) => {
            const isPrimary = offer.emphasis === "primary";

            return (
              <Card
                tone="plain"
                key={offer.title}
                className={`rounded-[1.6rem] border p-6 shadow-none ${
                  isPrimary ? "enterprise-dark border-white/10" : "border-slate-200 bg-slate-50"
                }`}
              >
                <CardHeader className="gap-2 px-0">
                  <p className={`enterprise-kicker ${isPrimary ? "text-white/72" : "text-[rgb(var(--z-ink-label))]"}`}>
                    {offer.eyebrow}
                  </p>
                  <h3 className={`font-display text-3xl font-semibold ${isPrimary ? "text-white" : "text-slate-950"}`}>
                    {offer.title}
                  </h3>
                  <p className={`text-sm font-medium ${isPrimary ? "text-slate-200" : "text-slate-700"}`}>
                    {offer.pricing}
                  </p>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      What it is
                    </h4>
                    <p className={`mt-2 text-sm leading-7 ${isPrimary ? "text-slate-100" : "text-[rgb(var(--z-ink-soft))]"}`}>
                      {offer.what}
                    </p>
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      What you get
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {offer.deliverables.map((item) => (
                        <li
                          key={item}
                          className={`rounded-2xl border px-4 py-3 text-sm ${
                            isPrimary
                              ? "border-white/10 bg-white/5 text-slate-100"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      When to buy
                    </h4>
                    <p className={`mt-2 text-sm leading-7 ${isPrimary ? "text-slate-100" : "text-[rgb(var(--z-ink-soft))]"}`}>
                      {offer.buyWhen}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Buying guidance</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              A practical path from first review to follow-through.
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Start with the review</h3>
              <p className="enterprise-copy mt-2 text-sm">
                Use the architecture review to narrow the real problem before you buy validation, implementation, or a
                monthly retainer.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Move into a fixed-scope package</h3>
              <p className="enterprise-copy mt-2 text-sm">
                If readiness, cost, or setup work is the real issue, use the corresponding fixed-scope service instead
                of jumping straight to open-ended implementation.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Use hourly work only when the task is clear</h3>
              <p className="enterprise-copy mt-2 text-sm">
                Implementation stays scoped. The goal is to finish the next technical step, not to create indefinite
                consulting dependency.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Scope guardrails</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              What ZoKorp is built to do, and what it is not.
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              Strong fit: AWS architecture review, FTR-style validation, cost optimization, landing-zone cleanup, and
              bounded implementation tied to those findings.
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Not the model: vague AI automation projects, broad digital-transformation programs, or full MSP coverage
              with strict SLA expectations.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {PUBLIC_LAUNCH_POLICY_NOTES.services}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {PUBLIC_LAUNCH_CONTACT.primaryHumanPathLabel}
            </div>
          </CardContent>
        </Card>
      </section>

      <ServiceRequestPanel
        signedIn={Boolean(session?.user?.email)}
        currentEmail={session?.user?.email ?? null}
        loginHref={`${appSiteUrl}/login?callbackUrl=/services`}
        registerHref={`${appSiteUrl}/register`}
        accountHref={`${appSiteUrl}/account`}
      />

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">FAQ</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">What buyers usually need clarified</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            {serviceFaq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                <p className="enterprise-copy mt-2 text-sm">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card tone="plain" className="enterprise-dark rounded-[1.8rem] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-white/72">Next step</p>
            <h2 className="font-display text-3xl font-semibold">
              Start publicly, scope tightly, and create an account only when it actually helps.
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <p className="text-sm leading-7 text-slate-200">
              The public site is there so you can understand the services before signup. The app is there for software
              access, account-linked history, and billing once the relationship becomes active.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
              Direct founder involvement stays in the loop from the first review through scoped delivery and any
              follow-on advisory support.
            </div>
          </CardContent>
          <CardFooter className="px-0">
            <Link href={`${appSiteUrl}/register`} className={buttonVariants()}>
              Create account
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "inverse" })}>
              Contact ZoKorp
            </Link>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
