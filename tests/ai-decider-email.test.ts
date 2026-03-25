import { describe, expect, it, vi } from "vitest";

import { buildAiDeciderEmailContent } from "@/lib/ai-decider/email";
import { buildAiDeciderReport } from "@/lib/ai-decider/engine";

describe("ai decider email", () => {
  it("renders an itemized estimate breakdown from the shared line-item schema", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T15:00:00.000Z"));

    const report = buildAiDeciderReport({
      lead: {
        email: "owner@acmeops.com",
        fullName: "Jordan Rivera",
        companyName: "Acme Ops",
        roleTitle: "COO",
        website: "acmeops.com",
        narrativeInput:
          "Our support team answers the same customer questions across email and Slack. Good answers live across docs, a knowledge base, and a few senior reps. We want faster response times and more consistent answers without making the workflow less safe.",
      },
      answers: {
        task_frequency: "daily",
        process_variability: "mostly_standard",
        data_state: "mixed_needs_cleanup",
        impact_window: "major",
        error_tolerance: "human_reviewed",
        knowledge_source: "few_curated",
        systems_count: "three_four",
        response_mode: "draft_with_human",
      },
    });

    const email = buildAiDeciderEmailContent({
      lead: {
        email: "owner@acmeops.com",
        fullName: "Jordan Rivera",
        companyName: "Acme Ops",
        roleTitle: "COO",
        website: "acmeops.com",
        narrativeInput:
          "Our support team answers the same customer questions across email and Slack. Good answers live across docs, a knowledge base, and a few senior reps. We want faster response times and more consistent answers without making the workflow less safe.",
      },
      report,
    });

    expect(report.quote.lineItems.length).toBeGreaterThanOrEqual(3);
    expect(email.text).toContain("Estimate breakdown:");
    expect(email.text).toContain(report.quote.lineItems[0]!.label);
    expect(email.html).toContain("Estimate breakdown");
    expect(email.html).toContain(report.quote.lineItems[0]!.label);
  });
});
