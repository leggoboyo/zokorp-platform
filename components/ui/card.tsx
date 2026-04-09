import * as React from "react";

import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "glass" | "muted" | "plain";
  lift?: boolean;
};

const toneClasses = {
  default: "bg-surface shadow-[var(--shadow-card)]",
  glass:
    "border-[rgba(183,197,218,0.75)] bg-[linear-gradient(140deg,var(--surface-glass-start),var(--surface-glass-end))] shadow-[var(--shadow-glass)] supports-[backdrop-filter]:backdrop-blur-[10px]",
  muted: "bg-surface-muted shadow-[var(--shadow-soft)]",
  plain: "",
} as const;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone = "default", lift = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[var(--radius-panel)] border border-border",
        toneClasses[tone],
        lift && "lift-card",
        className,
      )}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />;
  },
);

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("space-y-4", className)} {...props} />;
  },
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn("flex flex-wrap items-center gap-3", className)} {...props} />;
  },
);
