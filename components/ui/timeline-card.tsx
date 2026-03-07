import * as React from "react";

import { cn } from "@/lib/utils";

type TimelineCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  summary?: React.ReactNode;
  details?: React.ReactNode;
  footer?: React.ReactNode;
};

export function TimelineCard({
  className,
  title,
  meta,
  badge,
  summary,
  details,
  footer,
  ...props
}: TimelineCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-background-elevated/85 px-4 py-4 text-sm shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{title}</div>
          {meta ? <div className="text-xs text-foreground-subtle">{meta}</div> : null}
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      {summary ? <div className="mt-3 text-foreground-muted">{summary}</div> : null}
      {details ? <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-subtle">{details}</div> : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </article>
  );
}
