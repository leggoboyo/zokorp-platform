"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { isStrictPngFile } from "@/lib/architecture-review/client";
import type { ArchitectureProvider } from "@/lib/architecture-review/types";

type ArchitectureDiagramReviewerFormProps = {
  requiresAuth?: boolean;
  authUnavailable?: boolean;
};

type SubmitApiResponse =
  | {
      status: "sent";
    }
  | {
      status: "fallback";
      reason?: string;
      mailtoUrl?: string | null;
      emlDownloadToken?: string;
    }
  | {
      error: string;
    };

export function ArchitectureDiagramReviewerForm({
  requiresAuth = false,
  authUnavailable = false,
}: ArchitectureDiagramReviewerFormProps) {
  const [provider, setProvider] = useState<ArchitectureProvider>("aws");
  const [paragraph, setParagraph] = useState("");
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [version, setVersion] = useState("");
  const [legend, setLegend] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [progress, setProgress] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "fallback" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fallbackMailtoUrl, setFallbackMailtoUrl] = useState<string | null>(null);
  const [fallbackEmlToken, setFallbackEmlToken] = useState<string | null>(null);

  const paragraphTooShort = paragraph.trim().length < 1;
  const paragraphTooLong = paragraph.trim().length > 2000;
  const fieldClassName =
    "focus-ring block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset]";
  const fieldLabelClassName = "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";

  const canSubmit = useMemo(() => {
    if (!selectedFile) {
      return false;
    }

    if (paragraphTooShort || paragraphTooLong) {
      return false;
    }

    return status !== "running";
  }, [paragraphTooLong, paragraphTooShort, selectedFile, status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Select a PNG diagram before submitting.");
      return;
    }

    if (paragraphTooShort || paragraphTooLong) {
      setError("Description must be between 1 and 2000 characters.");
      return;
    }

    setStatus("running");
    setError(null);
    setProgress("Validating PNG...");
    setFallbackMailtoUrl(null);
    setFallbackEmlToken(null);

    const pngValidation = await isStrictPngFile(selectedFile);
    if (!pngValidation.ok) {
      setStatus("error");
      setProgress(null);
      setError(pngValidation.error ?? "Only PNG files are allowed.");
      return;
    }

    setProgress("Uploading diagram and running server-side review...");

    try {
      const submitData = new FormData();
      submitData.append(
        "metadata",
        JSON.stringify({
          provider,
          title: title.trim() || undefined,
          owner: owner.trim() || undefined,
          lastUpdated: lastUpdated.trim() || undefined,
          version: version.trim() || undefined,
          legend: legend.trim() || undefined,
          paragraphInput: paragraph.trim(),
        }),
      );
      submitData.append("diagram", selectedFile, selectedFile.name);

      const response = await fetch("/api/submit-architecture-review", {
        method: "POST",
        body: submitData,
      });

      const payload = (await response.json()) as SubmitApiResponse;

      if (!response.ok) {
        setStatus("error");
        setProgress(null);
        setError("error" in payload && payload.error ? payload.error : "Review submission failed. Please retry.");
        return;
      }

      if ("status" in payload && payload.status === "sent") {
        setStatus("success");
        setProgress(null);
        return;
      }

      if ("status" in payload && payload.status === "fallback") {
        setStatus("fallback");
        setProgress(null);
        setFallbackMailtoUrl(payload.mailtoUrl ?? null);
        setFallbackEmlToken(payload.emlDownloadToken ?? null);
        return;
      }

      setStatus("error");
      setProgress(null);
      setError("Unexpected response from the review endpoint.");
    } catch {
      setStatus("error");
      setProgress(null);
      setError("Network error while submitting review metadata.");
    }
  }

  if (authUnavailable) {
    return (
      <section className="surface-muted animate-fade-up rounded-2xl p-6">
        <div className="rounded-xl border border-slate-200 bg-white/75 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Architecture Review</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">Architecture Diagram Reviewer</h3>
          <p className="mt-2 text-sm text-slate-700">
            Password sign-in is currently disabled. Set `AUTH_PASSWORD_ENABLED=true`.
          </p>
        </div>
      </section>
    );
  }

  if (requiresAuth) {
    return (
      <section className="surface-muted animate-fade-up rounded-2xl p-6">
        <div className="rounded-xl border border-slate-200 bg-white/75 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Architecture Review</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">Architecture Diagram Reviewer</h3>
          <p className="mt-2 text-sm text-slate-700">
            Sign in with a business email to run this review. Results are delivered only by email.
          </p>
        </div>
        <Link
          href="/login?callbackUrl=/software/architecture-diagram-reviewer"
          className="focus-ring mt-4 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        >
          Sign in to continue
        </Link>
      </section>
    );
  }

  return (
    <section className="surface animate-fade-up overflow-hidden rounded-2xl">
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-[#123c66] to-[#0f8ea9] px-6 py-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-amber-200/20 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Server-Validated Review</p>
        <h3 className="font-display mt-2 text-3xl font-semibold">Architecture Diagram Reviewer</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 md:text-base">
          Upload a PNG, select cloud provider, and describe your architecture in one paragraph. The server
          recomputes OCR and scoring from the uploaded diagram before emailing results to your signed-in address.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/90">
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1">PNG only</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1">Server-side OCR</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1">Trusted scoring</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1">No findings on page</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1">Email delivery</span>
        </div>
      </div>

      <div className="space-y-4 p-5 md:p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/85 p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Core Input</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={fieldLabelClassName}>Cloud Provider</span>
                <select
                  name="provider"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as ArchitectureProvider)}
                  className={fieldClassName}
                  required
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">GCP</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className={fieldLabelClassName}>Diagram PNG</span>
                <input
                  name="diagram"
                  type="file"
                  accept="image/png"
                  required
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className={fieldClassName}
                />
                <p className="text-xs text-slate-500">Only `image/png` files are accepted.</p>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className={fieldLabelClassName}>Architecture Description (required)</span>
              <textarea
                name="description"
                value={paragraph}
                onChange={(event) => setParagraph(event.target.value)}
                minLength={1}
                maxLength={2000}
                required
                placeholder="Describe request/data flow, trust boundaries, and operational expectations in one paragraph."
                className={`${fieldClassName} min-h-32`}
              />
              <p className="text-xs text-slate-500">{paragraph.trim().length}/2000 characters</p>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Diagram Metadata (Improves Scoring Accuracy)
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={fieldLabelClassName}>Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={160}
                  placeholder="Payments API Production Architecture"
                  className={fieldClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={fieldLabelClassName}>Owner</span>
                <input
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  maxLength={160}
                  placeholder="Platform Team"
                  className={fieldClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={fieldLabelClassName}>Last Updated</span>
                <input
                  value={lastUpdated}
                  onChange={(event) => setLastUpdated(event.target.value)}
                  maxLength={60}
                  placeholder="2026-03-05"
                  className={fieldClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={fieldLabelClassName}>Version</span>
                <input
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  maxLength={60}
                  placeholder="v1.0"
                  className={fieldClassName}
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className={fieldLabelClassName}>Legend (optional)</span>
              <textarea
                value={legend}
                onChange={(event) => setLegend(event.target.value)}
                maxLength={600}
                placeholder="Example: solid arrow=request/response, dashed arrow=async event, dotted arrow=batch transfer"
                className={`${fieldClassName} min-h-24`}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="focus-ring rounded-lg bg-gradient-to-r from-slate-900 to-[#174f7f] px-5 py-2.5 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-[#1d628f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "running" ? "Reviewing..." : "Run Review"}
            </button>
            <p className="text-xs text-slate-500">Results are delivered by email only and are not shown in this page.</p>
          </div>
        </form>

        {progress ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
            <span className="font-semibold">Processing:</span> {progress}
          </div>
        ) : null}

        {status === "success" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
            Review complete. Check your email for results.
          </div>
        ) : null}

        {status === "fallback" ? (
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p>Automated delivery was unavailable. Use an email draft option below.</p>
            <div className="flex flex-wrap gap-2">
              {fallbackMailtoUrl ? (
                <a
                  href={fallbackMailtoUrl}
                  className="focus-ring inline-flex rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Open email draft
                </a>
              ) : null}
              {fallbackEmlToken ? (
                <a
                  href={`/api/download-eml?token=${encodeURIComponent(fallbackEmlToken)}`}
                  className="focus-ring inline-flex rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Download .eml
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>
        ) : null}
      </div>
    </section>
  );
}
