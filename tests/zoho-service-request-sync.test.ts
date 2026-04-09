import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());
const createInternalAuditLogMock = vi.hoisted(() => vi.fn());
const upsertZohoLeadMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  db: {
    serviceRequest: {
      findMany: findManyMock,
      update: updateMock,
    },
  },
}));

vi.mock("@/lib/internal-route", () => ({
  createInternalAuditLog: createInternalAuditLogMock,
}));

vi.mock("@/lib/zoho-crm", () => ({
  upsertZohoLead: upsertZohoLeadMock,
}));

import { runZohoServiceRequestSync } from "@/lib/zoho-service-request-sync";

describe("zoho service request sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs pending service requests into Zoho and clears the queue state", async () => {
    findManyMock.mockResolvedValueOnce([
      {
        id: "sr_123",
        trackingCode: "SR-260409-ABCDE",
        requesterEmail: "founder@customerco.com",
        requesterName: "Customer Founder",
        requesterCompanyName: "CustomerCo",
        requesterSource: "public_form",
        type: "CONSULTATION",
        title: "Architecture review follow-through",
        summary: "Need a short remediation plan after a scored AWS architecture review.",
        preferredStart: new Date("2026-04-10T00:00:00.000Z"),
        budgetRange: "Undecided",
        status: "SUBMITTED",
        latestNote: null,
        userId: null,
      },
    ]);
    upsertZohoLeadMock.mockResolvedValueOnce({
      status: "success",
      recordId: "zoho_123",
      error: null,
    });
    updateMock.mockResolvedValue({});

    const result = await runZohoServiceRequestSync();

    expect(result).toEqual({
      status: "ok",
      attempted: 1,
      synced: 1,
      failed: 0,
    });
    expect(upsertZohoLeadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "founder@customerco.com",
        fullName: "Customer Founder",
        companyName: "CustomerCo",
        leadSource: "ZoKorp Service Request",
      }),
    );
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sr_123" },
        data: expect.objectContaining({
          zohoRecordId: "zoho_123",
          zohoSyncNeedsUpdate: false,
          zohoSyncError: null,
        }),
      }),
    );
    expect(createInternalAuditLogMock).toHaveBeenCalledWith("internal.zoho_sync_service_requests.run", {
      attempted: 1,
      synced: 1,
      failed: 0,
    });
  });

  it("returns not_configured without mutating requests when Zoho is unavailable", async () => {
    findManyMock.mockResolvedValueOnce([
      {
        id: "sr_123",
        trackingCode: "SR-260409-ABCDE",
        requesterEmail: "founder@customerco.com",
        requesterName: "Customer Founder",
        requesterCompanyName: "CustomerCo",
        requesterSource: "public_form",
        type: "CONSULTATION",
        title: "Architecture review follow-through",
        summary: "Need a short remediation plan after a scored AWS architecture review.",
        preferredStart: null,
        budgetRange: null,
        status: "SUBMITTED",
        latestNote: null,
        userId: null,
      },
    ]);
    upsertZohoLeadMock.mockResolvedValueOnce({
      status: "not_configured",
      error: "Zoho CRM sync is not configured.",
    });

    await expect(runZohoServiceRequestSync()).resolves.toEqual({
      status: "not_configured",
      error: "Zoho CRM sync is not configured.",
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(createInternalAuditLogMock).toHaveBeenCalledWith("internal.zoho_sync_service_requests.not_ready");
  });
});
