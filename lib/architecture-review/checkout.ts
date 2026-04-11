import { loadArchitectureEstimateSnapshot } from "@/lib/architecture-review/rule-catalog";
import { architectureReviewReportSchema } from "@/lib/architecture-review/types";
import { db } from "@/lib/db";
import { ensureStripeCustomerForUser } from "@/lib/stripe-customer";
import { getStripeClient } from "@/lib/stripe";

export const ARCHITECTURE_REMEDIATION_PRODUCT_SLUG = "architecture-review-remediation";

export async function createArchitectureRemediationCheckoutSession(input: {
  userId: string;
  requestOrigin: string;
  jobId: string;
  estimateReferenceCode: string;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const [user, job, product] = await Promise.all([
    db.user.findUnique({ where: { id: input.userId } }),
    db.architectureReviewJob.findUnique({
      where: { id: input.jobId },
      select: {
        id: true,
        userId: true,
        reportJson: true,
      },
    }),
    db.product.findUnique({
      where: { slug: ARCHITECTURE_REMEDIATION_PRODUCT_SLUG },
    }),
  ]);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!job || job.userId !== input.userId || !job.reportJson) {
    throw new Error("CHECKOUT_JOB_NOT_FOUND");
  }

  if (!product || !product.active) {
    throw new Error("CHECKOUT_PRODUCT_NOT_FOUND");
  }

  const report = architectureReviewReportSchema.parse(job.reportJson);
  const { snapshot } = await loadArchitectureEstimateSnapshot(report);

  if (snapshot.referenceCode !== input.estimateReferenceCode) {
    throw new Error("CHECKOUT_ESTIMATE_MISMATCH");
  }

  if (!snapshot.policy.payableQuoteEnabled || snapshot.totalUsd <= 0 || snapshot.lineItems.length === 0) {
    throw new Error("CHECKOUT_NOT_PAYABLE");
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomerForUser(user, stripe);

  const successUrl = new URL("/software/architecture-diagram-reviewer", input.requestOrigin);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("jobId", job.id);
  successUrl.searchParams.set("estimateReferenceCode", snapshot.referenceCode);

  const cancelUrl = new URL("/software/architecture-diagram-reviewer", input.requestOrigin);
  cancelUrl.searchParams.set("checkout", "cancelled");
  cancelUrl.searchParams.set("jobId", job.id);
  cancelUrl.searchParams.set("estimateReferenceCode", snapshot.referenceCode);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: snapshot.lineItems.map((lineItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: lineItem.serviceLineLabel,
          description: `${lineItem.publicFixSummary} (${lineItem.ruleId})`,
        },
        unit_amount: lineItem.amountUsd * 100,
      },
      quantity: 1,
    })),
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    allow_promotion_codes: true,
    metadata: {
      checkoutType: "architecture-remediation",
      userId: user.id,
      productId: product.id,
      jobId: job.id,
      estimateReferenceCode: snapshot.referenceCode,
    },
  });

  try {
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "billing.architecture_checkout_session_created",
        metadataJson: {
          stripeCheckoutSessionId: session.id,
          jobId: job.id,
          estimateReferenceCode: snapshot.referenceCode,
          totalUsd: snapshot.totalUsd,
          lineItemCount: snapshot.lineItems.length,
        },
      },
    });
  } catch (error) {
    console.error("Failed to write architecture checkout audit log", error);
  }

  return {
    session,
    snapshot,
    product,
  };
}
