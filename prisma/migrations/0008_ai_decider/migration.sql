CREATE TABLE "AiDeciderSubmission" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "website" TEXT,
  "narrativeInput" TEXT NOT NULL,
  "signalsJson" JSONB NOT NULL,
  "answersJson" JSONB NOT NULL,
  "scoresJson" JSONB NOT NULL,
  "recommendation" TEXT NOT NULL,
  "findingsJson" JSONB NOT NULL,
  "blockersJson" JSONB NOT NULL,
  "quoteJson" JSONB NOT NULL,
  "verdictHeadline" TEXT NOT NULL,
  "verdictLine" TEXT NOT NULL,
  "summaryParagraph" TEXT NOT NULL,
  "crmSyncStatus" TEXT,
  "emailDeliveryStatus" TEXT,
  "zohoRecordId" TEXT,
  "zohoSyncError" TEXT,
  "source" TEXT NOT NULL DEFAULT 'ai-decider',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AiDeciderSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiDeciderSubmission_createdAt_idx" ON "AiDeciderSubmission"("createdAt");
CREATE INDEX "AiDeciderSubmission_email_idx" ON "AiDeciderSubmission"("email");
CREATE INDEX "AiDeciderSubmission_crmSyncStatus_idx" ON "AiDeciderSubmission"("crmSyncStatus");

ALTER TABLE "AiDeciderSubmission"
ADD CONSTRAINT "AiDeciderSubmission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
