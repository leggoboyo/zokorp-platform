"use client";

import { useState } from "react";

type EmailVerificationResendFormProps = {
  defaultEmail?: string;
  submitLabel?: string;
};

export function EmailVerificationResendForm({
  defaultEmail = "",
  submitLabel = "Send verification email",
}: EmailVerificationResendFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to send verification email right now.");
        return;
      }

      setStatusMessage(payload.message ?? "If that account is pending verification, a new email has been sent.");
    } catch {
      setError("Unable to send verification email right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="verification-email" className="block text-sm font-medium text-slate-700">
        Business email
      </label>
      <input
        id="verification-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        placeholder="you@company.com"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : submitLabel}
      </button>

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
