import nodemailer from "nodemailer";

import { isPasswordResetEmailConfigured } from "@/lib/auth-config";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createPasswordResetHtml(url: string) {
  const safeUrl = escapeHtml(url);

  return `
    <div style="background:#f3f6fb;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d7e2ef;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0b1f3a,#145c79);padding:24px 24px 22px;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d8e8ff;">ZoKorp Platform</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;">Reset your password</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Use the link below to set a new password.</p>
          <a href="${safeUrl}" style="display:inline-block;padding:11px 18px;background:#0f1f3f;border-radius:8px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Reset password</a>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">This link expires in 30 minutes. If you did not request this, ignore this email.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendPasswordResetEmail(input: { to: string; resetUrl: string }) {
  if (!isPasswordResetEmailConfigured()) {
    return { ok: false, error: "PASSWORD_RESET_EMAIL_NOT_CONFIGURED" } as const;
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT ?? "587"),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const result = await transport.sendMail({
      to: input.to,
      from: process.env.EMAIL_FROM,
      subject: "Reset your ZoKorp password",
      text: `Reset your password using this link:\n${input.resetUrl}\n\nThis link expires in 30 minutes.`,
      html: createPasswordResetHtml(input.resetUrl),
    });

    const failed = [...(result.rejected ?? []), ...(result.pending ?? [])].filter(Boolean);
    if (failed.length > 0) {
      return { ok: false, error: `PASSWORD_RESET_DELIVERY_FAILED:${failed.join(",")}` } as const;
    }

    return { ok: true } as const;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "PASSWORD_RESET_DELIVERY_UNKNOWN",
    } as const;
  }
}
