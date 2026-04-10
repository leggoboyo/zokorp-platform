import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "focus-ring block min-h-28 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground shadow-[var(--shadow-soft)] placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:bg-background-elevated disabled:text-foreground-muted",
        className,
      )}
      {...props}
    />
  );
});
