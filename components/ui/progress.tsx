import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  tone?: "brand" | "info" | "success";
};

const toneClasses = {
  brand: "bg-brand",
  info: "bg-sky-500",
  success: "bg-emerald-500",
} as const;

export function Progress({ className, value, max = 100, tone = "brand", ...props }: ProgressProps) {
  const safeMax = Math.max(1, max);
  const percent = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-3 overflow-hidden rounded-full bg-background-emphasis", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300 ease-out", toneClasses[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
