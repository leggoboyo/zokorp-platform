"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

type LearnMoreProps = {
  title: string;
  summary?: string;
  label?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function LearnMore({
  title,
  summary,
  label = "Learn more",
  defaultOpen = false,
  className,
  children,
}: LearnMoreProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <section className={cn("rounded-[1.6rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] md:p-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="enterprise-kicker">{label}</p>
          <h3 className="font-display text-2xl font-semibold text-card-foreground">{title}</h3>
          {summary ? <p className="measure-copy text-sm leading-6 text-muted-foreground">{summary}</p> : null}
        </div>

        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-card-foreground transition hover:border-border-strong hover:bg-muted"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide details" : label}
        </button>
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="mt-5 border-t border-border pt-5"
      >
        {children}
      </div>
    </section>
  );
}
