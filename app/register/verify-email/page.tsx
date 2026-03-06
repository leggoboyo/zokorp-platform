import Link from "next/link";

import { EmailVerificationResendForm } from "@/components/email-verification-resend-form";

function getStatusMessage(status: string | undefined) {
  if (status === "expired") {
    return {
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      title: "Verification link expired",
      detail: "Request a new verification email below and use the latest link.",
    };
  }

  if (status === "invalid") {
    return {
      tone: "border-rose-200 bg-rose-50 text-rose-800",
      title: "Verification link is invalid",
      detail: "The link may have been copied incorrectly or already used.",
    };
  }

  return {
    tone: "border-sky-200 bg-sky-50 text-sky-900",
    title: "Verify your email",
    detail: "Use the link from your inbox to activate your account, or request a fresh email below.",
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const params = await searchParams;
  const message = getStatusMessage(params.status);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="glass-surface animate-fade-up rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account Access</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">{message.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{message.detail}</p>

        <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${message.tone}`}>
          Verification is required before sign-in, purchases, or admin access are enabled.
        </div>

        <div className="mt-6">
          <EmailVerificationResendForm defaultEmail={params.email ?? ""} />
        </div>
      </section>

      <section className="surface-muted lift-card rounded-2xl p-6">
        <p className="text-sm text-slate-700">
          Already verified?{" "}
          <Link href="/login" className="underline underline-offset-2">
            Return to login
          </Link>
        </p>
      </section>
    </div>
  );
}
