import type { ArchitectureCategory, ArchitectureFinding, ArchitectureFindingDraft } from "@/lib/architecture-review/types";

function scoreToCost(points: number, low: number, high: number) {
  if (points <= 0) {
    return 0;
  }

  if (low === high) {
    return low;
  }

  const clamped = Math.max(1, Math.min(20, points));
  const ratio = (clamped - 1) / 19;
  return Math.round(low + (high - low) * ratio);
}

export function calculateFixCostUSD(category: ArchitectureCategory, pointsDeducted: number) {
  if (pointsDeducted <= 0) {
    return 0;
  }

  switch (category) {
    case "clarity":
      return scoreToCost(pointsDeducted, 25, 75);
    case "security":
      return scoreToCost(pointsDeducted, 150, 300);
    case "reliability":
      return scoreToCost(pointsDeducted, 200, 350);
    case "operations":
      return scoreToCost(pointsDeducted, 150, 200);
    case "performance":
      return 150;
    case "cost":
      return scoreToCost(pointsDeducted, 100, 150);
    case "sustainability":
      return scoreToCost(pointsDeducted, 0, 100);
    default:
      return 0;
  }
}

export function calculateOverallScore(findings: Array<Pick<ArchitectureFindingDraft, "pointsDeducted">>) {
  const deductions = findings.reduce((total, finding) => total + Math.max(0, finding.pointsDeducted), 0);
  return Math.max(0, Math.min(100, 100 - deductions));
}

export function calculateConsultationQuoteUSD(findings: ArchitectureFinding[], overallScore: number) {
  const repairTotal = findings.reduce((total, finding) => {
    if (finding.pointsDeducted <= 0) {
      return total;
    }

    return total + finding.fixCostUSD;
  }, 0);

  const baseline = 249 + repairTotal;

  if (overallScore >= 85) {
    return Math.min(750, baseline);
  }

  if (overallScore >= 70) {
    return Math.min(1500, baseline);
  }

  return Math.min(2500, baseline);
}
