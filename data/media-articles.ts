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
    title: "Architecture Review Checklist for Small Delivery Teams",
    description:
      "A practical checklist for reviewing cloud architecture diagrams before they become delivery blockers.",
    category: "Architecture Review",
    publishedAt: "2026-03-06",
    readTime: "6 min read",
    intro:
      "Most architecture reviews fail for ordinary reasons: missing flow context, weak ownership signals, and diagrams that do not say enough about security or operations. Small teams need a lightweight checklist that catches those issues early without turning every review into a committee exercise.",
    sections: [
      {
        heading: "Start with flow clarity",
        paragraphs: [
          "A diagram should show where requests begin, where data lands, and which components carry operational responsibility. If reviewers cannot narrate the flow in plain language, the diagram is not ready for approval.",
          "Ask for a one-paragraph description alongside the image. That simple requirement surfaces hidden assumptions faster than adding more boxes to the canvas.",
        ],
        bullets: [
          "Name the entry point and trust boundary.",
          "Label the data stores that matter to the flow.",
          "Explain synchronous, asynchronous, and batch paths clearly.",
        ],
      },
      {
        heading: "Review for security and recoverability",
        paragraphs: [
          "Security and reliability gaps are usually visible in architecture reviews long before implementation starts. Look for identity boundaries, secret handling, encryption context, backups, and clear failure paths.",
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
          "A diagram without an owner or review date becomes stale quickly. Add title, owner, version, and last-reviewed metadata so engineers know whether the diagram still reflects reality.",
        ],
      },
    ],
  },
  {
    slug: "aws-partner-readiness-workflow",
    title: "A Practical AWS Partner Readiness Workflow",
    description:
      "How to reduce scramble-driven evidence collection and turn partner-readiness work into a repeatable operating rhythm.",
    category: "AWS Delivery",
    publishedAt: "2026-03-06",
    readTime: "7 min read",
    intro:
      "Partner-readiness work breaks down when evidence is gathered at the last minute. The fix is not more spreadsheets. The fix is a repeatable workflow that connects service delivery, proof artifacts, and review ownership before a milestone deadline appears.",
    sections: [
      {
        heading: "Define evidence owners early",
        paragraphs: [
          "Every control or milestone should have one owner, one reviewer, and one canonical storage location. Teams lose time when proof exists but nobody knows who is responsible for keeping it current.",
        ],
      },
      {
        heading: "Separate collection from review",
        paragraphs: [
          "Collection gathers raw artifacts. Review checks those artifacts against acceptance criteria. Treating those as different steps reduces conflict and makes quality problems visible earlier.",
        ],
        bullets: [
          "Collect the source artifact.",
          "Normalize the artifact into a review-ready format.",
          "Record the reviewer decision and next action.",
        ],
      },
      {
        heading: "Use software where the work is repetitive",
        paragraphs: [
          "If your team keeps performing the same checklist comparison, score normalization, or evidence packaging task, it should become software-backed. That is the point where consulting effort starts to scale.",
        ],
      },
    ],
  },
  {
    slug: "why-zokorp-platform",
    title: "Why ZoKorp Runs Software, Services, and Billing in One Platform",
    description:
      "The operating model behind ZoKorp Platform and why account-linked software matters for delivery businesses.",
    category: "Platform Strategy",
    publishedAt: "2026-03-06",
    readTime: "5 min read",
    intro:
      "ZoKorp is designed around one practical idea: the same customer should not need one system for self-serve tools, another for service requests, and another for billing history. The platform brings those workflows together so product usage and delivery work reinforce each other.",
    sections: [
      {
        heading: "A shared account creates continuity",
        paragraphs: [
          "When software purchases, service requests, and billing history live under one account, follow-up work becomes simpler. Customers can move from discovery to purchase to implementation without losing context.",
        ],
      },
      {
        heading: "Software should reduce repetitive consulting work",
        paragraphs: [
          "ZoKorp uses consulting engagements to identify the manual steps that happen again and again. The platform is where those repeated steps become software-backed tools with clearer pricing and cleaner access control.",
        ],
      },
      {
        heading: "Trust comes from operational clarity",
        paragraphs: [
          "Customers need to know where support lives, how billing works, how uploads are handled, and what happens after they buy. The platform makes those answers visible instead of hiding them behind ad hoc follow-up.",
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
