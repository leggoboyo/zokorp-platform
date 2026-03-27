import Link from "next/link";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: {
    index: false,
    follow: false,
  },
};

function formatWorkspace(from: string | undefined) {
  if (!from || !from.startsWith("/admin/")) {
    return null;
  }

  return from;
}

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const workspace = formatWorkspace(params.from);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full rounded-[calc(var(--radius-xl)+0.25rem)] p-6 sm:p-8">
        <CardHeader className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Access Denied</p>
          <h1 className="font-display text-4xl font-semibold text-slate-900">Admin access required</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            This workspace is limited to verified ZoKorp admin accounts listed in <span className="font-mono">ZOKORP_ADMIN_EMAILS</span>.
          </p>
          {workspace ? (
            <p className="text-sm leading-6 text-slate-600">
              Attempted workspace: <span className="font-mono">{workspace}</span>
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Link href="/account" className={buttonVariants()}>
            Open account
          </Link>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Return home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
