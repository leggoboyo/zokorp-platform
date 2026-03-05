import Link from "next/link";

import { PasswordResetRequestForm } from "@/components/password-reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password Reset</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          Enter your business email and we&apos;ll send a reset link.
        </p>
        <PasswordResetRequestForm />
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <p className="text-sm text-slate-700">
          <Link href="/login" className="underline">
            Back to login
          </Link>
        </p>
      </section>
    </div>
  );
}
