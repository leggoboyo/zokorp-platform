#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSessionPoolPressure(output) {
  return output.includes("MaxClientsInSessionMode") || output.toLowerCase().includes("max clients reached");
}

function runInherited(command, args, stepLabel) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`${stepLabel} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function runCaptured(command, args, envOverrides = {}) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      ...envOverrides,
    },
  });
}

async function runProofWithRetry() {
  const settleMs = Number.parseInt(process.env.SOFT_LAUNCH_PROOF_SETTLE_MS ?? "5000", 10);
  const proofAttempts = Number.parseInt(process.env.SOFT_LAUNCH_PROOF_ATTEMPTS ?? "3", 10);

  if (settleMs > 0) {
    console.log(`Settling ${settleMs}ms before operational proof.`);
    await sleep(settleMs);
  }

  for (let attempt = 1; attempt <= proofAttempts; attempt += 1) {
    const result = runCaptured("node", ["scripts/production_operational_proof.mjs"], {
      PROOF_DB_INITIAL_SETTLE_MS: String(settleMs),
    });

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    if (result.status === 0) {
      return;
    }

    const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    const shouldRetry = isSessionPoolPressure(combinedOutput) && attempt < proofAttempts;
    if (!shouldRetry) {
      throw new Error(`Soft-launch operational proof failed with exit code ${result.status ?? "unknown"}.`);
    }

    const retryWaitMs = settleMs * (attempt + 1);
    console.warn(
      `Operational proof hit transient database pool pressure on attempt ${attempt}/${proofAttempts}. Retrying in ${retryWaitMs}ms...`,
    );
    await sleep(retryWaitMs);
  }
}

async function main() {
  runInherited("node", ["scripts/production_provider_audit.mjs"], "Production provider audit");
  runInherited("node", ["scripts/browser_customer_journey_audit.mjs"], "Production browser journey audit");
  await runProofWithRetry();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
