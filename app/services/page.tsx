import Link from "next/link";

import { ServiceRequestPanel } from "@/components/service-request-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { auth } from "@/lib/auth";
import { CONSULTING_OFFERS, CONSULTING_PRICE_OPTIONS, DELIVERY_PROCESS_STEPS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Services",
  description:
    "Founder-led AWS architecture review, remediation, readiness support, AI/ML advisory, and implementation services from ZoKorp.",
  path: "/services",
});

export const dynamic = "force-dynamic";

const fitScenarios = [
  {
    title: "You need a serious architecture review",
    detail:
      "Use ZoKorp when the current design needs technical scrutiny, prioritization, and a next-step recommendation that can survive real implementation work.",
  },
  {
    title: "You are preparing for readiness or validation work",
    detail:
      "Use ZoKorp when AWS-related readiness, partner evidence, or technical packaging work needs more structure and less last-minute scrambling.",
  },
  {
    title: "You want AI/ML guidance without vague positioning",
    detail:
      "Use ZoKorp when you need practical advice on infrastructure, forecasting workflows, MLOps direction, or delivery choices without buying into inflated platform claims.",
  },
] as const;

const serviceFaq = [
  {
    question: "Do I need an account to request services?",
    answer:
      "No. You can browse the service catalog and submit a quote request without an account. Account creation becomes useful when you want software access, billing history, or tracked follow-up inside the app.",
  },
  {
    question: "Is the $249 architecture advisory review the same as implementation?",
    answer:
      "No. The advisory review is the narrow first step. Remediation, readiness packages, and broader implementation are only scoped once the underlying work is actually clear.",
  },
  {
    question: "Are these fixed prices for every engagement?",
    answer:
      "No. The visible anchors are meant to reduce ambiguity, not pretend that every delivery need is fixed-scope. Broader work remains estimate-first.",
  },
  {
    question: "How do software and consulting connect?",
    answer:
      "The software creates a public, self-serve path where that makes sense. Consulting exists for the work that still benefits from direct technical judgment, implementation help, or readiness packaging.",
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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <Badge variant="secondary" className="border-slate-200 bg-white text-slate-700">
              ZoKorp services
            </Badge>
            <h1 className="font-display mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Architecture review first. Remediation, readiness, and implementation when the next step is real.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-lg">
              ZoKorp is a founder-led consultancy for teams that want clear AWS architecture judgment, AI/ML advisory,
              readiness support, and software-backed follow-through. You do not need an account to understand the
              offers or request a quote.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="#service-request" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Get a quote
              </Link>
              <Link href="/software" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Explore software
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {PUBLIC_LAUNCH_CONTACT.primaryHumanPathLabel}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {PUBLIC_LAUNCH_POLICY_NOTES.services}
              </div>
            </div>
          </div>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Founder-led scope</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Direct technical work, not generic “transformation” consulting.
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
              <p className="enterprise-copy text-sm">
                {PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}
              </p>
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
              <Link href={`${appSiteUrl}/account`} className={buttonVariants({ variant: "ghost" })}>
                Account
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Pricing anchors</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Visible consulting pricing without pretending every job is identical.</h2>
          </div>
          <p className="enterprise-copy max-w-xl text-sm">
            The anchors below are public on purpose. Anything broader still gets scoped before paid work begins.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {CONSULTING_PRICE_OPTIONS.map((item) => (
            <Card tone="plain" key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-none">
              <CardHeader className="gap-2 px-0">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="text-sm font-semibold text-slate-700">{item.price}</p>
              </CardHeader>
              <CardContent className="px-0">
                <p className="enterprise-copy text-sm">{item.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {CONSULTING_OFFERS.map((offer) => (
          <Card
            tone="plain"
            key={offer.slug}
            className={`rounded-[1.6rem] border border-slate-200 p-6 shadow-none ${offer.slug === "architecture-review-remediation" ? "enterprise-dark lg:col-span-2" : "bg-white"}`}
          >
            <CardHeader className="gap-2 px-0">
              <p
                className={`enterprise-kicker ${offer.slug === "architecture-review-remediation" ? "text-white/72" : "text-[rgb(var(--z-ink-label))]"}`}
              >
                {offer.eyebrow}
              </p>
              <h2 className={`font-display text-3xl font-semibold ${offer.slug === "architecture-review-remediation" ? "text-white" : "text-slate-950"}`}>
                {offer.title}
              </h2>
              <p className={`text-sm font-medium ${offer.slug === "architecture-review-remediation" ? "text-slate-200" : "text-slate-700"}`}>
                {offer.priceAnchor}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <p className={`text-sm leading-7 ${offer.slug === "architecture-review-remediation" ? "text-slate-200" : "text-[rgb(var(--z-ink-soft))]"}`}>
                {offer.summary}
              </p>
              <ul className="space-y-2">
                {offer.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className={`rounded-2xl border px-4 py-3 text-sm ${offer.slug === "architecture-review-remediation" ? "border-white/10 bg-white/5 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Good fit</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">When to use ZoKorp services</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {fitScenarios.map((scenario) => (
              <div key={scenario.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <h3 className="text-lg font-semibold text-slate-950">{scenario.title}</h3>
                <p className="enterprise-copy mt-2 text-sm">{scenario.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Engagement flow</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">A clear process from review to follow-through.</h2>
          </CardHeader>
          <CardContent className="grid gap-4 px-0 md:grid-cols-2">
            {DELIVERY_PROCESS_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="enterprise-copy mt-2 text-sm">{step.detail}</p>
              </div>
            ))}
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
            <h2 className="font-display text-3xl font-semibold">Start publicly, create an account only when it actually helps.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <p className="text-sm leading-7 text-slate-200">
              ZoKorp is designed so that browsing the company, understanding the services, and requesting a quote do
              not require login. Account creation remains available for software access, tracked history, and billing.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
              {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}. If a call is the better path, use the booking CTA above.
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
