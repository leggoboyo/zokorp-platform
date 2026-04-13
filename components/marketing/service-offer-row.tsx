import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ServiceOfferRowProps = {
  eyebrow: string;
  title: string;
  priceAnchor: string;
  summary: string;
  bullets: readonly string[];
  included: readonly string[];
  index?: number;
  className?: string;
  compact?: boolean;
};

export function ServiceOfferRow({
  eyebrow,
  title,
  priceAnchor,
  summary,
  bullets,
  included,
  index,
  className,
  compact = false,
}: ServiceOfferRowProps) {
  return (
    <article
      className={cn(
        "grid gap-6 border-t border-border/80 py-6 first:border-t-0 first:pt-0 lg:grid-cols-[auto_minmax(0,0.48fr)_minmax(0,1fr)_auto] lg:items-start",
        className,
      )}
    >
      <div className="hidden lg:block lg:pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-label">
          {index ? `0${index}` : "Offer"}
        </p>
      </div>

      <div className="space-y-2">
        <p className="enterprise-kicker">{eyebrow}</p>
        <h3
          className={cn(
            "font-display max-w-[12ch] font-semibold leading-[1.02] text-card-foreground",
            compact ? "text-[1.8rem]" : "text-[2.2rem]",
          )}
        >
          {title}
        </h3>
        <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">{summary}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)]">
        <ul className="marketing-list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <div className="rounded-[1.35rem] border border-border/80 bg-white/55 px-4 py-4 backdrop-blur-sm">
          <p className="enterprise-kicker">What you get</p>
          <div className="mt-3 grid gap-2.5">
            {included.map((item) => (
              <div key={item} className="text-sm text-card-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start lg:justify-end">
        <Badge variant="secondary" className="normal-case tracking-normal">
          {priceAnchor}
        </Badge>
      </div>
    </article>
  );
}
