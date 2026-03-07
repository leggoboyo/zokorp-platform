import Link from "next/link";

import { EmailVerificationResendForm } from "@/components/email-verification-resend-form";
import { PasswordSignInForm } from "@/components/password-signin-form";
import { isPasswordAuthEnabled } from "@/lib/auth-config";
import { sanitizeAuthCallbackUrl } from "@/lib/auth-callback-url";

function getErrorMessage(error: string | undefined) {
  if (!error) {
    return null;
  }

  if (error === "CredentialsSignin") {
    return "Invalid credentials or account temporarily locked.";
  }

  return "Sign-in failed. Please try again.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; verified?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = sanitizeAuthCallbackUrl(params.callbackUrl);
  const passwordAuthEnabled = isPasswordAuthEnabled();
  const errorMessage = getErrorMessage(params.error);
  const verificationSuccess = params.verified === "1";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account Access</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          Sign in with your business email and password.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        {verificationSuccess ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Email verified. You can sign in now.
          </div>
        ) : null}

        {passwordAuthEnabled ? (
          <PasswordSignInForm callbackUrl={callbackUrl} />
        ) : (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Password auth is disabled. Set `AUTH_PASSWORD_ENABLED=true`.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-slate-700 underline">
            Create account
          </Link>
          <Link href="/login/forgot-password" className="text-slate-700 underline">
            Forgot password?
          </Link>
        </div>
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Requirements</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Business email domains only</li>
          <li>Email verification required before first sign-in</li>
          <li>Strong password required</li>
          <li>Password reset link expires after 30 minutes</li>
        </ul>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-slate-900">Need a new verification email?</p>
          <EmailVerificationResendForm submitLabel="Resend verification email" />
        </div>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-slate-700 underline underline-offset-2 hover:text-slate-900">
            Back to home
          </Link>
        </p>
      </section>
    </div>
  );
}
