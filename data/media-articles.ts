export type MediaArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  intro: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

const mediaArticles: MediaArticle[] = [
  {
    slug: "architecture-review-checklist",
    title: "Architecture Review Checklist",
    description:
      "A short checklist for reviewing cloud architecture diagrams before they become blockers.",
    category: "Architecture Review",
    publishedAt: "2026-03-06",
    readTime: "4 min read",
    intro:
      "Most architecture reviews fail for ordinary reasons: weak flow context, unclear ownership, and missing security or operations detail.",
    sections: [
      {
        heading: "Start with flow clarity",
        paragraphs: [
          "A diagram should show where requests begin, where data lands, and who owns the path. If reviewers cannot narrate the flow in plain language, the diagram is not ready.",
        ],
        bullets: [
          "Name the entry point and trust boundary.",
          "Label the data stores that matter.",
          "Call out sync, async, and batch paths.",
        ],
      },
      {
        heading: "Review for security and recoverability",
        paragraphs: [
          "Security and reliability gaps are visible long before implementation starts. Look for identity boundaries, secret handling, backups, and clear failure paths.",
        ],
        bullets: [
          "Who is allowed to call each component?",
          "Where are credentials and secrets stored?",
          "What happens when a dependency fails or slows down?",
        ],
      },
      {
        heading: "Capture ownership and freshness",
        paragraphs: [
          "A diagram without an owner or review date goes stale fast. Add title, owner, version, and last-reviewed date.",
        ],
      },
    ],
  },
  {
    slug: "aws-partner-readiness-workflow",
    title: "AWS Partner Readiness Workflow",
    description:
      "How to reduce scramble-driven evidence collection and make readiness work repeatable.",
    category: "AWS Delivery",
    publishedAt: "2026-03-06",
    readTime: "4 min read",
    intro:
      "Partner-readiness work breaks down when evidence is gathered at the last minute. The fix is a repeatable workflow with named owners and review steps.",
    sections: [
      {
        heading: "Define evidence owners early",
        paragraphs: [
          "Every control should have one owner, one reviewer, and one storage location. Teams lose time when proof exists but nobody owns it.",
        ],
      },
      {
        heading: "Separate collection from review",
        paragraphs: [
          "Collection gathers raw artifacts. Review checks them against acceptance criteria. Keeping those steps separate makes quality problems visible earlier.",
        ],
        bullets: [
          "Collect the source artifact.",
          "Normalize it into a review-ready format.",
          "Record the reviewer decision and next action.",
        ],
      },
      {
        heading: "Use software where the work is repetitive",
        paragraphs: [
          "If your team keeps repeating the same checklist or evidence-packaging task, it should become software-backed.",
        ],
      },
    ],
  },
  {
    slug: "why-zokorp-platform",
    title: "Why ZoKorp Runs Software, Services, and Billing Together",
    description:
      "The operating model behind ZoKorp and why account-linked software matters.",
    category: "Platform Strategy",
    publishedAt: "2026-03-06",
    readTime: "3 min read",
    intro:
      "ZoKorp is built around one idea: the same customer should not need one system for tools, another for service requests, and another for billing history.",
    sections: [
      {
        heading: "A shared account creates continuity",
        paragraphs: [
          "When purchases, service requests, and billing history live under one account, follow-up gets simpler.",
        ],
      },
      {
        heading: "Software should reduce repetitive consulting work",
        paragraphs: [
          "Consulting shows which manual steps keep repeating. The platform is where those steps become tools.",
        ],
      },
      {
        heading: "Trust comes from operational clarity",
        paragraphs: [
          "Customers need to know where support lives, how billing works, and what happens after they buy.",
        ],
      },
    ],
  },
];

export function getMediaArticles() {
  return [...mediaArticles];
}

export function getMediaArticleBySlug(slug: string) {
  return mediaArticles.find((article) => article.slug === slug) ?? null;
}
