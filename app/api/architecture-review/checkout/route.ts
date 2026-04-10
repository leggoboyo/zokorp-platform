import { NextResponse } from "next/server";

import { createArchitectureRemediationCheckoutSession } from "@/lib/architecture-review/checkout";
import { requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import { methodNotAllowedJson } from "@/lib/internal-route";
import { getSiteOriginFromRequest } from "@/lib/site-origin";
import { StripeCustomerBindingError } from "@/lib/stripe-customer";

export const runtime = "nodejs";

export function POST() {
  return methodNotAllowedJson();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = getSiteOriginFromRequest(request);
  const jobId = requestUrl.searchParams.get("jobId")?.trim();
  const estimateReferenceCode = requestUrl.searchParams.get("estimateReferenceCode")?.trim();

  if (!jobId || !estimateReferenceCode) {
    return NextResponse.redirect(new URL("/software/architecture-diagram-reviewer?checkout=error", requestOrigin));
  }

  try {
    const access = await requireVerifiedFreeToolAccess({
      toolName: "Architecture Diagram Reviewer",
    });
    const result = await createArchitectureRemediationCheckoutSession({
      userId: access.user.id,
      requestOrigin,
      jobId,
      estimateReferenceCode,
    });

    return NextResponse.redirect(result.session.url ?? new URL("/software/architecture-diagram-reviewer?checkout=error", requestOrigin));
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message.includes("verified business email"))
    ) {
      const loginUrl = new URL("/login", requestOrigin);
      loginUrl.searchParams.set(
        "callbackUrl",
        `${requestUrl.pathname}${requestUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }

    if (error instanceof StripeCustomerBindingError) {
      const fallbackUrl = new URL("/software/architecture-diagram-reviewer?checkout=error", requestOrigin);
      fallbackUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(fallbackUrl);
    }

    console.error("Failed to redirect architecture remediation checkout", error);
    return NextResponse.redirect(new URL("/software/architecture-diagram-reviewer?checkout=error", requestOrigin));
  }
}
