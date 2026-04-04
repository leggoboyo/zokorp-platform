-- CreateEnum
CREATE TYPE "ToolRunStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditLedgerReason" AS ENUM (
  'PURCHASE',
  'CONSUMPTION',
  'MANUAL_ADJUSTMENT',
  'REFUND',
  'REVERSAL'
);

-- AlterTable
ALTER TABLE "ServiceRequest"
ADD COLUMN "requesterEmail" TEXT,
ADD COLUMN "requesterName" TEXT,
ADD COLUMN "requesterCompanyName" TEXT,
ADD COLUMN "requesterSource" TEXT NOT NULL DEFAULT 'public_form';

UPDATE "ServiceRequest" AS sr
SET
  "requesterEmail" = COALESCE(u."email", 'unknown@local.invalid'),
  "requesterName" = COALESCE(u."name", sr."requesterName"),
  "requesterSource" = CASE WHEN sr."userId" IS NOT NULL THEN 'account' ELSE 'public_form' END
FROM "User" AS u
WHERE sr."userId" = u."id";

UPDATE "ServiceRequest"
SET "requesterEmail" = 'unknown@local.invalid'
WHERE "requesterEmail" IS NULL;

ALTER TABLE "ServiceRequest"
ALTER COLUMN "requesterEmail" SET NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_userId_fkey";

ALTER TABLE "ServiceRequest"
ADD CONSTRAINT "ServiceRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ServiceRequest_requesterEmail_status_idx" ON "ServiceRequest"("requesterEmail", "status");

-- CreateTable
CREATE TABLE "ToolRun" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "toolSlug" TEXT NOT NULL,
  "toolLabel" TEXT NOT NULL,
  "status" "ToolRunStatus" NOT NULL DEFAULT 'COMPLETED',
  "summary" TEXT NOT NULL,
  "inputFileName" TEXT,
  "sourceType" TEXT,
  "sourceName" TEXT,
  "profile" TEXT,
  "targetId" TEXT,
  "targetLabel" TEXT,
  "score" INTEGER,
  "confidenceScore" INTEGER,
  "confidenceLabel" TEXT,
  "deliveryStatus" TEXT,
  "estimateAmountUsd" INTEGER,
  "estimateSla" TEXT,
  "estimateReferenceCode" TEXT,
  "remainingUses" INTEGER,
  "reportJson" JSONB,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ToolRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ToolRun_userId_createdAt_idx" ON "ToolRun"("userId", "createdAt");
CREATE INDEX "ToolRun_toolSlug_createdAt_idx" ON "ToolRun"("toolSlug", "createdAt");
CREATE INDEX "ToolRun_status_createdAt_idx" ON "ToolRun"("status", "createdAt");

ALTER TABLE "ToolRun"
ADD CONSTRAINT "ToolRun_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CreditLedgerEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "tier" "CreditTier" NOT NULL,
  "delta" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "reason" "CreditLedgerReason" NOT NULL,
  "source" TEXT NOT NULL,
  "sourceRecordKey" TEXT,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditLedgerEntry_userId_createdAt_idx" ON "CreditLedgerEntry"("userId", "createdAt");
CREATE INDEX "CreditLedgerEntry_productId_createdAt_idx" ON "CreditLedgerEntry"("productId", "createdAt");
CREATE INDEX "CreditLedgerEntry_source_createdAt_idx" ON "CreditLedgerEntry"("source", "createdAt");
CREATE INDEX "CreditLedgerEntry_sourceRecordKey_idx" ON "CreditLedgerEntry"("sourceRecordKey");

ALTER TABLE "CreditLedgerEntry"
ADD CONSTRAINT "CreditLedgerEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreditLedgerEntry"
ADD CONSTRAINT "CreditLedgerEntry_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."ToolRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CreditLedgerEntry" ENABLE ROW LEVEL SECURITY;
