import Link from "next/link";

import { isPasswordAuthEnabled } from "@/lib/auth-config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/software", label: "Software" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/media", label: "Media" },
  { href: "/about", label: "About" },
  { href: "/account", label: "Account" },
];

export function SiteHeader() {
  const authRuntimeReady = isPasswordAuthEnabled() && Boolean(process.env.NEXTAUTH_SECRET);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/78 backdrop-blur-xl">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#081f3d] via-[#0f3460] to-[#0a6f87] px-4 py-1.5 text-center text-xs text-slate-100">
        Server-validated tools, account-linked billing, and AWS delivery workflows in one platform.
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <Link
              href="/"
              className="font-display inline-flex w-fit items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(15,142,169,0.14)]" />
              ZoKorp Platform
            </Link>

            <nav className="glass-surface flex flex-wrap items-center gap-1.5 px-2 py-1.5 text-sm text-slate-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring rounded-full border border-transparent px-3 py-1.5 font-medium transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-sm text-slate-700">
            {authRuntimeReady ? (
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Link
                  href="/login"
                  className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="focus-ring inline-flex rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white transition hover:bg-slate-800"
                >
                  Create account
                </Link>
              </div>
            ) : (
              <span className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-900">
                Auth setup pending
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
