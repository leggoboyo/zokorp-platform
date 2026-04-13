import { cn } from "@/lib/utils";

type MarketingSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: "h1" | "h2" | "h3";
};

export function MarketingSectionHeading({
  eyebrow,
  title,
  description,
  aside,
  className,
  titleClassName,
  descriptionClassName,
  titleAs = "h2",
}: MarketingSectionHeadingProps) {
  const TitleTag = titleAs;

  return (
    <header className={cn("marketing-section-heading gap-5", className)}>
      <div className="space-y-3">
        <p className="enterprise-kicker">{eyebrow}</p>
        <TitleTag
          className={cn("font-display max-w-[16ch] text-3xl font-semibold text-foreground md:text-4xl", titleClassName)}
        >
          {title}
        </TitleTag>
      </div>

      {description || aside ? (
        <div className="space-y-4">
          {description ? (
            <p className={cn("marketing-section-copy text-base leading-7 text-muted-foreground", descriptionClassName)}>
              {description}
            </p>
          ) : null}
          {aside}
        </div>
      ) : null}
    </header>
  );
}
