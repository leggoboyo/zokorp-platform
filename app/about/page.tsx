import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getConsultationCta } from "@/lib/marketing-cta";
import { ABOUT_PAGE_CONTENT } from "@/lib/marketing-content";
import { FOUNDER_PROOF_PAGE_CONTENT } from "@/lib/marketing-proof";
import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_FOUNDER_PROFILE } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "About ZoKorp",
  description:
    "Founder-led cloud architecture and software for SMB teams that need direct technical judgment.",
  path: "/about",
});

export const dynamic = "force-dynamic";

const ABOUT_VIDEO_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/bQvrHYfJgl8?start=1320&rel=0";
const ABOUT_VIDEO_WATCH_URL =
  "https://youtu.be/bQvrHYfJgl8?si=NyWuv4OgzW0-SQad&t=1320";

const ABOUT_PORTFOLIO_MEDIA = {
  hero: {
    src: "/about/talk-agent-stage.jpeg",
    alt: "Zohaib Khawaja presenting an AI agents talk on stage",
    eyebrow: "Speaking",
    title: "Technical material explained in public, not hidden behind sales copy.",
    caption: "Talks and workshops that force clarity under live scrutiny.",
    imageClassName: "object-cover object-[center_54%]",
  },
  summit: {
    src: "/about/aws-summit-atrium.jpeg",
    alt: "Founder standing inside the AWS Summit venue atrium",
    eyebrow: "Fieldwork",
    title: "Operating in larger technical environments.",
    caption: "Enterprise-scale context, packaged here as smaller scoped work.",
    imageClassName: "object-cover object-center",
  },
  nvidia: {
    src: "/about/nvidia-ai-summit.jpeg",
    alt: "Founder at NVIDIA AI Summit",
    eyebrow: "Events",
    title: "AI and architecture work kept grounded in real rooms.",
    caption: "The point is judgment, not trend-chasing.",
    imageClassName: "object-cover object-[center_36%]",
  },
  panel: {
    src: "/about/panel-stage.jpeg",
    alt: "Founder participating in a panel discussion on stage",
    eyebrow: "Panels",
    title: "Comfortable in rooms with more stakeholders and higher stakes.",
    caption: "That experience shows up now as tighter recommendations and cleaner follow-through.",
    imageClassName: "object-cover object-center",
  },
  workshop: {
    src: "/about/strongdm-aws-workshop.jpeg",
    alt: "StrongDM and AWS workshop poster featuring the founder",
    eyebrow: "Workshop",
    title: "Hands-on sessions, not abstract positioning.",
    caption: "Technical instruction and partner-facing delivery under public brand standards.",
  },
  hcc: {
    src: "/about/hcc-photo.jpeg",
    alt: "Founder at Houston Community College with event participants",
    eyebrow: "Community",
    title: "Local programs and public-facing education work.",
    caption: "Clear explanation matters even more when the audience is mixed.",
    imageClassName: "object-cover object-[center_34%]",
  },
  cloudathon: {
    src: "/about/cloudathon-stage.jpeg",
    alt: "Founder speaking to a Cloudathon at UH audience",
    eyebrow: "Teaching",
    title: "Workshop and stage work that rewards directness.",
    caption: "The same style carries into reviews, scoping, and technical write-ups.",
    imageClassName: "object-cover object-center",
  },
} as const;

const ABOUT_FACTS = [
  {
    label: "Founder",
    value: PUBLIC_LAUNCH_FOUNDER_PROFILE.name,
  },
  {
    label: "Base",
    value: PUBLIC_LAUNCH_CONTACT.location,
  },
  {
    label: "Credential",
    value: PUBLIC_LAUNCH_FOUNDER_PROFILE.credentials[0],
  },
  {
    label: "Response",
    value: PUBLIC_LAUNCH_CONTACT.responseWindowLabel,
  },
] as const;

type PortfolioImageCardProps = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

function PortfolioImageCard({
  src,
  alt,
  eyebrow,
  title,
  caption,
  sizes,
  className,
  imageClassName,
  priority = false,
}: PortfolioImageCardProps) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border/70 bg-slate-100 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="relative min-h-[17rem]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover transition duration-700 ease-out group-hover:scale-[1.03]",
            imageClassName,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/94 via-slate-950/30 to-transparent" />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
        <div className="space-y-2 rounded-[1.4rem] border border-white/12 bg-slate-950/52 p-4 backdrop-blur-sm md:p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
            {eyebrow}
          </p>
          <div className="space-y-1.5">
            <h2 className="font-display max-w-[18ch] text-[1.28rem] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[1.5rem]">
              {title}
            </h2>
            <p className="max-w-[38ch] text-sm leading-6 text-white/84">{caption}</p>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

type PortfolioPosterCardProps = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  sizes: string;
  className?: string;
};

function PortfolioPosterCard({
  src,
  alt,
  eyebrow,
  title,
  caption,
  sizes,
  className,
}: PortfolioPosterCardProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-[var(--shadow-card)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      <div className="relative aspect-square bg-white">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-contain p-3 md:p-4" />
      </div>
      <figcaption className="space-y-2 border-t border-border/60 px-5 py-4 md:px-6 md:py-5">
        <p className="enterprise-kicker">{eyebrow}</p>
        <div className="space-y-1.5">
          <h2 className="font-display text-[1.35rem] font-semibold leading-[1.02] tracking-[-0.03em] text-card-foreground">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{caption}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default async function AboutPage() {
  const session = await auth();
  const primaryCta = getConsultationCta({
    signedIn: Boolean(session?.user?.email),
    utmMedium: "about-page",
  });

  return (
    <div className="marketing-stack">
      <section className="hero-bleed hero-poster border-b border-border/70">
        <div className="marketing-container px-4 py-8 md:px-6 md:py-10 xl:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-6 lg:col-span-5 lg:pb-3">
              <div className="space-y-4">
                <p className="enterprise-kicker">{ABOUT_PAGE_CONTENT.hero.eyebrow}</p>
                <h1 className="font-display max-w-[11ch] text-balance text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.055em] text-card-foreground md:text-[4.5rem] lg:text-[5.15rem]">
                  {ABOUT_PAGE_CONTENT.hero.title}
                </h1>
                <p className="max-w-[45ch] text-base leading-8 text-muted-foreground md:text-[1.05rem]">
                  {ABOUT_PAGE_CONTENT.hero.lede}
                </p>
                <p className="max-w-[45ch] text-sm leading-7 text-card-foreground/82 md:text-[0.98rem]">
                  The goal is simple: show the rooms, the work, and the communication style behind
                  the practice without pretending ZoKorp is a giant firm.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={primaryCta.href} className={buttonVariants()}>
                  {primaryCta.label}
                </Link>
                <Link href="/services" className={buttonVariants({ variant: "secondary" })}>
                  View services
                </Link>
              </div>

              <dl className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
                {ABOUT_FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-[1.35rem] border border-border/70 bg-white/72 px-4 py-3 shadow-[var(--shadow-soft)]"
                  >
                    <dt className="table-kicker">{fact.label}</dt>
                    <dd className="mt-1.5 text-sm leading-6 text-card-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid gap-4 lg:col-span-7 md:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.74fr)]">
              <PortfolioImageCard
                src={ABOUT_PORTFOLIO_MEDIA.hero.src}
                alt={ABOUT_PORTFOLIO_MEDIA.hero.alt}
                eyebrow={ABOUT_PORTFOLIO_MEDIA.hero.eyebrow}
                title={ABOUT_PORTFOLIO_MEDIA.hero.title}
                caption={ABOUT_PORTFOLIO_MEDIA.hero.caption}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 68vw, 44vw"
                className="min-h-[24rem] md:min-h-[31rem]"
                imageClassName={ABOUT_PORTFOLIO_MEDIA.hero.imageClassName}
                priority
              />

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <PortfolioImageCard
                  src={ABOUT_PORTFOLIO_MEDIA.summit.src}
                  alt={ABOUT_PORTFOLIO_MEDIA.summit.alt}
                  eyebrow={ABOUT_PORTFOLIO_MEDIA.summit.eyebrow}
                  title={ABOUT_PORTFOLIO_MEDIA.summit.title}
                  caption={ABOUT_PORTFOLIO_MEDIA.summit.caption}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 28vw, 22vw"
                  className="min-h-[16rem] md:min-h-[15rem]"
                  imageClassName={ABOUT_PORTFOLIO_MEDIA.summit.imageClassName}
                />
                <PortfolioImageCard
                  src={ABOUT_PORTFOLIO_MEDIA.nvidia.src}
                  alt={ABOUT_PORTFOLIO_MEDIA.nvidia.alt}
                  eyebrow={ABOUT_PORTFOLIO_MEDIA.nvidia.eyebrow}
                  title={ABOUT_PORTFOLIO_MEDIA.nvidia.title}
                  caption={ABOUT_PORTFOLIO_MEDIA.nvidia.caption}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 28vw, 22vw"
                  className="min-h-[16rem] md:min-h-[15rem]"
                  imageClassName={ABOUT_PORTFOLIO_MEDIA.nvidia.imageClassName}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band px-5 py-6 md:px-6 md:py-7">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="enterprise-kicker">{FOUNDER_PROOF_PAGE_CONTENT.about.narrative.eyebrow}</p>
              <h2 className="font-display max-w-[14ch] text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.6rem]">
                {FOUNDER_PROOF_PAGE_CONTENT.about.narrative.title}
              </h2>
            </div>

            <div className="space-y-4">
              {FOUNDER_PROOF_PAGE_CONTENT.about.narrative.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-card-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-white/76 px-5 py-5 shadow-[var(--shadow-soft)]">
              <p className="enterprise-kicker">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.eyebrow}
              </p>
              <h3 className="font-display text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.03em] text-card-foreground">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.title}
              </h3>
              <p className="text-sm leading-7 text-card-foreground">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.statement}
              </p>
              <p className="table-kicker text-[rgb(var(--z-ink-label))]">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.sectorLine}
              </p>
              <p className="text-xs leading-6 text-muted-foreground">
                {FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.disclaimer}
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(15rem,0.88fr)]">
            <PortfolioImageCard
              src={ABOUT_PORTFOLIO_MEDIA.panel.src}
              alt={ABOUT_PORTFOLIO_MEDIA.panel.alt}
              eyebrow={ABOUT_PORTFOLIO_MEDIA.panel.eyebrow}
              title={ABOUT_PORTFOLIO_MEDIA.panel.title}
              caption={ABOUT_PORTFOLIO_MEDIA.panel.caption}
              sizes="(max-width: 1280px) 100vw, 42vw"
              className="min-h-[21rem] xl:min-h-[28rem]"
              imageClassName={ABOUT_PORTFOLIO_MEDIA.panel.imageClassName}
            />
            <PortfolioPosterCard
              src={ABOUT_PORTFOLIO_MEDIA.workshop.src}
              alt={ABOUT_PORTFOLIO_MEDIA.workshop.alt}
              eyebrow={ABOUT_PORTFOLIO_MEDIA.workshop.eyebrow}
              title={ABOUT_PORTFOLIO_MEDIA.workshop.title}
              caption={ABOUT_PORTFOLIO_MEDIA.workshop.caption}
              sizes="(max-width: 1280px) 70vw, 22vw"
            />
          </div>
        </div>
      </section>

      <section className="section-band grid gap-7 px-5 py-6 md:px-6 md:py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="enterprise-kicker">{FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.eyebrow}</p>
            <h2 className="font-display max-w-[14ch] text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.55rem]">
              What clients get from that background.
            </h2>
          </div>

          <p className="max-w-[46ch] text-base leading-8 text-card-foreground">
            {FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.support}
          </p>

          <ul className="grid gap-3">
            {FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.bullets.map((bullet, index) => (
              <li
                key={bullet}
                className="rounded-[1.45rem] border border-border/70 bg-white/78 px-4 py-4 shadow-[var(--shadow-soft)]"
              >
                <p className="table-kicker">{`0${index + 1}`}</p>
                <p className="mt-1.5 text-sm leading-7 text-card-foreground">{bullet}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PortfolioImageCard
            src={ABOUT_PORTFOLIO_MEDIA.cloudathon.src}
            alt={ABOUT_PORTFOLIO_MEDIA.cloudathon.alt}
            eyebrow={ABOUT_PORTFOLIO_MEDIA.cloudathon.eyebrow}
            title={ABOUT_PORTFOLIO_MEDIA.cloudathon.title}
            caption={ABOUT_PORTFOLIO_MEDIA.cloudathon.caption}
            sizes="(max-width: 768px) 100vw, 38vw"
            className="min-h-[20rem] md:col-span-2 md:min-h-[24rem]"
            imageClassName={ABOUT_PORTFOLIO_MEDIA.cloudathon.imageClassName}
          />
          <PortfolioImageCard
            src={ABOUT_PORTFOLIO_MEDIA.hcc.src}
            alt={ABOUT_PORTFOLIO_MEDIA.hcc.alt}
            eyebrow={ABOUT_PORTFOLIO_MEDIA.hcc.eyebrow}
            title={ABOUT_PORTFOLIO_MEDIA.hcc.title}
            caption={ABOUT_PORTFOLIO_MEDIA.hcc.caption}
            sizes="(max-width: 768px) 100vw, 18vw"
            className="min-h-[18rem] md:min-h-[21rem]"
            imageClassName={ABOUT_PORTFOLIO_MEDIA.hcc.imageClassName}
          />
          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,rgba(10,21,38,0.98),rgba(18,45,80,0.92))] p-5 text-white shadow-[var(--shadow-hero)] md:min-h-[21rem]">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/68">Operating style</p>
              <h2 className="font-display max-w-[12ch] text-[1.6rem] font-semibold leading-[1.04] tracking-[-0.03em]">
                Small-scope delivery, not enterprise theater.
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-white/82">
              <p>
                ZoKorp is intentionally built around founder-level involvement, bounded engagements,
                and practical technical judgment.
              </p>
              <p>
                The bigger-environment background matters because it helps filter noise faster. It
                does not change the operating model into a bloated consultancy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band grid gap-7 px-5 py-6 md:px-6 md:py-7 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="enterprise-kicker">Interview</p>
            <h2 className="font-display max-w-[12ch] text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.45rem]">
              TV interview footage, embedded directly.
            </h2>
          </div>
          <p className="max-w-[44ch] text-base leading-8 text-card-foreground">
            This section starts at the point where Zohaib is introduced during the Houston
            Community College interview from his AWS period. It belongs here because it shows the
            communication style in motion, not just in still images.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={ABOUT_VIDEO_WATCH_URL}
              className={buttonVariants({ variant: "secondary" })}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
            <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>
              Ask about a project
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-card)]">
          <div className="aspect-video w-full bg-slate-950">
            <iframe
              title="Houston Community College TV interview with Zohaib Khawaja"
              src={ABOUT_VIDEO_EMBED_URL}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="section-band grid gap-6 px-5 py-6 md:px-6 md:py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-2">
          <p className="enterprise-kicker">Contact</p>
          <h2 className="font-display text-[2rem] font-semibold leading-[1.02] text-card-foreground">
            Use the contact form for first reach-out.
          </h2>
          <p className="max-w-[42ch] text-sm leading-7 text-muted-foreground">
            {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
          </p>
        </div>
        <Link href="/contact" className={buttonVariants()}>
          Request a call
        </Link>
      </section>
    </div>
  );
}
