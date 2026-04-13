import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getMediaArticles } from "@/data/media-articles";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Insights",
  description: "Guides and operating notes from ZoKorp on AWS architecture, readiness work, and software-backed delivery.",
  path: "/media",
});

export default function MediaPage() {
  const articles = getMediaArticles();

  return (
    <div className="marketing-stack">
      <section className="hero-bleed hero-poster animate-fade-up py-10 md:py-12 lg:py-16">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="space-y-5">
              <p className="enterprise-kicker">Insights</p>
              <h1 className="font-display max-w-[10ch] text-balance text-[3.1rem] font-semibold leading-[0.92] tracking-[-0.05em] text-card-foreground md:text-[5rem] lg:text-[6rem]">
                Short notes. Real operating detail.
              </h1>
              <p className="max-w-[34ch] text-base leading-7 text-muted-foreground">
                Practical notes on architecture reviews, readiness work, and the operating model behind ZoKorp.
              </p>
            </div>

            <section className="plane-dark rounded-[2.2rem] border border-white/8 px-6 py-6 md:px-7">
              <div className="space-y-3">
                <p className="enterprise-kicker text-white/72">Reading posture</p>
                <div className="grid gap-3">
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">Short reads only.</div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">Built for scanning.</div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">Action over theory.</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="section-band px-5 py-5 md:px-6">
        {articles.map((article, index) => (
          <article
            key={article.slug}
            className="grid gap-6 border-t border-border/80 py-5 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.64fr)_minmax(0,1fr)_auto] lg:items-end"
          >
            <div className="hidden lg:block lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
            </div>
            <div className="space-y-2">
              <p className="enterprise-kicker">{article.category}</p>
              <h2 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
                {article.title}
              </h2>
            </div>
            <div className="space-y-3">
              <p className="max-w-[34ch] text-sm leading-7 text-muted-foreground">{article.description}</p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em] text-foreground-label">
                <span>{article.readTime}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString("en-US")}</span>
              </div>
            </div>
            <Link href={`/media/${article.slug}`} className={buttonVariants({ variant: "secondary" })}>
              Read
            </Link>
          </article>
        ))}
      </section>

      <section className="hero-bleed plane-dark border-t border-white/8 py-12 md:py-14">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/72">Next step</p>
              <h2 className="font-display max-w-[11ch] text-[2.4rem] font-semibold leading-[0.98] text-white md:text-[3.4rem]">
                Need a tool, not another article?
              </h2>
            </div>

            <div className="space-y-5">
              <p className="max-w-[34ch] text-base leading-7 text-white/80">
                Browse the tools or go straight to services.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/software" className={buttonVariants({ variant: "secondary" })}>
                  Browse software
                </Link>
                <Link href="/services" className={buttonVariants({ variant: "inverse" })}>
                  Browse services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
