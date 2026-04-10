import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
        <input
          ref={ref}
          type={type}
          className={cn(
          "focus-ring block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground shadow-[var(--shadow-soft)] placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:bg-background-elevated disabled:text-foreground-muted",
          className,
        )}
        {...props}
      />
    );
  },
);
