function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries
      .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export async function hashSubmissionFingerprint(input: {
  toolName: string;
  email: string | null | undefined;
  payload: unknown;
}) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable for submission fingerprinting.");
  }

  const data = new TextEncoder().encode(
    `${input.toolName}:${normalizeEmail(input.email)}:${stableStringify(input.payload)}`,
  );
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

export { stableStringify };
