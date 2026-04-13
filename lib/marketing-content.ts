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
    summary: "A fast AWS read with a clear next step.",
    bullets: [
      "Findings, not filler",
      "What to validate, fix, or build next",
      "Best first buy when scope is still forming",
    ],
    included: [
      "Risks and gaps",
      "Next-step recommendation",
      "Founder review",
    ],
    prominence: "primary",
  },
  {
    slug: "aws-readiness-ftr-validation",
    eyebrow: "Additional scoped work",
    title: "AWS Readiness / FTR Validation",
    priceAnchor: "from $1,500",
    summary: "A validation pass for teams that need pass/fail clarity.",
    bullets: [
      "Evidence-based findings",
      "Pass/fail output by control area",
      "Best once the architecture is stable",
    ],
    included: [
      "Control findings",
      "Remediation guidance",
      "Validation summary",
    ],
    prominence: "secondary",
  },
  {
    slug: "cloud-cost-optimization-audit",
    eyebrow: "One-time audit",
    title: "Cloud Cost Optimization Audit",
    priceAnchor: "from $750",
    summary: "A bounded AWS cost review focused on waste and savings.",
    bullets: [
      "Waste review with clear priorities",
      "Savings tied to real spend",
      "Best when the bill no longer fits the value",
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
    summary: "A clean AWS baseline for IAM, networking, and security.",
    bullets: [
      "Security-first baseline",
      "Clean account and network structure",
      "Better footing before broader work",
    ],
    included: [
      "IAM baseline",
      "Network baseline",
      "Documented baseline",
    ],
    prominence: "primary",
  },
  {
    slug: "scoped-implementation",
    eyebrow: "Additional scoped work",
    title: "Scoped Implementation",
    priceAnchor: "from $1,250 per sprint or $149/hr",
    summary: "Hands-on follow-through once the next step is already clear.",
    bullets: [
      "Bounded implementation",
      "Clear stop point and handoff",
      "Used only when the work is specific enough to scope",
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
    summary: "Monthly founder access for teams that want continuity.",
    bullets: [
      "Decision support without managed services",
      "Continuity after review or remediation",
      "Business-hours support with clear expectations",
    ],
    included: [
      "Founder access",
      "Architecture guidance",
      "Follow-up support",
    ],
    prominence: "primary",
  },
] as const;

export const PRIMARY_CONSULTING_OFFERS = CONSULTING_OFFERS.filter((offer) => offer.prominence === "primary");
export const SECONDARY_CONSULTING_OFFERS = CONSULTING_OFFERS.filter((offer) => offer.prominence === "secondary");

export const SPECIALIST_ADVISORY = {
  title: "AI / ML Advisory",
  priceAnchor: "from $3,500",
  summary: "Kept secondary on purpose. Use it only for a real AWS AI or ML decision.",
  bullets: [
    "Guidance for a defined AI or ML use case",
    "Scope before build work starts",
    "Secondary to the core AWS offer",
  ],
} as const;

export const SOFTWARE_HIGHLIGHTS = [
  {
    title: "Architecture Diagram Reviewer",
    href: "/software/architecture-diagram-reviewer",
    summary: "Review an architecture and get a concrete next step.",
    audience: "Teams that want fast AWS architecture feedback.",
    outcome: "Review findings and a clearer remediation path.",
    cta: "Open reviewer",
  },
  {
    title: "ZoKorpValidator",
    href: "/software/zokorp-validator",
    summary: "Run evidence-heavy validation without keeping it manual.",
    audience: "Teams that need repeatable validation output.",
    outcome: "Clearer validation output and a steadier workflow.",
    cta: "Open validator",
  },
  {
    title: "Forecasting beta",
    href: "/software/mlops-foundation-platform",
    summary: "A narrow forecasting workflow kept separate from general consulting.",
    audience: "Teams evaluating a focused forecasting workflow.",
    outcome: "Public product context before signup or billing.",
    cta: "View forecasting beta",
  },
] as const;

export const DELIVERY_PROCESS_STEPS = [
  {
    title: "Review first",
    detail: "Start with a review or audit.",
  },
  {
    title: "Scope clearly",
    detail: "Use the findings to decide what comes next.",
  },
  {
    title: "Deliver the next step",
    detail: "Move only when the problem is clear enough to scope.",
  },
  {
    title: "Stay supported if needed",
    detail: "Use light advisory only when continuity matters.",
  },
] as const;

export const HOME_PAGE_CONTENT = {
  hero: {
    eyebrow: "Founder-led AWS architecture",
    title: "Clear AWS help for SMB teams.",
    lede:
      "Former AWS. Microsoft now. Fixed reviews, scoped follow-through, and public tools that make the next step obvious.",
    supportingBullets: [
      "Fixed reviews",
      "Clear scope before work starts",
      "Public browsing first",
      "Direct founder access",
    ],
  },
  offersTitle: "Start with one of four paths",
  offersIntro:
    "Review, audit, setup, or retainer. Start small, then decide.",
  softwareTitle: "Public tools before paid help",
  softwareIntro:
    "Use the tools first. Buy help when the next step is clear.",
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
    title: "Four AWS offers up front.",
    lede:
      "Start with a review, cost audit, landing zone setup, or retainer. Validation and implementation stay secondary.",
    supportingBullets: [
      "Founder-led delivery",
      "Price anchors",
      "Clear scope before work starts",
      "One-business-day response",
    ],
  },
  primaryTitle: "Primary services",
  primaryIntro:
    "These are the default entry points.",
  secondaryTitle: "Additional scoped work",
  secondarySummary: "Validation and implementation stay public, but secondary.",
  requestTitle: "Request a quote",
  requestIntro: "Use the form when you need a quote.",
} as const;

export const ABOUT_PAGE_CONTENT = {
  hero: {
    eyebrow: "Credibility stack",
    title: "Former AWS. Microsoft now. Direct technical judgment.",
    lede:
      "Named background, visible certifications, Houston contact, and a small operating model.",
    supportingBullets: [
      "Former AWS Partner Solutions Architect",
      "Currently at Microsoft",
      "AWS SA Pro, ML Specialty, Security Specialty",
      "Houston, Texas",
    ],
  },
  credibilityTitle: "Signals you can verify fast",
  credibilityCards: [
    {
      title: "Former AWS Partner Solutions Architect",
      detail: "Architecture, readiness, and delivery experience stay central.",
    },
    {
      title: "Currently at Microsoft",
      detail: "Present-day technical context stays visible.",
    },
    {
      title: "AWS certifications and Houston location",
      detail: "Certifications and a real operating location keep trust concrete.",
    },
  ],
} as const;

export const PRICING_PAGE_CONTENT = {
  hero: {
    eyebrow: "Pricing",
    title: "Public price anchors first.",
    lede:
      "Visible numbers, inclusions, and where estimate-first scoping still applies.",
    supportingBullets: [
      "Visible starting prices",
      "What is included",
      "Scoped quotes where needed",
    ],
  },
  consultingTitle: "Primary consulting offers",
  consultingIntro: "Use the public numbers first. Quote only what still needs scoping.",
  secondarySummary: "Validation and implementation are public, but not the first buy.",
  softwareTitle: "Software pricing and access",
} as const;

export const SOFTWARE_PAGE_CONTENT = {
  hero: {
    eyebrow: "Public software",
    title: "See the product before signup.",
    lede:
      "Browse first. Create an account when you want access, history, or billing.",
    supportingBullets: [
      "What it does",
      "Who it is for",
      "What you get",
      "Account later, not first",
    ],
  },
  spotlightTitle: "Public product paths",
  spotlightIntro: "Each product should scan in seconds.",
  accessSummary: "Marketing on `www`. Usage and billing in `app`.",
} as const;

export const CONTACT_PAGE_CONTENT = {
  hero: {
    eyebrow: "Contact ZoKorp",
    title: "Book a call or email directly.",
    lede:
      "Reply within one business day. Clear scope before work starts.",
    supportingBullets: [
      "Book a call for context",
      "Email for direct questions",
      "Houston, Texas",
    ],
  },
} as const;
