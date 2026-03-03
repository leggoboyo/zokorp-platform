import crypto from "node:crypto";

import { RunnerKeyStatus } from "@prisma/client";

import { db } from "@/lib/db";

const RUNNER_KEY_PREFIX = "zkr_";

function runnerKeyPepper() {
  return process.env.MLOPS_RUNNER_KEY_PEPPER ?? process.env.NEXTAUTH_SECRET ?? "zokorp-runner-pepper";
}

function hashRunnerKey(key: string) {
  return crypto.createHash("sha256").update(`${runnerKeyPepper()}::${key}`).digest("hex");
}

export function generateRunnerApiKey() {
  const token = crypto.randomBytes(24).toString("base64url");
  return `${RUNNER_KEY_PREFIX}${token}`;
}

export function getRunnerKeyPrefix(rawKey: string) {
  return rawKey.slice(0, Math.min(rawKey.length, 16));
}

export async function createRunnerKey(input: {
  organizationId: string;
  createdByUserId: string;
  name: string;
}) {
  const plainKey = generateRunnerApiKey();

  const created = await db.mlopsRunnerKey.create({
    data: {
      organizationId: input.organizationId,
      createdByUserId: input.createdByUserId,
      name: input.name,
      keyPrefix: getRunnerKeyPrefix(plainKey),
      keyHash: hashRunnerKey(plainKey),
      status: RunnerKeyStatus.ACTIVE,
    },
  });

  return {
    plainKey,
    runnerKey: created,
  };
}

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export async function authenticateRunnerApiKey(rawKey: string) {
  if (!rawKey || !rawKey.startsWith(RUNNER_KEY_PREFIX)) {
    return null;
  }

  const keyPrefix = getRunnerKeyPrefix(rawKey);
  const candidate = await db.mlopsRunnerKey.findFirst({
    where: {
      keyPrefix,
      status: RunnerKeyStatus.ACTIVE,
    },
    include: {
      organization: true,
    },
  });

  if (!candidate) {
    return null;
  }

  const suppliedHash = hashRunnerKey(rawKey);
  if (!constantTimeEqual(candidate.keyHash, suppliedHash)) {
    return null;
  }

  await db.mlopsRunnerKey.update({
    where: {
      id: candidate.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return candidate;
}
