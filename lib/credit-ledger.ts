import { CreditLedgerReason, Prisma, type CreditTier } from "@prisma/client";

import { db } from "@/lib/db";

type CreditLedgerCreateDelegate = {
  create: (args: { data: Prisma.CreditLedgerEntryUncheckedCreateInput }) => Promise<{ id: string }>;
};

function creditLedgerDelegate(client: unknown) {
  return (client as { creditLedgerEntry?: CreditLedgerCreateDelegate }).creditLedgerEntry;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function recordCreditLedgerEntry(input: {
  client?: unknown;
  userId: string;
  productId: string;
  tier: CreditTier;
  delta: number;
  balanceAfter: number;
  reason: CreditLedgerReason;
  source: string;
  sourceRecordKey?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const delegate = creditLedgerDelegate(input.client ?? db);
  if (!delegate?.create) {
    return null;
  }

  return delegate.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      tier: input.tier,
      delta: input.delta,
      balanceAfter: input.balanceAfter,
      reason: input.reason,
      source: input.source,
      sourceRecordKey: input.sourceRecordKey ?? null,
      metadataJson: toJsonValue(input.metadata ?? null),
    },
  });
}
