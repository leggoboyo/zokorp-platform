import { Prisma, ServiceRequestStatus, ServiceRequestType } from "@prisma/client";

import { db } from "@/lib/db";
import { recordLeadInteraction, upsertLead } from "@/lib/privacy-leads";
import { isBusinessEmail } from "@/lib/security";
import { createServiceRequest } from "@/lib/service-requests";

async function ensureServiceRequestForBookedCall(input: {
  interactionId: string;
  userId: string;
  requesterEmail: string;
  requesterName?: string | null;
  bookedAtIso: string | null;
  estimateReferenceCode: string | null;
  provider: string;
}) {
  const request = await createServiceRequest({
    userId: input.userId,
    requesterEmail: input.requesterEmail,
    requesterName: input.requesterName ?? null,
    requesterSource: "account",
    type: ServiceRequestType.CONSULTATION,
    title: "Architecture Review Follow-up",
    summary: [
      "Calendly booking confirmed for architecture review follow-up.",
      input.bookedAtIso ? `Booked time: ${input.bookedAtIso}` : null,
      input.estimateReferenceCode ? `Estimate reference: ${input.estimateReferenceCode}` : null,
      `Provider: ${input.provider}`,
    ]
      .filter(Boolean)
      .join(" "),
  });

  await db.serviceRequest.update({
    where: { id: request.id },
    data: {
      status: ServiceRequestStatus.SCHEDULED,
    },
  });

  await db.leadInteraction.update({
    where: { id: input.interactionId },
    data: {
      serviceRequestId: request.id,
    },
  });

  return request;
}

export async function ingestArchitectureBookedCall(input: {
  email: string;
  name?: string | null;
  externalEventId: string;
  bookedAtIso?: string | null;
  estimateReferenceCode?: string | null;
  provider?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  const provider = input.provider?.trim() || "calendly";
  const bookedAtIso = input.bookedAtIso?.trim() || null;
  const estimateReferenceCode = input.estimateReferenceCode?.trim() || null;

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!isBusinessEmail(email)) {
    await upsertLead({
      email,
      name: input.name ?? user?.name ?? null,
    });

    await db.auditLog.create({
      data: {
        userId: user?.id ?? null,
        action: "integration.calendly_non_business_email_flagged",
        metadataJson: {
          email,
          source: "architecture-review",
          provider,
          externalEventId: input.externalEventId,
          bookedAtIso,
          estimateReferenceCode,
          matchedAccount: Boolean(user?.id),
        },
      },
    });

    return {
      status: "flagged" as const,
      serviceRequestId: null,
      reason: "business_email_required" as const,
    };
  }

  const lead = await upsertLead({
    userId: user?.id ?? null,
    email,
    name: input.name ?? user?.name ?? null,
  });

  let interaction = await db.leadInteraction.findUnique({
    where: {
      externalEventId: input.externalEventId,
    },
    select: {
      id: true,
      serviceRequestId: true,
    },
  });

  if (!interaction) {
    try {
      const created = await recordLeadInteraction({
        leadId: lead.id,
        userId: user?.id ?? null,
        source: "architecture-review",
        action: "call_booked",
        provider,
        externalEventId: input.externalEventId,
        estimateReferenceCode,
      });
      interaction = {
        id: created.id,
        serviceRequestId: created.serviceRequestId,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        interaction = await db.leadInteraction.findUnique({
          where: {
            externalEventId: input.externalEventId,
          },
          select: {
            id: true,
            serviceRequestId: true,
          },
        });
      } else {
        throw error;
      }
    }
  }

  let serviceRequestId = interaction?.serviceRequestId ?? null;
  if (user?.id && interaction && !serviceRequestId) {
    const serviceRequest = await ensureServiceRequestForBookedCall({
      interactionId: interaction.id,
      userId: user.id,
      requesterEmail: email,
      requesterName: user.name ?? input.name ?? null,
      bookedAtIso,
      estimateReferenceCode,
      provider,
    });
    serviceRequestId = serviceRequest.id;
  }

  await db.auditLog.create({
    data: {
      userId: user?.id ?? null,
      action: "integration.calendly_call_booked",
      metadataJson: {
        email,
        source: "architecture-review",
        provider,
        externalEventId: input.externalEventId,
        bookedAtIso,
        estimateReferenceCode,
        createdServiceRequest: Boolean(serviceRequestId),
      },
    },
  });

  return {
    status: "ok" as const,
    serviceRequestId,
  };
}
