export const CONSULTING_OFFERS = [
  {
    slug: "architecture-review-remediation",
    eyebrow: "Flagship offer",
    title: "Architecture Review + Remediation",
    priceAnchor: "$249 advisory review / from $1,250 sprint",
    summary:
      "For teams that need a founder-led review, a clear remediation path, and help turning architecture findings into implementation decisions.",
    bullets: [
      "AWS architecture review and prioritization",
      "Scoped remediation plan with concrete next steps",
      "Hands-on follow-through for bounded delivery work",
    ],
  },
  {
    slug: "apn-aws-readiness",
    eyebrow: "Supporting offer",
    title: "APN / AWS Readiness",
    priceAnchor: "from $2,500",
    summary:
      "For teams preparing partner, readiness, or evidence-heavy AWS work that needs stronger structure, packaging, and technical alignment.",
    bullets: [
      "Readiness planning and evidence workflow design",
      "Architecture and control review for milestone preparation",
      "Founder-led guidance without enterprise-bench theater",
    ],
  },
  {
    slug: "aiml-mlops-advisory",
    eyebrow: "Supporting offer",
    title: "AI/ML & MLOps Advisory",
    priceAnchor: "from $3,500",
    summary:
      "For teams planning AI/ML delivery, GPU-backed workloads, or MLOps operating patterns where the forecasting workflow is only one piece of the roadmap.",
    bullets: [
      "AI/ML architecture and infrastructure advisory",
      "MLOps direction with practical launch constraints",
      "Forecasting workflow planning while the product matures",
    ],
  },
  {
    slug: "implementation-partner",
    eyebrow: "Custom scope",
    title: "Implementation Partner",
    priceAnchor: "Custom quote",
    summary:
      "For redesigns, migrations, or larger delivery efforts that should not be auto-scoped from a single call or software result.",
    bullets: [
      "Broader implementation planning and execution support",
      "Software-backed advisory when repeat work should become productized",
      "Custom scoping for multi-step delivery engagements",
    ],
  },
] as const;

export const CONSULTING_PRICE_OPTIONS = [
  {
    title: "Architecture Advisory Review",
    price: "$249",
    summary:
      "A founder-led review for teams that need a credible second set of eyes before committing to deeper remediation or implementation.",
  },
  {
    title: "Architecture Remediation Sprint",
    price: "from $1,250",
    summary:
      "A bounded follow-through sprint when the review already made the next technical step obvious.",
  },
  {
    title: "APN / AWS Readiness Package",
    price: "from $2,500",
    summary:
      "Readiness, validation, and evidence-heavy AWS support for teams preparing for milestones, audits, or partner checkpoints.",
  },
  {
    title: "AI/ML & MLOps Advisory",
    price: "from $3,500",
    summary:
      "Practical AI/ML and MLOps architecture guidance for teams planning infrastructure, controls, and forecasting workflows.",
  },
  {
    title: "Implementation Partner",
    price: "Custom quote",
    summary:
      "Custom scoping for broader implementation, migrations, or multi-step delivery efforts that should not be auto-scoped from a single call.",
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
      "A narrow forecasting workflow inside the broader MLOps advisory story, with scope stated plainly while the product continues to be built.",
    cta: "View forecasting beta",
  },
] as const;

export const DELIVERY_PROCESS_STEPS = [
  {
    title: "Assess",
    detail: "Clarify the architecture, readiness target, and practical constraint set before work expands unnecessarily.",
  },
  {
    title: "Scope",
    detail: "Choose the shortest credible path: advisory review, remediation sprint, readiness package, or a custom implementation plan.",
  },
  {
    title: "Execute",
    detail: "Run the work with founder-led accountability and software support where the process should become repeatable.",
  },
  {
    title: "Carry forward",
    detail: "Move into software, support, or a broader implementation phase without losing context.",
  },
] as const;
