import { describe, expect, it } from "vitest";

import { consumeRateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("blocks requests after limit within the same window", async () => {
    const key = `test-key-${Date.now()}-${Math.random()}`;

    const first = await consumeRateLimit({ key, limit: 2, windowMs: 60_000 });
    const second = await consumeRateLimit({ key, limit: 2, windowMs: 60_000 });
    const third = await consumeRateLimit({ key, limit: 2, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });
});
