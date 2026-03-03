type Bucket = {
  count: number;
  resetAt: number;
};

type ConsumeInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type ConsumeResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

declare global {
  var __zokorpRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = global.__zokorpRateLimitBuckets ?? new Map<string, Bucket>();

if (process.env.NODE_ENV !== "production") {
  global.__zokorpRateLimitBuckets = buckets;
}

export function getRequestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const candidate = forwardedFor.split(",")[0]?.trim() || realIp.trim();

  if (candidate) {
    return candidate;
  }

  const ua = request.headers.get("user-agent")?.trim() ?? "unknown-agent";
  return `ua:${ua.slice(0, 120)}`;
}

export function consumeRateLimit(input: ConsumeInput): ConsumeResult {
  const now = Date.now();
  const current = buckets.get(input.key);

  if (!current || current.resetAt <= now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, input.limit - 1),
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
    };
  }

  if (current.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(input.key, current);

  return {
    allowed: true,
    remaining: Math.max(0, input.limit - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
