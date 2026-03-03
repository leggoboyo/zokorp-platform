import Link from "next/link";
import {
  CreditTier,
  EntitlementStatus,
  ServiceRequestStatus,
  type ServiceRequest,
} from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSchemaDriftError } from "@/lib/db-errors";
import {
  SERVICE_REQUEST_STATUS_LABEL,
  SERVICE_REQUEST_STATUS_STYLE,
  SERVICE_REQUEST_TYPE_LABEL,
} from "@/lib/service-requests";

export const dynamic = "force-dynamic";

function isServiceRequestOpen(status: ServiceRequestStatus) {
  return status !== ServiceRequestStatus.DELIVERED && status !== ServiceRequestStatus.CLOSED;
}

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login?callbackUrl=/account");
  }

  let user = null;
  let serviceRequests: ServiceRequest[] = [];

  try {
    user = await db.user.findUnique({
      where: { email },
      include: {
        entitlements: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        creditBalances: {
          include: {
            product: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        checkoutFulfillments: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (user) {
      try {
        serviceRequests = await db.serviceRequest.findMany({
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 25,
        });
      } catch (error) {
        if (!isSchemaDriftError(error)) {
          throw error;
        }
      }
    }
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <section className="surface rounded-2xl p-6">
          <h1 className="font-display text-3xl font-semibold text-slate-900">Account</h1>
          <p className="mt-3 text-sm text-slate-600">
            We could not load your account data yet. This usually means database settings are still
            being finalized in the deployment environment.
          </p>
          <div className="mt-5">
            <Link
              href="/software"
              className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Return to Software
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const activeSubscriptions = user.entitlements.filter(
    (entitlement) =>
      (entitlement.product.accessModel === "SUBSCRIPTION" || entitlement.product.accessModel === "METERED") &&
      entitlement.status === EntitlementStatus.ACTIVE,
  );
  const activeCredits = user.creditBalances.filter((wallet) => wallet.status === EntitlementStatus.ACTIVE);
  const openServiceRequests = serviceRequests.filter((request) => isServiceRequestOpen(request.status));

  return (
    <div className="space-y-6">
      <section className="glass-surface animate-fade-up rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account Hub</p>
            <h1 className="font-display mt-1 text-4xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/billing"
              className="focus-ring inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Billing and Invoices
            </Link>
            <Link
              href="/services#service-request"
              className="focus-ring inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              New Service Request
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="surface lift-card rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Open Requests</p>
          <p className="font-display mt-1 text-3xl font-semibold text-slate-900">{openServiceRequests.length}</p>
        </article>
        <article className="surface lift-card rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Active Subscriptions</p>
          <p className="font-display mt-1 text-3xl font-semibold text-slate-900">{activeSubscriptions.length}</p>
        </article>
        <article className="surface lift-card rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Credit Wallets</p>
          <p className="font-display mt-1 text-3xl font-semibold text-slate-900">{activeCredits.length}</p>
        </article>
        <article className="surface lift-card rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recent Purchases</p>
          <p className="font-display mt-1 text-3xl font-semibold text-slate-900">{user.checkoutFulfillments.length}</p>
        </article>
      </section>

      <section className="surface lift-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Service Requests</h2>
          <Link
            href="/services#service-request"
            className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 underline-offset-2 hover:underline"
          >
            Submit another request
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {serviceRequests.length === 0 ? (
            <p className="text-sm text-slate-600">No service requests yet.</p>
          ) : (
            serviceRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{request.title}</p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SERVICE_REQUEST_STATUS_STYLE[request.status]}`}
                  >
                    {SERVICE_REQUEST_STATUS_LABEL[request.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {request.trackingCode} · {SERVICE_REQUEST_TYPE_LABEL[request.type]} · Submitted{" "}
                  {new Date(request.createdAt).toLocaleDateString("en-US")}
                </p>
                <p className="mt-2 text-slate-700">{request.summary}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {request.preferredStart ? (
                    <p>Preferred start: {new Date(request.preferredStart).toLocaleDateString("en-US")}</p>
                  ) : null}
                  {request.budgetRange ? <p>Budget: {request.budgetRange}</p> : null}
                </div>
                {request.latestNote ? (
                  <p className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                    Latest update: {request.latestNote}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="surface lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Entitlements</h2>
        <div className="mt-3 space-y-2">
          {user.entitlements.length === 0 ? (
            <p className="text-sm text-slate-600">No active purchases yet.</p>
          ) : (
            user.entitlements.map((entitlement) => (
              <div key={entitlement.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">{entitlement.product.name}</p>
                <p className="text-slate-600">Status: {entitlement.status}</p>
                <p className="text-slate-600">Remaining uses: {entitlement.remainingUses}</p>
                {entitlement.validUntil ? (
                  <p className="text-slate-600">Valid until: {entitlement.validUntil.toLocaleDateString("en-US")}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Credit Wallets</h2>
        <div className="mt-3 space-y-2">
          {user.creditBalances.length === 0 ? (
            <p className="text-sm text-slate-600">No credit wallets found yet.</p>
          ) : (
            user.creditBalances.map((wallet) => (
              <div key={wallet.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">
                  {wallet.product.name} ·{" "}
                  {wallet.tier === CreditTier.SDP_SRP
                    ? "SDP/SRP"
                    : wallet.tier === CreditTier.COMPETENCY
                      ? "Competency"
                      : wallet.tier}
                </p>
                <p className="text-slate-600">Remaining uses: {wallet.remainingUses}</p>
                <p className="text-slate-600">Status: {wallet.status}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Recent Purchases</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {user.checkoutFulfillments.length === 0 ? (
            <li className="text-slate-600">No completed checkouts yet.</li>
          ) : (
            user.checkoutFulfillments.map((purchase) => (
              <li key={purchase.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700">
                <p className="font-medium text-slate-900">{purchase.product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Checkout session: <span className="font-mono">{purchase.stripeCheckoutSessionId}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500">{new Date(purchase.createdAt).toLocaleString()}</span>
                  <Link
                    href={`/software/${purchase.product.slug}`}
                    className="text-xs font-semibold text-slate-800 underline-offset-2 hover:underline"
                  >
                    Open tool
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="surface lift-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Recent Activity</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {user.auditLogs.length === 0 ? (
            <li className="text-slate-600">No activity logged yet.</li>
          ) : (
            user.auditLogs.map((log) => (
              <li key={log.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                <span className="font-medium">{log.action}</span>
                <span className="ml-2 text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
