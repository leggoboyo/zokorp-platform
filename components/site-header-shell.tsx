import Link from "next/link";

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
  "rounded-full border border-transparent px-3.5 text-[rgb(var(--z-ink-soft))] hover:border-[rgb(var(--z-border)/0.45)] hover:bg-[rgb(var(--z-panel-muted))] hover:text-[rgb(var(--z-ink))]",
);

const disclosureClass = cn(
  desktopNavLinkClass,
  "list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden",
);

export function SiteHeaderShell({
  primaryLinks,
  secondaryLinks,
  authRuntimeReady,
  bookCallHref,
  loginHref,
  registerHref,
}: SiteHeaderShellProps) {
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
      <nav className="hidden items-center gap-1.5 rounded-full border border-[rgb(var(--z-border)/0.55)] bg-[rgba(255,255,255,0.92)] px-2 py-1.5 text-sm shadow-[0_1px_0_rgba(255,255,255,0.84)_inset] md:flex">
        {primaryLinks.map((link) => (
          <Link key={link.href} href={link.href} className={desktopNavLinkClass}>
            {link.label}
          </Link>
        ))}

        <details className="group relative">
          <summary aria-label="More" role="button" className={disclosureClass}>
            More
          </summary>
          <div
            id="desktop-more-menu"
            aria-label="More pages"
            className="absolute right-0 top-full z-50 mt-2 hidden w-56 rounded-2xl border border-[rgb(var(--z-border)/0.55)] bg-[rgb(var(--z-panel))] p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)] group-open:block"
          >
            <div className="space-y-1">
              {secondaryLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn(desktopNavLinkClass, "w-full justify-start rounded-xl")}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </nav>

      <div className="hidden items-center gap-2 md:flex">{authActions}</div>

      <details className="relative md:hidden">
        <summary
          aria-label="Menu"
          role="button"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "border-[rgb(var(--z-border)/0.55)] bg-[rgb(var(--z-panel))] text-[rgb(var(--z-ink))] list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden",
          )}
        >
          <span className="inline-flex flex-col gap-1">
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
          </span>
          <span>Menu</span>
        </summary>

        <div
          id="mobile-nav-panel"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 right-0 top-[calc(100%+0.75rem)] z-40 rounded-[1.4rem] border border-[rgb(var(--z-border)/0.55)] bg-[rgb(var(--z-panel))] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
        >
          <div className="space-y-2">
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(buttonVariants({ variant: "ghost", size: "md", fullWidth: true }), "justify-start")}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-[rgb(var(--z-border)/0.55)] pt-4">
            <div className="flex flex-col gap-2">{authActions}</div>
          </div>
        </div>
      </details>
    </div>
  );
}
