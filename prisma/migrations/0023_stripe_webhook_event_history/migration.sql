CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "processingStatus" TEXT NOT NULL,
  "livemode" BOOLEAN NOT NULL DEFAULT false,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripeCheckoutSessionId" TEXT,
  "stripeInvoiceId" TEXT,
  "stripeChargeId" TEXT,
  "stripeDisputeId" TEXT,
  "metadataJson" JSONB,
  "errorMessage" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");
CREATE INDEX "StripeWebhookEvent_receivedAt_idx" ON "StripeWebhookEvent"("receivedAt");
CREATE INDEX "StripeWebhookEvent_processingStatus_receivedAt_idx" ON "StripeWebhookEvent"("processingStatus", "receivedAt");
CREATE INDEX "StripeWebhookEvent_eventType_receivedAt_idx" ON "StripeWebhookEvent"("eventType", "receivedAt");
