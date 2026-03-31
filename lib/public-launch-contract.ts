export const PUBLIC_LAUNCH_CONTACT = {
  primaryEmail: "consulting@zokorp.com",
  location: "Houston, Texas, United States",
  responseWindowLabel: "Initial response within one business day",
  securityResponseLabel: "Urgent security issues are prioritized the same business day when possible",
  bookingLabel: "Book architecture follow-up",
  primaryHumanPathLabel: "Primary human path is direct email plus a tagged booking link. Forms stay secondary during the founder-led soft launch.",
} as const;

export const PUBLIC_LAUNCH_PLACEHOLDER_NOTES = {
  founder:
    "Broad-launch replacement slot: replace this block with founder bio, headshot, and approved credibility details when those assets are ready.",
  proof:
    "Broad-launch replacement slot: replace representative proof with the first approved named case study or proof asset when legal and client approval exist.",
} as const;

export const PUBLIC_LAUNCH_POLICY_NOTES = {
  pricing:
    "Published software pricing stays conservative until final pricing, refund posture, and tax handling are formally approved.",
  services:
    "Service work remains estimate-first. Scope is confirmed before paid consulting, remediation, or implementation is accepted.",
  proof:
    "Public proof remains representative and anonymized until explicit approval exists for founder assets or client-facing proof.",
} as const;
