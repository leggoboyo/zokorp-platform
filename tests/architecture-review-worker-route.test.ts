import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auditCreateMock, drainArchitectureReviewQueueMock, isSchemaDriftErrorMock } = vi.hoisted(() => ({
  auditCreateMock: vi.fn(),
  drainArchitectureReviewQueueMock: vi.fn(),
  isSchemaDriftErrorMock: vi.fn(),
}));

vi.mock("@/lib/architecture-review/jobs", () => ({
  drainArchitectureReviewQueue: drainArchitectureReviewQueueMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: auditCreateMock,
    },
  },
}));

vi.mock("@/lib/db-errors", () => ({
  isSchemaDriftError: isSchemaDriftErrorMock,
}));

import { GET, POST } from "@/app/api/architecture-review/worker/route";

describe("architecture review worker route", () => {
  const originalSecret = process.env.ARCH_REVIEW_WORKER_SECRET;
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    auditCreateMock.mockResolvedValue({});
    isSchemaDriftErrorMock.mockReturnValue(false);
    drainArchitectureReviewQueueMock.mockResolvedValue({
      scanned: 1,
      processed: 1,
      sent: 1,
      fallback: 0,
      rejected: 0,
      failed: 0,
      runningOrQueued: 0,
    });
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.ARCH_REVIEW_WORKER_SECRET;
    } else {
      process.env.ARCH_REVIEW_WORKER_SECRET = originalSecret;
    }
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns 503 when the worker secret is not configured", async () => {
    delete process.env.ARCH_REVIEW_WORKER_SECRET;

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Architecture review worker secret is not configured.",
    });
  });

  it("returns unauthorized without a valid worker secret", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("drains the queue when authorized", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker?limit=3", {
        method: "POST",
        headers: {
          "x-arch-review-worker-secret": "worker-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(drainArchitectureReviewQueueMock).toHaveBeenCalledWith({ limit: 3 });
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      processed: 1,
      sent: 1,
    });
  });

  it("rejects GET requests and requires POST for queue drain runs", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";

    const response = await GET(new Request("http://localhost/api/architecture-review/worker?limit=2", { method: "GET" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Method not allowed" });
    expect(drainArchitectureReviewQueueMock).not.toHaveBeenCalled();
  });

  it("does not expose raw error details on worker failures", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";
    drainArchitectureReviewQueueMock.mockRejectedValueOnce(new Error("database connection detail"));

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker?limit=1", {
        method: "POST",
        headers: {
          "x-arch-review-worker-secret": "worker-secret",
        },
      }),
    );

    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Architecture review worker run failed.",
    });
  });
});
