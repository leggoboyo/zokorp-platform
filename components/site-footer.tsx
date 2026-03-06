import Link from "next/link";

const platformLinks = [
  { href: "/software", label: "Software" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/account", label: "Account" },
];

const resourceLinks = [
  { href: "/case-studies", label: "Case Studies" },
  { href: "/media", label: "Media" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-300 bg-white/72 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 md:grid-cols-4 md:px-6">
        <section>
          <p className="font-display text-xl font-semibold text-slate-900">ZoKorp</p>
          <p className="mt-2 max-w-xs text-sm text-slate-600">
            AWS-focused AI delivery, validation software, and account-linked billing workflows for teams that need measurable execution.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-500">Houston-based - Serving U.S. teams</p>
        </section>

        <section>
          <p className="font-semibold text-slate-900">Platform</p>
          <ul className="mt-2 space-y-1">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-600 transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-semibold text-slate-900">Resources</p>
          <ul className="mt-2 space-y-1">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-600 transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-semibold text-slate-900">Trust and Support</p>
          <ul className="mt-2 space-y-1">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-600 transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-700">zkhawaja@zokorp.com</p>
        </section>
      </div>
      <div className="section-divider mx-auto w-full max-w-7xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>ZoKorp Platform</p>
        <p>(C) {new Date().getFullYear()} ZoKorp. All rights reserved.</p>
      </div>
    </footer>
  );
}
