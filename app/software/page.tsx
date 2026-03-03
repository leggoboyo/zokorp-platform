import Link from "next/link";
import { AccessModel } from "@prisma/client";

import { getSoftwareCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const accessLabel: Record<AccessModel, string> = {
  FREE: "Free",
  ONE_TIME_CREDIT: "Pay Per Use",
  SUBSCRIPTION: "Subscription",
  METERED: "Usage Metered",
};

const accessStyle: Record<AccessModel, string> = {
  FREE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ONE_TIME_CREDIT: "bg-amber-50 text-amber-800 border-amber-200",
  SUBSCRIPTION: "bg-sky-50 text-sky-700 border-sky-200",
  METERED: "bg-violet-50 text-violet-700 border-violet-200",
};

const roadmapItems = [
  {
    title: "MLOps Foundation Platform",
    status: "Planned SaaS",
    summary:
      "A subdomain product for SMB teams that need practical MLOps workflows, governance checks, and lightweight deployment operations.",
    cta: "Track roadmap",
    href: "/account",
  },
  {
    title: "Architecture Diagram Reviewer",
    status: "Free tool",
    summary:
      "Upload cloud architecture diagram PDFs and receive structured feedback on reliability, security, and operational readiness.",
    cta: "Open in catalog",
    href: "/software/architecture-diagram-reviewer",
  },
];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function SoftwarePage() {
  const products = await getSoftwareCatalog();
  const activeProductCount = products.length;

  return (
    <div className="space-y-8">
      <section className="hero-surface animate-fade-up px-6 py-8 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Software Hub</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold">Products, access, and billing in one place</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
          Purchase software, run tools, manage subscriptions, and track usage through a single account
          and Stripe-backed billing experience.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="metric-chip bg-white/90 text-slate-800">{activeProductCount} active products</span>
          <span className="metric-chip bg-white/90 text-slate-800">Hosted checkout + portal</span>
          <span className="metric-chip bg-white/90 text-slate-800">Entitlement-protected access</span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="surface lift-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold text-slate-900">{product.name}</h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${accessStyle[product.accessModel]}`}
              >
                {accessLabel[product.accessModel]}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pricing</p>
              {product.prices.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {product.prices.map((price) => (
                    <li key={price.id} className="flex items-center justify-between gap-4">
                      <span>{price.kind.replaceAll("_", " ")}</span>
                      <span className="font-semibold">{formatAmount(price.amount, price.currency)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Pricing is configured per product in the admin dashboard.</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className="focus-ring rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                href={`/software/${product.slug}`}
              >
                Open product
              </Link>
              <Link
                className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                href="/account"
              >
                View account access
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="surface soft-grid rounded-2xl p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Roadmap</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Upcoming product surfaces</h2>
          </div>
          <Link href="/services#service-request" className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline">
            Request priority access
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {roadmapItems.map((item) => (
            <article key={item.title} className="lift-card rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.status}</p>
              <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
              <Link
                href={item.href}
                className="focus-ring mt-4 inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
