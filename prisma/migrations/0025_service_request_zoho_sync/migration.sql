-- AlterTable
ALTER TABLE "ServiceRequest"
ADD COLUMN "syncedToZohoAt" TIMESTAMP(3),
ADD COLUMN "zohoRecordId" TEXT,
ADD COLUMN "zohoSyncNeedsUpdate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "zohoSyncError" TEXT;

-- CreateIndex
CREATE INDEX "ServiceRequest_zohoSyncNeedsUpdate_updatedAt_idx"
ON "ServiceRequest"("zohoSyncNeedsUpdate", "updatedAt");
