import * as React from "react";

import { cn } from "@/lib/utils";

const toneClasses = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
  neutral: "border-border bg-card text-card-foreground",
} as const;

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof toneClasses;
};

export function Alert({ className, tone = "neutral", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border px-4 py-3 text-sm shadow-[var(--shadow-soft)]", toneClasses[tone], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 leading-6", className)} {...props} />;
}
