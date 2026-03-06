import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata, getSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.platformName,
  description: "Software, services, and billing workflows for practical AWS AI delivery teams.",
  path: "/",
});

const valueProps = [
  {
    title: "Software that reflects real delivery work",
    detail: "ZoKorp turns repetitive review and readiness tasks into account-linked tools instead of keeping them fully manual.",
  },
  {
    title: "Services that connect to the same account",
    detail: "Customers can move from self-serve software to scoped help without losing billing or workflow context.",
  },
  {
    title: "Operational trust built into the platform",
    detail: "Verified access, Stripe-hosted billing, support paths, and platform policies are visible before you buy.",
  },
];

const startPoints = [
  {
    title: "Architecture Diagram Reviewer",
    summary: "A free entry point for architecture feedback with server-validated scoring and email delivery.",
    cta: "Run the free review",
    href: "/software/architecture-diagram-reviewer",
  },
  {
    title: "ZoKorpValidator",
    summary: "Credit-based validation software for evidence-heavy review workflows that should not stay manual.",
    cta: "Open validator",
    href: "/software/zokorp-validator",
  },
  {
    title: "Scoped AWS delivery help",
    summary: "For teams that need architecture guidance, readiness structure, or implementation follow-through beyond self-serve tooling.",
    cta: "Request services",
    href: "/services#service-request",
  },
];

const trustLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
];

export default function HomePage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.platformName,
      url: getSiteUrl(),
      email: siteConfig.supportEmail,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.platformName,
      url: getSiteUrl(),
      description: siteConfig.description,
    },
  ];

  return (
    <div className="space-y-10 md:space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="hero-surface animate-fade-up px-6 py-12 text-white md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-8 top-4 h-36 w-36 rounded-full border border-white/15 bg-white/10 blur-md animate-float-soft" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-amber-300/25 blur-3xl" />

        <p className="text-sm uppercase tracking-[0.2em] text-slate-100/90">ZoKorp Platform</p>
        <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight md:text-6xl">
          Practical AI delivery software, AWS guidance, and billing in one customer platform.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-100/95 md:text-lg">
          Start with a free review tool, buy self-serve validation software, or request a scoped engagement
          without leaving the same account and billing surface.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/software"
            className="focus-ring rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Browse Software
          </Link>
          <Link
            href="/pricing"
            className="focus-ring rounded-md border border-white/45 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View Pricing
          </Link>
          <Link
            href="/services#service-request"
            className="focus-ring pulse-accent rounded-md border border-teal-200/80 bg-teal-500/20 px-5 py-2.5 text-sm font-semibold text-teal-100 transition hover:bg-teal-500/30"
          >
            Request Services
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {valueProps.map((item, index) => (
          <article
            key={item.title}
            className="surface lift-card animate-fade-up rounded-2xl p-5"
            style={{ animationDelay: `${Math.min(index, 3) * 90}ms` }}
          >
            <h2 className="font-display text-2xl font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface soft-grid rounded-2xl p-6 md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Start Here</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Choose the right entry point</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
            <span className="metric-chip">Verified business accounts</span>
            <span className="metric-chip">Stripe-hosted billing</span>
            <span className="metric-chip">Server-validated uploads</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {startPoints.map((item) => (
            <article key={item.title} className="lift-card rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-display text-2xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
              <Link
                href={item.href}
                className="focus-ring mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <article className="surface lift-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Why it converts better</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-slate-900">The platform removes purchase and follow-up friction</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
            Customers do not need one site for discovery, another workflow for delivery requests, and a separate
            billing portal that feels disconnected. ZoKorp keeps those steps under one account framework.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/about" className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
              About the platform
            </Link>
            <Link href="/case-studies" className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View case studies
            </Link>
          </div>
        </article>

        <article className="glass-surface lift-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Trust Center</p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900">Read the operating basics first</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {trustLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline underline-offset-2 hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
