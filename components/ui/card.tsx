import * as React from "react";

import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "glass" | "muted";
  lift?: boolean;
};

const toneClasses = {
  default: "surface",
  glass: "glass-surface",
  muted: "surface-muted",
} as const;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone = "default", lift = false, ...props },
  ref,
) {
  return <div ref={ref} className={cn(toneClasses[tone], lift && "lift-card", className)} {...props} />;
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
