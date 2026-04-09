import { ServiceRequestType } from "@prisma/client";

import { db } from "@/lib/db";
import { createInternalAuditLog } from "@/lib/internal-route";
import { upsertZohoLead } from "@/lib/zoho-crm";

function fallbackZohoCompanyName(input: {
  requesterCompanyName?: string | null;
  requesterEmail: string;
}) {
  const explicitCompany = input.requesterCompanyName?.trim();
  if (explicitCompany) {
    return explicitCompany;
  }

  const domain = input.requesterEmail.split("@")[1]?.trim().toLowerCase();
  if (!domain) {
    return "ZoKorp website inquiry";
  }

  return domain;
}

function buildZohoServiceRequestDescription(input: {
  trackingCode: string;
  requesterSource: string;
  type: ServiceRequestType;
  title: string;
  summary: string;
  requesterEmail: string;
  preferredStart?: Date | null;
  budgetRange?: string | null;
  linkedToAccount: boolean;
  status: string;
  latestNote?: string | null;
}) {
  return [
    `ZoKorp service request ${input.trackingCode}`,
    `Requester source: ${input.requesterSource}`,
    `Linked to account: ${input.linkedToAccount ? "yes" : "no"}`,
    `Status: ${input.status}`,
    `Type: ${input.type}`,
    `Title: ${input.title}`,
    `Email: ${input.requesterEmail}`,
    input.preferredStart ? `Preferred start: ${input.preferredStart.toISOString().slice(0, 10)}` : null,
    input.budgetRange ? `Budget range: ${input.budgetRange}` : null,
    input.latestNote?.trim() ? `Latest note: ${input.latestNote.trim()}` : null,
    `Summary: ${input.summary}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export async function runZohoServiceRequestSync() {
  const pendingRequests = await db.serviceRequest.findMany({
    where: {
      OR: [{ syncedToZohoAt: null }, { zohoSyncNeedsUpdate: true }],
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 50,
    select: {
      id: true,
      trackingCode: true,
      requesterEmail: true,
      requesterName: true,
      requesterCompanyName: true,
      requesterSource: true,
      type: true,
      title: true,
      summary: true,
      preferredStart: true,
      budgetRange: true,
      status: true,
      latestNote: true,
      userId: true,
    },
  });

  if (pendingRequests.length === 0) {
    await createInternalAuditLog("internal.zoho_sync_service_requests.run", {
      attempted: 0,
      synced: 0,
      failed: 0,
    });

    return {
      status: "ok" as const,
      attempted: 0,
      synced: 0,
      failed: 0,
    };
  }

  let synced = 0;
  let failed = 0;
  const now = new Date();

  try {
    for (const request of pendingRequests) {
      const zohoResult = await upsertZohoLead({
        email: request.requesterEmail,
        fullName: request.requesterName?.trim() || request.requesterEmail,
        companyName: fallbackZohoCompanyName({
          requesterCompanyName: request.requesterCompanyName,
          requesterEmail: request.requesterEmail,
        }),
        leadSource: "ZoKorp Service Request",
        description: buildZohoServiceRequestDescription({
          trackingCode: request.trackingCode,
          requesterSource: request.requesterSource,
          type: request.type,
          title: request.title,
          summary: request.summary,
          requesterEmail: request.requesterEmail,
          preferredStart: request.preferredStart,
          budgetRange: request.budgetRange,
          linkedToAccount: Boolean(request.userId),
          status: request.status,
          latestNote: request.latestNote,
        }),
      });

      if (zohoResult.status === "not_configured") {
        await createInternalAuditLog("internal.zoho_sync_service_requests.not_ready");
        return {
          status: "not_configured" as const,
          error: "Zoho CRM sync is not configured.",
        };
      }

      if (zohoResult.status === "success" || zohoResult.status === "duplicate") {
        synced += 1;
        await db.serviceRequest.update({
          where: { id: request.id },
          data: {
            syncedToZohoAt: now,
            zohoRecordId: zohoResult.recordId ?? null,
            zohoSyncError:
              zohoResult.status === "duplicate"
                ? zohoResult.error ?? "DUPLICATE"
                : null,
            zohoSyncNeedsUpdate: false,
          },
        });
        continue;
      }

      failed += 1;
      await db.serviceRequest.update({
        where: { id: request.id },
        data: {
          zohoSyncError: zohoResult.error,
          zohoSyncNeedsUpdate: true,
        },
      });
    }

    await createInternalAuditLog("internal.zoho_sync_service_requests.run", {
      attempted: pendingRequests.length,
      synced,
      failed,
    });

    return {
      status: "ok" as const,
      attempted: pendingRequests.length,
      synced,
      failed,
    };
  } catch (error) {
    console.error("zoho service request sync failed", error);
    await createInternalAuditLog("internal.zoho_sync_service_requests.failed", {
      errorName: error instanceof Error ? error.name : "unknown_error",
    });
    return {
      status: "failed" as const,
      error: "Zoho service request sync failed.",
    };
  }
}
