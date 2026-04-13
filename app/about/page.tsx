import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE, PUBLIC_LAUNCH_PROOF_ASSET } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "About ZoKorp",
  description:
    "Founder-led AWS architecture, validation, optimization, and software built by Zohaib Khawaja for SMB teams that need a credible next step.",
  path: "/about",
});

const backgroundChapters = [
  {
    company: "Amazon Web Services",
    role: "Partner Solutions Architect",
    detail:
      "Worked with AWS partners on architecture reviews, readiness work, delivery patterns, and the technical decisions that sit between design and implementation.",
  },
  {
    company: "Microsoft",
    role: "AI Solutions Engineer",
    detail:
      "Worked on cloud and AI-related architecture decisions where teams needed clearer infrastructure, delivery, and adoption tradeoffs.",
  },
  {
    company: "Nordic Global",
    role: "Senior AI Solutions Architect",
    detail:
      "Delivered architecture work in healthcare environments where technical choices had to respect operational constraints, compatibility, and real implementation pressure.",
  },
] as const;

const operatingPrinciples = [
  {
    title: "Founder-led by default",
    detail:
      "ZoKorp is intentionally built around direct technical judgment, not a handoff chain that turns the first conversation into a sales script.",
  },
  {
    title: "Specific claims only",
    detail:
      "If proof is not approved for public use, it does not get published. The site is meant to earn trust through clarity, not borrowed credibility.",
  },
  {
    title: "Software and services stay connected",
    detail:
      "The software exists to reduce repetitive review work and make follow-through cleaner, not to hide the human operating model behind a fake self-serve story.",
  },
] as const;

const fitSignals = [
  "SMB teams that need AWS architecture review before they spend more money or time.",
  "Operators who want direct founder guidance without hiring a full MSP or large consultancy.",
  "Teams preparing for readiness, validation, cost cleanup, or a tightly scoped implementation step.",
] as const;

export default function AboutPage() {
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${getMarketingSiteUrl()}/services#service-request`,
    utmMedium: "about-page",
  });

  return (
    <div className="enterprise-shell space-y-10 md:space-y-12">
      <section className="rounded-[2rem] border border-[rgb(var(--z-border)/0.55)] bg-[image:var(--z-gradient-hero)] px-6 py-8 shadow-[var(--z-shadow-panel)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <Badge variant="secondary" className="border-slate-200 bg-white text-slate-700">
              About ZoKorp
            </Badge>
            <h1 className="font-display mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Built by a technical founder who has spent time inside AWS, Microsoft, and real delivery work.
            </h1>
            <p className="enterprise-copy mt-5 max-w-3xl text-base md:text-lg">
              ZoKorp exists for teams that need serious technical judgment, a bounded path from review to execution,
              and software that supports the work instead of dressing it up. The company is founder-led on purpose:
              direct conversations, clear scope, and no fake proof wall.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="/services" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                View services
              </Link>
              <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                LinkedIn
              </a>
            </div>
          </div>

          <Card tone="plain" className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="grid gap-5 p-4 md:grid-cols-[minmax(240px,300px)_1fr] md:p-5">
              <div className="portrait-frame relative min-h-[340px] overflow-hidden rounded-[1.45rem] bg-[linear-gradient(180deg,#e2e8f4_0%,#cad4e5_100%)] md:min-h-[420px]">
                <Image
                  src={PUBLIC_LAUNCH_FOUNDER_PROFILE.headshotPath}
                  alt={PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="flex flex-col justify-between py-2 pr-2">
                <div className="flex items-center gap-3">
                  <Image
                    src={PUBLIC_LAUNCH_FOUNDER_PROFILE.logoPath}
                    alt="ZoKorp"
                    width={983}
                    height={316}
                    className="h-12 w-auto"
                    sizes="148px"
                  />
                  <div>
                    <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Founder</p>
                    <h2 className="font-display text-3xl font-semibold text-slate-950">
                      {PUBLIC_LAUNCH_FOUNDER_PROFILE.name}
                    </h2>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">{PUBLIC_LAUNCH_FOUNDER_PROFILE.role}</p>
                <p className="enterprise-kicker mt-1 text-[rgb(var(--z-ink-label))]">{PUBLIC_LAUNCH_CONTACT.location}</p>
                <p className="enterprise-copy mt-4 text-sm">{PUBLIC_LAUNCH_FOUNDER_PROFILE.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials.map((credential) => (
                    <Badge key={credential} variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                      {credential}
                    </Badge>
                  ))}
                </div>
                <div className="mt-5 space-y-2 text-sm text-[rgb(var(--z-ink-soft))]">
                  <p>{PUBLIC_LAUNCH_CONTACT.location}</p>
                  <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className="font-medium text-slate-900">
                    {PUBLIC_LAUNCH_CONTACT.primaryEmail}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {backgroundChapters.map((chapter) => (
          <Card tone="plain" key={chapter.company} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-none">
            <CardHeader className="gap-2 px-0">
              <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">{chapter.company}</p>
              <h2 className="font-display text-2xl font-semibold text-slate-950">{chapter.role}</h2>
            </CardHeader>
            <CardContent className="px-0">
              <p className="enterprise-copy text-sm">{chapter.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">How ZoKorp operates</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Clear trust posture instead of inflated positioning.</h2>
          </CardHeader>
          <CardContent className="grid gap-4 px-0 md:grid-cols-3">
            {operatingPrinciples.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="enterprise-copy mt-2 text-sm">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card tone="plain" className="enterprise-dark rounded-[1.8rem] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-white/72">Public proof posture</p>
            <h2 className="font-display text-3xl font-semibold">{PUBLIC_LAUNCH_PROOF_ASSET.title}</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            <p className="text-sm leading-7 text-slate-200">{PUBLIC_LAUNCH_PROOF_ASSET.summary}</p>
            {PUBLIC_LAUNCH_PROOF_ASSET.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                {highlight}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-[#f7f5f1] p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Who this is for</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">Buyers who want real technical judgment before they buy more work.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {fitSignals.map((signal) => (
              <div key={signal} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                {signal}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card tone="plain" className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Background summary</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">The company is small on purpose, not vague by accident.</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <p className="enterprise-copy text-sm md:text-base">
              ZoKorp is not trying to imitate a large consultancy. It is a focused company built around one founder,
              one clear consulting catalog, and software that supports the same operating model.
            </p>
            <p className="enterprise-copy text-sm md:text-base">
              That means direct access, tighter scope control, clearer accountability, and a lower tolerance for vague
              positioning. If a service or product is still maturing, the site says so plainly.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Current public background signals: AWS professional and specialty certifications, prior roles across AWS,
              Microsoft, and Nordic Global, a real founder identity, and public software that explains exactly what it does.
            </div>
          </CardContent>
          <CardFooter className="px-0">
            <Link href="/software" className={buttonVariants()}>
              Explore software
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
              Contact ZoKorp
            </Link>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
