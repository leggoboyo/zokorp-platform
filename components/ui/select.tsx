import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "focus-ring block w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:bg-background-elevated disabled:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
