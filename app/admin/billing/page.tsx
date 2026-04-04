import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineCard } from "@/components/ui/timeline-card";
import { getAdminBillingSnapshot } from "@/lib/admin-billing";
import { requireAdminPageAccess } from "@/lib/admin-page-access";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  await requireAdminPageAccess("/admin/billing");
  const snapshot = await getAdminBillingSnapshot();

  return (
    <div className="space-y-6">
      <Card tone="glass" className="rounded-[calc(var(--radius-xl)+0.25rem)] p-6">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Workspace</p>
            <h1 className="font-display text-4xl font-semibold text-slate-900">Billing</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Review paid checkout activity, immutable credit movement, and Stripe exception signals in one operator view.
            </p>
          </div>
          <AdminNav current="billing" />
        </CardHeader>
      </Card>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Recent checkouts", value: snapshot.stats.recentCheckouts },
          { label: "Credit events", value: snapshot.stats.creditEvents },
          { label: "Billing attention", value: snapshot.stats.billingAttention },
          { label: "Refunds and disputes", value: snapshot.stats.refundsAndDisputes },
        ].map((item) => (
          <Card key={item.label} lift className="rounded-3xl p-4">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-slate-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
          <CardHeader className="gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-slate-900">Billing attention</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Failed payments, webhook anomalies, refunds, disputes, and customer-binding exceptions land here first.
                </p>
              </div>
              <Link href="/admin/operations" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Open operations
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.attentionSignals.length === 0 ? (
              <Card tone="muted" className="rounded-3xl p-4">
                <CardContent>
                  <p className="text-sm text-slate-600">No billing exceptions are queued right now.</p>
                </CardContent>
              </Card>
            ) : (
              snapshot.attentionSignals.map((entry) => (
                <TimelineCard
                  key={entry.id}
                  title={entry.title}
                  meta={new Date(entry.createdAt).toLocaleString()}
                  badge={<Badge variant={entry.statusTone}>{entry.statusLabel}</Badge>}
                  summary={entry.summary}
                  details={
                    <>
                      {entry.details.map((detail) => (
                        <span key={detail}>{detail}</span>
                      ))}
                    </>
                  }
                  footer={
                    entry.href ? (
                      <Link href={entry.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        Open related workspace
                      </Link>
                    ) : undefined
                  }
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
          <CardHeader className="gap-2">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Recent fulfilled checkouts</h2>
            <p className="text-sm leading-6 text-slate-600">
              Recent paid software purchases that successfully created account entitlements or credit wallets.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentCheckouts.length === 0 ? (
              <Card tone="muted" className="rounded-3xl p-4">
                <CardContent>
                  <p className="text-sm text-slate-600">No fulfilled checkouts recorded yet.</p>
                </CardContent>
              </Card>
            ) : (
              snapshot.recentCheckouts.map((entry) => (
                <TimelineCard
                  key={entry.id}
                  title={entry.title}
                  meta={new Date(entry.createdAt).toLocaleString()}
                  badge={<Badge variant={entry.statusTone}>{entry.statusLabel}</Badge>}
                  summary={entry.summary}
                  details={
                    <>
                      {entry.details.map((detail) => (
                        <span key={detail}>{detail}</span>
                      ))}
                    </>
                  }
                  footer={
                    entry.href ? (
                      <Link href={entry.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        Open product
                      </Link>
                    ) : undefined
                  }
                />
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
        <CardHeader className="gap-2">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Credit ledger</h2>
          <p className="text-sm leading-6 text-slate-600">
            Immutable purchase and consumption records for credit-based products, intended for reconciliation and support.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.creditActivity.length === 0 ? (
            <Card tone="muted" className="rounded-3xl p-4">
              <CardContent>
                <p className="text-sm text-slate-600">Credit ledger schema is not recording entries yet in this environment.</p>
              </CardContent>
            </Card>
          ) : (
            snapshot.creditActivity.map((entry) => (
              <TimelineCard
                key={entry.id}
                title={entry.title}
                meta={new Date(entry.createdAt).toLocaleString()}
                badge={<Badge variant={entry.statusTone}>{entry.statusLabel}</Badge>}
                summary={entry.summary}
                details={
                  <>
                    {entry.details.map((detail) => (
                      <span key={detail}>{detail}</span>
                    ))}
                  </>
                }
                footer={
                  entry.href ? (
                    <Link href={entry.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      Open product
                    </Link>
                  ) : undefined
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
