import type { ArchitectureReviewReport } from "@/lib/architecture-review/types";

function providerLabel(provider: ArchitectureReviewReport["provider"]) {
  return provider.toUpperCase();
}

function findingLine(index: number, finding: ArchitectureReviewReport["findings"][number]) {
  return `${index + 1}. pointsDeducted=${finding.pointsDeducted} | message=${finding.message} | fix=${finding.fix} | ruleId=${finding.ruleId} | estFixCost=$${finding.fixCostUSD}`;
}

export function buildArchitectureReviewEmailContent(report: ArchitectureReviewReport) {
  const mandatoryFindings = report.findings.filter((finding) => finding.pointsDeducted > 0);
  const optionalRecommendations = report.findings.filter((finding) => finding.pointsDeducted === 0);

  const lines = [
    `Architecture Diagram Review (${providerLabel(report.provider)})`,
    `Generated: ${report.generatedAtISO}`,
    `Email: ${report.userEmail}`,
    "",
    `Overall score: ${report.overallScore}/100`,
    `Consultation quote: $${report.consultationQuoteUSD}`,
    "",
    "Flow narrative:",
    report.flowNarrative,
    "",
    "Findings (single-line, deterministic format):",
    ...(mandatoryFindings.length > 0
      ? mandatoryFindings.map((finding, index) => findingLine(index, finding))
      : ["No mandatory findings."]),
    "",
    "Optional recommendations (0 points deducted):",
    ...(optionalRecommendations.length > 0
      ? optionalRecommendations.map((finding, index) => findingLine(index, finding))
      : ["No optional recommendations."]),
  ];

  const subject = `[ZoKorp] ${providerLabel(report.provider)} architecture review score ${report.overallScore}/100`;
  const text = lines.join("\n");

  return {
    subject,
    text,
  };
}

export function buildMailtoUrl(input: { to: string; subject: string; body: string; maxLength?: number }) {
  const maxLength = input.maxLength ?? 1800;
  const encodedSubject = encodeURIComponent(input.subject);
  const encodedBody = encodeURIComponent(input.body);
  const mailto = `mailto:${encodeURIComponent(input.to)}?subject=${encodedSubject}&body=${encodedBody}`;

  if (mailto.length > maxLength) {
    return null;
  }

  return mailto;
}

export function buildEmlDocument(input: { to: string; subject: string; body: string }) {
  const utcDate = new Date().toUTCString();
  const escapedBody = input.body.replace(/\r?\n/g, "\r\n");

  return [
    `From: ZoKorp Platform <no-reply@zokorp.local>`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    `Date: ${utcDate}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    escapedBody,
    "",
  ].join("\r\n");
}
