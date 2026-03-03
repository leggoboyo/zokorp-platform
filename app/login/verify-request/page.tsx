import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email sent</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Check your inbox</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          We sent a secure sign-in link to your email. Open that message and click{" "}
          <span className="font-semibold">Sign in to ZoKorp</span> to continue.
        </p>
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Didn&apos;t receive it?</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Check spam or promotions folders</li>
          <li>Wait up to one minute for delivery</li>
          <li>Return to login and request a new link</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
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
