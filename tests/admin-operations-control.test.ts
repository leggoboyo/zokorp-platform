import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  architectureReviewEmailOutboxFindUniqueMock,
  architectureReviewEmailOutboxUpdateMock,
  leadLogUpdateMock,
  auditLogCreateMock,
  sendToolResultEmailMock,
  runZohoLeadSyncMock,
  runEstimateCompanionSyncMock,
} = vi.hoisted(() => ({
  architectureReviewEmailOutboxFindUniqueMock: vi.fn(),
  architectureReviewEmailOutboxUpdateMock: vi.fn(),
  leadLogUpdateMock: vi.fn(),
  auditLogCreateMock: vi.fn(),
  sendToolResultEmailMock: vi.fn(),
  runZohoLeadSyncMock: vi.fn(),
  runEstimateCompanionSyncMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    architectureReviewEmailOutbox: {
      findUnique: architectureReviewEmailOutboxFindUniqueMock,
      update: architectureReviewEmailOutboxUpdateMock,
    },
    leadLog: {
      update: leadLogUpdateMock,
    },
    auditLog: {
      create: auditLogCreateMock,
    },
  },
}));

vi.mock("@/lib/architecture-review/sender", () => ({
  sendToolResultEmail: sendToolResultEmailMock,
}));

vi.mock("@/lib/zoho-sync-leads", () => ({
  runZohoLeadSync: runZohoLeadSyncMock,
}));

vi.mock("@/lib/estimate-companion-sync", () => ({
  runEstimateCompanionSync: runEstimateCompanionSyncMock,
}));

import {
  retryArchitectureReviewEmailOutbox,
  triggerEstimateCompanionSyncNow,
  triggerZohoLeadSyncNow,
} from "@/lib/admin-operations-control";

describe("admin operations control helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries a failed architecture-review email from the outbox", async () => {
    architectureReviewEmailOutboxFindUniqueMock.mockResolvedValue({
      id: "cmailretry00000000000000000",
      leadLogId: "clead00000000000000000000",
      status: "failed",
      toEmail: "consulting@zokorp.com",
      subject: "[ZoKorp] Architecture review result",
      textBody: "Plain text body",
      htmlBody: "<p>HTML body</p>",
      job: {
        userId: "cuser00000000000000000000",
      },
    });
    sendToolResultEmailMock.mockResolvedValue({
      ok: true,
      provider: "smtp",
    });

    const result = await retryArchitectureReviewEmailOutbox({
      outboxId: "cmailretry00000000000000000",
    });

    expect(sendToolResultEmailMock).toHaveBeenCalledWith({
      to: "consulting@zokorp.com",
      subject: "[ZoKorp] Architecture review result",
      text: "Plain text body",
      html: "<p>HTML body</p>",
    });
    expect(architectureReviewEmailOutboxUpdateMock).toHaveBeenCalled();
    expect(leadLogUpdateMock).toHaveBeenCalled();
    expect(auditLogCreateMock).toHaveBeenCalled();
    expect(result.status).toBe("sent");
  });

  it("returns already_sent without sending again", async () => {
    architectureReviewEmailOutboxFindUniqueMock.mockResolvedValue({
      id: "cmailretry00000000000000001",
      leadLogId: null,
      status: "sent",
      toEmail: "consulting@zokorp.com",
      subject: "[ZoKorp] Architecture review result",
      textBody: "Plain text body",
      htmlBody: null,
      job: {
        userId: "cuser00000000000000000000",
      },
    });

    const result = await retryArchitectureReviewEmailOutbox({
      outboxId: "cmailretry00000000000000001",
    });

    expect(sendToolResultEmailMock).not.toHaveBeenCalled();
    expect(result.status).toBe("already_sent");
  });

  it("surfaces the direct Zoho lead sync helper", async () => {
    runZohoLeadSyncMock.mockResolvedValue({ status: "ok", synced: 2, skipped: 0, failed: 0, message: "done" });

    const result = await triggerZohoLeadSyncNow();

    expect(runZohoLeadSyncMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("ok");
  });

  it("surfaces the direct estimate companion sync helper", async () => {
    runEstimateCompanionSyncMock.mockResolvedValue({
      status: "ok",
      scanned: 4,
      updated: 1,
      unchanged: 3,
      failed: 0,
    });

    const result = await triggerEstimateCompanionSyncNow();

    expect(runEstimateCompanionSyncMock).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: "ok",
      updated: 1,
    });
  });
});
