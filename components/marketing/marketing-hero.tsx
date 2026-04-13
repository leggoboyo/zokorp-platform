import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketingAction = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  rel?: string;
};

type MarketingHeroProps = {
  mode?: "panel" | "inverted";
  eyebrow: string;
  title: string;
  lede: string;
  supportingBullets?: readonly string[];
  proofChips?: readonly string[];
  primaryAction: MarketingAction;
  secondaryAction?: MarketingAction;
  tertiaryAction?: MarketingAction;
  rail?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  railClassName?: string;
};

function renderAction(action: MarketingAction | undefined, fallbackVariant: ButtonVariant) {
  if (!action) {
    return null;
  }

  const variant = action.variant ?? fallbackVariant;
  const size = action.size ?? "lg";
  const className = buttonVariants({ variant, size });
  const isExternal = action.external ?? /^(https?:|mailto:)/.test(action.href);

  if (isExternal) {
    return (
      <a
        href={action.href}
        className={className}
        rel={action.rel ?? (action.href.startsWith("http") ? "noreferrer" : undefined)}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {action.label}
    </Link>
  );
}

export function MarketingHero({
  mode = "panel",
  eyebrow,
  title,
  lede,
  supportingBullets = [],
  proofChips = [],
  primaryAction,
  secondaryAction,
  tertiaryAction,
  rail,
  className,
  bodyClassName,
  railClassName,
}: MarketingHeroProps) {
  const isPanel = mode === "panel";

  return (
    <section className={cn("hero-surface marketing-grid-lines px-5 py-6 md:px-8 md:py-10 lg:px-10 lg:py-12", className)}>
      <div className="marketing-orbit" data-orbit="one" />
      <div className="marketing-orbit" data-orbit="two" />
      <div
        data-hero-layout={rail ? "split" : "single"}
        className={cn("relative z-10 grid gap-8 lg:grid-cols-12 lg:items-start", rail ? "lg:gap-8" : "")}
      >
        <div
          data-surface="hero-copy"
          data-hero-body
          className={cn(
            "lg:col-span-7",
            isPanel
              ? "glass-surface rounded-[2rem] p-6 text-card-foreground md:p-8 lg:p-10"
              : "text-white",
            bodyClassName,
          )}
        >
          <Badge
            variant={isPanel ? "secondary" : "outline"}
            className={cn(
              "w-fit rounded-full px-3.5 py-1.5 normal-case tracking-[0.18em]",
              isPanel
                ? "bg-white/80 text-muted-foreground"
                : "border-white/20 bg-white/10 text-white",
            )}
          >
            {eyebrow}
          </Badge>

          <h1
            className={cn(
              "font-display mt-6 max-w-[11.5ch] text-balance text-[2.85rem] font-semibold leading-[0.98] tracking-[-0.045em] md:text-[4.5rem] lg:text-[5.35rem]",
              isPanel ? "text-card-foreground" : "text-white",
            )}
          >
            {title}
          </h1>

          <p
            data-measure="lede"
            className={cn(
              "measure-copy mt-6 max-w-[58ch] text-base leading-7 md:text-[1.1rem] md:leading-8",
              isPanel ? "text-muted-foreground" : "text-white/88",
            )}
          >
            {lede}
          </p>

          {supportingBullets.length > 0 ? (
            <ul className="mt-8 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {supportingBullets.map((bullet) => (
                <li
                  key={bullet}
                  className={cn(
                    "relative pl-5 text-sm font-medium leading-6",
                    isPanel
                      ? "text-card-foreground"
                      : "text-white",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-2 size-2 rounded-full",
                      isPanel ? "bg-brand shadow-[0_0_0_6px_rgb(var(--z-accent)/0.12)]" : "bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.14)]",
                    )}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-9 flex flex-wrap gap-3">
            {renderAction(primaryAction, isPanel ? "primary" : "primary")}
            {renderAction(secondaryAction, isPanel ? "secondary" : "inverse")}
            {renderAction(tertiaryAction, isPanel ? "ghost" : "inverse")}
          </div>

          {proofChips.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {proofChips.map((chip) => (
                <span
                  key={chip}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.13em]",
                    isPanel
                      ? "border-border bg-white/84 text-muted-foreground"
                      : "border-white/16 bg-white/10 text-white/84",
                  )}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {rail ? (
          <div data-hero-rail className={cn("space-y-4 lg:col-span-5 lg:pt-2", railClassName)}>
            {rail}
          </div>
        ) : null}
      </div>
    </section>
  );
}
