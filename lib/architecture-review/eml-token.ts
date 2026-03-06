import crypto from "node:crypto";

export type EmlTokenPayload = {
  to: string;
  subject: string;
  body: string;
  exp: number;
};

function deriveEncryptionKey(secret: string) {
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

function encryptPayload(value: string, secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveEncryptionKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64url"), ciphertext.toString("base64url"), authTag.toString("base64url")].join(".");
}

export function createEmlToken(
  payload: Omit<EmlTokenPayload, "exp">,
  secret: string,
  ttlSeconds = 15 * 60,
) {
  const signedPayload: EmlTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  return encryptPayload(JSON.stringify(signedPayload), secret);
}

export function verifyEmlToken(token: string, secret: string): EmlTokenPayload | null {
  const [ivRaw, ciphertextRaw, authTagRaw] = token.split(".");
  if (!ivRaw || !ciphertextRaw || !authTagRaw) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      deriveEncryptionKey(secret),
      Buffer.from(ivRaw, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(authTagRaw, "base64url"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextRaw, "base64url")),
      decipher.final(),
    ]).toString("utf8");

    const parsed = JSON.parse(plaintext) as EmlTokenPayload;

    if (!parsed.to || !parsed.subject || !parsed.body || !Number.isInteger(parsed.exp)) {
      return null;
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
