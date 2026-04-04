import { Prisma, ToolRunStatus } from "@prisma/client";

import { db } from "@/lib/db";

type ToolRunCreateDelegate = {
  create: (args: { data: Prisma.ToolRunUncheckedCreateInput }) => Promise<{ id: string }>;
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
      reportJson: toJsonValue(input.report),
      metadataJson: toJsonValue(input.metadata ?? null),
    },
  });
}
