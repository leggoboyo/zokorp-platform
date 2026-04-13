import * as React from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "border-transparent bg-brand text-white shadow-[0_14px_30px_rgb(var(--z-accent)/0.22)] hover:bg-brand-strong",
  secondary:
    "border-border bg-card text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] hover:border-border-strong hover:bg-muted",
  outline:
    "border-border bg-background/80 text-foreground hover:border-border-strong hover:bg-muted",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted/90",
  inverse:
    "border-white/15 bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] hover:border-white/25 hover:bg-white/[0.14]",
  destructive: "border-transparent bg-danger text-white hover:brightness-95",
  link: "border-transparent bg-transparent px-0 py-0 text-brand shadow-none hover:text-brand-strong hover:underline",
} as const;

const sizeClasses = {
  sm: "min-h-9 rounded-lg px-3 py-2 text-xs",
  md: "min-h-10 rounded-xl px-4 py-2.5 text-sm",
  lg: "min-h-11 rounded-xl px-5 py-3 text-[0.95rem]",
  icon: "size-10 rounded-xl p-0",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
}: ButtonVariantOptions = {}) {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 border font-semibold transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    loading && "cursor-progress",
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantOptions & {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
});
