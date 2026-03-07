type IdempotencyEntry = {
  status: number;
  body: Record<string, unknown>;
  expiresAt: number;
};

declare global {
  var __zokorpIdempotencyCache: Map<string, IdempotencyEntry> | undefined;
}

const idempotencyCache = global.__zokorpIdempotencyCache ?? new Map<string, IdempotencyEntry>();

if (process.env.NODE_ENV !== "production") {
  global.__zokorpIdempotencyCache = idempotencyCache;
}

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of idempotencyCache.entries()) {
    if (value.expiresAt <= now) {
      idempotencyCache.delete(key);
    }
  }
}

export function normalizeIdempotencyKey(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  const key = raw.trim();
  if (!key) {
    return null;
  }

  if (!/^[a-zA-Z0-9:_-]{8,120}$/.test(key)) {
    return null;
  }

  return key;
}

export function readIdempotencyEntry(key: string) {
  const now = Date.now();
  cleanupExpiredEntries(now);
  const value = idempotencyCache.get(key);
  if (!value || value.expiresAt <= now) {
    if (value) {
      idempotencyCache.delete(key);
    }
    return null;
  }

  return value;
}

export function writeIdempotencyEntry(
  key: string,
  value: {
    status: number;
    body: Record<string, unknown>;
  },
  ttlMs = 20 * 60 * 1000,
) {
  const now = Date.now();
  cleanupExpiredEntries(now);
  idempotencyCache.set(key, {
    status: value.status,
    body: value.body,
    expiresAt: now + ttlMs,
  });
}
