import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account Access</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Sign in with password</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          Use your business email and password on the login page.
        </p>
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <div className="mt-1 flex flex-wrap gap-2">
          <Link
            href="/login"
            className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to login
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
