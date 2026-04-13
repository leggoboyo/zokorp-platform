export const PUBLIC_LAUNCH_CONTACT = {
  primaryEmail: "consulting@zokorp.com",
  location: "Houston, Texas",
  linkedInUrl: "https://www.linkedin.com/in/zohaib-khawaja/",
  responseWindowLabel: "Initial response within one business day",
  securityResponseLabel: "Urgent security issues are prioritized the same business day when possible",
  bookingLabel: "Book a call",
  primaryHumanPathLabel: "Primary human paths are a direct founder call, a scoped quote request, or software exploration without forced signup.",
} as const;

export const PUBLIC_LAUNCH_FOUNDER_PROFILE = {
  name: "Zohaib Khawaja",
  role: "Founder, ZoKorp",
  headshotPath: "/founder/zohaib-khawaja.jpg",
  logoPath: "/brand/zokorp-logo.png",
  summary:
    "Former AWS Partner Solutions Architect building ZoKorp to help SMB teams move from architecture decisions to validation, optimization, and scoped implementation.",
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
    "Former AWS Partner Solutions Architect with hands-on architecture, readiness, and delivery experience.",
    "Background across AWS, Microsoft, Nordic Global, and higher education technical instruction.",
    "ZoKorp keeps software, consulting, and follow-up workflows connected without forcing buyers into signup too early.",
  ],
} as const;

export const PUBLIC_LAUNCH_PROOF_ASSET = {
  title: "Concrete founder credibility without fake proof",
  summary:
    "ZoKorp does not publish unapproved client logos, testimonials, or inflated outcome claims. Public trust is built through clear founder background, certifications, practical delivery scope, and software that explains exactly what it does.",
  highlights: [
    "Founder-first positioning with a real headshot, LinkedIn profile, and named prior employers.",
    "AWS professional and specialty certifications are stated directly instead of implied through vague copy.",
    "Consulting, software, and pricing are explained with bounded claims and visible next steps.",
  ],
} as const;

export const PUBLIC_LAUNCH_POLICY_NOTES = {
  pricing:
    "Published software pricing stays conservative until subscription pricing, refund posture, and tax handling are formally approved.",
  services:
    "Service work stays estimate-first beyond the visible price anchors. Scope is confirmed before paid consulting, remediation, or implementation is accepted.",
  proof:
    "Public proof stays conservative: no client logos, testimonials, or case-study claims are published without approval.",
} as const;
