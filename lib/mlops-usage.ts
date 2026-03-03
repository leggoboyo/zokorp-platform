import { MlopsUsageKind } from "@prisma/client";
import crypto from "node:crypto";

import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";

export async function recordMlopsUsage(input: {
  organizationId: string;
  projectId: string;
  jobId?: string;
  createdByUserId?: string;
  kind?: MlopsUsageKind;
  quantity?: number;
}) {
  const usage = await db.mlopsUsageLedger.create({
    data: {
      organizationId: input.organizationId,
      projectId: input.projectId,
      jobId: input.jobId,
      createdByUserId: input.createdByUserId,
      kind: input.kind ?? MlopsUsageKind.JOB_UNITS,
      quantity: input.quantity ?? 1,
    },
  });

  try {
    const env = getEnv();

    if (usage.kind !== MlopsUsageKind.JOB_UNITS || !env.STRIPE_METER_EVENT_NAME_JOB_UNITS) {
      return usage;
    }

    const organization = await db.organization.findUnique({
      where: {
        id: input.organizationId,
      },
      select: {
        stripeCustomerId: true,
        usageMeteringEnabled: true,
      },
    });

    if (!organization?.stripeCustomerId || !organization.usageMeteringEnabled) {
      return usage;
    }

    const meterEvent = await getStripeClient().billing.meterEvents.create({
      event_name: env.STRIPE_METER_EVENT_NAME_JOB_UNITS,
      identifier: crypto.randomUUID(),
      payload: {
        stripe_customer_id: organization.stripeCustomerId,
        value: String(input.quantity ?? 1),
      },
    });

    await db.mlopsUsageLedger.update({
      where: {
        id: usage.id,
      },
      data: {
        stripeMeterEventId: meterEvent.identifier,
      },
    });
  } catch (error) {
    console.error("Failed to forward usage event to Stripe meter", error);
  }

  return usage;
}
