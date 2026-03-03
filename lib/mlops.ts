import {
  MlopsDeploymentStatus,
  MlopsJobStatus,
  MlopsJobType,
  MlopsModelStage,
  MlopsRunStatus,
  MlopsUsageKind,
} from "@prisma/client";

export const MLOPS_JOB_STATUS_LABEL: Record<MlopsJobStatus, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  CANCELED: "Canceled",
};

export const MLOPS_RUN_STATUS_LABEL: Record<MlopsRunStatus, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  CANCELED: "Canceled",
};

export const MLOPS_JOB_TYPE_LABEL: Record<MlopsJobType, string> = {
  TRAIN: "Train",
  BATCH_SCORE: "Batch Score",
  INFERENCE_SMOKE_TEST: "Inference Smoke Test",
  MONITORING_CHECK: "Monitoring Check",
};

export const MLOPS_MODEL_STAGE_LABEL: Record<MlopsModelStage, string> = {
  DEV: "Dev",
  STAGING: "Staging",
  PROD: "Prod",
  ARCHIVED: "Archived",
};

export const MLOPS_DEPLOYMENT_STATUS_LABEL: Record<MlopsDeploymentStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  FAILED: "Failed",
  RETIRED: "Retired",
};

export const MLOPS_USAGE_KIND_LABEL: Record<MlopsUsageKind, string> = {
  JOB_UNITS: "Job Units",
  INFERENCE_UNITS: "Inference Units",
  STORAGE_GB_HOURS: "Storage GB-Hours",
};

export function calculateP50(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export function calculateP95(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index];
}

export function simpleDistributionDrift(input: { baseline: number[]; current: number[] }) {
  if (input.baseline.length === 0 || input.current.length === 0) {
    return 0;
  }

  const baselineMean = input.baseline.reduce((sum, value) => sum + value, 0) / input.baseline.length;
  const currentMean = input.current.reduce((sum, value) => sum + value, 0) / input.current.length;

  const denominator = Math.max(Math.abs(baselineMean), 1);
  return Number((Math.abs(currentMean - baselineMean) / denominator).toFixed(4));
}
