ALTER TABLE "ArchitectureReviewJob"
ADD COLUMN "workdriveDiagramFileId" TEXT,
ADD COLUMN "workdriveReportFileId" TEXT,
ADD COLUMN "workdriveUploadStatus" TEXT;

UPDATE "ArchitectureReviewJob"
SET "workdriveUploadStatus" = 'legacy_raw_upload_present'
WHERE octet_length("diagramBytes") > 0
  AND "workdriveUploadStatus" IS NULL;

ALTER TABLE "ArchitectureReviewJob"
DROP COLUMN "diagramBytes";
