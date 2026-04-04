import { PUBLIC_LAUNCH_CONTACT, PUBLIC_LAUNCH_POLICY_NOTES } from "@/lib/public-launch-contract";

export const SOFT_LAUNCH_POSTURE = {
  label: "Founder-led soft launch",
  proofModeLabel: "Conservative proof mode",
  supportResponseLabel: PUBLIC_LAUNCH_CONTACT.responseWindowLabel,
  urgentSecurityLabel: PUBLIC_LAUNCH_CONTACT.securityResponseLabel,
  pricingLabel: PUBLIC_LAUNCH_POLICY_NOTES.pricing,
  serviceScopeLabel: "Software-backed advisory, remediation, and scoped delivery",
  caseStudyLabel: "Representative delivery patterns, not named client endorsements",
  mlopsLabel: "Forecasting beta only",
} as const;

export const SOFT_LAUNCH_RESPONSE_WINDOWS = [
  {
    title: "Service requests",
    detail: SOFT_LAUNCH_POSTURE.supportResponseLabel,
  },
  {
    title: "Security concerns",
    detail: SOFT_LAUNCH_POSTURE.urgentSecurityLabel,
  },
  {
    title: "Scoped delivery",
    detail: "No blind pay-now consulting checkout. Scope is confirmed first, then formal estimate or invoice terms follow.",
  },
] as const;

export const SOFT_LAUNCH_PUBLIC_PROOF_NOTES = [
  "Public case studies remain representative and anonymized until explicit client approval exists.",
  "Architecture and validation outputs support decisions and readiness, but they do not guarantee AWS acceptance or production success by themselves.",
  "MLOps remains intentionally narrow at launch: one forecasting workflow, not a broad general-purpose ML platform.",
] as const;
