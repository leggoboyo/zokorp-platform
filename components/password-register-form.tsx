"use client";

import { useState } from "react";

import { EmailVerificationResendForm } from "@/components/email-verification-resend-form";

type PasswordRegisterFormProps = {
  callbackUrl: string;
};

export function PasswordRegisterForm({ callbackUrl }: PasswordRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        verificationEmailSent?: boolean;
      };
      if (!response.ok) {
        setError(payload.error ?? "Registration failed.");
        return;
      }

      setRegisteredEmail(email.trim().toLowerCase());
      setVerificationEmailSent(payload.verificationEmailSent !== false);
      setSuccessMessage(payload.message ?? "Account created. Verify your email before signing in.");
      setPassword("");
    } catch {
      setError("Unable to register right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          {verificationEmailSent ? (
            <p className="text-sm text-slate-700">
              Verification email sent to <span className="font-semibold text-slate-900">{registeredEmail}</span>.
            </p>
          ) : (
            <p className="text-sm text-slate-700">
              Account created for <span className="font-semibold text-slate-900">{registeredEmail}</span>, but the
              verification email did not send successfully.
            </p>
          )}
          <p className="mt-2 text-sm text-slate-600">
            Use that link first. After verification, sign in and continue to{" "}
            <span className="font-medium text-slate-900">{callbackUrl}</span>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <p className="mb-3 text-sm font-medium text-slate-900">Need a fresh verification email?</p>
          <EmailVerificationResendForm defaultEmail={registeredEmail} submitLabel="Resend verification email" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label htmlFor="name" className="block text-sm font-medium text-slate-700">
        Name
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
        maxLength={120}
        placeholder="Your name"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
        Business email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        placeholder="you@company.com"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <label htmlFor="password" className="block text-sm font-medium text-slate-700">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={12}
        autoComplete="new-password"
        placeholder="At least 12 chars, upper/lower/number/symbol"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
