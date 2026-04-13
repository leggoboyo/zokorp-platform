"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

type SiteHeaderShellProps = {
  primaryLinks: NavLink[];
  secondaryLinks: NavLink[];
  authRuntimeReady: boolean;
  bookCallHref: string;
  loginHref: string;
  registerHref: string;
};

const desktopNavLinkClass = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "rounded-full px-3.5 text-muted-foreground hover:bg-white/88 hover:text-foreground",
);

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.display !== "none" && styles.visibility !== "hidden";
  });
}

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    last.focus();
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function SiteHeaderShell({
  primaryLinks,
  secondaryLinks,
  authRuntimeReady,
  bookCallHref,
  loginHref,
  registerHref,
}: SiteHeaderShellProps) {
  const pathname = usePathname();
  const desktopMenuId = useId();
  const mobileMenuId = useId();
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeDesktopMenu = (restoreFocus = false) => {
    setDesktopOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => desktopTriggerRef.current?.focus());
    }
  };

  const closeMobileMenu = (restoreFocus = false) => {
    setMobileOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => mobileTriggerRef.current?.focus());
    }
  };

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    const frameId = requestAnimationFrame(() => {
      setDesktopOpen(false);
      setMobileOpen(false);
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname]);

  useEffect(() => {
    if (!desktopOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !desktopMenuRef.current?.contains(target) &&
        !desktopTriggerRef.current?.contains(target)
      ) {
        closeDesktopMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDesktopOpen(false);
        requestAnimationFrame(() => desktopTriggerRef.current?.focus());
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      const focusable = getFocusableElements(mobilePanelRef.current);
      focusable[0]?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        requestAnimationFrame(() => mobileTriggerRef.current?.focus());
        return;
      }

      trapFocus(event, mobilePanelRef.current);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!mobilePanelRef.current?.contains(target)) {
        closeMobileMenu(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [mobileOpen]);

  const bookCallAction = (
    <a href={bookCallHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
      Book a call
    </a>
  );

  const authActions = !authRuntimeReady ? (
    <>
      {bookCallAction}
      <Badge variant="warning" className="normal-case tracking-normal">
        Auth setup pending
      </Badge>
    </>
  ) : (
    <>
      {bookCallAction}
      <Link href={loginHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
        Sign in
      </Link>
      <Link href={registerHref} className={buttonVariants({ variant: "primary", size: "sm" })}>
        Create account
      </Link>
    </>
  );

  return (
    <div className="flex flex-1 items-center justify-end gap-3">
      <nav className="hidden items-center gap-1.5 rounded-full border border-border bg-white/68 px-2 py-1.5 text-sm shadow-[0_1px_0_rgba(255,255,255,0.84)_inset] backdrop-blur md:flex">
        {primaryLinks.map((link) => (
          <Link key={link.href} href={link.href} className={desktopNavLinkClass}>
            {link.label}
          </Link>
        ))}

        <div className="relative">
          <button
            ref={desktopTriggerRef}
            type="button"
            aria-expanded={desktopOpen}
            aria-controls={desktopMenuId}
            aria-haspopup="menu"
            className={desktopNavLinkClass}
            onClick={() => setDesktopOpen((value) => !value)}
          >
            More
          </button>

          {desktopOpen ? (
            <div
              ref={desktopMenuRef}
              id={desktopMenuId}
              aria-label="More pages"
              className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur"
            >
              <div className="space-y-1">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(desktopNavLinkClass, "w-full justify-start rounded-xl")}
                    onClick={() => closeDesktopMenu()}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </nav>

      <div className="hidden items-center gap-2 md:flex">{authActions}</div>

      <button
        ref={mobileTriggerRef}
        type="button"
        aria-label="Menu"
        aria-expanded={mobileOpen}
        aria-controls={mobileMenuId}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "border-border bg-card text-card-foreground md:hidden",
        )}
        onClick={() => setMobileOpen(true)}
      >
        <span className="inline-flex flex-col gap-1" aria-hidden="true">
          <span className="h-0.5 w-4 rounded-full bg-current" />
          <span className="h-0.5 w-4 rounded-full bg-current" />
          <span className="h-0.5 w-4 rounded-full bg-current" />
        </span>
        <span>Menu</span>
      </button>

      {mobileOpen ? (
        <div
          data-testid="mobile-nav-backdrop"
          className="fixed inset-0 z-[70] bg-slate-950/34 backdrop-blur-sm md:hidden"
          onClick={() => closeMobileMenu(true)}
        >
          <div
            ref={mobilePanelRef}
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex h-dvh w-[min(92vw,420px)] flex-col border-l border-border bg-[rgba(247,250,253,0.98)] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="enterprise-kicker">Navigation</p>
                <p className="mt-1 text-sm text-muted-foreground">Book a call or choose the next page.</p>
              </div>
              <button
                type="button"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                onClick={() => closeMobileMenu(true)}
              >
                Close
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-5 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {[...primaryLinks, ...secondaryLinks].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(buttonVariants({ variant: "ghost", size: "md", fullWidth: true }), "justify-start")}
                    onClick={() => closeMobileMenu()}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="border-t border-border pt-4">
              <div className="flex flex-col gap-2">{authActions}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
