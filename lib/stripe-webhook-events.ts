import Stripe from "stripe";

import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";

export type StripeWebhookProcessingStatus = "received" | "processed" | "ignored" | "failed";

type StripeWebhookEventUpsertDelegate = {
  upsert: (args: {
    where: { stripeEventId: string };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
};

function stripeWebhookEventDelegate(client: unknown) {
  return (client as { stripeWebhookEvent?: StripeWebhookEventUpsertDelegate }).stripeWebhookEvent;
}

function extractStripeIdentifiers(event: Stripe.Event) {
  const data = event.data.object as unknown as Record<string, unknown> | null;

  const customer =
    typeof data?.customer === "string"
      ? data.customer
      : typeof data?.customer === "object" && data.customer && typeof (data.customer as { id?: unknown }).id === "string"
        ? ((data.customer as { id: string }).id)
        : null;

  const subscription =
    typeof data?.subscription === "string"
      ? data.subscription
      : typeof data?.id === "string" && event.type.startsWith("customer.subscription.")
        ? data.id
        : null;

  const invoiceId = typeof data?.id === "string" && event.type.startsWith("invoice.") ? data.id : null;
  const checkoutSessionId =
    typeof data?.id === "string" && event.type.startsWith("checkout.session.") ? data.id : null;
  const chargeId =
    typeof data?.id === "string" && event.type.startsWith("charge.") ? data.id : null;
  const disputeId =
    typeof data?.id === "string" && event.type.startsWith("charge.dispute.") ? data.id : null;

  return {
    stripeCustomerId: customer,
    stripeSubscriptionId: subscription,
    stripeInvoiceId: invoiceId,
    stripeCheckoutSessionId: checkoutSessionId,
    stripeChargeId: chargeId,
    stripeDisputeId: disputeId,
  };
}

export async function recordStripeWebhookEvent(input: {
  event: Stripe.Event;
  processingStatus: StripeWebhookProcessingStatus;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const identifiers = extractStripeIdentifiers(input.event);
  const processedAt =
    input.processingStatus === "received" ? null : new Date();
  const delegate = stripeWebhookEventDelegate(db);

  if (!delegate?.upsert) {
    return;
  }

  try {
    await delegate.upsert({
      where: {
        stripeEventId: input.event.id,
      },
      create: {
        stripeEventId: input.event.id,
        eventType: input.event.type,
        processingStatus: input.processingStatus,
        livemode: input.event.livemode,
        ...identifiers,
        errorMessage: input.errorMessage ?? null,
        processedAt,
        metadataJson: JSON.parse(JSON.stringify({
          ...(input.metadata ?? {}),
        })),
      },
      update: {
        eventType: input.event.type,
        processingStatus: input.processingStatus,
        livemode: input.event.livemode,
        ...identifiers,
        errorMessage: input.errorMessage ?? null,
        processedAt,
        metadataJson: JSON.parse(JSON.stringify({
          ...(input.metadata ?? {}),
        })),
      },
    });
  } catch (error) {
    if (isSchemaDriftError(error)) {
      console.error("Stripe webhook event history schema is not ready", error);
      return;
    }

    throw error;
  }
}
