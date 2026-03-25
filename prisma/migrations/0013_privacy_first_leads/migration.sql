-- CreateTable
CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "companyName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadEvent" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT,
  "source" TEXT NOT NULL,
  "deliveryState" TEXT NOT NULL DEFAULT 'unknown',
  "crmSyncState" TEXT NOT NULL DEFAULT 'unknown',
  "saveForFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "allowCrmFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "scoreBand" TEXT,
  "estimateBand" TEXT,
  "recommendedEngagement" TEXT,
  "sourceRecordKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedToolSubmission" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT,
  "toolName" TEXT NOT NULL,
  "payloadCiphertext" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ArchivedToolSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionFingerprint" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "userId" TEXT,
  "toolName" TEXT NOT NULL,
  "fingerprintHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SubmissionFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");

-- CreateIndex
CREATE INDEX "Lead_lastSeenAt_idx" ON "Lead"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeadEvent_sourceRecordKey_key" ON "LeadEvent"("sourceRecordKey");

-- CreateIndex
CREATE INDEX "LeadEvent_leadId_createdAt_idx" ON "LeadEvent"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadEvent_userId_idx" ON "LeadEvent"("userId");

-- CreateIndex
CREATE INDEX "LeadEvent_source_createdAt_idx" ON "LeadEvent"("source", "createdAt");

-- CreateIndex
CREATE INDEX "ArchivedToolSubmission_leadId_idx" ON "ArchivedToolSubmission"("leadId");

-- CreateIndex
CREATE INDEX "ArchivedToolSubmission_expiresAt_idx" ON "ArchivedToolSubmission"("expiresAt");

-- CreateIndex
CREATE INDEX "ArchivedToolSubmission_toolName_createdAt_idx" ON "ArchivedToolSubmission"("toolName", "createdAt");

-- CreateIndex
CREATE INDEX "SubmissionFingerprint_leadId_idx" ON "SubmissionFingerprint"("leadId");

-- CreateIndex
CREATE INDEX "SubmissionFingerprint_userId_idx" ON "SubmissionFingerprint"("userId");

-- CreateIndex
CREATE INDEX "SubmissionFingerprint_toolName_fingerprintHash_expiresAt_idx" ON "SubmissionFingerprint"("toolName", "fingerprintHash", "expiresAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedToolSubmission" ADD CONSTRAINT "ArchivedToolSubmission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedToolSubmission" ADD CONSTRAINT "ArchivedToolSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFingerprint" ADD CONSTRAINT "SubmissionFingerprint_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFingerprint" ADD CONSTRAINT "SubmissionFingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Keep new public-schema tables closed by default behind server-side Prisma.
ALTER TABLE "public"."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LeadEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ArchivedToolSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SubmissionFingerprint" ENABLE ROW LEVEL SECURITY;

-- AlterTable
ALTER TABLE "LeadLog"
ADD COLUMN "saveForFollowUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "allowCrmFollowUp" BOOLEAN NOT NULL DEFAULT false;
