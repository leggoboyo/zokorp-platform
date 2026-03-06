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

function createEmailShell(input: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  url: string;
  footer: string;
}) {
  return `
    <div style="background:#f3f6fb;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d7e2ef;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0b1f3a,#145c79);padding:24px 24px 22px;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d8e8ff;">${escapeHtml(input.eyebrow)}</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;">${escapeHtml(input.title)}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${escapeHtml(input.body)}</p>
          <a href="${escapeHtml(input.url)}" style="display:inline-block;padding:11px 18px;background:#0f1f3f;border-radius:8px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${escapeHtml(input.ctaLabel)}</a>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">${escapeHtml(input.footer)}</p>
        </div>
      </div>
    </div>
  `;
}

function createPasswordResetHtml(url: string) {
  return createEmailShell({
    eyebrow: "ZoKorp Platform",
    title: "Reset your password",
    body: "Use the link below to set a new password.",
    ctaLabel: "Reset password",
    url,
    footer: "This link expires in 30 minutes. If you did not request this, ignore this email.",
  });
}

function createEmailVerificationHtml(url: string) {
  return createEmailShell({
    eyebrow: "ZoKorp Platform",
    title: "Verify your business email",
    body: "Confirm your email address to activate sign-in, billing access, and account-linked tools.",
    ctaLabel: "Verify email",
    url,
    footer: "This link expires in 24 hours. If you did not create an account, ignore this email.",
  });
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? "587"),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

async function sendPlatformEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const transport = getTransport();
  const result = await transport.sendMail({
    to: input.to,
    from: process.env.EMAIL_FROM,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  const failed = [...(result.rejected ?? []), ...(result.pending ?? [])].filter(Boolean);
  if (failed.length > 0) {
    return { ok: false, error: `EMAIL_DELIVERY_FAILED:${failed.join(",")}` } as const;
  }

  return { ok: true } as const;
}

export async function sendPasswordResetEmail(input: { to: string; resetUrl: string }) {
  if (!isPasswordResetEmailConfigured()) {
    return { ok: false, error: "PASSWORD_RESET_EMAIL_NOT_CONFIGURED" } as const;
  }

  try {
    return await sendPlatformEmail({
      to: input.to,
      subject: "Reset your ZoKorp password",
      text: `Reset your password using this link:\n${input.resetUrl}\n\nThis link expires in 30 minutes.`,
      html: createPasswordResetHtml(input.resetUrl),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "PASSWORD_RESET_DELIVERY_UNKNOWN",
    } as const;
  }
}

export async function sendEmailVerificationEmail(input: { to: string; verifyUrl: string }) {
  if (!isPasswordResetEmailConfigured()) {
    return { ok: false, error: "EMAIL_VERIFICATION_NOT_CONFIGURED" } as const;
  }

  try {
    return await sendPlatformEmail({
      to: input.to,
      subject: "Verify your ZoKorp email",
      text: `Verify your ZoKorp account using this link:\n${input.verifyUrl}\n\nThis link expires in 24 hours.`,
      html: createEmailVerificationHtml(input.verifyUrl),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "EMAIL_VERIFICATION_DELIVERY_UNKNOWN",
    } as const;
  }
}
