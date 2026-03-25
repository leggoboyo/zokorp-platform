CREATE TYPE "ArchitectureRuleCatalogPricingMode" AS ENUM ('DERIVED', 'OVERRIDE');
CREATE TYPE "ArchitectureRuleCatalogReviewStatus" AS ENUM ('UNREVIEWED', 'DRAFT', 'PUBLISHED', 'STALE');

CREATE TABLE "ArchitectureRuleCatalog" (
  "id" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "isPresentInCode" BOOLEAN NOT NULL DEFAULT true,
  "codeSnapshotJson" JSONB NOT NULL,
  "reviewStatus" "ArchitectureRuleCatalogReviewStatus" NOT NULL DEFAULT 'UNREVIEWED',
  "publishedVersion" INTEGER,
  "publishedRevisionId" TEXT,
  "serviceLineLabel" TEXT,
  "publicFixSummary" TEXT,
  "internalResearchNotes" TEXT,
  "pricingMode" "ArchitectureRuleCatalogPricingMode" NOT NULL DEFAULT 'DERIVED',
  "overrideMinPriceUsd" INTEGER,
  "overrideMaxPriceUsd" INTEGER,
  "nextReviewAt" TIMESTAMP(3),
  "lastReviewedAt" TIMESTAMP(3),
  "lastReviewedByEmail" TEXT,
  "publishedAt" TIMESTAMP(3),
  "lastCodeSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ArchitectureRuleCatalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArchitectureRuleCatalogRevision" (
  "id" TEXT NOT NULL,
  "catalogId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "ArchitectureRuleCatalogReviewStatus" NOT NULL,
  "serviceLineLabel" TEXT NOT NULL,
  "publicFixSummary" TEXT NOT NULL,
  "internalResearchNotes" TEXT,
  "pricingMode" "ArchitectureRuleCatalogPricingMode" NOT NULL DEFAULT 'DERIVED',
  "overrideMinPriceUsd" INTEGER,
  "overrideMaxPriceUsd" INTEGER,
  "nextReviewAt" TIMESTAMP(3),
  "changeSummary" TEXT,
  "changedByEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "effectiveAt" TIMESTAMP(3),
  "snapshotJson" JSONB NOT NULL,

  CONSTRAINT "ArchitectureRuleCatalogRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArchitectureRuleCatalog_ruleId_key" ON "ArchitectureRuleCatalog"("ruleId");
CREATE UNIQUE INDEX "ArchitectureRuleCatalog_publishedRevisionId_key" ON "ArchitectureRuleCatalog"("publishedRevisionId");
CREATE INDEX "ArchitectureRuleCatalog_reviewStatus_updatedAt_idx" ON "ArchitectureRuleCatalog"("reviewStatus", "updatedAt");
CREATE INDEX "ArchitectureRuleCatalog_isPresentInCode_idx" ON "ArchitectureRuleCatalog"("isPresentInCode");
CREATE INDEX "ArchitectureRuleCatalog_category_idx" ON "ArchitectureRuleCatalog"("category");

CREATE UNIQUE INDEX "ArchitectureRuleCatalogRevision_catalogId_version_key" ON "ArchitectureRuleCatalogRevision"("catalogId", "version");
CREATE INDEX "ArchitectureRuleCatalogRevision_catalogId_createdAt_idx" ON "ArchitectureRuleCatalogRevision"("catalogId", "createdAt");
CREATE INDEX "ArchitectureRuleCatalogRevision_status_createdAt_idx" ON "ArchitectureRuleCatalogRevision"("status", "createdAt");

ALTER TABLE "ArchitectureRuleCatalogRevision"
ADD CONSTRAINT "ArchitectureRuleCatalogRevision_catalogId_fkey"
FOREIGN KEY ("catalogId") REFERENCES "ArchitectureRuleCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArchitectureRuleCatalog"
ADD CONSTRAINT "ArchitectureRuleCatalog_publishedRevisionId_fkey"
FOREIGN KEY ("publishedRevisionId") REFERENCES "ArchitectureRuleCatalogRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
