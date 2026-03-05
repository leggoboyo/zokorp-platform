"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type PasswordRegisterFormProps = {
  callbackUrl: string;
};

export function PasswordRegisterForm({ callbackUrl }: PasswordRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
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

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Registration failed.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInResult?.url) {
        window.location.href = signInResult.url;
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("Unable to register right now.");
    } finally {
      setIsSubmitting(false);
    }
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
