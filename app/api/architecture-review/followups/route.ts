import { buildArchitectureFollowUpEmail, dueFollowUpCheckpoint } from "@/lib/architecture-review/followup";
import { sendArchitectureReviewEmail } from "@/lib/architecture-review/sender";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import {
  createInternalAuditLog,
  jsonNoStore,
  methodNotAllowedJson,
  safeSecretEqual,
} from "@/lib/internal-route";

export const runtime = "nodejs";

function providedSecret(request: Request) {
  return (
    request.headers.get("x-arch-followup-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  );
}

export async function POST(request: Request) {
  const configuredSecret = process.env.ARCH_REVIEW_FOLLOWUP_SECRET ?? process.env.ZOHO_SYNC_SECRET ?? "";
  const receivedSecret = providedSecret(request);
  const usingZohoFallbackSecret =
    !process.env.ARCH_REVIEW_FOLLOWUP_SECRET && Boolean(process.env.ZOHO_SYNC_SECRET);

  if (!configuredSecret) {
    await createInternalAuditLog("internal.architecture_review_followups.not_configured");
    return jsonNoStore(
      { error: "Architecture review follow-up secret is not configured." },
      { status: 503 },
    );
  }

  if (!receivedSecret || !safeSecretEqual(configuredSecret, receivedSecret)) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  }

  if (usingZohoFallbackSecret) {
    await createInternalAuditLog("internal.architecture_review_followups.secret_fallback", {
      fallbackSecret: "ZOHO_SYNC_SECRET",
    });
  }

  try {
    const candidates = await db.leadLog.findMany({
      where: {
        architectureProvider: {
          in: ["aws", "azure", "gcp"],
        },
        emailSentAt: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 150,
      select: {
        id: true,
        userEmail: true,
        architectureProvider: true,
        overallScore: true,
        topIssues: true,
        createdAt: true,
        leadStage: true,
        followUpStatusJson: true,
      },
    });

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const lead of candidates) {
      const dueDay = dueFollowUpCheckpoint({
        createdAt: lead.createdAt,
        leadStage: lead.leadStage,
        followUpStatusJson: lead.followUpStatusJson,
      });

      if (!dueDay) {
        skipped += 1;
        continue;
      }

      const email = await buildArchitectureFollowUpEmail({
        leadId: lead.id,
        userEmail: lead.userEmail,
        provider: lead.architectureProvider,
        overallScore: lead.overallScore,
        topIssues: lead.topIssues,
        day: dueDay,
      });

      const sendResult = await sendArchitectureReviewEmail({
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      if (!sendResult.ok) {
        failed += 1;
        await db.leadLog.update({
          where: { id: lead.id },
          data: {
            followUpStatusJson: {
              ...(typeof lead.followUpStatusJson === "object" && lead.followUpStatusJson && !Array.isArray(lead.followUpStatusJson)
                ? lead.followUpStatusJson
                : {}),
              [email.statusKey]: `failed:${new Date().toISOString()}`,
            },
          },
        });
        continue;
      }

      sent += 1;
      await db.leadLog.update({
        where: { id: lead.id },
        data: {
          followUpStatusJson: {
            ...(typeof lead.followUpStatusJson === "object" && lead.followUpStatusJson && !Array.isArray(lead.followUpStatusJson)
              ? lead.followUpStatusJson
              : {}),
            [email.statusKey]: `sent:${new Date().toISOString()}`,
          },
        },
      });
    }

    await createInternalAuditLog("internal.architecture_review_followups.run", {
      sent,
      skipped,
      failed,
      usedZohoSyncSecretFallback: usingZohoFallbackSecret,
    });

    return jsonNoStore({
      status: "ok",
      sent,
      skipped,
      failed,
    });
  } catch (error) {
    if (isSchemaDriftError(error)) {
      await createInternalAuditLog("internal.architecture_review_followups.schema_unavailable", {
        usedZohoSyncSecretFallback: usingZohoFallbackSecret,
      });
      return jsonNoStore(
        {
          error: "Architecture follow-up run is unavailable.",
        },
        { status: 503 },
      );
    }

    console.error("architecture follow-up run failed", error);
    await createInternalAuditLog("internal.architecture_review_followups.failed", {
      errorName: error instanceof Error ? error.name : "unknown_error",
      usedZohoSyncSecretFallback: usingZohoFallbackSecret,
    });

    return jsonNoStore(
      {
        error: "Architecture follow-up run failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request) {
  void _request;
  return methodNotAllowedJson("POST");
}
