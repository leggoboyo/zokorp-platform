import { db } from "@/lib/db";
import { runEstimateCompanionSync } from "@/lib/estimate-companion-sync";
import { sendToolResultEmail } from "@/lib/architecture-review/sender";
import { runZohoServiceRequestSync } from "@/lib/zoho-service-request-sync";
import { runZohoLeadSync } from "@/lib/zoho-sync-leads";

export async function retryArchitectureReviewEmailOutbox(input: { outboxId: string }) {
  const outbox = await db.architectureReviewEmailOutbox.findUnique({
    where: {
      id: input.outboxId,
    },
    select: {
      id: true,
      leadLogId: true,
      status: true,
      toEmail: true,
      subject: true,
      textBody: true,
      htmlBody: true,
      job: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!outbox) {
    throw new Error("Architecture review email outbox entry not found");
  }

  if (outbox.status === "sent") {
    return {
      status: "already_sent" as const,
      outboxId: outbox.id,
    };
  }

  const sentAt = new Date();
  const sendResult = await sendToolResultEmail({
    to: outbox.toEmail,
    subject: outbox.subject,
    text: outbox.textBody,
    html: outbox.htmlBody ?? undefined,
  });

  const nextStatus = sendResult.ok ? "sent" : "failed";

  await db.architectureReviewEmailOutbox.update({
    where: { id: outbox.id },
    data: {
      status: nextStatus,
      attemptCount: {
        increment: 1,
      },
      provider: sendResult.provider,
      errorMessage: sendResult.ok ? null : sendResult.error ?? "EMAIL_RETRY_FAILED",
      sentAt: sendResult.ok ? sentAt : null,
    },
  });

  if (sendResult.ok && outbox.leadLogId) {
    await db.leadLog.update({
      where: { id: outbox.leadLogId },
      data: {
        emailSentAt: sentAt,
      },
    });
  }

  await db.auditLog.create({
    data: {
      userId: outbox.job.userId,
      action: "admin.architecture_review_email_retry",
      metadataJson: {
        outboxId: outbox.id,
        previousStatus: outbox.status,
        nextStatus,
        provider: sendResult.provider,
        error: sendResult.error ?? null,
      },
    },
  });

  return {
    status: nextStatus as "sent" | "failed",
    outboxId: outbox.id,
    provider: sendResult.provider,
    error: sendResult.error ?? null,
  };
}

export async function triggerZohoLeadSyncNow() {
  return runZohoLeadSync();
}

export async function triggerEstimateCompanionSyncNow() {
  return runEstimateCompanionSync();
}

export async function triggerServiceRequestZohoSyncNow() {
  return runZohoServiceRequestSync();
}
