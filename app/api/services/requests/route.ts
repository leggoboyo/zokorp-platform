import { ServiceRequestType } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSchemaDriftError, isTransientDatabaseConnectionError } from "@/lib/db-errors";
import { jsonNoStore } from "@/lib/internal-route";
import { recordOperationalIssue } from "@/lib/operational-issues";
import { upsertLead } from "@/lib/privacy-leads";
import { requireSameOrigin } from "@/lib/request-origin";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { BUSINESS_EMAIL_REQUIRED_MESSAGE, isBusinessEmail } from "@/lib/security";
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

    if (!isBusinessEmail(requesterEmail)) {
      return jsonNoStore(
        { error: BUSINESS_EMAIL_REQUIRED_MESSAGE },
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

    const requesterSource = signedInUser ? "account" : "public_form";
    const requesterName = signedInUser?.name ?? parsed.data.requesterName ?? null;
    const requesterCompanyName = parsed.data.requesterCompanyName ?? null;

    if (!signedInUser) {
      try {
        await upsertLead({
          email: requesterEmail,
          name: requesterName,
          companyName: requesterCompanyName,
        });
      } catch (leadError) {
        await recordOperationalIssue({
          action: "service.request_lead_upsert_failed",
          area: "service-requests",
          error: leadError,
          metadata: {
            requesterEmail,
            trackingCode: created.trackingCode,
          },
        });
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
            requesterSource,
            zohoSyncQueued: true,
          },
        },
      });
    } catch (auditError) {
      await recordOperationalIssue({
        action: "service.request_audit_log_failed",
        area: "service-requests",
        error: auditError,
        metadata: {
          requesterEmail,
          trackingCode: created.trackingCode,
        },
      });
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

    if (isTransientDatabaseConnectionError(error)) {
      return jsonNoStore(
        { error: "Service request intake is temporarily busy. Please retry shortly." },
        { status: 503 },
      );
    }

    await recordOperationalIssue({
      action: "service.request_submission_failed",
      area: "service-requests",
      error,
    });
    return jsonNoStore({ error: "Unable to submit service request." }, { status: 500 });
  }
}
