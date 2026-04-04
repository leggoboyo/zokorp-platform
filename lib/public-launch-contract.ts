export const PUBLIC_LAUNCH_CONTACT = {
  primaryEmail: "consulting@zokorp.com",
  location: "Houston, Texas, United States",
  responseWindowLabel: "Initial response within one business day",
  securityResponseLabel: "Urgent security issues are prioritized the same business day when possible",
  bookingLabel: "Book architecture follow-up",
  primaryHumanPathLabel: "Primary human path is direct email plus a tagged booking link. Forms stay secondary during the founder-led soft launch.",
} as const;

export const PUBLIC_LAUNCH_FOUNDER_PROFILE = {
  name: "Zohaib Khawaja",
  role: "Founder, ZoKorp",
  summary:
    "ZoKorp is currently a founder-led operating platform focused on practical AWS architecture review, FTR-first validation workflows, and scoped follow-up work that stays tied to the same customer account and billing surface.",
  highlights: [
    "Founder-led soft launch on purpose so software, delivery, and support quality stay aligned.",
    "Public scope today is narrow: Architecture Diagram Reviewer, FTR-first Validator, and a forecasting beta.",
    "The commercial posture stays estimate-first for consulting and remediation work instead of pretending every service is fixed-scope on day one.",
  ],
} as const;

export const PUBLIC_LAUNCH_PROOF_ASSET = {
  title: "Operational proof verified March 30, 2026",
  summary:
    "ZoKorp has real operating proof beyond design polish: repeatable production audits pass, monitored result-email delivery is confirmed, and one real founder-controlled Calendly booking was matched back into production records.",
  highlights: [
    "Production validator run, credit decrement, and account-linked history were verified end to end.",
    "Customer-facing result email delivery and password reset delivery were confirmed in the monitored inbox at consulting@zokorp.com.",
    "A real `/services` booking created a matching LeadInteraction, ServiceRequest, and ingest audit record in production.",
  ],
} as const;

export const PUBLIC_LAUNCH_POLICY_NOTES = {
  pricing:
    "Published software pricing stays conservative until final pricing, refund posture, and tax handling are formally approved.",
  services:
    "Service work remains estimate-first. Scope is confirmed before paid consulting, remediation, or implementation is accepted.",
  proof:
    "Public proof stays conservative: named client endorsements still require approval, but verified operational evidence can be shown today.",
} as const;
