"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ServiceRequestType = "CONSULTATION" | "DELIVERY" | "SUPPORT";

const requestTypeOptions: Array<{ value: ServiceRequestType; label: string }> = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "DELIVERY", label: "Service Delivery" },
  { value: "SUPPORT", label: "Support" },
];

const budgetOptions = [
  "Under $5k",
  "$5k - $15k",
  "$15k - $50k",
  "$50k+",
  "Undecided",
];

type SubmissionResponse = {
  id: string;
  trackingCode: string;
  status: string;
};

type ServiceRequestPanelProps = {
  signedIn?: boolean;
};

export function ServiceRequestPanel({ signedIn = false }: ServiceRequestPanelProps) {
  const [isSignedIn, setIsSignedIn] = useState(signedIn);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: { email?: string } };
        if (isMounted) {
          setIsSignedIn(Boolean(data.user?.email));
        }
      } catch {
        // Keep static fallback state if session endpoint is unavailable.
      }
    }

    void syncSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return "Submitting request...";
    }

    return "Submit service request";
  }, [isSubmitting]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSignedIn) {
      setError("Please sign in first so your service request can be tracked in your account.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = {
      type: String(formData.get("type") ?? "") as ServiceRequestType,
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      preferredStart: String(formData.get("preferredStart") ?? "").trim() || undefined,
      budgetRange: String(formData.get("budgetRange") ?? "").trim() || undefined,
    };

    setIsSubmitting(true);
    setTrackingCode(null);
    setError(null);

    try {
      const response = await fetch("/api/services/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as Partial<SubmissionResponse> & { error?: string };

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in first so your service request can be tracked in your account.");
          return;
        }

        setError(data.error ?? "Unable to submit request right now.");
        return;
      }

      setTrackingCode(data.trackingCode ?? null);
      form.reset();
    } catch {
      setError("Unexpected network error while submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="service-request" className="surface lift-card rounded-2xl p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service Hub</p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Request consultation or delivery</h2>
        </div>
        <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">
          Tracked in account
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        Submit what you need and ZoKorp will triage, schedule, and update status in your account timeline.
      </p>

      {!isSignedIn ? (
        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <p>Sign in to submit a request and track milestones from your account.</p>
          <Link
            href="/login?callbackUrl=/services"
            className="focus-ring mt-3 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Request type</span>
          <select
            name="type"
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            defaultValue="CONSULTATION"
            required
          >
            {requestTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Preferred start date</span>
          <input
            type="date"
            name="preferredStart"
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Request title</span>
          <input
            name="title"
            required
            minLength={8}
            maxLength={120}
            placeholder="Example: FTR readiness consultation for AI advisory offering"
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">What do you need?</span>
          <textarea
            name="summary"
            required
            minLength={30}
            maxLength={2400}
            placeholder="Describe scope, goals, timelines, and any constraints."
            className="focus-ring min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Budget range</span>
          <select
            name="budgetRange"
            defaultValue="Undecided"
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting || !isSignedIn}
            className="focus-ring rounded-md bg-gradient-to-r from-slate-900 to-[#174f7f] px-4 py-2 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-[#1d628f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>

      {trackingCode ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Request submitted. Tracking code: <span className="font-mono font-semibold">{trackingCode}</span>. You can
          track updates in your account.
          <div className="mt-2">
            <Link
              href="/account"
              className="text-xs font-semibold text-emerald-900 underline underline-offset-2"
            >
              Open account timeline
            </Link>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
