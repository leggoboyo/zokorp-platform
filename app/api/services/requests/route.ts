import { ServiceRequestType } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import { jsonNoStore } from "@/lib/internal-route";
import { upsertLead } from "@/lib/privacy-leads";
import { requireSameOrigin } from "@/lib/request-origin";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { createServiceRequest } from "@/lib/service-requests";

const requestSchema = z.object({
  type: z.nativeEnum(ServiceRequestType),
  title: z.string().trim().min(8).max(120),
  summary: z.string().trim().min(30).max(2400),
  preferredStart: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  budgetRange: z.string().trim().max(80).optional(),
  requesterEmail: z.string().trim().email().optional(),
  requesterName: z.string().trim().max(120).optional(),
  requesterCompanyName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse) {
      return crossSiteResponse;
    }

    const session = await auth();
    const signedInUser = session?.user?.email
      ? await db.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            email: true,
            name: true,
          },
        })
      : null;

    const limiter = await consumeRateLimit({
      key: `service-request:${signedInUser?.id ?? "public"}:${getRequestFingerprint(request)}`,
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return jsonNoStore(
        { error: "Too many submissions. Please wait a few minutes and retry." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonNoStore({ error: "Invalid service request input." }, { status: 400 });
    }

    const requesterEmail = signedInUser?.email ?? parsed.data.requesterEmail?.trim().toLowerCase();
    if (!requesterEmail) {
      return jsonNoStore(
        { error: "Email is required when submitting without an account." },
        { status: 400 },
      );
    }

    const created = await createServiceRequest({
      userId: signedInUser?.id ?? null,
      requesterEmail,
      requesterName: signedInUser?.name ?? parsed.data.requesterName ?? null,
      requesterCompanyName: parsed.data.requesterCompanyName ?? null,
      requesterSource: signedInUser ? "account" : "public_form",
      type: parsed.data.type,
      title: parsed.data.title,
      summary: parsed.data.summary,
      preferredStart: parsed.data.preferredStart
        ? new Date(`${parsed.data.preferredStart}T00:00:00.000Z`)
        : undefined,
      budgetRange: parsed.data.budgetRange ?? undefined,
    });

    if (!signedInUser) {
      try {
        await upsertLead({
          email: requesterEmail,
          name: parsed.data.requesterName ?? null,
          companyName: parsed.data.requesterCompanyName ?? null,
        });
      } catch (leadError) {
        console.error("Failed to upsert public service-request lead", leadError);
      }
    }

    try {
      await db.auditLog.create({
        data: {
          userId: signedInUser?.id ?? null,
          action: "service.request_submitted",
          metadataJson: {
            trackingCode: created.trackingCode,
            type: created.type,
            title: created.title,
            requesterEmail,
            requesterSource: signedInUser ? "account" : "public_form",
          },
        },
      });
    } catch (auditError) {
      console.error("Failed to record service request audit log", auditError);
    }

    return jsonNoStore({
      id: created.id,
      trackingCode: created.trackingCode,
      status: created.status,
      linkedToAccount: Boolean(signedInUser),
    });
  } catch (error) {
    if (isSchemaDriftError(error)) {
      return jsonNoStore(
        { error: "Service request tracking is being enabled. Please retry shortly." },
        { status: 503 },
      );
    }

    console.error(error);
    return jsonNoStore({ error: "Unable to submit service request." }, { status: 500 });
  }
}
