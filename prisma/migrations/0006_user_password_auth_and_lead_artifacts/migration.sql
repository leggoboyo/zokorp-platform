-- AlterTable
ALTER TABLE "LeadLog"
ADD COLUMN "userName" TEXT,
ADD COLUMN "inputParagraph" TEXT,
ADD COLUMN "reportJson" JSONB,
ADD COLUMN "workdriveDiagramFileId" TEXT,
ADD COLUMN "workdriveReportFileId" TEXT,
ADD COLUMN "workdriveUploadStatus" TEXT;

-- CreateTable
CREATE TABLE "UserAuth" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "resetTokenHash" TEXT,
  "resetTokenExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_key" ON "UserAuth"("userId");

-- CreateIndex
CREATE INDEX "UserAuth_lockedUntil_idx" ON "UserAuth"("lockedUntil");

-- CreateIndex
CREATE INDEX "UserAuth_resetTokenExpiresAt_idx" ON "UserAuth"("resetTokenExpiresAt");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
