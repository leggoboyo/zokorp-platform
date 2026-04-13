export const PUBLIC_LAUNCH_CONTACT = {
  primaryEmail: "consulting@zokorp.com",
  location: "Houston, Texas",
  linkedInUrl: "https://www.linkedin.com/in/zohaib-khawaja/",
  responseWindowLabel: "Initial response within one business day",
  securityResponseLabel: "Urgent security issues are prioritized the same business day when possible",
  bookingLabel: "Book a call",
  primaryHumanPathLabel: "Book a call or email directly. Clear scope is confirmed before work starts.",
} as const;

export const PUBLIC_LAUNCH_FOUNDER_PROFILE = {
  name: "Zohaib Khawaja",
  role: "Founder, ZoKorp",
  formerRoleLabel: "Former AWS Partner Solutions Architect",
  currentRoleLabel: "Currently at Microsoft",
  headshotPath: "/founder/zohaib-khawaja.jpg",
  logoPath: "/brand/zokorp-logo.png",
  summary:
    "Former AWS Partner Solutions Architect. Currently at Microsoft. Building ZoKorp for SMB teams that need direct technical judgment, fixed reviews, and a scoped next step.",
  credentials: [
    "AWS Certified Solutions Architect - Professional",
    "AWS Certified Machine Learning - Specialty",
    "AWS Certified Security - Specialty",
  ],
  backgroundCompanies: [
    "Amazon Web Services",
    "Microsoft",
    "Nordic Global",
  ],
  highlights: [
    "Former AWS Partner Solutions Architect with real architecture, readiness, and delivery experience.",
    "Current Microsoft background kept visible because buyers care about present-day technical context.",
    "Software, consulting, and follow-through stay connected without forcing buyers into signup too early.",
  ],
} as const;

export const PUBLIC_LAUNCH_PROOF_ASSET = {
  title: "Approved public proof only",
  summary:
    "ZoKorp keeps public proof tight: named founder, employer background, AWS certifications, Houston location, deterministic outputs, and clear scope before work starts. No fake logos. No invented guarantees.",
  highlights: [
    "Former AWS Partner Solutions Architect and currently at Microsoft.",
    "AWS professional and specialty certifications are stated directly.",
    "Initial response within one business day and clear scope before work starts.",
  ],
} as const;

export const PUBLIC_LAUNCH_POLICY_NOTES = {
  pricing:
    "Public pricing stays useful, but broader implementation still moves through estimate-first scoping.",
  services:
    "Scope is confirmed before paid consulting, remediation, or implementation work is accepted.",
  proof:
    "No client logos, testimonials, case studies, guarantees, or metrics are published without approval.",
} as const;
