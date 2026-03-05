"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type MagicLinkSignInFormProps = {
  callbackUrl: string;
  enabled?: boolean;
};

export function MagicLinkSignInForm({ callbackUrl, enabled = true }: MagicLinkSignInFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled) {
      setError("Sign-in email is temporarily paused. Please try again shortly.");
      return;
    }

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("email", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Could not send sign-in link right now. Please wait and retry.");
        return;
      }

      setMessage("Sign-in link sent. Please check your inbox.");
    } catch {
      setError("Unexpected error while requesting sign-in link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
        Work email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={!enabled || isSubmitting}
        required
        autoComplete="email"
        placeholder="consulting@zokorp.com"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      />
      <button
        type="submit"
        disabled={!enabled || isSubmitting}
        className="focus-ring inline-flex rounded-md bg-gradient-to-r from-slate-900 to-[#153f67] px-4 py-2.5 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-[#174f7f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!enabled ? "Sign-in email paused" : isSubmitting ? "Sending link..." : "Send magic sign-in link"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
