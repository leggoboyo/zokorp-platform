import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { getMediaArticleBySlug, getMediaArticles } from "@/data/media-articles";
import { buildMarketingPageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return getMediaArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getMediaArticleBySlug(slug);

  if (!article) {
    return buildMarketingPageMetadata({
      title: "Insights",
      description: "Guides and operating notes from ZoKorp.",
      path: "/media",
    });
  }

  return buildMarketingPageMetadata({
    title: article.title,
    description: article.description,
    path: `/media/${article.slug}`,
    type: "article",
  });
}

export default async function MediaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getMediaArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="marketing-stack">
      <section className="hero-bleed hero-poster py-10 md:py-12 lg:py-16">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="space-y-5">
              <p className="enterprise-kicker">{article.category}</p>
              <h1 className="font-display max-w-[10ch] text-balance text-[3.1rem] font-semibold leading-[0.92] tracking-[-0.05em] text-card-foreground md:text-[5rem] lg:text-[6rem]">
                {article.title}
              </h1>
              <p className="max-w-[34ch] text-base leading-7 text-muted-foreground">{article.description}</p>
            </div>

            <section className="plane-dark rounded-[2.2rem] border border-white/8 px-6 py-6 md:px-7">
              <div className="space-y-3">
                <p className="enterprise-kicker text-white/72">Reading time</p>
                <div className="grid gap-3">
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">
                    {new Date(article.publishedAt).toLocaleDateString("en-US")}
                  </div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">{article.readTime}</div>
                  <div className="border-t border-white/12 pt-3 text-sm leading-7 text-white/78">Short, practical, direct.</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="section-band px-5 py-6 md:px-6">
        <p className="max-w-[58ch] text-base leading-8 text-card-foreground">{article.intro}</p>
      </section>

      <section className="section-band px-5 py-5 md:px-6">
        {article.sections.map((section, index) => (
          <section
            key={section.heading}
            className="grid gap-6 border-t border-border/80 py-6 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.46fr)_minmax(0,1fr)] lg:items-start"
          >
            <div className="hidden lg:block lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">{`0${index + 1}`}</p>
            </div>
            <h2 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[48ch] text-sm leading-7 text-muted-foreground md:text-base">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="grid gap-3 text-sm text-card-foreground md:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="border-t border-border/80 pt-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </section>

      <section className="hero-bleed plane-dark border-t border-white/8 py-12 md:py-14">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/72">Next step</p>
              <h2 className="font-display max-w-[10ch] text-[2.4rem] font-semibold leading-[0.98] text-white md:text-[3.4rem]">
                Need a tool or scoped help?
              </h2>
            </div>
            <div className="space-y-5">
              <p className="max-w-[34ch] text-base leading-7 text-white/80">Move from guidance to software or services.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/software" className={buttonVariants()}>
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
    </article>
  );
}
