import { AdminNav } from "@/components/admin/admin-nav";
import { AdminStatusOverview } from "@/components/admin/admin-status-overview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminBillingSnapshot } from "@/lib/admin-billing";
import { buildAdminOverview } from "@/lib/admin-overview";
import { getAdminOperationsSnapshot } from "@/lib/admin-operations";
import { requireAdminPageAccess } from "@/lib/admin-page-access";
import { buildRuntimeReadinessReport, type ReadinessLevel } from "@/lib/runtime-readiness";

export const dynamic = "force-dynamic";

function badgeVariant(level: ReadinessLevel) {
  if (level === "pass") {
    return "success" as const;
  }

  if (level === "fail") {
    return "danger" as const;
  }

  return "warning" as const;
}

function tone(level: ReadinessLevel) {
  if (level === "pass") {
    return "success" as const;
  }

  if (level === "fail") {
    return "danger" as const;
  }

  return "warning" as const;
}

function displayLevel(level: ReadinessLevel) {
  if (level === "pass") {
    return "configured";
  }

  if (level === "fail") {
    return "failing";
  }

  return "warning";
}

export default async function AdminReadinessPage() {
  await requireAdminPageAccess("/admin/readiness");

  const report = buildRuntimeReadinessReport();
  const [operationsSnapshot, billingSnapshot] = await Promise.all([
    getAdminOperationsSnapshot(),
    getAdminBillingSnapshot(),
  ]);
  const overviewItems = buildAdminOverview({
    readinessReport: report,
    operationsSnapshot,
    billingSnapshot,
  });

  return (
    <div className="space-y-6">
      <Card tone="glass" className="rounded-[calc(var(--radius-xl)+0.25rem)] p-6">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Workspace</p>
            <h1 className="font-display text-4xl font-semibold text-slate-900">Runtime Readiness</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Secret-safe runtime checks for auth, billing, scheduled jobs, and integrations. This page reports presence, drift, and risky
              secret reuse without exposing secret values.
            </p>
          </div>
          <AdminNav current="readiness" />
        </CardHeader>
      </Card>

      <AdminStatusOverview items={overviewItems} />

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Pass", value: report.totals.pass, variant: "success" as const },
          { label: "Warnings", value: report.totals.warning, variant: "warning" as const },
          { label: "Failures", value: report.totals.fail, variant: "danger" as const },
        ].map((item) => (
          <Card key={item.label} lift className="rounded-3xl p-4">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="font-display text-3xl font-semibold text-slate-900">{item.value}</p>
              <Badge variant={item.variant}>{item.label}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <Alert tone={report.totals.fail > 0 ? "danger" : report.totals.warning > 0 ? "warning" : "success"}>
        <AlertTitle>
          {report.totals.fail > 0
            ? "Risky runtime drift detected"
            : report.totals.warning > 0
              ? "Runtime is only partially ready"
              : "Runtime checks look healthy"}
        </AlertTitle>
        <AlertDescription>
          This page cannot verify masked provider secrets, GitHub workflow URL values, Stripe dashboard webhook bindings, or live response
          headers. Use it to catch in-app drift before dashboard verification.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {report.sections.map((section) => (
          <Card key={section.id} className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold text-slate-900">{section.label}</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.checks.map((check) => (
                <Alert key={check.id} tone={tone(check.level)}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <AlertTitle className="mb-0">{check.label}</AlertTitle>
                    <Badge variant={badgeVariant(check.level)}>{displayLevel(check.level)}</Badge>
                  </div>
                  <AlertDescription>{check.summary}</AlertDescription>
                  {check.details && check.details.length > 0 ? (
                    <div className="mt-2 space-y-1 text-sm">
                      {check.details.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                  ) : null}
                  {check.operatorAction ? (
                    <p className="mt-2 text-sm font-medium">Operator action: {check.operatorAction}</p>
                  ) : null}
                </Alert>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
