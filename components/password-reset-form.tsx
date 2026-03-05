"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PasswordResetFormProps = {
  token: string;
};

export function PasswordResetForm({ token }: PasswordResetFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not reset password.");
        return;
      }

      setMessage(payload.message ?? "Password updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Network error while resetting password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={12}
        autoComplete="new-password"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
        Confirm password
      </label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        minLength={12}
        autoComplete="new-password"
        className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
