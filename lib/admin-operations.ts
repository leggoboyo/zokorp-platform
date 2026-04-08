import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import { resolveServiceRequestOwnerLabel } from "@/lib/service-requests";

const FOLLOW_UP_ATTENTION_WINDOW_MS = 48 * 60 * 60 * 1000;

const AUTOMATION_HEALTH_CONFIGS = [
  {
    key: "architecture-worker",
    title: "Architecture queue worker",
    cadenceLabel: "Expected every 5 minutes",
    staleAfterMs: 20 * 60 * 1000,
    successActions: ["internal.architecture_review_worker.run"],
    warningActions: ["internal.architecture_review_worker.schema_unavailable"],
    failureActions: [
      "internal.architecture_review_worker.failed",
      "internal.architecture_review_worker.not_configured",
      "internal.cron_architecture_review_worker.not_configured",
    ],
    href: "/admin/readiness",
  },
  {
    key: "architecture-followups",
    title: "Architecture follow-ups",
    cadenceLabel: "Expected daily",
    staleAfterMs: 36 * 60 * 60 * 1000,
    successActions: ["internal.architecture_review_followups.run"],
    warningActions: [
      "internal.architecture_review_followups.secret_fallback",
      "internal.architecture_review_followups.schema_unavailable",
    ],
    failureActions: [
      "internal.architecture_review_followups.failed",
      "internal.architecture_review_followups.not_configured",
    ],
    href: "/admin/readiness",
  },
  {
    key: "retention-sweep",
    title: "Retention sweep",
    cadenceLabel: "Expected daily",
    staleAfterMs: 36 * 60 * 60 * 1000,
    successActions: ["internal.retention_sweep.completed"],
    warningActions: [],
    failureActions: ["internal.retention_sweep.failed", "internal.retention_sweep.not_configured"],
    href: "/admin/readiness",
  },
  {
    key: "zoho-lead-sync",
    title: "Zoho lead sync",
    cadenceLabel: "Expected weekly or on demand",
    staleAfterMs: 10 * 24 * 60 * 60 * 1000,
    successActions: ["internal.zoho_sync_leads.run"],
    warningActions: [
      "internal.zoho_sync_leads.timeout",
      "internal.zoho_sync_leads.request_failed",
      "internal.zoho_sync_leads.upstream_failed",
      "internal.zoho_sync_leads.schema_unavailable",
      "internal.zoho_sync_leads.not_ready",
    ],
    failureActions: ["internal.zoho_sync_leads.failed", "internal.cron_zoho_sync_leads.not_configured", "internal.zoho_sync_leads.not_configured"],
    href: "/admin/readiness",
  },
  {
    key: "estimate-companion-sync",
    title: "Estimate companion sync",
    cadenceLabel: "Expected hourly",
    staleAfterMs: 3 * 60 * 60 * 1000,
    successActions: ["internal.zoho_sync_estimate_companions.run"],
    warningActions: [],
    failureActions: [
      "internal.zoho_sync_estimate_companions.failed",
      "internal.cron_zoho_sync_estimate_companions.not_configured",
    ],
    href: "/admin/billing",
  },
] as const;

const AUTOMATION_HEALTH_ACTIONS = [
  ...new Set(
    AUTOMATION_HEALTH_CONFIGS.flatMap((item) => [
      ...item.successActions,
      ...item.warningActions,
      ...item.failureActions,
    ]),
  ),
];

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
    automationAttention: number;
  };
  architectureEmailIssues: OperationsIssue[];
  crmSyncIssues: OperationsIssue[];
  estimateCompanionIssues: OperationsIssue[];
  bookedCallSignals: OperationsIssue[];
  automationHealthSignals: OperationsIssue[];
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

function actionMatches(actions: readonly string[], action: string) {
  return actions.includes(action);
}

function formatRelativeAge(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute(s) ago`;
  }

  const diffHours = Math.max(1, Math.round(diffMinutes / 60));
  if (diffHours < 48) {
    return `${diffHours} hour(s) ago`;
  }

  const diffDays = Math.max(1, Math.round(diffHours / 24));
  return `${diffDays} day(s) ago`;
}

export async function getAdminOperationsSnapshot(): Promise<AdminOperationsSnapshot> {
  const staleThreshold = new Date(Date.now() - FOLLOW_UP_ATTENTION_WINDOW_MS);

  const [emailOutboxes, crmLeads, estimateCompanions, toolRuns, legacyToolRunLogs, bookedCalls, flaggedBookedCallLogs, automationHealthLogs, staleServiceRequests] = await Promise.all([
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
    (async () => {
      try {
        return await db.toolRun.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: 25,
        });
      } catch (error) {
        if (isSchemaDriftError(error)) {
          return [];
        }

        throw error;
      }
    })(),
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
    db.auditLog.findMany({
      where: {
        action: {
          in: [
            "integration.calendly_non_business_email_flagged",
            "internal.calendly_booked_call.not_configured",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
    db.auditLog.findMany({
      where: {
        action: {
          in: AUTOMATION_HEALTH_ACTIONS,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
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

  const hasPersistedToolRuns = toolRuns.length > 0;
  const automationHealthSignals = AUTOMATION_HEALTH_CONFIGS.map((automation) => {
    const latest = automationHealthLogs.find((item) =>
      actionMatches(automation.successActions, item.action) ||
      actionMatches(automation.warningActions, item.action) ||
      actionMatches(automation.failureActions, item.action),
    );

    if (!latest) {
      return {
        id: `${automation.key}:missing`,
        createdAt: new Date(0),
        title: automation.title,
        statusLabel: "no recent signal",
        statusTone: "warning" as const,
        summary: automation.cadenceLabel,
        details: [
          "No recent automation audit record was found for this job in the current environment.",
        ],
        href: automation.href,
      } satisfies OperationsIssue;
    }

    const metadata = asRecord(latest.metadataJson);
    const isFailure = actionMatches(automation.failureActions, latest.action);
    const isWarning = actionMatches(automation.warningActions, latest.action);
    const isStale = !isFailure && !isWarning && Date.now() - latest.createdAt.getTime() > automation.staleAfterMs;

    return {
      id: `${automation.key}:${latest.id}`,
      createdAt: latest.createdAt,
      title: automation.title,
      statusLabel: isFailure ? "failed" : isWarning ? "warning" : isStale ? "stale" : "healthy",
      statusTone: isFailure ? "danger" : isWarning || isStale ? "warning" : "success",
      summary: `${automation.cadenceLabel} · Last signal ${formatRelativeAge(latest.createdAt)}`,
      details: [
        `Latest action ${latest.action}`,
        readString(metadata, "error"),
        readNumber(metadata, "processed") !== null ? `Processed ${readNumber(metadata, "processed")}` : null,
        readNumber(metadata, "scanned") !== null ? `Scanned ${readNumber(metadata, "scanned")}` : null,
        readNumber(metadata, "updated") !== null ? `Updated ${readNumber(metadata, "updated")}` : null,
        readNumber(metadata, "failed") !== null ? `Failed ${readNumber(metadata, "failed")}` : null,
      ].filter((value): value is string => Boolean(value)),
      href: automation.href,
    } satisfies OperationsIssue;
  }).sort((left, right) => {
    const tonePriority = { danger: 0, warning: 1, info: 2, secondary: 3, success: 4 } as const;
    const byTone = tonePriority[left.statusTone] - tonePriority[right.statusTone];
    if (byTone !== 0) {
      return byTone;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  const flaggedBookedCallSignals = flaggedBookedCallLogs.map((item) => {
    const metadata = asRecord(item.metadataJson);

    if (item.action === "internal.calendly_booked_call.not_configured") {
      return {
        id: item.id,
        createdAt: item.createdAt,
        title: "Booked-call ingest not configured",
        statusLabel: "not configured",
        statusTone: "danger" as const,
        summary: "Internal booked-call ingest route rejected a sync attempt because the shared secret is missing.",
        details: [
          "Set CALENDLY_SYNC_SECRET and confirm the internal ingest route is reachable from the scheduled sync job.",
        ],
        href: "/admin/readiness",
      } satisfies OperationsIssue;
    }

    return {
      id: item.id,
      createdAt: item.createdAt,
      title: "Booked follow-up flagged",
      statusLabel: "business email required",
      statusTone: "warning" as const,
      summary: `${readString(metadata, "email") ?? "unknown email"} · ${readString(metadata, "provider") ?? "provider unknown"}`,
      details: [
        readString(metadata, "externalEventId"),
        readString(metadata, "estimateReferenceCode")
          ? `Estimate ${readString(metadata, "estimateReferenceCode")}`
          : null,
        metadata?.matchedAccount === true ? "Matched an existing account and still flagged for review" : null,
      ].filter((value): value is string => Boolean(value)),
      href: "/admin/leads",
    } satisfies OperationsIssue;
  });
  const toolRunSignals = hasPersistedToolRuns
    ? toolRuns.map((item) => {
        if (item.toolSlug === "zokorp-validator") {
          return {
            id: item.id,
            createdAt: item.createdAt,
            title: `Validator run · ${item.profile ?? "FTR"}`,
            statusLabel: item.deliveryStatus ?? (item.score !== null ? `${item.score}%` : "completed"),
            statusTone:
              item.deliveryStatus === "failed"
                ? "danger"
                : item.score !== null && item.score < 60
                  ? "warning"
                  : item.estimateAmountUsd !== null
                    ? "info"
                    : "secondary",
            summary: [
              item.targetLabel ?? "Checklist target",
              item.score !== null ? `Score ${item.score}%` : null,
              item.estimateAmountUsd !== null ? `Quote $${item.estimateAmountUsd}` : null,
            ]
              .filter(Boolean)
              .join(" · "),
            details: [
              item.estimateSla ? `SLA ${item.estimateSla}` : null,
              item.estimateReferenceCode ? `Estimate ${item.estimateReferenceCode}` : null,
              item.inputFileName,
            ].filter((value): value is string => Boolean(value)),
            href: "/software/zokorp-validator",
          } satisfies OperationsIssue;
        }

        return {
          id: item.id,
          createdAt: item.createdAt,
          title: "Forecasting beta run",
          statusLabel:
            item.confidenceScore !== null && item.confidenceScore !== undefined
              ? `${item.confidenceScore}%`
              : item.status.toLowerCase(),
          statusTone:
            (item.confidenceScore ?? 0) >= 75
              ? "success"
              : (item.confidenceScore ?? 0) >= 50
                ? "info"
                : "warning",
          summary: [
            item.sourceName ?? item.summary,
            item.sourceType ? item.sourceType.toUpperCase() : null,
            item.confidenceLabel ? `${item.confidenceLabel} confidence` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          details: [item.inputFileName, item.deliveryStatus ? `Email ${item.deliveryStatus}` : null].filter(
            (value): value is string => Boolean(value),
          ),
          href: "/software/mlops-foundation-platform",
        } satisfies OperationsIssue;
      })
    : legacyToolRunLogs.map((item) => {
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
      });

  return {
    stats: {
      pendingArchitectureEmail: emailOutboxes.filter((item) => item.status === "pending").length,
      failedArchitectureEmail: emailOutboxes.filter((item) => item.status === "failed").length,
      crmNeedsAttention: crmLeads.length,
      failedQuoteCompanions: estimateCompanions.length,
      recentValidatorRuns: toolRunSignals.filter((item) => item.href === "/software/zokorp-validator").length,
      recentMlopsRuns: toolRunSignals.filter((item) => item.href === "/software/mlops-foundation-platform").length,
      recentBookedCalls: bookedCalls.length + flaggedBookedCallSignals.length,
      followUpAttention: staleServiceRequests.length + staleEstimatesWithoutFollowUp.length,
      automationAttention: automationHealthSignals.filter((item) => item.statusTone === "danger" || item.statusTone === "warning").length,
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
    bookedCallSignals: [
      ...bookedCalls.map((item) => ({
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
      } satisfies OperationsIssue)),
      ...flaggedBookedCallSignals,
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    automationHealthSignals,
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
        summary: `${item.trackingCode} · ${resolveServiceRequestOwnerLabel(item)} · ${item.status}`,
        details: [
          item.title,
          item.latestNote ? `Latest note: ${item.latestNote}` : "No recent customer-visible note",
        ],
        href: "/admin/service-requests",
      })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    toolRunSignals,
  };
}
