import Link from "next/link";

import { getMediaArticles } from "@/data/media-articles";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Media",
  description: "Guides, operating notes, and platform perspectives from ZoKorp.",
  path: "/media",
});

export default function MediaPage() {
  const articles = getMediaArticles();

  return (
    <div className="space-y-8">
      <section className="glass-surface animate-fade-up rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Media</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold text-slate-900">
          Guides, notes, and platform thinking
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          ZoKorp publishes practical guidance around architecture reviews, AWS delivery readiness, and
          account-linked software operations.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <article key={article.slug} className="surface lift-card rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{article.category}</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{article.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{article.readTime}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("en-US")}</span>
            </div>
            <Link
              href={`/media/${article.slug}`}
              className="focus-ring mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Read article
            </Link>
          </article>
        ))}
      </section>

      <section className="hero-surface px-6 py-8 text-white md:px-8">
        <h2 className="font-display text-3xl font-semibold">Need a tool, not just an article?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Explore ZoKorp software for architecture review and validation workflows, or request delivery support
          for larger readiness work.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/software"
            className="focus-ring inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Browse software
          </Link>
          <Link
            href="/services"
            className="focus-ring inline-flex rounded-md border border-slate-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse services
          </Link>
        </div>
      </section>
    </div>
  );
}
