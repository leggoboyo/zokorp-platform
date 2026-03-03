import { OrganizationRole, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { calculateP50, calculateP95 } from "@/lib/mlops";
import { requireMlopsContext } from "@/lib/mlops-auth";

export type MlopsContextInput = {
  organizationSlug?: string;
  minimumRole?: OrganizationRole;
};

export async function getMlopsWorkspace(input?: MlopsContextInput) {
  return requireMlopsContext({
    organizationSlug: input?.organizationSlug,
    minimumRole: input?.minimumRole ?? OrganizationRole.VIEWER,
  });
}

export async function getMlopsWorkspaceForPage(input?: MlopsContextInput) {
  try {
    return await getMlopsWorkspace(input);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      const callbackPath = input?.organizationSlug
        ? `/mlops?org=${encodeURIComponent(input.organizationSlug)}`
        : "/mlops";
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      redirect("/account");
    }

    throw error;
  }
}

export async function getMlopsDashboardSnapshot(input?: MlopsContextInput) {
  const context = await getMlopsWorkspaceForPage(input);

  const [projectCount, jobCount, runningJobs, modelCount, deploymentCount, recentMetrics, usageTotal] =
    await Promise.all([
      db.mlopsProject.count({ where: { organizationId: context.organization.id } }),
      db.mlopsJob.count({ where: { organizationId: context.organization.id } }),
      db.mlopsJob.count({ where: { organizationId: context.organization.id, status: "RUNNING" } }),
      db.mlopsModel.count({ where: { organizationId: context.organization.id } }),
      db.mlopsDeployment.count({ where: { organizationId: context.organization.id } }),
      db.mlopsMonitoringEvent.findMany({
        where: {
          organizationId: context.organization.id,
          metricName: {
            in: ["latency_ms", "request_count", "error_count"],
          },
        },
        orderBy: {
          recordedAt: "desc",
        },
        take: 250,
      }),
      db.mlopsUsageLedger.aggregate({
        where: {
          organizationId: context.organization.id,
          kind: "JOB_UNITS",
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

  const latency = recentMetrics
    .filter((event) => event.metricName === "latency_ms")
    .map((event) => event.metricValue);

  const requestCount = recentMetrics
    .filter((event) => event.metricName === "request_count")
    .reduce((sum, event) => sum + event.metricValue, 0);

  const errorCount = recentMetrics
    .filter((event) => event.metricName === "error_count")
    .reduce((sum, event) => sum + event.metricValue, 0);

  return {
    ...context,
    summary: {
      projectCount,
      jobCount,
      runningJobs,
      modelCount,
      deploymentCount,
      requestCount,
      errorCount,
      usageJobUnits: usageTotal._sum.quantity ?? 0,
      latencyP50Ms: Number(calculateP50(latency).toFixed(2)),
      latencyP95Ms: Number(calculateP95(latency).toFixed(2)),
    },
  };
}

export async function getTopProjectsByActivity(organizationId: string) {
  const rows = await db.$queryRaw<
    Array<{
      id: string;
      name: string;
      slug: string;
      job_count: bigint;
      run_count: bigint;
      deployment_count: bigint;
    }>
  >(Prisma.sql`
    SELECT
      p."id",
      p."name",
      p."slug",
      COUNT(DISTINCT j."id") AS job_count,
      COUNT(DISTINCT r."id") AS run_count,
      COUNT(DISTINCT d."id") AS deployment_count
    FROM "MlopsProject" p
    LEFT JOIN "MlopsJob" j ON j."projectId" = p."id"
    LEFT JOIN "MlopsRun" r ON r."projectId" = p."id"
    LEFT JOIN "MlopsDeployment" d ON d."projectId" = p."id"
    WHERE p."organizationId" = ${organizationId}
    GROUP BY p."id"
    ORDER BY COUNT(DISTINCT j."id") DESC, COUNT(DISTINCT r."id") DESC
    LIMIT 8
  `);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    jobCount: Number(row.job_count),
    runCount: Number(row.run_count),
    deploymentCount: Number(row.deployment_count),
  }));
}
