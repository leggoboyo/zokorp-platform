import { beforeEach, describe, expect, it, vi } from "vitest";

const { drainArchitectureReviewQueueMock, isSchemaDriftErrorMock } = vi.hoisted(() => ({
  drainArchitectureReviewQueueMock: vi.fn(),
  isSchemaDriftErrorMock: vi.fn(),
}));

vi.mock("@/lib/architecture-review/jobs", () => ({
  drainArchitectureReviewQueue: drainArchitectureReviewQueueMock,
}));

vi.mock("@/lib/db-errors", () => ({
  isSchemaDriftError: isSchemaDriftErrorMock,
}));

import { POST } from "@/app/api/architecture-review/worker/route";

describe("architecture review worker route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("returns unauthorized without a valid worker secret", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("drains queue when authorized and applies query limit", async () => {
    process.env.ARCH_REVIEW_WORKER_SECRET = "worker-secret";

    const response = await POST(
      new Request("http://localhost/api/architecture-review/worker?limit=7", {
        method: "POST",
        headers: {
          authorization: "Bearer worker-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(drainArchitectureReviewQueueMock).toHaveBeenCalledWith({ limit: 7 });
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      processed: 1,
      sent: 1,
    });
  });
});
