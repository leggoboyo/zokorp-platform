import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="glass-surface rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">404</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">This page is not here.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
          The link may be outdated, or the page may have moved as the platform structure evolves.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/software" className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Browse software
          </Link>
          <Link href="/services" className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
            Browse services
          </Link>
        </div>
      </section>
    </div>
  );
}
