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

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.25) {
      node.dataset.aboutRevealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.aboutRevealed = "true";
            observer.disconnect();
            window.clearTimeout(fallbackTimer);
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px 40% 0px",
      },
    );

    observer.observe(node);

    const fallbackTimer = window.setTimeout(() => {
      node.dataset.aboutRevealed = "true";
      observer.disconnect();
    }, 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
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
