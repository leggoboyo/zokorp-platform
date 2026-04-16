export type FounderProofVariantKey = "conservative" | "default" | "stronger";

export const FOUNDER_PROOF_ORGANIZATIONS = [
  "D.R. Horton",
  "SiriusXM",
  "Warner Bros.",
  "JE Dunn",
  "Cohere",
  "Glean",
  "Anthropic",
  "the National Hockey League",
] as const;

export const FOUNDER_PROOF_SECTOR_CLUSTERS = [
  {
    label: "Homebuilding / construction",
    organizations: ["D.R. Horton", "JE Dunn"],
  },
  {
    label: "Media / entertainment",
    organizations: ["SiriusXM", "Warner Bros."],
  },
  {
    label: "Enterprise / AI",
    organizations: ["Cohere", "Glean", "Anthropic"],
  },
  {
    label: "Sports",
    organizations: ["the National Hockey League"],
  },
] as const;

export const FOUNDER_PROOF_SECTOR_SUMMARY =
  "Across homebuilding, construction, media, enterprise software, frontier AI, and sports.";

export const FOUNDER_PROOF_DISCLAIMER =
  "Organization names are included as background context and do not imply endorsement.";

const organizationList = FOUNDER_PROOF_ORGANIZATIONS.join(", ").replace(
  ", the National Hockey League",
  ", and the National Hockey League",
);

export const FOUNDER_PROOF_VARIANTS = {
  conservative: `Experience includes work involving organizations such as ${organizationList}.`,
  default: `Technical-lead experience includes work supporting teams at organizations such as ${organizationList}.`,
  stronger: `I have served as technical lead on work for organizations including ${organizationList}.`,
} as const satisfies Record<FounderProofVariantKey, string>;

export const ACTIVE_FOUNDER_PROOF_VARIANT: FounderProofVariantKey = "conservative";
export const variants = FOUNDER_PROOF_VARIANTS;
export const activeVariant = ACTIVE_FOUNDER_PROOF_VARIANT;

export type FounderProofPageContent = {
  home: {
    eyebrow: string;
    statement: string;
    support: string;
    sectorLine: string;
  };
  about: {
    narrative: {
      eyebrow: string;
      title: string;
      paragraphs: readonly string[];
    };
    selectedBackground: {
      eyebrow: string;
      title: string;
      statement: string;
      sectorLine: string;
    };
    whyItMatters: {
      eyebrow: string;
      title: string;
      support: string;
      bullets: readonly string[];
      disclaimer: string;
    };
  };
  services: {
    eyebrow: string;
    title: string;
    support: string;
    statement: string;
    benefits: readonly {
      title: string;
      detail: string;
    }[];
  };
  contact: {
    statement: string;
  };
};

export const FOUNDER_PROOF_PAGE_CONTENT = {
  home: {
    eyebrow: "Selected background",
    statement: FOUNDER_PROOF_VARIANTS[ACTIVE_FOUNDER_PROOF_VARIANT],
    support:
      "That background shows up here as tighter scope, clearer reviews, cleaner follow-through, and less generic advice.",
    sectorLine: FOUNDER_PROOF_SECTOR_SUMMARY,
  },
  about: {
    narrative: {
      eyebrow: "Founder background",
      title: "Larger-environment judgment, smaller-practice delivery.",
      paragraphs: [
        "ZoKorp is intentionally small, but it is not built from small-context experience. Before building a founder-led practice, Zohaib worked in larger technical environments where standards were stricter, stakeholder groups were broader, and weak recommendations had a shorter shelf life.",
        "That includes prior work as a Former AWS Partner Solutions Architect and current work at Microsoft. The value to buyers is not prestige. It is tighter scoping, clearer communication when tradeoffs are real, and cleaner follow-through.",
      ],
    },
    selectedBackground: {
      eyebrow: "Selected background",
      title: "Experience that raises the bar without changing the model.",
      statement: FOUNDER_PROOF_VARIANTS[ACTIVE_FOUNDER_PROOF_VARIANT],
      sectorLine: FOUNDER_PROOF_SECTOR_SUMMARY,
    },
    whyItMatters: {
      eyebrow: "Why it matters now",
      title: "Why this helps smaller teams.",
      support:
        "The point of this background is simple: buyers get judgment shaped by bigger environments without getting pushed into bloated enterprise consulting.",
      bullets: [
        "Cleaner decision-making shaped by larger environments.",
        "Clearer communication when more stakeholders are involved.",
        "Tighter scoping and sharper risk judgment.",
      ],
      disclaimer: FOUNDER_PROOF_DISCLAIMER,
    },
  },
  services: {
    eyebrow: "Why trust this work?",
    title: "Larger-environment standards, applied to smaller scoped engagements.",
    support:
      "The same founder handling your review has operated in larger technical environments with stricter standards, more stakeholders, and less room for vague recommendations.",
    statement: FOUNDER_PROOF_VARIANTS[ACTIVE_FOUNDER_PROOF_VARIANT],
    benefits: [
      {
        title: "Architecture Review",
        detail:
          "Founder-led judgment shaped by higher-stakes architecture decisions and clearer tradeoff calls.",
      },
      {
        title: "Readiness / Validation Review",
        detail:
          "Stronger evidence discipline and less vague pass/fail language when the work needs to stand up to scrutiny.",
      },
      {
        title: "Cloud Cost Optimization Audit",
        detail:
          "Practical prioritization instead of generic savings lists or cost-cutting theater.",
      },
      {
        title: "Landing Zone Setup",
        detail:
          "Cleaner baselines and fewer naive recommendations before the environment gets harder to unwind.",
      },
    ],
  },
  contact: {
    statement:
      "Small practice. Founder-led. Background includes work involving organizations across homebuilding, construction, media, enterprise software, frontier AI, and sports.",
  },
} as const satisfies FounderProofPageContent;
