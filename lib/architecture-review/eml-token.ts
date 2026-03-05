import crypto from "node:crypto";

export type EmlTokenPayload = {
  to: string;
  subject: string;
  body: string;
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
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

  const encoded = encodeBase64Url(JSON.stringify(signedPayload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifyEmlToken(token: string, secret: string): EmlTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as EmlTokenPayload;

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
