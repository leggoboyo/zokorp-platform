export const CONSULTING_OFFERS = [
  {
    slug: "architecture-review",
    eyebrow: "Entry point",
    title: "Architecture Review",
    priceAnchor: "Free browser review or founder review under $200",
    summary:
      "Start here when you need a founder-led AWS architecture read before you commit to broader delivery work.",
    bullets: [
      "Architecture findings tied to practical next steps",
      "Clear guidance on whether to validate, optimize, or implement next",
      "A low-friction entry point into scoped follow-through work",
    ],
  },
  {
    slug: "aws-readiness-ftr-validation",
    eyebrow: "Fixed scope",
    title: "AWS Readiness / FTR Validation",
    priceAnchor: "Typically $500-$1,500",
    summary:
      "A structured validation pass for teams that need pass/fail clarity, issues, and remediation guidance before submission or review.",
    bullets: [
      "Pass/fail posture with specific issues called out",
      "Evidence and control gaps translated into a usable next-step list",
      "A repeatable validation service instead of open-ended consulting time",
    ],
  },
  {
    slug: "cloud-cost-optimization-audit",
    eyebrow: "One-time audit",
    title: "Cloud Cost Optimization Audit",
    priceAnchor: "Typically $500-$1,500",
    summary:
      "A focused cost review for AWS environments that need clearer savings opportunities, cleaner waste reduction, and a better ROI story.",
    bullets: [
      "Waste and inefficiency review with clear priorities",
      "Savings opportunities tied to practical remediation guidance",
      "A bounded audit instead of an ongoing optimization retainer",
    ],
  },
  {
    slug: "landing-zone-setup",
    eyebrow: "Fixed scope",
    title: "Landing Zone Setup",
    priceAnchor: "Typically $1,200-$2,000",
    summary:
      "A clean AWS baseline for teams that need IAM, networking, and security fundamentals set up correctly before more work begins.",
    bullets: [
      "Tight-scope environment setup for SMB teams",
      "IAM, networking, and security-baseline guidance",
      "No enterprise platform over-promising",
    ],
  },
  {
    slug: "scoped-implementation",
    eyebrow: "Follow-through",
    title: "Scoped Implementation",
    priceAnchor: "Hourly or scoped quote",
    summary:
      "Hands-on work for the next technical step after a review, validation, or audit has made the path clear enough to scope cleanly.",
    bullets: [
      "Bounded implementation instead of vague delivery engagements",
      "Best used after findings have already narrowed the real work",
      "Direct founder involvement without turning into an MSP contract",
    ],
  },
  {
    slug: "advisory-retainer",
    eyebrow: "Light support",
    title: "Advisory Retainer",
    priceAnchor: "Light monthly retainer",
    summary:
      "Ongoing guidance for teams that want continuity after a project without buying a managed-service relationship or strict SLA coverage.",
    bullets: [
      "Monthly founder access for email or Slack guidance",
      "Advisory-first support with limited scope and lower SLA",
      "Best after architecture, readiness, or implementation work is already underway",
    ],
  },
] as const;

export const CONSULTING_PRICE_OPTIONS = [
  {
    title: "Architecture Advisory Review",
    price: "Free to under $200",
    summary:
      "The entry point for teams that need a credible founder-led read before deciding what work is actually worth buying.",
  },
  {
    title: "AWS Readiness / FTR Validation",
    price: "Usually $500-$1,500",
    summary:
      "A fixed-scope validation package with pass/fail posture, issues, and remediation guidance.",
  },
  {
    title: "Cloud Cost Optimization Audit",
    price: "Usually $500-$1,500",
    summary:
      "A one-time audit for SMB teams that need clearer savings opportunities and cost cleanup priorities.",
  },
  {
    title: "Landing Zone Setup",
    price: "Usually $1,200-$2,000",
    summary:
      "A clean AWS setup for IAM, networking, and security-baseline work without enterprise bloat.",
  },
  {
    title: "Scoped Implementation",
    price: "Hourly or scoped quote",
    summary:
      "Use this when the issue is already clear enough to finish the next technical step without turning it into an open-ended engagement.",
  },
  {
    title: "Advisory Retainer",
    price: "Light monthly retainer",
    summary:
      "Limited ongoing founder guidance for teams that want continuity without a full MSP or strict SLA relationship.",
  },
] as const;

export const SOFTWARE_HIGHLIGHTS = [
  {
    title: "Architecture Diagram Reviewer",
    href: "/software/architecture-diagram-reviewer",
    summary:
      "A public entry point for architecture reviews, follow-up calls, and bounded remediation conversations.",
    cta: "Open reviewer",
  },
  {
    title: "ZoKorpValidator",
    href: "/software/zokorp-validator",
    summary:
      "Evidence-heavy validation software for workflows that should not stay manual forever.",
    cta: "Open validator",
  },
  {
    title: "Forecasting beta",
    href: "/software/mlops-foundation-platform",
    summary:
      "A narrow forecasting workflow that stays secondary to the core AWS architecture and validation business.",
    cta: "View forecasting beta",
  },
] as const;

export const DELIVERY_PROCESS_STEPS = [
  {
    title: "Review",
    detail: "Start with architecture, readiness, or cost findings before buying broader delivery work.",
  },
  {
    title: "Validate",
    detail: "Use fixed-scope validation and audit work when the team needs pass/fail clarity, issue lists, or savings guidance.",
  },
  {
    title: "Implement",
    detail: "Move into scoped implementation only after the next technical step is clear enough to define tightly.",
  },
  {
    title: "Advise",
    detail: "Use light monthly guidance when continuity matters but a managed-service relationship does not.",
  },
] as const;
