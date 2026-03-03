-- CreateEnum
CREATE TYPE "ServiceRequestType" AS ENUM ('CONSULTATION', 'DELIVERY', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM (
  'SUBMITTED',
  'TRIAGED',
  'PROPOSAL_SENT',
  'SCHEDULED',
  'IN_PROGRESS',
  'BLOCKED',
  'DELIVERED',
  'CLOSED'
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "trackingCode" TEXT NOT NULL,
  "type" "ServiceRequestType" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "preferredStart" TIMESTAMP(3),
  "budgetRange" TEXT,
  "status" "ServiceRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
  "latestNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_trackingCode_key" ON "ServiceRequest"("trackingCode");

-- CreateIndex
CREATE INDEX "ServiceRequest_userId_status_idx" ON "ServiceRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdAt_idx" ON "ServiceRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
