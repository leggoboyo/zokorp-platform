import { Role, type User } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

import { db } from "@/lib/db";
import { parseAdminEmails } from "@/lib/security";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createSignInEmailHtml(url: string, host: string) {
  const safeUrl = escapeHtml(url);
  const safeHost = escapeHtml(host);

  return `
    <div style="background:#f3f6fb;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d7e2ef;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0b1f3a,#145c79);padding:24px 24px 22px;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d8e8ff;">ZoKorp Platform</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;">Sign in securely</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">
            Use the button below to sign in to <strong>${safeHost}</strong>.
          </p>
          <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">
            This magic-link is one-time use and expires automatically for security.
          </p>
          <a href="${safeUrl}" style="display:inline-block;padding:11px 18px;background:#0f1f3f;border-radius:8px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Sign in to ZoKorp</a>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
            If you did not request this email, you can safely ignore it.
          </p>
        </div>
      </div>
    </div>
  `;
}

async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { server: unknown; from?: string };
}) {
  const { host } = new URL(url);
  const transport = nodemailer.createTransport(provider.server as nodemailer.TransportOptions);

  const result = await transport.sendMail({
    to: identifier,
    from: provider.from ?? process.env.EMAIL_FROM,
    subject: `Sign in to ${host}`,
    text: `Sign in to ${host}\n${url}\n\nIf you did not request this email, you can ignore it.`,
    html: createSignInEmailHtml(url, host),
  });

  const failed = [...(result.rejected ?? []), ...(result.pending ?? [])].filter(Boolean);
  if (failed.length > 0) {
    throw new Error(`Unable to send sign-in email to: ${failed.join(", ")}`);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify-request",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        session.user.id = user.id;
        session.user.role = dbUser?.role ?? Role.USER;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "auth.sign_in",
          metadataJson: { email: user.email },
        },
      });

      if (user.email) {
        const adminEmails = parseAdminEmails(process.env.ZOKORP_ADMIN_EMAILS);
        if (adminEmails.has(user.email.toLowerCase())) {
          await db.user.updateMany({
            where: {
              id: user.id,
              role: { not: Role.ADMIN },
            },
            data: { role: Role.ADMIN },
          });
        }
      }
    },
  },
};

export async function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function requireUser(): Promise<User> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();

  if (user.role === Role.ADMIN) {
    return user;
  }

  const adminEmails = parseAdminEmails(process.env.ZOKORP_ADMIN_EMAILS);
  if (user.email && adminEmails.has(user.email.toLowerCase())) {
    const promoted = await db.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });

    return promoted;
  }

  throw new Error("FORBIDDEN");
}
