import { describe, expect, it } from "vitest";

import {
  calculateConsultationQuoteUSD,
  calculateFixCostUSD,
  calculateOverallScore,
} from "@/lib/architecture-review/quote";

describe("architecture quote calculator", () => {
  it("maps category + points to deterministic fix cost", () => {
    expect(calculateFixCostUSD("performance", 6)).toBe(150);
    expect(calculateFixCostUSD("security", 12)).toBeGreaterThanOrEqual(150);
    expect(calculateFixCostUSD("security", 12)).toBeLessThanOrEqual(300);
    expect(calculateFixCostUSD("sustainability", 0)).toBe(0);
  });

  it("computes score and applies quote cap by score bucket", () => {
    const findings = [
      {
        ruleId: "SEC-1",
        category: "security" as const,
        pointsDeducted: 12,
        message: "Add IAM boundary.",
        fix: "Define least-privilege roles.",
        evidence: "IAM missing.",
        fixCostUSD: 290,
      },
      {
        ruleId: "REL-1",
        category: "reliability" as const,
        pointsDeducted: 10,
        message: "Add failover plan.",
        fix: "Document RTO/RPO and backup restore.",
        evidence: "No DR details.",
        fixCostUSD: 340,
      },
    ];

    const score = calculateOverallScore(findings);
    const quote = calculateConsultationQuoteUSD(findings, score);

    expect(score).toBe(78);
    expect(quote).toBeLessThanOrEqual(1500);
    expect(quote).toBe(249 + 290 + 340);
  });
});
