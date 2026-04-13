import Link from "next/link";

import { ServiceRequestPanel } from "@/components/service-request-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Services",
  description:
    "Productized AWS architecture services for SMB teams that need scoped reviews, validation, optimization, and implementation without enterprise consulting overhead.",
  path: "/services",
});

export const dynamic = "force-dynamic";

const positioningBlock = [
  "ZoKorp is a founder-led AWS architecture consultancy.",
  "Work is scoped, defined, and delivered directly, not handed off to teams.",
  "Lower overhead means pricing stays below larger consultancies without reducing quality.",
] as const;

type ServiceCard = {
  title: string;
  price: string;
  summary: string;
  what: string;
  deliverables: string[];
  whyBuy: string;
  whenToUse: string;
  highlight?: string;
  tone: "primary" | "standard";
};

const services: ServiceCard[] = [
  {
    title: "Architecture Review",
    price: "$249",
    summary: "Fast review of AWS architecture with clear findings and next steps.",
    what: "A quick AWS architecture review focused on risks, gaps, and inefficiencies before they turn into larger delivery work.",
    deliverables: [
      "Written findings with the highest-priority risks called out",
      "Gaps and inefficiencies mapped to specific next actions",
      "Clear recommendation on what to fix, validate, or scope next",
    ],
    whyBuy: "This is the fastest way to get an expert opinion before spending more money on a larger engagement.",
    whenToUse:
      "Use this when you need a second set of eyes on an AWS design, migration plan, or production setup and want a direct answer quickly.",
    highlight: "Start here before any larger engagement",
    tone: "primary" as const,
  },
  {
    title: "AWS Readiness / FTR Validation",
    price: "from $1,500",
    summary: "Structured validation against AWS best practices with pass/fail style findings.",
    what: "A fixed-scope validation engagement built to assess production readiness and highlight the issues that must be addressed before launch, scale, or audit.",
    deliverables: [
      "Structured review against AWS best-practice areas",
      "Pass/fail style findings by control area",
      "Remediation guidance for every material issue found",
    ],
    whyBuy: "You get a repeatable validation process instead of a vague opinion or a generic architecture review deck.",
    whenToUse: "Use when preparing for launch, scale, or audit.",
    tone: "standard" as const,
  },
  {
    title: "Cloud Cost Optimization Audit",
    price: "from $750",
    summary: "Analyze AWS spend, identify waste, and recommend practical reductions.",
    what: "A one-time AWS cost audit focused on where money is being lost, what should be reduced, and which changes are worth making first.",
    deliverables: [
      "Spend review across the main AWS cost drivers",
      "Waste and inefficiency findings ranked by likely impact",
      "Concrete recommendations for cost reduction",
    ],
    whyBuy: "This usually creates immediate ROI because the savings opportunities are tied to real AWS spend, not abstract theory.",
    whenToUse: "Use when AWS costs have drifted upward or the bill no longer matches the value you expect to be getting.",
    highlight: "Typically pays for itself quickly",
    tone: "standard" as const,
  },
  {
    title: "Landing Zone Setup",
    price: "from $2,500",
    summary: "Clean AWS foundation setup with IAM, account, networking, and security basics done properly.",
    what: "A clean foundation setup for teams that need their AWS environment structured correctly before additional projects or application work continue.",
    deliverables: [
      "IAM and account baseline configuration",
      "Networking baseline setup with security-first defaults",
      "A clean documented foundation ready for follow-on work",
    ],
    whyBuy: "A clean foundation prevents future delivery work from being slowed down by avoidable account, access, or network mistakes.",
    whenToUse: "Use when AWS is new, inconsistent, or messy enough that future work needs a cleaner baseline first.",
    tone: "standard" as const,
  },
  {
    title: "Implementation (Scoped Work)",
    price: "from $1,250 per sprint or $149/hr",
    summary: "Small, clearly defined AWS projects tied to specific findings.",
    what: "Direct implementation for the issues identified in a review, validation, or audit. This is scoped technical work, not open-ended consulting.",
    deliverables: [
      "A defined work scope before execution starts",
      "Hands-on fixes for the agreed technical issues",
      "A clear stop point, handoff, and next-step recommendation",
    ],
    whyBuy: "This gives you direct execution without drifting into unlimited consulting hours or vague ongoing work.",
    whenToUse: "Use when the problem is already clear and you want it fixed without turning the work into an undefined engagement.",
    highlight:
      "All work is scoped before execution. No unlimited or ongoing work without agreement.",
    tone: "standard" as const,
  },
  {
    title: "Advisory Retainer (Light Support)",
    price: "from $1,500/month",
    summary: "Ongoing guidance for architecture decisions, reviews, and follow-up questions.",
    what: "A light monthly advisory relationship for teams that need regular AWS guidance without buying a managed service contract.",
    deliverables: [
      "Async email support for architecture and AWS decisions",
      "Review of small changes, plans, and follow-up questions",
      "Direct founder guidance when decisions need a fast answer",
    ],
    whyBuy: "This keeps expert guidance available after a project without paying for a full support desk or outsourced operations team.",
    whenToUse: "Use when you want continuity and decision support, but not a larger implementation project or a managed service relationship.",
    highlight: "Not a managed service. No strict SLA. Business-hours response only.",
    tone: "standard" as const,
  },
] as const;

const secondaryService = {
  title: "AI / ML Advisory",
  price: "from $3,500",
  summary: "Optional specialist support for teams with a real AWS-based AI or ML decision to make.",
  what: "A specialized advisory engagement for AI or ML architecture decisions that sit on top of the core AWS foundation, data, and cost questions.",
  deliverables: [
    "Architecture guidance for a defined AI or ML use case",
    "Scope, risk, and delivery recommendations before build work starts",
    "Advice anchored to AWS architecture and operating cost reality",
  ],
  whyBuy: "Use this only when there is a specific AI or ML decision to evaluate. It is not the main ZoKorp service line.",
  whenToUse: "Use when AI or ML is a real architectural decision in your roadmap and you need specialist input before committing budget.",
} as const;

const policyPoints = [
  "Services are clearly scoped before work begins.",
  "No all-you-can-eat support.",
  "Business-hours engagement only.",
  "Advisory-first approach, not managed services.",
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
              Scoped AWS architecture services you can actually buy.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-lg">
              ZoKorp sells defined AWS architecture services for SMB teams that need direct expertise without large-firm
              overhead. Reviews, validation, optimization, and implementation stay scoped so you know what you are
              buying before work starts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="#service-request" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Request services
              </Link>
              <Link href="/software/architecture-diagram-reviewer" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Start with Architecture Review
              </Link>
            </div>
          </div>

          <Card
            tone="plain"
            className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
          >
            <CardHeader className="gap-3 px-0">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Founder-led positioning</p>
              <h2 className="font-display text-3xl font-semibold text-slate-950">
                Direct delivery, clear scope, lower overhead.
              </h2>
            </CardHeader>
            <CardContent className="space-y-3 px-0">
              {positioningBlock.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Primary services</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Six clear offers. Each one is defined, scoped, and priced.
            </h2>
          </div>
          <p className="enterprise-copy max-w-2xl text-sm">
            Every service below answers the same questions: what it is, what you get, why to buy it, when to use it,
            and how much it costs.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {services.map((service) => {
            const isPrimary = service.tone === "primary";

            return (
              <Card
                tone="plain"
                key={service.title}
                className={`rounded-[1.6rem] border p-6 shadow-none ${
                  isPrimary ? "enterprise-dark border-white/10" : "border-slate-200 bg-slate-50"
                }`}
              >
                <CardHeader className="gap-2 px-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className={`font-display text-3xl font-semibold ${isPrimary ? "text-white" : "text-slate-950"}`}>
                        {service.title}
                      </h3>
                      <p className={`mt-2 text-sm ${isPrimary ? "text-slate-100" : "text-slate-700"}`}>
                        {service.summary}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={isPrimary ? "border-white/15 bg-white/10 text-white" : "bg-white text-slate-900"}
                    >
                      {service.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      What it is
                    </h4>
                    <p className={`mt-2 text-sm leading-7 ${isPrimary ? "text-slate-100" : "text-[rgb(var(--z-ink-soft))]"}`}>
                      {service.what}
                    </p>
                  </div>

                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      What you get
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {service.deliverables.map((item) => (
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
                      Why buy it
                    </h4>
                    <p className={`mt-2 text-sm leading-7 ${isPrimary ? "text-slate-100" : "text-[rgb(var(--z-ink-soft))]"}`}>
                      {service.whyBuy}
                    </p>
                  </div>

                  <div>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.12em] ${isPrimary ? "text-white/72" : "text-slate-600"}`}>
                      When to use it
                    </h4>
                    <p className={`mt-2 text-sm leading-7 ${isPrimary ? "text-slate-100" : "text-[rgb(var(--z-ink-soft))]"}`}>
                      {service.whenToUse}
                    </p>
                  </div>

                  {service.highlight ? (
                    <div
                      className={`rounded-2xl border px-4 py-4 text-sm font-medium ${
                        isPrimary
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      {service.highlight}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Specialized option</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">{secondaryService.title}</h2>
            <p className="text-sm font-medium text-slate-700">{secondaryService.price}</p>
          </CardHeader>
          <CardContent className="space-y-5 px-0">
            <p className="enterprise-copy text-sm">{secondaryService.summary}</p>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">What it is</h3>
              <p className="enterprise-copy mt-2 text-sm">{secondaryService.what}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">What you get</h3>
              <ul className="mt-3 space-y-2">
                {secondaryService.deliverables.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Why buy it</h3>
              <p className="enterprise-copy mt-2 text-sm">{secondaryService.whyBuy}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">When to use it</h3>
              <p className="enterprise-copy mt-2 text-sm">{secondaryService.whenToUse}</p>
            </div>
          </CardContent>
        </Card>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Buying path</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Start with review, then buy the next clearly scoped step.
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Most engagements should start with the Architecture Review.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Validation, cost work, and landing-zone setup are fixed-scope services, not vague consulting retainers.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Implementation only starts after scope is clear and agreed.
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
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">How ZoKorp Works</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Clear scope, direct delivery, no managed-service ambiguity.
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {policyPoints.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card tone="plain" className="enterprise-dark rounded-[1.8rem] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-white/72">Next step</p>
            <h2 className="font-display text-3xl font-semibold">Start with the smallest useful engagement.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <p className="text-sm leading-7 text-slate-200">
              If you are unsure where to begin, use the Architecture Review first. It is the fastest way to turn an AWS
              problem into a scoped next step.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
              ZoKorp is built for direct expert guidance, defined services, and business-hours delivery. It is not an MSP
              or an open-ended consulting bench.
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants()}>
                Book a call
              </a>
              <Link href="/software/architecture-diagram-reviewer" className={buttonVariants({ variant: "inverse" })}>
                Start with Architecture Review
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
