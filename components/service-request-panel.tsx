"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  linkedToAccount?: boolean;
};

type ServiceRequestPanelProps = {
  signedIn?: boolean;
  currentEmail?: string | null;
  loginHref?: string;
  registerHref?: string;
  accountHref?: string;
};

const fieldLabelClassName = "enterprise-kicker text-[rgb(var(--z-ink-label))]";
const fieldHelpClassName = "block text-xs leading-5 text-[rgb(var(--z-ink-soft))]";

export function ServiceRequestPanel({
  signedIn = false,
  currentEmail = null,
  loginHref = "/login?callbackUrl=/services",
  registerHref = "/register",
  accountHref = "/account",
}: ServiceRequestPanelProps) {
  const [isSignedIn] = useState(signedIn);
  const [signedInEmail] = useState<string | null>(currentEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<SubmissionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return "Submitting request...";
    }

    return "Submit service request";
  }, [isSubmitting]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = isSignedIn
      ? {
          type: String(formData.get("type") ?? "") as ServiceRequestType,
          title: String(formData.get("title") ?? "").trim(),
          summary: String(formData.get("summary") ?? "").trim(),
          preferredStart: String(formData.get("preferredStart") ?? "").trim() || undefined,
          budgetRange: String(formData.get("budgetRange") ?? "").trim() || undefined,
        }
      : {
          requesterEmail: String(formData.get("requesterEmail") ?? "").trim() || undefined,
          requesterName: String(formData.get("requesterName") ?? "").trim() || undefined,
          requesterCompanyName: String(formData.get("requesterCompanyName") ?? "").trim() || undefined,
          budgetRange: String(formData.get("budgetRange") ?? "").trim() || undefined,
          summary: String(formData.get("summary") ?? "").trim(),
        };

    setIsSubmitting(true);
    setSubmittedRequest(null);
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
        setError(data.error ?? "Unable to submit request right now.");
        return;
      }

      setSubmittedRequest({
        id: data.id ?? "",
        trackingCode: data.trackingCode ?? "",
        status: data.status ?? "SUBMITTED",
        linkedToAccount: data.linkedToAccount ?? isSignedIn,
      });
      form.reset();
    } catch {
      setError("Unexpected network error while submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetSubmissionState() {
    setSubmittedRequest(null);
    setError(null);
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      if (!titleInputRef.current) {
        formRef.current?.querySelector<HTMLInputElement>('[name="requesterName"]')?.focus();
      }
    });
  }

  return (
    <section
      id="service-request"
      className="surface lift-card rounded-[1.8rem] border border-[rgb(var(--z-border)/0.55)] bg-[rgb(var(--z-panel))] p-6 md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Service Hub</p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-slate-900">Request consultation or delivery</h2>
        </div>
        <Badge variant="secondary">{isSignedIn ? "Tracked in account" : "No account required"}</Badge>
      </div>

      <p className="enterprise-copy mt-3 max-w-3xl text-sm">
        Share your name, email, and what you need. Optional details help route the request faster.
      </p>

      {isSignedIn ? (
        <Alert tone="success" className="mt-5">
          <p>
            Signed in as <span className="font-semibold">{signedInEmail ?? "your account"}</span>. This form creates a
            tracked service request as soon as you submit it.
          </p>
        </Alert>
      ) : (
        <Alert tone="info" className="mt-5">
          <p>No account is required for the first contact. Use the email address you want ZoKorp to reply to.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={loginHref} className={buttonVariants({ size: "sm" })}>
              Sign in instead
            </Link>
            <Link href={registerHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Create account
            </Link>
          </div>
        </Alert>
      )}

      {submittedRequest ? (
        <Alert tone="success" className="mt-5" aria-live="polite">
          <AlertTitle>Request recorded</AlertTitle>
          <AlertDescription>
            Tracking code: <span className="font-mono font-semibold">{submittedRequest.trackingCode}</span>. Your
            request now has the current status of <span className="font-semibold">{submittedRequest.status.toLowerCase()}</span>.
          </AlertDescription>
          <p className="mt-2 text-sm leading-6">
            {submittedRequest.linkedToAccount
              ? "Use your account timeline for updates. If you also book a follow-up call, that booking appears separately after Calendly confirms it against the same email."
              : "ZoKorp can follow up by email using the contact details you submitted. If you later create an account with the same email, this request can be picked up from that account history."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {submittedRequest.linkedToAccount ? (
              <Link href={accountHref} className={buttonVariants({ size: "sm" })}>
                Open account timeline
              </Link>
            ) : (
              <Link href={registerHref} className={buttonVariants({ size: "sm" })}>
                Create account later
              </Link>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={resetSubmissionState}>
              Submit another request
            </Button>
          </div>
        </Alert>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
          {isSignedIn ? (
            <>
              <label className="space-y-1">
                <span className={fieldLabelClassName}>Request type</span>
                <Select name="type" defaultValue="CONSULTATION" required>
                  {requestTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="space-y-1">
                <span className={fieldLabelClassName}>Preferred start date</span>
                <Input type="date" name="preferredStart" />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className={fieldLabelClassName}>Request title</span>
                <Input
                  ref={titleInputRef}
                  name="title"
                  required
                  minLength={8}
                  maxLength={120}
                  placeholder="Example: readiness review for an upcoming launch"
                />
              </label>
            </>
          ) : (
            <>
              <label className="space-y-1">
                <span className={fieldLabelClassName}>Your name</span>
                <Input name="requesterName" maxLength={120} required placeholder="Full name" />
              </label>

              <label className="space-y-1">
                <span className={fieldLabelClassName}>Email</span>
                <Input type="email" name="requesterEmail" required placeholder="you@example.com" />
                <span className={fieldHelpClassName}>ZoKorp will reply here.</span>
              </label>
            </>
          )}

          <label className="space-y-1 md:col-span-2">
            <span className={fieldLabelClassName}>What do you need?</span>
            <Textarea
              name="summary"
              required
              minLength={30}
              maxLength={2400}
              placeholder="Short scope, goals, and any constraints."
            />
          </label>

          {!isSignedIn ? (
            <>
              <label className="space-y-1">
                <span className={fieldLabelClassName}>Company (Optional)</span>
                <Input name="requesterCompanyName" maxLength={120} placeholder="Company or team" />
              </label>

              <label className="space-y-1">
                <span className={fieldLabelClassName}>Budget range (Optional)</span>
                <Select name="budgetRange" defaultValue="">
                  <option value="">Optional</option>
                  {budgetOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </label>
            </>
          ) : (
            <label className="space-y-1">
              <span className={fieldLabelClassName}>Budget range (Optional)</span>
              <Select name="budgetRange" defaultValue="">
                <option value="">Optional</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
          )}

          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      )}

      {error ? <Alert tone="danger" className="mt-3">{error}</Alert> : null}
    </section>
  );
}
