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
    <section className={cn("hero-surface px-5 py-6 md:px-8 md:py-10 lg:px-10 lg:py-12", className)}>
      <div
        data-hero-layout={rail ? "split" : "single"}
        className={cn("grid gap-6 lg:grid-cols-12 lg:items-start", rail ? "lg:gap-8" : "")}
      >
        <div
          data-surface="hero-copy"
          data-hero-body
          className={cn(
            "lg:col-span-7",
            isPanel
              ? "rounded-[1.9rem] border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-card)] md:p-8"
              : "text-white",
            bodyClassName,
          )}
        >
          <Badge
            variant={isPanel ? "secondary" : "outline"}
            className={cn(
              "w-fit normal-case tracking-[0.14em]",
              isPanel ? "bg-card text-muted-foreground" : "border-white/20 bg-white/10 text-white",
            )}
          >
            {eyebrow}
          </Badge>

          <h1
            className={cn(
              "font-display mt-5 max-w-[14ch] text-balance text-4xl font-semibold leading-[1.02] md:text-6xl",
              isPanel ? "text-card-foreground" : "text-white",
            )}
          >
            {title}
          </h1>

          <p
            data-measure="lede"
            className={cn(
              "measure-copy mt-5 text-base leading-7 md:text-lg",
              isPanel ? "text-muted-foreground" : "text-white/88",
            )}
          >
            {lede}
          </p>

          {supportingBullets.length > 0 ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {supportingBullets.map((bullet) => (
                <li
                  key={bullet}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium leading-6",
                    isPanel
                      ? "border-border bg-muted text-card-foreground"
                      : "border-white/12 bg-white/10 text-white",
                  )}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
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
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                    isPanel
                      ? "border-border bg-background text-muted-foreground"
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
          <div data-hero-rail className={cn("space-y-4 lg:col-span-5", railClassName)}>
            {rail}
          </div>
        ) : null}
      </div>
    </section>
  );
}
