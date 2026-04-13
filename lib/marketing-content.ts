export type PublicServiceOffer = {
  slug: string;
  eyebrow: string;
  title: string;
  priceAnchor: string;
  summary: string;
  bullets: string[];
  included: string[];
  prominence: "primary" | "secondary";
};

export const MARKETING_TRUST_CHIPS = [
  "Former AWS Partner Solutions Architect",
  "Currently at Microsoft",
  "Houston, Texas",
  "Initial response within one business day",
] as const;

export const CONSULTING_OFFERS: PublicServiceOffer[] = [
  {
    slug: "architecture-review",
    eyebrow: "Start here",
    title: "Architecture Review",
    priceAnchor: "$249 founder review or free browser review",
    summary: "The fastest way to get a direct AWS architecture read and a scoped next step.",
    bullets: [
      "Deterministic findings instead of vague consulting language",
      "Clear guidance on whether to validate, optimize, or implement next",
      "Best first purchase when the real scope is still forming",
    ],
    included: [
      "Priority risks and gaps",
      "Clear next-step recommendation",
      "Founder-led review output",
    ],
    prominence: "primary",
  },
  {
    slug: "aws-readiness-ftr-validation",
    eyebrow: "Additional scoped work",
    title: "AWS Readiness / FTR Validation",
    priceAnchor: "from $1,500",
    summary: "A structured validation pass for teams that need pass/fail clarity before launch, review, or audit.",
    bullets: [
      "Evidence-based readiness findings",
      "Pass/fail style output by control area",
      "Best used once the architecture is stable enough to validate",
    ],
    included: [
      "Control-area findings",
      "Remediation guidance",
      "Validation-ready summary",
    ],
    prominence: "secondary",
  },
  {
    slug: "cloud-cost-optimization-audit",
    eyebrow: "One-time audit",
    title: "Cloud Cost Optimization Audit",
    priceAnchor: "from $750",
    summary: "A bounded AWS cost review focused on waste, savings opportunities, and the changes worth making first.",
    bullets: [
      "Waste and inefficiency review with clear priorities",
      "Savings guidance tied to actual AWS spend",
      "Good fit when the bill no longer matches the value",
    ],
    included: [
      "Spend review",
      "Savings priorities",
      "Remediation guidance",
    ],
    prominence: "primary",
  },
  {
    slug: "landing-zone-setup",
    eyebrow: "Fixed scope",
    title: "Landing Zone Setup",
    priceAnchor: "from $2,500",
    summary: "A clean AWS baseline for teams that need IAM, networking, and security basics set up correctly.",
    bullets: [
      "Security-first AWS baseline",
      "Clean account and networking structure",
      "Better foundation before broader delivery work starts",
    ],
    included: [
      "IAM baseline",
      "Network baseline",
      "Documented starting point",
    ],
    prominence: "primary",
  },
  {
    slug: "scoped-implementation",
    eyebrow: "Additional scoped work",
    title: "Scoped Implementation",
    priceAnchor: "from $1,250 per sprint or $149/hr",
    summary: "Hands-on follow-through for the next technical step after a review or audit has already made the path clear.",
    bullets: [
      "Bounded implementation instead of open-ended delivery",
      "Clear stop point and handoff",
      "Used only after the actual work is specific enough to scope cleanly",
    ],
    included: [
      "Defined work scope",
      "Hands-on fixes",
      "Clear handoff",
    ],
    prominence: "secondary",
  },
  {
    slug: "advisory-retainer",
    eyebrow: "Light support",
    title: "Advisory Retainer",
    priceAnchor: "from $1,500/month",
    summary: "Monthly founder access for teams that want continuity after the initial architecture work is underway.",
    bullets: [
      "Decision support without a managed-service contract",
      "Clearer continuity after review or remediation work",
      "Business-hours support with visible expectations",
    ],
    included: [
      "Founder access",
      "Architecture guidance",
      "Follow-up review support",
    ],
    prominence: "primary",
  },
] as const;

export const PRIMARY_CONSULTING_OFFERS = CONSULTING_OFFERS.filter((offer) => offer.prominence === "primary");
export const SECONDARY_CONSULTING_OFFERS = CONSULTING_OFFERS.filter((offer) => offer.prominence === "secondary");

export const SPECIALIST_ADVISORY = {
  title: "AI / ML Advisory",
  priceAnchor: "from $3,500",
  summary: "Kept secondary on purpose. Use it only when there is a real AWS-based AI or ML architecture decision to make.",
  bullets: [
    "Architecture guidance for a defined AI or ML use case",
    "Scope and delivery recommendations before build work starts",
    "Secondary to the core AWS architecture offering",
  ],
} as const;

export const SOFTWARE_HIGHLIGHTS = [
  {
    title: "Architecture Diagram Reviewer",
    href: "/software/architecture-diagram-reviewer",
    summary: "Review an architecture, surface findings, and turn the result into a concrete next step.",
    audience: "Teams that want fast AWS architecture feedback before buying broader work.",
    outcome: "Review findings and a clearer remediation conversation.",
    cta: "Open reviewer",
  },
  {
    title: "ZoKorpValidator",
    href: "/software/zokorp-validator",
    summary: "Run evidence-heavy validation without keeping the entire workflow manual forever.",
    audience: "Teams that need repeatable validation output with audit-style structure.",
    outcome: "A more consistent validation workflow and clearer output quality.",
    cta: "Open validator",
  },
  {
    title: "Forecasting beta",
    href: "/software/mlops-foundation-platform",
    summary: "A narrow forecasting workflow that stays secondary to the core AWS architecture business.",
    audience: "Teams evaluating a focused forecasting workflow rather than general consulting.",
    outcome: "Public product context before account creation or billing.",
    cta: "View forecasting beta",
  },
] as const;

export const DELIVERY_PROCESS_STEPS = [
  {
    title: "Review first",
    detail: "Start with a review or audit before buying broader implementation work.",
  },
  {
    title: "Scope clearly",
    detail: "Use the findings to decide what is worth validating, fixing, or buying next.",
  },
  {
    title: "Deliver the next step",
    detail: "Move into bounded follow-through only after the actual problem is clear enough to define.",
  },
  {
    title: "Stay supported if needed",
    detail: "Use light advisory only when continuity matters after the initial work is underway.",
  },
] as const;

export const HOME_PAGE_CONTENT = {
  hero: {
    eyebrow: "Founder-led AWS architecture",
    title: "Clear AWS architecture help for SMB teams that need the next move.",
    lede:
      "Former AWS. Currently at Microsoft. ZoKorp gives SMB teams fixed reviews, bounded follow-through, and public tools that make the next step obvious.",
    supportingBullets: [
      "Fixed reviews instead of vague consulting retainers",
      "Clear scope before work starts",
      "Public browsing before account creation",
      "Direct founder access when a call is the faster path",
    ],
  },
  offersTitle: "Start with one of four clear paths",
  offersIntro:
    "Use a review, cost audit, landing zone setup, or advisory retainer to define the next move without widening the scope too early.",
  softwareTitle: "Public tools that clarify the problem before you buy help",
  softwareIntro:
    "The software exists to make decisions sharper, not to hide the service model behind a login wall.",
  finalCtaTitle: "Move to a call when the situation is easier to explain live.",
  finalCtaBullets: [
    "Initial response within one business day",
    "Clear scope before work starts",
    "No fake proof wall or invented outcomes",
  ],
} as const;

export const SERVICES_PAGE_CONTENT = {
  hero: {
    eyebrow: "Scoped AWS services",
    title: "Four productized AWS offers up front. Follow-through only when scope is earned.",
    lede:
      "The catalog stays narrow on purpose: architecture review, cost audit, landing zone setup, and advisory. Validation and implementation stay visible, but secondary.",
    supportingBullets: [
      "Founder-led delivery",
      "Visible price anchors",
      "Clear scope before work starts",
      "Initial response within one business day",
    ],
  },
  primaryTitle: "Primary services",
  primaryIntro:
    "These are the default entry points for SMB buyers who want direct AWS judgment without large-firm process overhead.",
  secondaryTitle: "Additional scoped work",
  secondarySummary: "Readiness validation and scoped implementation stay public, but they should not be the first thing most buyers purchase.",
  requestTitle: "Request a quote",
  requestIntro: "Use the request form when you already know a structured quote is the right next step.",
} as const;

export const ABOUT_PAGE_CONTENT = {
  hero: {
    eyebrow: "Credibility stack",
    title: "Former AWS. Currently at Microsoft. Operating with direct technical judgment.",
    lede:
      "ZoKorp is intentionally founder-led: named background, visible certifications, Houston-based contact, and a small operating model that keeps scope visible.",
    supportingBullets: [
      "Former AWS Partner Solutions Architect",
      "Currently at Microsoft",
      "AWS SA Pro, ML Specialty, Security Specialty",
      "Houston, Texas",
    ],
  },
  credibilityTitle: "Signals a buyer can verify without guesswork",
  credibilityCards: [
    {
      title: "Former AWS Partner Solutions Architect",
      detail: "Architecture, readiness, and delivery experience stay central to the public positioning.",
    },
    {
      title: "Currently at Microsoft",
      detail: "Present-day technical context matters, so the current Microsoft background stays visible.",
    },
    {
      title: "AWS certifications and Houston location",
      detail: "Professional and specialty certifications plus a real operating location make the trust posture concrete.",
    },
  ],
} as const;

export const PRICING_PAGE_CONTENT = {
  hero: {
    eyebrow: "Pricing",
    title: "Public price anchors first. Scoped quotes only when the work is real.",
    lede:
      "Pricing should orient a buyer quickly. ZoKorp shows the visible numbers, what is included, and where estimate-first scoping still applies.",
    supportingBullets: [
      "Visible starting prices or ranges",
      "What is included stays explicit",
      "Broader implementation still moves through scoped quotes",
    ],
  },
  consultingTitle: "Primary consulting offers",
  consultingIntro: "Use the public numbers to understand the buying model. Use a quote when broader work still needs scoping.",
  secondarySummary: "Validation and implementation stay public, but they should only be bought once the actual need is clear.",
  softwareTitle: "Software pricing and access",
} as const;

export const SOFTWARE_PAGE_CONTENT = {
  hero: {
    eyebrow: "Public software",
    title: "See the product outcome before you create an account.",
    lede:
      "ZoKorp software exists to reduce repetitive review work and clarify product outcomes. Browse publicly first. Create an account only when you want access, history, or billing inside the app.",
    supportingBullets: [
      "What it does stays visible",
      "Who it is for stays visible",
      "What you get stays visible",
      "Account creation happens later, not first",
    ],
  },
  spotlightTitle: "Public product paths",
  spotlightIntro: "Each product should be understandable in a few seconds: what it does, who it is for, and what you get next.",
  accessSummary: "Marketing stays on `www`. Product use, history, and billing stay on `app`.",
} as const;

export const CONTACT_PAGE_CONTENT = {
  hero: {
    eyebrow: "Contact ZoKorp",
    title: "Book a call or email directly.",
    lede:
      "Initial response within one business day. Clear scope before work starts. No forced signup just to ask a question.",
    supportingBullets: [
      "Book a call when a real conversation is the faster next step",
      "Email when you already know what you want to ask",
      "Houston, Texas",
    ],
  },
} as const;
