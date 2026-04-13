import type { ServiceRequestType } from "@prisma/client";

import { sendArchitectureReviewEmail, type SendEmailResult } from "@/lib/architecture-review/sender";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { SERVICE_REQUEST_TYPE_LABEL } from "@/lib/service-requests";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPreferredStart(value: Date | null) {
  return value ? value.toLocaleDateString("en-US", { timeZone: "UTC" }) : "Not provided";
}

type ServiceRequestOperatorNotificationInput = {
  trackingCode: string;
  type: ServiceRequestType;
  title: string;
  summary: string;
  requesterEmail: string;
  requesterName?: string | null;
  requesterCompanyName?: string | null;
  requesterSource: string;
  preferredStart?: Date | null;
  budgetRange?: string | null;
};

export async function sendServiceRequestOperatorNotification(
  input: ServiceRequestOperatorNotificationInput,
): Promise<SendEmailResult> {
  const subject = `[ZoKorp] ${input.trackingCode} · ${SERVICE_REQUEST_TYPE_LABEL[input.type]}`;
  const requesterName = input.requesterName?.trim() || "Not provided";
  const requesterCompanyName = input.requesterCompanyName?.trim();
  const budgetRange = input.budgetRange?.trim();
  const preferredStart = input.preferredStart ? formatPreferredStart(input.preferredStart) : null;

  const detailLines = [
    ["Tracking code", input.trackingCode],
    ["Request", input.title],
    ["Type", SERVICE_REQUEST_TYPE_LABEL[input.type]],
    ["Name", requesterName],
    ["Email", input.requesterEmail],
    requesterCompanyName ? ["Company", requesterCompanyName] : null,
    budgetRange ? ["Budget range", budgetRange] : null,
    preferredStart ? ["Preferred start", preferredStart] : null,
  ].filter((entry): entry is [string, string] => Boolean(entry));

  const text = [
    "New ZoKorp contact request.",
    "",
    ...detailLines.map(([label, value]) => `${label}: ${value}`),
    "",
    "Summary:",
    input.summary,
    "",
    `Reply to: ${PUBLIC_LAUNCH_CONTACT.primaryEmail}`,
  ].join("\n");

  const html = `
    <div style="background:#f3f6fb;padding:28px 16px;font-family:'Plus Jakarta Sans',Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d7e2ef;border-radius:18px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:24px;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#cbd5f5;">ZoKorp contact request</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;font-weight:700;">${escapeHtml(input.trackingCode)} · ${escapeHtml(
            SERVICE_REQUEST_TYPE_LABEL[input.type],
          )}</h1>
        </div>
        <div style="padding:24px;">
          <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
            ${detailLines
              .map(
                ([label, value]) => `
                  <div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(
                      label,
                    )}</p>
                    <p style="margin:0;font-size:15px;line-height:1.5;color:#0f172a;">${escapeHtml(value)}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
          <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Summary</p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${escapeHtml(input.summary)}</p>
          </div>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">Reply-to target: ${escapeHtml(
            PUBLIC_LAUNCH_CONTACT.primaryEmail,
          )}</p>
        </div>
      </div>
    </div>
  `;

  return sendArchitectureReviewEmail({
    to: PUBLIC_LAUNCH_CONTACT.primaryEmail,
    subject,
    text,
    html,
  });
}
