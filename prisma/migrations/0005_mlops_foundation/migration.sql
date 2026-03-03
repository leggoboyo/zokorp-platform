-- CreateEnum
CREATE TYPE "public"."OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."WorkspacePersona" AS ENUM ('C_SUITE', 'TECH_LEAD', 'DATA_SCIENTIST');

-- CreateEnum
CREATE TYPE "public"."OnboardingMode" AS ENUM ('SELF_SERVE', 'SALES_ASSISTED');

-- CreateEnum
CREATE TYPE "public"."MlopsBillingPlan" AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."MlopsJobType" AS ENUM ('TRAIN', 'BATCH_SCORE', 'INFERENCE_SMOKE_TEST', 'MONITORING_CHECK');

-- CreateEnum
CREATE TYPE "public"."MlopsJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."MlopsRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."MlopsModelStage" AS ENUM ('DEV', 'STAGING', 'PROD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MlopsDeploymentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'FAILED', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."RunnerKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."MlopsUsageKind" AS ENUM ('JOB_UNITS', 'INFERENCE_UNITS', 'STORAGE_GB_HOURS');

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "onboardingMode" "public"."OnboardingMode" NOT NULL DEFAULT 'SELF_SERVE',
    "workspacePersona" "public"."WorkspacePersona" NOT NULL DEFAULT 'TECH_LEAD',
    "billingPlan" "public"."MlopsBillingPlan" NOT NULL DEFAULT 'STARTER',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "usageMeteringEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "workspacePersona" "public"."WorkspacePersona" NOT NULL DEFAULT 'TECH_LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsProject" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlopsProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."MlopsJobType" NOT NULL,
    "status" "public"."MlopsJobStatus" NOT NULL DEFAULT 'QUEUED',
    "containerImage" TEXT NOT NULL,
    "commandJson" JSONB,
    "envJson" JSONB,
    "inputsJson" JSONB,
    "outputsJson" JSONB,
    "errorMessage" TEXT,
    "claimedByRunnerName" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlopsJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsJobLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlopsJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsRun" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "jobId" TEXT,
    "name" TEXT NOT NULL,
    "status" "public"."MlopsRunStatus" NOT NULL DEFAULT 'QUEUED',
    "parametersJson" JSONB,
    "metricsJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlopsRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsArtifact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "jobId" TEXT,
    "runId" TEXT,
    "storagePath" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "checksumSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlopsArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsModel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlopsModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsModelVersion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "artifactId" TEXT,
    "version" TEXT NOT NULL,
    "stage" "public"."MlopsModelStage" NOT NULL DEFAULT 'DEV',
    "metricsJson" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotedAt" TIMESTAMP(3),

    CONSTRAINT "MlopsModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsDeployment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "modelVersionId" TEXT,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" "public"."MlopsDeploymentStatus" NOT NULL DEFAULT 'DRAFT',
    "endpointUrl" TEXT,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlopsDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsMonitoringEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deploymentId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "dimensionJson" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlopsMonitoringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsDriftSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deploymentId" TEXT,
    "featureName" TEXT NOT NULL,
    "baselineJson" JSONB NOT NULL,
    "currentJson" JSONB NOT NULL,
    "driftScore" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlopsDriftSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsRunnerKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "status" "public"."RunnerKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "MlopsRunnerKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MlopsUsageLedger" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "jobId" TEXT,
    "createdByUserId" TEXT,
    "kind" "public"."MlopsUsageKind" NOT NULL DEFAULT 'JOB_UNITS',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "stripeMeterEventId" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlopsUsageLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "public"."Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_createdByUserId_idx" ON "public"."Organization"("createdByUserId");

-- CreateIndex
CREATE INDEX "Organization_createdAt_idx" ON "public"."Organization"("createdAt");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "public"."OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_role_idx" ON "public"."OrganizationMember"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "public"."OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "MlopsProject_organizationId_createdAt_idx" ON "public"."MlopsProject"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsProject_createdByUserId_idx" ON "public"."MlopsProject"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsProject_organizationId_slug_key" ON "public"."MlopsProject"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "MlopsJob_organizationId_status_queuedAt_idx" ON "public"."MlopsJob"("organizationId", "status", "queuedAt");

-- CreateIndex
CREATE INDEX "MlopsJob_projectId_createdAt_idx" ON "public"."MlopsJob"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsJob_createdByUserId_idx" ON "public"."MlopsJob"("createdByUserId");

-- CreateIndex
CREATE INDEX "MlopsJobLog_organizationId_createdAt_idx" ON "public"."MlopsJobLog"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsJobLog_jobId_sequence_key" ON "public"."MlopsJobLog"("jobId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsRun_jobId_key" ON "public"."MlopsRun"("jobId");

-- CreateIndex
CREATE INDEX "MlopsRun_organizationId_status_createdAt_idx" ON "public"."MlopsRun"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsRun_projectId_createdAt_idx" ON "public"."MlopsRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsRun_createdByUserId_idx" ON "public"."MlopsRun"("createdByUserId");

-- CreateIndex
CREATE INDEX "MlopsArtifact_organizationId_createdAt_idx" ON "public"."MlopsArtifact"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsArtifact_projectId_idx" ON "public"."MlopsArtifact"("projectId");

-- CreateIndex
CREATE INDEX "MlopsArtifact_jobId_idx" ON "public"."MlopsArtifact"("jobId");

-- CreateIndex
CREATE INDEX "MlopsArtifact_runId_idx" ON "public"."MlopsArtifact"("runId");

-- CreateIndex
CREATE INDEX "MlopsModel_organizationId_createdAt_idx" ON "public"."MlopsModel"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsModel_createdByUserId_idx" ON "public"."MlopsModel"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsModel_organizationId_projectId_slug_key" ON "public"."MlopsModel"("organizationId", "projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsModelVersion_artifactId_key" ON "public"."MlopsModelVersion"("artifactId");

-- CreateIndex
CREATE INDEX "MlopsModelVersion_organizationId_stage_createdAt_idx" ON "public"."MlopsModelVersion"("organizationId", "stage", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsModelVersion_createdByUserId_idx" ON "public"."MlopsModelVersion"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsModelVersion_modelId_version_key" ON "public"."MlopsModelVersion"("modelId", "version");

-- CreateIndex
CREATE INDEX "MlopsDeployment_organizationId_status_createdAt_idx" ON "public"."MlopsDeployment"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MlopsDeployment_createdByUserId_idx" ON "public"."MlopsDeployment"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsDeployment_organizationId_projectId_name_key" ON "public"."MlopsDeployment"("organizationId", "projectId", "name");

-- CreateIndex
CREATE INDEX "MlopsMonitoringEvent_organizationId_recordedAt_idx" ON "public"."MlopsMonitoringEvent"("organizationId", "recordedAt");

-- CreateIndex
CREATE INDEX "MlopsMonitoringEvent_deploymentId_recordedAt_idx" ON "public"."MlopsMonitoringEvent"("deploymentId", "recordedAt");

-- CreateIndex
CREATE INDEX "MlopsDriftSnapshot_organizationId_recordedAt_idx" ON "public"."MlopsDriftSnapshot"("organizationId", "recordedAt");

-- CreateIndex
CREATE INDEX "MlopsDriftSnapshot_deploymentId_recordedAt_idx" ON "public"."MlopsDriftSnapshot"("deploymentId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MlopsRunnerKey_keyPrefix_key" ON "public"."MlopsRunnerKey"("keyPrefix");

-- CreateIndex
CREATE INDEX "MlopsRunnerKey_organizationId_status_idx" ON "public"."MlopsRunnerKey"("organizationId", "status");

-- CreateIndex
CREATE INDEX "MlopsRunnerKey_createdByUserId_idx" ON "public"."MlopsRunnerKey"("createdByUserId");

-- CreateIndex
CREATE INDEX "MlopsUsageLedger_organizationId_recordedAt_idx" ON "public"."MlopsUsageLedger"("organizationId", "recordedAt");

-- CreateIndex
CREATE INDEX "MlopsUsageLedger_projectId_kind_recordedAt_idx" ON "public"."MlopsUsageLedger"("projectId", "kind", "recordedAt");

-- CreateIndex
CREATE INDEX "MlopsUsageLedger_jobId_idx" ON "public"."MlopsUsageLedger"("jobId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "public"."AuditLog"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsProject" ADD CONSTRAINT "MlopsProject_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsProject" ADD CONSTRAINT "MlopsProject_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsJob" ADD CONSTRAINT "MlopsJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsJob" ADD CONSTRAINT "MlopsJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsJob" ADD CONSTRAINT "MlopsJob_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsJobLog" ADD CONSTRAINT "MlopsJobLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsJobLog" ADD CONSTRAINT "MlopsJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."MlopsJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRun" ADD CONSTRAINT "MlopsRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRun" ADD CONSTRAINT "MlopsRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRun" ADD CONSTRAINT "MlopsRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRun" ADD CONSTRAINT "MlopsRun_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."MlopsJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsArtifact" ADD CONSTRAINT "MlopsArtifact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsArtifact" ADD CONSTRAINT "MlopsArtifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsArtifact" ADD CONSTRAINT "MlopsArtifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."MlopsJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsArtifact" ADD CONSTRAINT "MlopsArtifact_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."MlopsRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModel" ADD CONSTRAINT "MlopsModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModel" ADD CONSTRAINT "MlopsModel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModel" ADD CONSTRAINT "MlopsModel_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModelVersion" ADD CONSTRAINT "MlopsModelVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModelVersion" ADD CONSTRAINT "MlopsModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."MlopsModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModelVersion" ADD CONSTRAINT "MlopsModelVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsModelVersion" ADD CONSTRAINT "MlopsModelVersion_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "public"."MlopsArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDeployment" ADD CONSTRAINT "MlopsDeployment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDeployment" ADD CONSTRAINT "MlopsDeployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDeployment" ADD CONSTRAINT "MlopsDeployment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDeployment" ADD CONSTRAINT "MlopsDeployment_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "public"."MlopsModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsMonitoringEvent" ADD CONSTRAINT "MlopsMonitoringEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsMonitoringEvent" ADD CONSTRAINT "MlopsMonitoringEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsMonitoringEvent" ADD CONSTRAINT "MlopsMonitoringEvent_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "public"."MlopsDeployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDriftSnapshot" ADD CONSTRAINT "MlopsDriftSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDriftSnapshot" ADD CONSTRAINT "MlopsDriftSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsDriftSnapshot" ADD CONSTRAINT "MlopsDriftSnapshot_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "public"."MlopsDeployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRunnerKey" ADD CONSTRAINT "MlopsRunnerKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsRunnerKey" ADD CONSTRAINT "MlopsRunnerKey_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsUsageLedger" ADD CONSTRAINT "MlopsUsageLedger_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsUsageLedger" ADD CONSTRAINT "MlopsUsageLedger_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."MlopsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsUsageLedger" ADD CONSTRAINT "MlopsUsageLedger_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."MlopsJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MlopsUsageLedger" ADD CONSTRAINT "MlopsUsageLedger_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

