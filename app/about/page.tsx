import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SOFT_LAUNCH_POSTURE, SOFT_LAUNCH_PUBLIC_PROOF_NOTES } from "@/lib/launch-posture";
import { PUBLIC_LAUNCH_PLACEHOLDER_NOTES } from "@/lib/public-launch-contract";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "About",
  description: "Learn how ZoKorp combines software, delivery, and billing into one operating platform.",
  path: "/about",
});

const principles = [
  {
    title: "Software should remove repetitive review work",
    detail:
      "ZoKorp turns repeatable delivery tasks into productized workflows instead of treating every engagement as custom forever.",
  },
  {
    title: "Customer context should not get lost between products and services",
    detail:
      "The platform links software access, service requests, and billing history under the same account so follow-up work is cleaner.",
  },
  {
    title: "Operational trust matters as much as visual design",
    detail:
      "Clear support paths, security expectations, and billing behavior are part of the product, not post-purchase cleanup.",
  },
];

const launchNotes = [
  {
    title: "Founder-led by design",
    detail:
      "The public launch is intentionally narrow so software, delivery, and follow-up stay aligned. The goal is a trustworthy operating system for AWS-focused work, not a bloated consulting brochure.",
  },
  {
    title: "Representative proof mode",
    detail:
      "ZoKorp does not publish named client claims or inflated delivery proof until approvals exist. Public proof stays conservative on purpose.",
  },
  {
    title: "Current launch scope",
    detail:
      "Architecture Diagram Reviewer, FTR-first Validator, and a forecasting beta are live today. Broader MLOps positioning is intentionally deferred.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="hero-surface animate-fade-up px-6 py-9 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">About</p>
        <h1 className="font-display mt-2 text-balance text-4xl font-semibold">ZoKorp is built for practical delivery work</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100 md:text-base">
          ZoKorp combines AWS-focused advisory work, productized validation tooling, and account-linked
          software delivery so customers can move from discovery to execution without changing systems. The current public launch stays intentionally narrow: Architecture Diagram Reviewer, FTR-first Validator, and a forecasting beta.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {launchNotes.map((item) => (
          <article key={item.title} className="surface lift-card rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{SOFT_LAUNCH_POSTURE.label}</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map((principle) => (
          <article key={principle.title} className="surface lift-card rounded-2xl p-6">
            <h2 className="font-display text-2xl font-semibold text-slate-900">{principle.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{principle.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface soft-grid rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Public proof posture</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-slate-900">What ZoKorp will and will not claim publicly</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {SOFT_LAUNCH_PUBLIC_PROOF_NOTES.map((note) => (
            <div key={note} className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
              {note}
            </div>
          ))}
        </div>
      </section>

      <Card tone="muted" className="rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Founder profile slot</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {PUBLIC_LAUNCH_PLACEHOLDER_NOTES.founder}
        </p>
      </Card>

      <section className="surface soft-grid rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What the platform does</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Software</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Self-serve tools for validation, architecture review, and future delivery workflows with
              account-linked access and billing controls.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Services</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Consultation and delivery support for teams that need architecture depth, readiness structure,
              or implementation guidance beyond what self-serve tooling can handle.
            </p>
          </article>
        </div>
      </section>

      <Card tone="glass" className="rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Where to go next</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Pricing stays conservative, proof stays safe, and delivery posture stays explicit until the broader launch bar is met.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/pricing" className={buttonVariants()}>
            View pricing
          </Link>
          <Link href="/case-studies" className={buttonVariants({ variant: "secondary" })}>
            View case studies
          </Link>
        </div>
      </Card>
    </div>
  );
}
