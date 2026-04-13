import Link from "next/link";

import type { AdminOverviewItem, AdminOverviewStatus } from "@/lib/admin-overview";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function statusVariant(status: AdminOverviewStatus) {
  switch (status) {
    case "configured":
      return "success" as const;
    case "healthy":
      return "success" as const;
    case "not configured":
      return "danger" as const;
    case "failing":
      return "danger" as const;
    case "stale":
      return "warning" as const;
    case "warning":
      return "warning" as const;
  }
}

type AdminStatusOverviewProps = {
  items: AdminOverviewItem[];
};

export function AdminStatusOverview({ items }: AdminStatusOverviewProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Operator Pulse</p>
        <h2 className="font-display text-3xl font-semibold text-slate-900">Cross-workspace status at a glance</h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-[calc(var(--radius-xl)+0.25rem)] p-5">
            <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</p>
                  <h3 className="font-display text-2xl font-semibold text-slate-900">{item.title}</h3>
                </div>
                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-slate-600">{item.summary}</p>
              <div className="space-y-2">
                {item.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
                    {highlight}
                  </div>
                ))}
              </div>
              <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Open workspace
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
