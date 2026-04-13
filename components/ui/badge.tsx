import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-border bg-card text-card-foreground",
  secondary: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  brand: "border-brand/15 bg-brand-soft text-brand",
  outline: "border-border bg-transparent text-muted-foreground",
} as const;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
