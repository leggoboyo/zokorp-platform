import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { buildEmlDocument } from "@/lib/architecture-review/email";
import { verifyEmlToken } from "@/lib/architecture-review/eml-token";

export const runtime = "nodejs";

function emlSecret() {
  return process.env.ARCH_REVIEW_EML_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user.email) {
      return NextResponse.json({ error: "Account email is required." }, { status: 400 });
    }

    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const secret = emlSecret();
    if (!secret) {
      return NextResponse.json({ error: "EML token secret is not configured." }, { status: 500 });
    }

    const payload = verifyEmlToken(token, secret);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    if (payload.to.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Token email mismatch." }, { status: 403 });
    }

    const emlContent = buildEmlDocument({
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
    });

    return new Response(emlContent, {
      status: 200,
      headers: {
        "Content-Type": "message/rfc822; charset=utf-8",
        "Content-Disposition": 'attachment; filename="architecture-review.eml"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json({ error: "Unable to generate EML draft." }, { status: 500 });
  }
}
