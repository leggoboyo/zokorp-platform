"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type PasswordSignInFormProps = {
  callbackUrl: string;
};

export function PasswordSignInForm({ callbackUrl }: PasswordSignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials or account is temporarily locked.");
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
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
        autoComplete="current-password"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
