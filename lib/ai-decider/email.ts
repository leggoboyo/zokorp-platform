import { AI_DECIDER_FINDING_CATEGORY_LABELS, AI_DECIDER_RECOMMENDATION_LABELS, CONSULTATION_CTA_PATH } from "@/lib/ai-decider/config";
import type { AiDeciderLeadInput, AiDeciderReport } from "@/lib/ai-decider/types";
import { formatUsdRange, renderQuoteLineItemsHtml, quoteLineItemText } from "@/lib/quote-line-items";
import { getSiteUrl } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? "there";
}

function consultationUrl() {
  return new URL(CONSULTATION_CTA_PATH, getSiteUrl()).toString();
}

function scoreLines(report: AiDeciderReport) {
  return [
    `AI fit: ${report.scores.aiFitScore}/100`,
    `Automation fit: ${report.scores.automationFitScore}/100`,
    `Data readiness: ${report.scores.dataReadinessScore}/100`,
    `Implementation risk: ${report.scores.implementationRiskScore}/100`,
    `ROI plausibility: ${report.scores.roiPlausibilityScore}/100`,
    `Confidence: ${report.scores.confidenceScore}/100`,
  ];
}

function buildTextEmail(input: {
  lead: AiDeciderLeadInput;
  report: AiDeciderReport;
}) {
  const lines = [
    `Hi ${firstName(input.lead.fullName)},`,
    "",
    `Your AI Decider memo for ${input.lead.companyName} is ready.`,
    "",
    `${input.report.verdictHeadline}`,
    `${input.report.verdictLine}`,
    "",
    input.report.summaryParagraph,
    "",
    `Recommendation: ${AI_DECIDER_RECOMMENDATION_LABELS[input.report.recommendation]}`,
    "",
    "Score snapshot:",
    ...scoreLines(input.report).map((line) => `- ${line}`),
    "",
    "Findings:",
    ...(
      input.report.findings.length > 0
        ? input.report.findings.map(
            (finding) =>
              `- ${AI_DECIDER_FINDING_CATEGORY_LABELS[finding.category]} (${finding.severity}): ${finding.finding} Fix: ${finding.recommendedFix}`,
          )
        : ["- No major blockers were detected in the submitted scope."]
    ),
    "",
    "Blockers:",
    ...(
      input.report.blockers.length > 0
        ? input.report.blockers.map((blocker) => `- ${blocker}`)
        : ["- No immediate blockers were detected."]
    ),
    "",
    "Next steps:",
    ...input.report.nextSteps.map((step) => `- ${step}`),
    "",
    `Suggested engagement: ${input.report.quote.engagementType}`,
    `Estimated quote range: ${formatUsdRange(input.report.quote.priceLow, input.report.quote.priceHigh)}`,
    `Quote confidence: ${input.report.quote.confidence}`,
    "Quote breakdown:",
    ...input.report.quote.lineItems.map((item) => `- ${quoteLineItemText(item)}`),
    ...input.report.quote.rationaleLines.map((line) => `- ${line}`),
    "",
    `Book a consultation: ${consultationUrl()}`,
    "Reply to this email if you want the scope tightened before booking.",
  ];

  return lines.join("\n");
}

function buildHtmlEmail(input: {
  lead: AiDeciderLeadInput;
  report: AiDeciderReport;
}) {
  return `
    <div style="background:#f4f7fb;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d7e2ef;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f172a,#1d4d4f);padding:24px;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d6f5f0;">ZoKorp Software</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;">AI Decider Advisory Memo</h1>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Hi ${escapeHtml(firstName(input.lead.fullName))}, here is the memo for ${escapeHtml(input.lead.companyName)}.</p>

          <div style="border:1px solid #d7e2ef;border-radius:12px;padding:16px;background:#f8fbff;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Verdict</div>
            <h2 style="margin:8px 0 6px;font-size:24px;line-height:1.2;color:#0f172a;">${escapeHtml(input.report.verdictHeadline)}</h2>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(input.report.verdictLine)}</p>
          </div>

          <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#334155;">${escapeHtml(input.report.summaryParagraph)}</p>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Recommendation</div>
            <div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(AI_DECIDER_RECOMMENDATION_LABELS[input.report.recommendation])}</div>
          </div>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;background:#fbfcfe;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Score snapshot</div>
            <ul style="margin:10px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              ${scoreLines(input.report).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Findings</div>
            <ul style="margin:10px 0 0;padding-left:18px;color:#0f172a;font-size:14px;line-height:1.7;">
              ${
                input.report.findings.length > 0
                  ? input.report.findings
                      .map(
                        (finding) =>
                          `<li><strong>${escapeHtml(AI_DECIDER_FINDING_CATEGORY_LABELS[finding.category])}</strong> (${escapeHtml(finding.severity)}): ${escapeHtml(finding.finding)}<br /><span style="color:#475569;">Recommended fix: ${escapeHtml(finding.recommendedFix)}</span></li>`,
                      )
                      .join("")
                  : "<li>No major blockers were detected in the submitted scope.</li>"
              }
            </ul>
          </div>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;background:#fbfcfe;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Blockers</div>
            <ul style="margin:10px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              ${
                input.report.blockers.length > 0
                  ? input.report.blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join("")
                  : "<li>No immediate blockers were detected.</li>"
              }
            </ul>
          </div>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;background:#fbfcfe;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Next steps</div>
            <ul style="margin:10px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              ${input.report.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:18px;border:1px solid #d7e2ef;border-radius:12px;padding:14px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Quote range</div>
            <p style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(formatUsdRange(input.report.quote.priceLow, input.report.quote.priceHigh))}</p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#334155;">Suggested engagement: <strong>${escapeHtml(input.report.quote.engagementType)}</strong><br />Quote confidence: ${escapeHtml(input.report.quote.confidence)}</p>
            <div style="margin-top:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Quote breakdown</div>
            <ul style="margin:10px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              ${renderQuoteLineItemsHtml(input.report.quote.lineItems)}
            </ul>
            <ul style="margin:10px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              ${input.report.quote.rationaleLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:20px;">
            <a href="${escapeHtml(consultationUrl())}" style="display:inline-block;padding:12px 18px;background:#0f172a;border-radius:8px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Book a consultation</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildAiDeciderEmailContent(input: {
  lead: AiDeciderLeadInput;
  report: AiDeciderReport;
}) {
  return {
    subject: `AI Decider Memo for ${input.lead.companyName}`,
    text: buildTextEmail(input),
    html: buildHtmlEmail(input),
  };
}
