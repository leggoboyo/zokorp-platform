"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type AboutRevealVariant = "copy" | "media" | "detail";

type AboutRevealProps = {
  children: ReactNode;
  delay?: number;
  variant?: AboutRevealVariant;
} & HTMLAttributes<HTMLDivElement>;

export function AboutReveal({
  children,
  className,
  delay = 0,
  variant = "copy",
  style,
  ...props
}: AboutRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    node.dataset.aboutRevealReady = "true";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.aboutRevealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.aboutRevealed = "true";
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("about-reveal", className)}
      data-about-reveal=""
      data-about-reveal-ready="false"
      data-about-revealed="false"
      data-about-reveal-variant={variant}
      style={{ ...style, "--about-reveal-delay": `${delay}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
