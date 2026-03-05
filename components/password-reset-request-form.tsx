"use client";

import { useState } from "react";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not start reset flow.");
        return;
      }

      setMessage(payload.message ?? "If that account exists, a reset email was sent.");
    } catch {
      setError("Network error while requesting reset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
        Business email
      </label>
      <input
        id="reset-email"
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
        className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
