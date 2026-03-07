import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeIdempotencyKey, readIdempotencyEntry, writeIdempotencyEntry } from "@/lib/idempotency-cache";

describe("idempotency cache", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes valid keys and rejects invalid ones", () => {
    expect(normalizeIdempotencyKey("  abcDEF12-_:  ")).toBe("abcDEF12-_:");
    expect(normalizeIdempotencyKey("short")).toBeNull();
    expect(normalizeIdempotencyKey("bad key with spaces")).toBeNull();
    expect(normalizeIdempotencyKey("../../etc/passwd")).toBeNull();
  });

  it("stores and retrieves idempotent entries", () => {
    writeIdempotencyEntry("test-key-001", { status: 200, body: { status: "sent" } }, 30_000);
    expect(readIdempotencyEntry("test-key-001")).toMatchObject({
      status: 200,
      body: { status: "sent" },
    });
  });

  it("expires entries after ttl", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-06T00:00:00.000Z"));

    writeIdempotencyEntry("test-key-002", { status: 200, body: { status: "fallback" } }, 1_000);
    expect(readIdempotencyEntry("test-key-002")).not.toBeNull();

    vi.advanceTimersByTime(1_500);
    expect(readIdempotencyEntry("test-key-002")).toBeNull();
  });
});
