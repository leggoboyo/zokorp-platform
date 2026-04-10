import { Prisma, ToolRunStatus } from "@prisma/client";

import { db } from "@/lib/db";

type ToolRunCreateDelegate = {
  create: (args: { data: Prisma.ToolRunUncheckedCreateInput }) => Promise<{ id: string }>;
  update?: (args: { where: { id: string }; data: Prisma.ToolRunUncheckedUpdateInput }) => Promise<{ id: string }>;
};

function toolRunDelegate() {
  return (db as unknown as { toolRun?: ToolRunCreateDelegate }).toolRun;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function recordValidatorToolRun(input: {
  userId: string;
  summary: string;
  fileName: string;
  mimeType: string;
  profile: string;
  targetId?: string | null;
  targetLabel?: string | null;
  score: number;
  deliveryStatus: string;
  estimateAmountUsd: number;
  estimateSla: string;
  estimateReferenceCode: string;
  remainingUses: number;
  report: unknown;
  metadata?: Record<string, unknown> | null;
  failed?: boolean;
}) {
  const delegate = toolRunDelegate();
  if (!delegate?.create) {
    return null;
  }

  return delegate.create({
    data: {
      userId: input.userId,
      toolSlug: "zokorp-validator",
      toolLabel: "ZoKorpValidator",
      status: input.failed ? ToolRunStatus.FAILED : ToolRunStatus.COMPLETED,
      summary: input.summary,
      inputFileName: input.fileName,
      sourceType: input.mimeType,
      profile: input.profile,
      targetId: input.targetId ?? null,
      targetLabel: input.targetLabel ?? null,
      score: input.score,
      deliveryStatus: input.deliveryStatus,
      estimateAmountUsd: input.estimateAmountUsd,
      estimateSla: input.estimateSla,
      estimateReferenceCode: input.estimateReferenceCode,
      remainingUses: input.remainingUses,
      reportJson: toJsonValue(input.report),
      metadataJson: toJsonValue(input.metadata ?? null),
    },
  });
}

export async function recordArchitectureReviewToolRun(input: {
  toolRunId?: string | null;
  userId: string;
  summary: string;
  inputFileName?: string | null;
  sourceType?: string | null;
  sourceName?: string | null;
  score?: number | null;
  confidenceLabel?: string | null;
  deliveryStatus?: string | null;
  estimateAmountUsd?: number | null;
  estimateSla?: string | null;
  estimateReferenceCode?: string | null;
  report?: unknown;
  metadata?: Record<string, unknown> | null;
  failed?: boolean;
}) {
  const delegate = toolRunDelegate();
  if (!delegate?.create) {
    return null;
  }

  const data: Prisma.ToolRunUncheckedCreateInput = {
    userId: input.userId,
    toolSlug: "architecture-diagram-reviewer",
    toolLabel: "Architecture Diagram Reviewer",
    status: input.failed ? ToolRunStatus.FAILED : ToolRunStatus.COMPLETED,
    summary: input.summary,
    inputFileName: input.inputFileName ?? null,
    sourceType: input.sourceType ?? null,
    sourceName: input.sourceName ?? null,
    score: input.score ?? null,
    confidenceLabel: input.confidenceLabel ?? null,
    deliveryStatus: input.deliveryStatus ?? null,
    estimateAmountUsd: input.estimateAmountUsd ?? null,
    estimateSla: input.estimateSla ?? null,
    estimateReferenceCode: input.estimateReferenceCode ?? null,
    reportJson: toJsonValue(input.report ?? null),
    metadataJson: toJsonValue(input.metadata ?? null),
  };

  if (input.toolRunId && delegate.update) {
    return delegate.update({
      where: { id: input.toolRunId },
      data,
    });
  }

  return delegate.create({ data });
}

export async function recordMlopsForecastToolRun(input: {
  userId: string;
  summary: string;
  inputFileName?: string | null;
  sourceType: string;
  sourceName: string;
  confidenceScore: number;
  confidenceLabel: string;
  report: unknown;
  metadata?: Record<string, unknown> | null;
  failed?: boolean;
}) {
  const delegate = toolRunDelegate();
  if (!delegate?.create) {
    return null;
  }

  return delegate.create({
    data: {
      userId: input.userId,
      toolSlug: "mlops-foundation-platform",
      toolLabel: "ZoKorp Forecasting Beta",
      status: input.failed ? ToolRunStatus.FAILED : ToolRunStatus.COMPLETED,
      summary: input.summary,
      inputFileName: input.inputFileName ?? null,
      sourceType: input.sourceType,
      sourceName: input.sourceName,
      confidenceScore: input.confidenceScore,
      confidenceLabel: input.confidenceLabel,
      deliveryStatus: "onscreen-only",
      reportJson: toJsonValue(input.report),
      metadataJson: toJsonValue(input.metadata ?? null),
    },
  });
}
