import crypto from "node:crypto";
import { z } from "zod";

const SCRYPT_N = 2 ** 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password is too long.")
  .refine((value) => /[a-z]/.test(value), "Password must include a lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Password must include an uppercase letter.")
  .refine((value) => /\d/.test(value), "Password must include a number.")
  .refine((value) => /[^A-Za-z0-9]/.test(value), "Password must include a symbol.");

export function validatePasswordStrength(password: string) {
  return passwordSchema.safeParse(password);
}

function buildScryptOptions() {
  return {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 128 * 1024 * 1024,
  } satisfies crypto.ScryptOptions;
}

async function scryptDeriveKey(input: string, salt: Buffer, keyLength: number, options: crypto.ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(input, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const derived = await scryptDeriveKey(password, salt, KEY_LENGTH, buildScryptOptions());

  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, nRaw, rRaw, pRaw, saltRaw, hashRaw] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !nRaw || !rRaw || !pRaw || !saltRaw || !hashRaw) {
    return false;
  }

  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const salt = Buffer.from(saltRaw, "base64url");
  const expected = Buffer.from(hashRaw, "base64url");

  const derived = await scryptDeriveKey(password, salt, expected.length, {
    N: n,
    r,
    p,
    maxmem: 128 * 1024 * 1024,
  });

  if (derived.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(derived, expected);
}

export function generateOpaqueToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

export function hashOpaqueToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
