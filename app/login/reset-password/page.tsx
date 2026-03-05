import Link from "next/link";

import { PasswordResetForm } from "@/components/password-reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password Reset</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Set a new password</h1>

        {token ? (
          <PasswordResetForm token={token} />
        ) : (
          <p className="mt-3 text-sm text-rose-700">Missing or invalid reset token. Request a new reset link.</p>
        )}
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <p className="text-sm text-slate-700">
          <Link href="/login/forgot-password" className="underline">
            Request another reset link
          </Link>
        </p>
      </section>
    </div>
  );
}
