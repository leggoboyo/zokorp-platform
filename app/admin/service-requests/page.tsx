import { ServiceRequestStatus } from "@prisma/client";

import { triggerServiceRequestZohoSyncNowAction, updateServiceRequestStatusAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TimelineCard } from "@/components/ui/timeline-card";
import { requireAdminPageAccess } from "@/lib/admin-page-access";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  SERVICE_REQUEST_STATUS_STYLE,
  SERVICE_REQUEST_TYPE_LABEL,
  resolveServiceRequestOwnerLabel,
} from "@/lib/service-requests";

export const dynamic = "force-dynamic";

function crmSyncBadge(input: {
  syncedToZohoAt: Date | null;
  zohoSyncNeedsUpdate: boolean;
  zohoSyncError: string | null;
}) {
  if (input.zohoSyncError) {
    return {
      label: "CRM sync failed",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      detail: input.zohoSyncError,
    };
  }

  if (input.zohoSyncNeedsUpdate || !input.syncedToZohoAt) {
    return {
      label: "CRM sync pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      detail: "Waiting for the next Zoho service-request sync run.",
    };
  }

  return {
    label: "CRM synced",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    detail: `Last synced ${input.syncedToZohoAt.toLocaleString()}`,
  };
}

async function getServiceRequests() {
  return db.serviceRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 80,
  });
}

export default async function AdminServiceRequestsPage() {
  await requireAdminPageAccess("/admin/service-requests");

  let requests: Awaited<ReturnType<typeof getServiceRequests>> | null = null;

  try {
    requests = await getServiceRequests();
  } catch (error) {
    if (!isSchemaDriftError(error)) {
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <Card tone="glass" className="rounded-[calc(var(--radius-xl)+0.25rem)] p-6">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Workspace</p>
            <h1 className="font-display text-4xl font-semibold text-slate-900">Service Requests</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Review the delivery queue, update customer-visible status, and keep request notes current for both account-linked customers and public inbound leads.
            </p>
          </div>
          <AdminNav current="service-requests" />
        </CardHeader>
      </Card>

      <Card className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-slate-900">Request queue</h2>
              <p className="text-sm text-slate-600">Update request status, keep the customer-visible note current, and watch whether the request has been synced into Zoho CRM yet.</p>
            </div>
            <form action={triggerServiceRequestZohoSyncNowAction}>
              <Button type="submit" variant="secondary" size="sm">
                Run service-request CRM sync
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!requests ? (
            <Alert tone="warning">
              <AlertTitle>Schema not ready</AlertTitle>
              <AlertDescription>
                Service request schema is not migrated yet in this environment.
              </AlertDescription>
            </Alert>
          ) : null}

          {!requests || requests.length === 0 ? (
            <p className="text-sm text-slate-600">No service requests found.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const syncState = crmSyncBadge(request);

                return (
                  <TimelineCard
                    key={request.id}
                    title={request.title}
                    meta={`${request.trackingCode} · ${SERVICE_REQUEST_TYPE_LABEL[request.type]} · ${resolveServiceRequestOwnerLabel(request)}`}
                    badge={
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SERVICE_REQUEST_STATUS_STYLE[request.status]}`}
                        >
                          {SERVICE_REQUEST_STATUS_LABEL[request.status]}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${syncState.className}`}
                        >
                          {syncState.label}
                        </span>
                      </div>
                    }
                    summary={request.summary}
                    details={
                      <>
                        <span>Linked account: {request.user?.id ? "Yes" : "Not yet"}</span>
                        <span>Request source: {request.requesterSource === "account" ? "Account form" : "Public form"}</span>
                        {request.requesterCompanyName ? <span>Company: {request.requesterCompanyName}</span> : null}
                        <span>Reply target: {request.requesterEmail}</span>
                        <span>{syncState.detail}</span>
                        {request.zohoRecordId ? <span>Zoho record ID: {request.zohoRecordId}</span> : null}
                      </>
                    }
                    footer={
                      <form action={updateServiceRequestStatusAction} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                        <input type="hidden" name="requestId" value={request.id} />
                        <Select name="status" defaultValue={request.status}>
                          {Object.values(ServiceRequestStatus).map((status) => (
                            <option key={status} value={status}>
                              {SERVICE_REQUEST_STATUS_LABEL[status]}
                            </option>
                          ))}
                        </Select>
                        <Input
                          name="latestNote"
                          defaultValue={request.latestNote || ""}
                          maxLength={240}
                          placeholder="Latest customer-visible update"
                        />
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                      </form>
                    }
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
