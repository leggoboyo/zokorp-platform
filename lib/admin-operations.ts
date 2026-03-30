import { db } from "@/lib/db";

const FOLLOW_UP_ATTENTION_WINDOW_MS = 48 * 60 * 60 * 1000;

type OperationsIssue = {
  id: string;
  createdAt: Date;
  title: string;
  statusLabel: string;
  statusTone: "secondary" | "success" | "warning" | "danger" | "info";
  summary: string;
  details: string[];
  href?: string | null;
};

export type AdminOperationsSnapshot = {
  stats: {
    pendingArchitectureEmail: number;
    failedArchitectureEmail: number;
    crmNeedsAttention: number;
    failedQuoteCompanions: number;
    recentValidatorRuns: number;
    recentMlopsRuns: number;
    recentBookedCalls: number;
    followUpAttention: number;
  };
  architectureEmailIssues: OperationsIssue[];
  crmSyncIssues: OperationsIssue[];
  estimateCompanionIssues: OperationsIssue[];
  bookedCallSignals: OperationsIssue[];
  followUpAttentionIssues: OperationsIssue[];
  toolRunSignals: OperationsIssue[];
};

function asRecord(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function getAdminOperationsSnapshot(): Promise<AdminOperationsSnapshot> {
  const staleThreshold = new Date(Date.now() - FOLLOW_UP_ATTENTION_WINDOW_MS);

  const [emailOutboxes, crmLeads, estimateCompanions, toolRuns, bookedCalls, staleServiceRequests] = await Promise.all([
    db.architectureReviewEmailOutbox.findMany({
      where: {
        status: {
          in: ["pending", "failed"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20,
      include: {
        job: {
          select: {
            overallScore: true,
            userEmail: true,
          },
        },
      },
    }),
    db.leadLog.findMany({
      where: {
        OR: [{ zohoSyncNeedsUpdate: true }, { zohoSyncError: { not: null } }],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        userEmail: true,
        overallScore: true,
        analysisConfidence: true,
        quoteTier: true,
        zohoSyncNeedsUpdate: true,
        zohoSyncError: true,
        leadStage: true,
      },
    }),
    db.estimateCompanion.findMany({
      where: {
        status: {
          in: ["failed", "not_configured"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20,
    }),
    db.auditLog.findMany({
      where: {
        action: {
          in: ["tool.zokorp_validator_run", "tool.mlops_forecast_run"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    }),
    db.leadInteraction.findMany({
      where: {
        action: "call_booked",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      include: {
        lead: {
          select: {
            email: true,
          },
        },
        serviceRequest: {
          select: {
            trackingCode: true,
            status: true,
          },
        },
      },
    }),
    db.serviceRequest.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "TRIAGED", "PROPOSAL_SENT"],
        },
        updatedAt: {
          lt: staleThreshold,
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: 20,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
  ]);

  const staleEstimateCandidates = await db.estimateCompanion.findMany({
    where: {
      status: "created",
      updatedAt: {
        lt: staleThreshold,
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 20,
  });

  const staleEstimateReferenceCodes = staleEstimateCandidates
    .map((item) => item.referenceCode)
    .filter((value): value is string => Boolean(value));
  const bookedCallByReference = new Set(
    staleEstimateReferenceCodes.length === 0
      ? []
      : (
          await db.leadInteraction.findMany({
            where: {
              action: "call_booked",
              estimateReferenceCode: {
                in: staleEstimateReferenceCodes,
              },
            },
            select: {
              estimateReferenceCode: true,
            },
          })
        )
          .map((item) => item.estimateReferenceCode)
          .filter((value): value is string => Boolean(value)),
  );
  const staleEstimatesWithoutFollowUp = staleEstimateCandidates.filter(
    (item) => !bookedCallByReference.has(item.referenceCode),
  );

  return {
    stats: {
      pendingArchitectureEmail: emailOutboxes.filter((item) => item.status === "pending").length,
      failedArchitectureEmail: emailOutboxes.filter((item) => item.status === "failed").length,
      crmNeedsAttention: crmLeads.length,
      failedQuoteCompanions: estimateCompanions.length,
      recentValidatorRuns: toolRuns.filter((item) => item.action === "tool.zokorp_validator_run").length,
      recentMlopsRuns: toolRuns.filter((item) => item.action === "tool.mlops_forecast_run").length,
      recentBookedCalls: bookedCalls.length,
      followUpAttention: staleServiceRequests.length + staleEstimatesWithoutFollowUp.length,
    },
    architectureEmailIssues: emailOutboxes.map((item) => ({
      id: item.id,
      createdAt: item.updatedAt,
      title: "Architecture review delivery",
      statusLabel: item.status,
      statusTone: item.status === "failed" ? "danger" : "warning",
      summary: `${item.toEmail} · ${item.job.overallScore !== null ? `Score ${item.job.overallScore}/100` : "Score pending"}`,
      details: [item.provider ? `Provider ${item.provider}` : null, item.errorMessage ? item.errorMessage : null].filter(
        (value): value is string => Boolean(value),
      ),
      href: "/admin/leads?source=architecture-review&ops=needs-attention",
    })),
    crmSyncIssues: crmLeads.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      title: "CRM follow-up sync",
      statusLabel: item.zohoSyncError ? "failed" : "pending",
      statusTone: item.zohoSyncError ? "danger" : "warning",
      summary: `${item.userEmail} · Score ${item.overallScore}/100 · ${item.leadStage}`,
      details: [
        item.analysisConfidence ? `${item.analysisConfidence} confidence` : null,
        item.quoteTier ? item.quoteTier : null,
        item.zohoSyncError ? item.zohoSyncError : "Waiting for Zoho sync update.",
      ].filter((value): value is string => Boolean(value)),
      href: "/admin/leads?source=architecture-review&ops=needs-attention",
    })),
    estimateCompanionIssues: estimateCompanions.map((item) => ({
      id: item.id,
      createdAt: item.updatedAt,
      title: item.sourceLabel,
      statusLabel: item.status,
      statusTone: item.status === "failed" ? "danger" : "info",
      summary: `${item.customerEmail} · ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: item.currency.toUpperCase(),
        maximumFractionDigits: 0,
      }).format(item.amountUsd)}`,
      details: [item.referenceCode, item.externalNumber, item.provider].filter((value): value is string => Boolean(value)),
      href: "/account",
    })),
    bookedCallSignals: bookedCalls.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      title: "Booked follow-up synced",
      statusLabel: item.serviceRequest ? "linked" : "lead only",
      statusTone: item.serviceRequest ? "success" : "info",
      summary: `${item.lead.email} · ${item.provider ?? "provider unknown"} · ${item.source}`,
      details: [
        item.estimateReferenceCode ? `Estimate ${item.estimateReferenceCode}` : null,
        item.serviceRequest?.trackingCode ? `Service request ${item.serviceRequest.trackingCode}` : null,
        item.serviceRequest?.status ? `Status ${item.serviceRequest.status}` : null,
      ].filter((value): value is string => Boolean(value)),
      href: item.serviceRequest ? "/admin/service-requests" : "/admin/leads",
    })),
    followUpAttentionIssues: [
      ...staleEstimatesWithoutFollowUp.map((item) => ({
        id: item.id,
        createdAt: item.updatedAt,
        title: "Estimate awaiting follow-up",
        statusLabel: "attention",
        statusTone: "warning" as const,
        summary: `${item.customerEmail} · ${item.referenceCode}`,
        details: [
          item.sourceLabel,
          `${Math.max(1, Math.round((Date.now() - item.updatedAt.getTime()) / (24 * 60 * 60 * 1000)))} day(s) without booked follow-up`,
        ],
        href: "/admin/operations",
      })),
      ...staleServiceRequests.map((item) => ({
        id: item.id,
        createdAt: item.updatedAt,
        title: "Service request needs operator update",
        statusLabel: "attention",
        statusTone: "warning" as const,
        summary: `${item.trackingCode} · ${item.user.email ?? "unknown email"} · ${item.status}`,
        details: [
          item.title,
          item.latestNote ? `Latest note: ${item.latestNote}` : "No recent customer-visible note",
        ],
        href: "/admin/service-requests",
      })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    toolRunSignals: toolRuns.map((item) => {
      const metadata = asRecord(item.metadataJson);

      if (item.action === "tool.zokorp_validator_run") {
        const deliveryStatus = readString(metadata, "deliveryStatus");
        const quoteCompanionStatus = readString(metadata, "quoteCompanionStatus");
        const score = readNumber(metadata, "score");

        return {
          id: item.id,
          createdAt: item.createdAt,
          title: `Validator run · ${readString(metadata, "profile") ?? "FTR"}`,
          statusLabel: deliveryStatus ?? "logged",
          statusTone:
            deliveryStatus === "failed" || quoteCompanionStatus === "failed"
              ? "danger"
              : deliveryStatus === "not_configured"
                ? "info"
                : score !== null && score < 60
                  ? "warning"
                  : "secondary",
          summary: [
            readString(metadata, "targetLabel") ?? "Checklist target",
            score !== null ? `Score ${score}%` : null,
            quoteCompanionStatus ? `Quote ${quoteCompanionStatus}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          details: [
            readString(metadata, "quoteCompanionReference"),
            readString(metadata, "quoteCompanionError"),
            readString(metadata, "filename"),
          ].filter((value): value is string => Boolean(value)),
          href: "/software/zokorp-validator",
        } satisfies OperationsIssue;
      }

      return {
        id: item.id,
        createdAt: item.createdAt,
        title: "MLOps forecasting beta run",
        statusLabel: readNumber(metadata, "confidenceScore") !== null ? `${readNumber(metadata, "confidenceScore")}%` : "logged",
        statusTone:
          (readNumber(metadata, "confidenceScore") ?? 0) >= 75
            ? "success"
            : (readNumber(metadata, "confidenceScore") ?? 0) >= 50
              ? "info"
              : "warning",
        summary: [
          readString(metadata, "sourceName") ?? "Forecast input",
          readString(metadata, "sourceType")?.toUpperCase() ?? null,
          metadata?.demoRun === true ? "Demo run" : "Customer run",
        ]
          .filter(Boolean)
          .join(" · "),
        details: [readString(metadata, "cadenceLabel"), readString(metadata, "confidenceLabel")].filter(
          (value): value is string => Boolean(value),
        ),
        href: "/software/mlops-foundation-platform",
      } satisfies OperationsIssue;
    }),
  };
}
