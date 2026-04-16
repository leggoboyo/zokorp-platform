import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AboutInterviewPlayer } from "@/components/marketing/about-interview-player";
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

const ABOUT_VIDEO_WATCH_URL =
  "https://youtu.be/bQvrHYfJgl8?si=NyWuv4OgzW0-SQad&t=1320";
const ABOUT_LOCAL_VIDEO_SOURCE = "/about/hcc-tv-interview.mp4";
const ABOUT_LOCAL_VIDEO_POSTER = "/about/hcc-photo.jpeg";
const ABOUT_LOCAL_VIDEO_START_SECONDS = 1320;

const ABOUT_PORTFOLIO_MEDIA = {
  hero: {
    src: "/about/talk-agent-stage.jpeg",
    alt: "Zohaib Khawaja presenting an AI agents talk on stage",
    eyebrow: "Speaking",
    title: "Public technical explanation, not closed-room positioning.",
    caption:
      "The communication style behind ZoKorp is visible in rooms, not hidden behind polished sales language.",
    imageClassName: "object-cover object-[center_54%]",
  },
  summit: {
    src: "/about/aws-summit-atrium.jpeg",
    alt: "Founder standing inside the AWS Summit venue atrium",
    eyebrow: "Fieldwork",
    title: "Larger technical environments, smaller-practice delivery.",
    caption: "Enterprise context matters here because it sharpens judgment before work starts.",
    imageClassName: "object-cover object-center",
  },
  nvidia: {
    src: "/about/nvidia-ai-summit.jpeg",
    alt: "Founder at NVIDIA AI Summit",
    eyebrow: "Events",
    title: "AI work kept grounded in real rooms.",
    caption: "The point is signal, not trend theater.",
    imageClassName: "object-cover object-[center_36%]",
  },
  panel: {
    src: "/about/panel-stage.jpeg",
    alt: "Founder participating in a panel discussion on stage",
    eyebrow: "Panels",
    title: "Comfortable in rooms with more stakeholders and higher stakes.",
    caption:
      "That experience shows up now as clearer tradeoff calls, tighter scoping, and less vague follow-through.",
    imageClassName: "object-cover object-center",
  },
  workshop: {
    src: "/about/strongdm-aws-workshop.jpeg",
    alt: "StrongDM and AWS workshop poster featuring the founder",
    eyebrow: "Workshop",
    title: "Hands-on sessions, not abstract positioning.",
    caption: "Partner-facing technical delivery under public brand standards.",
  },
  hcc: {
    src: "/about/hcc-photo.jpeg",
    alt: "Founder at Houston Community College with event participants",
    eyebrow: "Community",
    title: "Public-facing education work close to home.",
    caption: "Clarity matters even more when the audience is mixed and the room is live.",
    imageClassName: "object-cover object-[center_34%]",
  },
  cloudathon: {
    src: "/about/cloudathon-stage.jpeg",
    alt: "Founder speaking to a Cloudathon at UH audience",
    eyebrow: "Teaching",
    title: "Direct workshop and stage work that rewards precision.",
    caption: "The same operating style carries into reviews, scoping, and technical write-ups.",
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

type AboutImageCardVariant = "featured" | "hoverReveal" | "artifact";

type AboutImageCardProps = {
  variant: AboutImageCardVariant;
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  mediaClassName?: string;
  priority?: boolean;
};

function AboutImageCard({
  variant,
  src,
  alt,
  eyebrow,
  title,
  caption,
  sizes,
  className,
  imageClassName,
  mediaClassName,
  priority = false,
}: AboutImageCardProps) {
  if (variant === "artifact") {
    return (
      <figure
        className={cn(
          "overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-[var(--shadow-soft)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
          className,
        )}
      >
        <div className={cn("relative aspect-square bg-white", mediaClassName)}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            loading="eager"
            className="object-contain p-4 md:p-5"
          />
        </div>
        <figcaption className="space-y-2 border-t border-border/60 px-5 py-4 md:px-6 md:py-5">
          <p className="enterprise-kicker">{eyebrow}</p>
          <p className="text-lg font-semibold leading-[1.15] tracking-[-0.02em] text-card-foreground">
            {title}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{caption}</p>
        </figcaption>
      </figure>
    );
  }

  if (variant === "hoverReveal") {
    return (
      <figure className={cn("group space-y-3", className)}>
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] border border-border/70 bg-slate-100 shadow-[var(--shadow-soft)]",
            mediaClassName,
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading="eager"
            className={cn(
              "object-cover transition duration-700 ease-out group-hover:scale-[1.035]",
              imageClassName,
            )}
          />
          <div className="absolute left-4 top-4 rounded-full border border-white/28 bg-slate-950/60 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {eyebrow}
          </div>
          <div className="absolute inset-0 hidden bg-gradient-to-t from-slate-950/82 via-slate-950/12 to-transparent opacity-0 transition duration-300 group-hover:opacity-100 md:block" />
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-3 px-5 pb-5 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="space-y-1 rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4 backdrop-blur-sm">
              <p className="text-base font-semibold leading-[1.15] tracking-[-0.02em]">{title}</p>
              <p className="text-sm leading-6 text-white/82">{caption}</p>
            </div>
          </div>
        </div>

        <figcaption className="space-y-1 px-1 md:hidden">
          <p className="enterprise-kicker">{eyebrow}</p>
          <p className="text-base font-semibold leading-[1.15] tracking-[-0.02em] text-card-foreground">
            {title}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{caption}</p>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={cn("space-y-4", className)}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-[2rem] border border-border/70 bg-slate-100 shadow-[var(--shadow-soft)]",
          mediaClassName,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading="eager"
          className={cn(
            "object-cover transition duration-700 ease-out group-hover:scale-[1.025]",
            imageClassName,
          )}
        />
      </div>
      <figcaption className="space-y-2 px-1">
        <p className="enterprise-kicker">{eyebrow}</p>
        <p className="max-w-[28ch] text-lg font-semibold leading-[1.12] tracking-[-0.025em] text-card-foreground">
          {title}
        </p>
        <p className="max-w-[48ch] text-sm leading-7 text-muted-foreground">{caption}</p>
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
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
            <div className="space-y-7 lg:pt-6">
              <div className="space-y-4">
                <p className="enterprise-kicker">{ABOUT_PAGE_CONTENT.hero.eyebrow}</p>
                <h1 className="font-display max-w-[10ch] text-balance text-[3.1rem] font-semibold leading-[0.93] tracking-[-0.055em] text-card-foreground md:text-[4.35rem] lg:text-[5rem]">
                  {ABOUT_PAGE_CONTENT.hero.title}
                </h1>
                <p className="max-w-[40ch] text-base leading-8 text-muted-foreground md:text-[1.02rem]">
                  {ABOUT_PAGE_CONTENT.hero.lede}
                </p>
                <p className="max-w-[41ch] text-sm leading-7 text-card-foreground/82 md:text-[0.98rem]">
                  The point is not prestige theater. It is visible communication under scrutiny,
                  packaged here as smaller, founder-led work.
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

              <dl className="grid gap-x-6 gap-y-4 border-t border-border/70 pt-5 sm:grid-cols-2">
                {ABOUT_FACTS.map((fact) => (
                  <div key={fact.label} className="space-y-1.5 pb-1">
                    <dt className="table-kicker">{fact.label}</dt>
                    <dd className="text-sm leading-6 text-card-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid gap-5 lg:pt-6 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.62fr)]">
              <AboutImageCard
                variant="featured"
                src={ABOUT_PORTFOLIO_MEDIA.hero.src}
                alt={ABOUT_PORTFOLIO_MEDIA.hero.alt}
                eyebrow={ABOUT_PORTFOLIO_MEDIA.hero.eyebrow}
                title={ABOUT_PORTFOLIO_MEDIA.hero.title}
                caption={ABOUT_PORTFOLIO_MEDIA.hero.caption}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 68vw, 42vw"
                mediaClassName="aspect-[16/11] min-h-[20rem] md:min-h-[27rem]"
                imageClassName={ABOUT_PORTFOLIO_MEDIA.hero.imageClassName}
                priority
              />

              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1">
                <AboutImageCard
                  variant="hoverReveal"
                  src={ABOUT_PORTFOLIO_MEDIA.summit.src}
                  alt={ABOUT_PORTFOLIO_MEDIA.summit.alt}
                  eyebrow={ABOUT_PORTFOLIO_MEDIA.summit.eyebrow}
                  title={ABOUT_PORTFOLIO_MEDIA.summit.title}
                  caption={ABOUT_PORTFOLIO_MEDIA.summit.caption}
                  sizes="(max-width: 768px) 48vw, (max-width: 1200px) 28vw, 20vw"
                  mediaClassName="aspect-[4/4.9] min-h-[15rem]"
                  imageClassName={ABOUT_PORTFOLIO_MEDIA.summit.imageClassName}
                />
                <AboutImageCard
                  variant="hoverReveal"
                  src={ABOUT_PORTFOLIO_MEDIA.nvidia.src}
                  alt={ABOUT_PORTFOLIO_MEDIA.nvidia.alt}
                  eyebrow={ABOUT_PORTFOLIO_MEDIA.nvidia.eyebrow}
                  title={ABOUT_PORTFOLIO_MEDIA.nvidia.title}
                  caption={ABOUT_PORTFOLIO_MEDIA.nvidia.caption}
                  sizes="(max-width: 768px) 48vw, (max-width: 1200px) 28vw, 20vw"
                  mediaClassName="aspect-[4/4.9] min-h-[15rem]"
                  imageClassName={ABOUT_PORTFOLIO_MEDIA.nvidia.imageClassName}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band space-y-10 px-5 py-6 md:px-6 md:py-7">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="enterprise-kicker">{FOUNDER_PROOF_PAGE_CONTENT.about.narrative.eyebrow}</p>
              <h2 className="font-display max-w-[13ch] text-balance text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.6rem]">
                {FOUNDER_PROOF_PAGE_CONTENT.about.narrative.title}
              </h2>
            </div>

            <div className="space-y-4">
              {FOUNDER_PROOF_PAGE_CONTENT.about.narrative.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[42ch] text-base leading-8 text-card-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-white/72 px-5 py-5 shadow-[var(--shadow-soft)]">
              <p className="enterprise-kicker">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.eyebrow}
              </p>
              <p className="max-w-[18ch] text-[1.35rem] font-semibold leading-[1.08] tracking-[-0.025em] text-card-foreground">
                {FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.title}
              </p>
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

          <div className="space-y-6">
            <AboutImageCard
              variant="featured"
              src={ABOUT_PORTFOLIO_MEDIA.panel.src}
              alt={ABOUT_PORTFOLIO_MEDIA.panel.alt}
              eyebrow={ABOUT_PORTFOLIO_MEDIA.panel.eyebrow}
              title={ABOUT_PORTFOLIO_MEDIA.panel.title}
              caption={ABOUT_PORTFOLIO_MEDIA.panel.caption}
              sizes="(max-width: 1280px) 100vw, 42vw"
              mediaClassName="aspect-[16/10] min-h-[22rem]"
              imageClassName={ABOUT_PORTFOLIO_MEDIA.panel.imageClassName}
            />

            <div className="max-w-[30rem] lg:ml-auto">
              <AboutImageCard
                variant="artifact"
                src={ABOUT_PORTFOLIO_MEDIA.workshop.src}
                alt={ABOUT_PORTFOLIO_MEDIA.workshop.alt}
                eyebrow={ABOUT_PORTFOLIO_MEDIA.workshop.eyebrow}
                title={ABOUT_PORTFOLIO_MEDIA.workshop.title}
                caption={ABOUT_PORTFOLIO_MEDIA.workshop.caption}
                sizes="(max-width: 1280px) 72vw, 28vw"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-border/70 pt-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="enterprise-kicker">{FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.eyebrow}</p>
              <h2 className="font-display max-w-[12ch] text-balance text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.5rem]">
                What clients get from that background.
              </h2>
            </div>

            <p className="max-w-[44ch] text-base leading-8 text-card-foreground">
              {FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.support}
            </p>

            <ol className="overflow-hidden rounded-[1.85rem] border border-border/70 bg-white/76 shadow-[var(--shadow-soft)]">
              {FOUNDER_PROOF_PAGE_CONTENT.about.whyItMatters.bullets.map((bullet, index) => (
                <li
                  key={bullet}
                  className={cn(
                    "grid grid-cols-[2.4rem_minmax(0,1fr)] gap-3 px-4 py-4 md:px-5",
                    index > 0 ? "border-t border-border/60" : "",
                  )}
                >
                  <p className="table-kicker pt-0.5">{`0${index + 1}`}</p>
                  <p className="text-sm leading-7 text-card-foreground">{bullet}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <AboutImageCard
              variant="featured"
              src={ABOUT_PORTFOLIO_MEDIA.cloudathon.src}
              alt={ABOUT_PORTFOLIO_MEDIA.cloudathon.alt}
              eyebrow={ABOUT_PORTFOLIO_MEDIA.cloudathon.eyebrow}
              title={ABOUT_PORTFOLIO_MEDIA.cloudathon.title}
              caption={ABOUT_PORTFOLIO_MEDIA.cloudathon.caption}
              sizes="(max-width: 1280px) 100vw, 42vw"
              mediaClassName="aspect-[16/10] min-h-[21rem]"
              imageClassName={ABOUT_PORTFOLIO_MEDIA.cloudathon.imageClassName}
            />

            <div className="max-w-[29rem]">
              <AboutImageCard
                variant="hoverReveal"
                src={ABOUT_PORTFOLIO_MEDIA.hcc.src}
                alt={ABOUT_PORTFOLIO_MEDIA.hcc.alt}
                eyebrow={ABOUT_PORTFOLIO_MEDIA.hcc.eyebrow}
                title={ABOUT_PORTFOLIO_MEDIA.hcc.title}
                caption={ABOUT_PORTFOLIO_MEDIA.hcc.caption}
                sizes="(max-width: 1280px) 72vw, 28vw"
                mediaClassName="aspect-[4/5] min-h-[18rem]"
                imageClassName={ABOUT_PORTFOLIO_MEDIA.hcc.imageClassName}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-band space-y-8 px-5 py-6 md:px-6 md:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="enterprise-kicker">Interview</p>
            <h2 className="font-display max-w-[12ch] text-balance text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-card-foreground md:text-[2.45rem]">
              Interview footage from the AWS period, playable here.
            </h2>
            <p className="max-w-[48ch] text-base leading-8 text-card-foreground">
              This player opens at the point where Zohaib is introduced during the Houston
              Community College interview. It stays on the page because moving video says more than
              another block of proof copy.
            </p>
          </div>

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

        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-slate-950 shadow-[var(--shadow-card)]">
          <AboutInterviewPlayer
            src={ABOUT_LOCAL_VIDEO_SOURCE}
            poster={ABOUT_LOCAL_VIDEO_POSTER}
            startTimeSeconds={ABOUT_LOCAL_VIDEO_START_SECONDS}
            watchUrl={ABOUT_VIDEO_WATCH_URL}
            className="aspect-video w-full"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="enterprise-kicker">Contact</p>
            <p className="text-lg font-semibold leading-[1.15] tracking-[-0.02em] text-card-foreground">
              Use the contact form for first reach-out.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
            </p>
          </div>

          <Link href="/contact" className={buttonVariants()}>
            Request a call
          </Link>
        </div>
      </section>
    </div>
  );
}
