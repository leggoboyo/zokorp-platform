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
    <section className={cn("table-band rounded-[1.8rem] p-5 md:p-6", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2.5">
          <p className="enterprise-kicker">Learn more</p>
          <h3 className="font-display max-w-[18ch] text-2xl font-semibold text-card-foreground md:text-[2rem] md:leading-[1.05]">
            {title}
          </h3>
          {summary ? <p className="measure-copy text-sm leading-7 text-muted-foreground">{summary}</p> : null}
        </div>

        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-card-foreground transition hover:border-border-strong"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? "Hide details" : label}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={cn("size-4 transition-transform", open ? "rotate-180" : "rotate-0")}
          >
            <path
              d="M3.5 6.25 8 10.75l4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
            />
          </svg>
        </button>
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="mt-6 border-t border-border pt-6"
      >
        {children}
      </div>
    </section>
  );
}
