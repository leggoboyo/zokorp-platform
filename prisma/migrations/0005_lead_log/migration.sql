-- CreateTable
CREATE TABLE "LeadLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userEmail" TEXT NOT NULL,
  "architectureProvider" TEXT NOT NULL,
  "authProvider" TEXT,
  "overallScore" INTEGER NOT NULL,
  "topIssues" TEXT NOT NULL,
  "syncedToZohoAt" TIMESTAMP(3),
  "zohoRecordId" TEXT,
  "zohoSyncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadLog_createdAt_idx" ON "LeadLog"("createdAt");

-- CreateIndex
CREATE INDEX "LeadLog_userEmail_idx" ON "LeadLog"("userEmail");

-- CreateIndex
CREATE INDEX "LeadLog_syncedToZohoAt_idx" ON "LeadLog"("syncedToZohoAt");

-- AddForeignKey
ALTER TABLE "LeadLog" ADD CONSTRAINT "LeadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
