import { ServiceRequestStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { updateServiceRequestStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  SERVICE_REQUEST_STATUS_STYLE,
  SERVICE_REQUEST_TYPE_LABEL,
} from "@/lib/service-requests";

export const dynamic = "force-dynamic";

async function getServiceRequests() {
  return db.serviceRequest.findMany({
    include: {
      user: {
        select: {
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
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login?callbackUrl=/admin/service-requests");
    }

    return (
      <section className="surface rounded-2xl p-6">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Admin access required</h1>
        <p className="mt-3 text-sm text-slate-600">
          This page is restricted to ZoKorp admin accounts listed in <span className="font-mono">ZOKORP_ADMIN_EMAILS</span>.
        </p>
      </section>
    );
  }

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
      <h1 className="font-display text-4xl font-semibold text-slate-900">Admin: Service Requests</h1>
      <nav className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
        <Link href="/admin/products" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Products
        </Link>
        <Link href="/admin/prices" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Prices
        </Link>
        <Link href="/admin/service-requests" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Service Requests
        </Link>
      </nav>

      <section className="surface rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Request Queue</h2>
        <p className="mt-2 text-sm text-slate-600">Update request status and latest note shown in user accounts.</p>
        {!requests ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Service request schema is not migrated yet in this environment.
          </p>
        ) : null}

        <ul className="mt-4 space-y-3 text-sm">
          {!requests || requests.length === 0 ? (
            <li className="text-slate-600">No service requests found.</li>
          ) : (
            requests.map((request) => (
              <li key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{request.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.trackingCode} · {SERVICE_REQUEST_TYPE_LABEL[request.type]} · {request.user.email || "no-email"}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SERVICE_REQUEST_STATUS_STYLE[request.status]}`}>
                    {SERVICE_REQUEST_STATUS_LABEL[request.status]}
                  </span>
                </div>

                <p className="mt-2 text-slate-700">{request.summary}</p>

                <form action={updateServiceRequestStatusAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                  <input type="hidden" name="requestId" value={request.id} />
                  <select
                    name="status"
                    defaultValue={request.status}
                    className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {Object.values(ServiceRequestStatus).map((status) => (
                      <option key={status} value={status}>
                        {SERVICE_REQUEST_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                  <input
                    name="latestNote"
                    defaultValue={request.latestNote || ""}
                    maxLength={240}
                    placeholder="Latest customer-visible update"
                    className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="focus-ring rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
