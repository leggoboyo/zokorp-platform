import Link from "next/link";

const serviceItems = [
  {
    title: "AWS Consultation",
    description:
      "Architecture decisions, execution sequencing, and reliability baselines for practical AI delivery.",
  },
  {
    title: "APN Consulting",
    description:
      "Partner-readiness workflows for evidence quality, control mapping, and validation milestones.",
  },
  {
    title: "Productized Tooling",
    description:
      "Software-backed delivery assets that convert repetitive consulting work into scalable workflows.",
  },
];

const hubCapabilities = [
  {
    title: "Software Commerce",
    detail: "One-time purchases, subscriptions, and account-linked access checks.",
  },
  {
    title: "Service Operations",
    detail: "Consultation and delivery requests with tracking codes and status timelines.",
  },
  {
    title: "Billing Control",
    detail: "Stripe hosted checkout plus billing portal for invoices and payment management.",
  },
];

const productDirections = [
  {
    title: "ZoKorpValidator",
    summary: "Control-level validation for FTR, SDP/SRP, and Competency checklists.",
    tags: ["Pay per use", "Excel/PDF", "Account-protected"],
    href: "/software/zokorp-validator",
  },
  {
    title: "MLOps Foundation Platform",
    summary: "Subscription platform for SMB machine-learning operations and governance workflows.",
    tags: ["Planned SaaS", "Subdomain-ready", "Usage-aware"],
    href: "/software/mlops-foundation-platform",
  },
  {
    title: "Architecture Diagram Reviewer",
    summary: "Free architecture feedback tool for cloud diagram PNG/SVG uploads.",
    tags: ["Free", "Fast feedback", "Lead-in offering"],
    href: "/software/architecture-diagram-reviewer",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10 md:space-y-12">
      <section className="hero-surface animate-fade-up px-6 py-12 text-white md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-8 top-4 h-36 w-36 rounded-full border border-white/15 bg-white/10 blur-md animate-float-soft" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-amber-300/25 blur-3xl" />

        <p className="text-sm uppercase tracking-[0.2em] text-slate-100/90">ZoKorp Platform</p>
        <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight md:text-6xl">
          The operating hub for AI delivery services and software products.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100/95 md:text-lg">
          Buy software, request consultations, track delivery, and manage billing in one account-driven
          platform while your main marketing site remains safely live.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/software"
            className="focus-ring rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Browse Software
          </Link>
          <Link
            href="/services#service-request"
            className="focus-ring rounded-md border border-white/45 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Request Services
          </Link>
          <Link
            href="/account"
            className="focus-ring pulse-accent rounded-md border border-teal-200/80 bg-teal-500/20 px-5 py-2.5 text-sm font-semibold text-teal-100 transition hover:bg-teal-500/30"
          >
            Open Account Hub
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {hubCapabilities.map((metric, index) => (
          <article
            key={metric.title}
            className="surface lift-card animate-fade-up rounded-2xl p-5"
            style={{ animationDelay: `${Math.min(index, 3) * 90}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Core Services</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Delivery with depth</h2>
          </div>
          <Link href="/services" className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline">
            View services hub
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {serviceItems.map((item) => (
            <article key={item.title} className="surface lift-card rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface soft-grid rounded-2xl p-6 md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Product Direction</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Software portfolio trajectory</h2>
          </div>
          <Link href="/software" className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline">
            View software catalog
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {productDirections.map((item) => (
            <article key={item.title} className="lift-card rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-display text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="metric-chip">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={item.href}
                className="focus-ring mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="hero-surface px-6 py-8 text-white md:px-8">
        <h2 className="font-display text-3xl font-semibold">Ready to centralize software and service operations?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
          Start with ZoKorpValidator, then expand into subscription products and service delivery tracking
          from the same account framework.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/software/zokorp-validator"
            className="focus-ring rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Launch ZoKorpValidator
          </Link>
          <Link
            href="/services#service-request"
            className="focus-ring rounded-md border border-slate-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Request Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
