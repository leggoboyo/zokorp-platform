import { z } from "zod";

import { createArchitectureRemediationCheckoutSession } from "@/lib/architecture-review/checkout";
import { requireVerifiedFreeToolAccess } from "@/lib/free-tool-access";
import { jsonNoStore, methodNotAllowedJson } from "@/lib/internal-route";
import { requireSameOrigin } from "@/lib/request-origin";
import { getSiteOriginFromRequest } from "@/lib/site-origin";
import { StripeCustomerBindingError } from "@/lib/stripe-customer";

const schema = z.object({
  jobId: z.string().cuid(),
  estimateReferenceCode: z.string().trim().min(1).max(40),
});

export const runtime = "nodejs";

export function GET() {
  return methodNotAllowedJson();
}

export async function POST(request: Request) {
  try {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse) {
      return crossSiteResponse;
    }

    const access = await requireVerifiedFreeToolAccess({
      toolName: "Architecture Diagram Reviewer",
    });
    const payload = schema.parse(await request.json());
    const result = await createArchitectureRemediationCheckoutSession({
      userId: access.user.id,
      requestOrigin: getSiteOriginFromRequest(request),
      jobId: payload.jobId,
      estimateReferenceCode: payload.estimateReferenceCode,
    });

    return jsonNoStore({ url: result.session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonNoStore({ error: "Invalid request body." }, { status: 400 });
    }

    if (error instanceof StripeCustomerBindingError) {
      return jsonNoStore({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "STRIPE_NOT_CONFIGURED") {
        return jsonNoStore({ error: "Billing setup is still in progress. Please try again shortly." }, { status: 503 });
      }

      if (
        error.message === "CHECKOUT_JOB_NOT_FOUND" ||
        error.message === "CHECKOUT_ESTIMATE_MISMATCH" ||
        error.message === "CHECKOUT_NOT_PAYABLE" ||
        error.message === "CHECKOUT_PRODUCT_NOT_FOUND"
      ) {
        return jsonNoStore({ error: "This remediation quote is not available for checkout." }, { status: 404 });
      }
    }

    console.error("Failed to create architecture remediation checkout session", error);
    return jsonNoStore({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
