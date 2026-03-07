import * as React from "react";

import { cn } from "@/lib/utils";

type RadioCardProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
  indicator?: React.ReactNode;
  wrapperClassName?: string;
};

export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { className, wrapperClassName, label, description, indicator, checked, disabled, children, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "focus-ring block rounded-2xl border p-4 transition",
        checked
          ? "border-brand bg-brand text-white shadow-[var(--shadow-soft)]"
          : "border-border bg-white text-foreground hover:border-border-strong hover:bg-background-elevated",
        disabled && "cursor-not-allowed opacity-60",
        wrapperClassName,
      )}
    >
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          disabled={disabled}
          className={cn("sr-only", className)}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
            checked ? "border-white bg-white/20" : "border-border-strong bg-white",
          )}
        >
          <span className={cn("size-2 rounded-full", checked ? "bg-white" : "bg-transparent")} />
        </span>
        {indicator ? <span className="shrink-0">{indicator}</span> : null}
        <span className="space-y-1">
          <span className="block text-sm font-semibold">{label}</span>
          {description ? (
            <span className={cn("block text-xs leading-5", checked ? "text-white/85" : "text-foreground-muted")}>
              {description}
            </span>
          ) : null}
          {children}
        </span>
      </div>
    </label>
  );
});
