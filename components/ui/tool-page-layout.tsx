import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ToolPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  alert?: React.ReactNode;
  actions?: React.ReactNode;
  pricing?: React.ReactNode;
  secondary?: React.ReactNode;
  heroTone?: "glass" | "hero";
  children: React.ReactNode;
};

export function ToolPageLayout({
  eyebrow,
  title,
  description,
  meta,
  alert,
  actions,
  pricing,
  secondary,
  heroTone = "glass",
  children,
}: ToolPageLayoutProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <section
        className={cn(
          heroTone === "hero"
            ? "hero-surface animate-fade-up px-6 py-8 text-white md:px-8"
            : "glass-surface animate-fade-up rounded-2xl p-6 md:p-8",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            heroTone === "hero" ? "text-slate-200" : "text-slate-500",
          )}
        >
          {eyebrow}
        </p>
        <h1
          className={cn(
            "font-display mt-2 text-balance text-4xl font-semibold",
            heroTone === "hero" ? "text-white" : "text-slate-900",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-3 max-w-3xl text-sm leading-7 md:text-base",
            heroTone === "hero" ? "text-slate-100/95" : "text-slate-600",
          )}
        >
          {description}
        </p>
        {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
        {alert ? <div className="mt-5">{alert}</div> : null}
        {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
      </section>

      {pricing ? <div>{pricing}</div> : null}

      <div className="space-y-6">
        <Card className="rounded-2xl p-0 shadow-none">{children}</Card>
      </div>

      {secondary ? <div>{secondary}</div> : null}
    </div>
  );
}
