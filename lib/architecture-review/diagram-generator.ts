import { extractServiceTokens } from "@/lib/architecture-review/engine";
import type { ArchitectureProvider } from "@/lib/architecture-review/types";

type DiagramLane = "source" | "edge" | "application" | "data" | "operations";

type DiagramNode = {
  id: string;
  label: string;
  lane: DiagramLane;
  iconPath?: string;
};

type DiagramEdge = {
  from: string;
  to: string;
  kind: "primary" | "secondary";
};

type ProviderTheme = {
  accent: string;
  accentSoft: string;
  background: string;
  laneFill: string;
  laneStroke: string;
  nodeFill: string;
  nodeStroke: string;
  textStrong: string;
  textMuted: string;
};

type GeneratedArchitectureDiagram = {
  provider: ArchitectureProvider;
  svg: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  title: string;
};

type IconRule = {
  keywords: string[];
  label: string;
  lane: DiagramLane;
  iconPath: string;
};

const MAX_NODES_PER_LANE = 4;
const DEFAULT_NARRATIVE =
  "Users send requests through a secure edge tier to application services that read and write managed data stores, with monitoring and alerts in place.";

const LOW_SIGNAL_TOKENS = new Set([
  "api",
  "gateway",
  "auth",
  "monitoring",
  "logging",
  "cache",
  "queue",
  "stream",
  "backup",
  "replica",
  "dr",
]);

const LANE_ORDER: DiagramLane[] = ["source", "edge", "application", "data", "operations"];

const LANE_LABELS: Record<DiagramLane, string> = {
  source: "Source",
  edge: "Edge",
  application: "Application",
  data: "Data",
  operations: "Observability",
};

const PROVIDER_THEMES: Record<ArchitectureProvider, ProviderTheme> = {
  aws: {
    accent: "#ff9900",
    accentSoft: "#fff4e5",
    background: "#f8fbff",
    laneFill: "#fffaf2",
    laneStroke: "#ffd7a3",
    nodeFill: "#ffffff",
    nodeStroke: "#f2c37b",
    textStrong: "#12263a",
    textMuted: "#4f6b86",
  },
  azure: {
    accent: "#0078d4",
    accentSoft: "#e8f3ff",
    background: "#f6fbff",
    laneFill: "#f4f9ff",
    laneStroke: "#a5d0ff",
    nodeFill: "#ffffff",
    nodeStroke: "#8ac0f1",
    textStrong: "#10263b",
    textMuted: "#496984",
  },
  gcp: {
    accent: "#1a73e8",
    accentSoft: "#ecf3ff",
    background: "#f7faff",
    laneFill: "#f2f7ff",
    laneStroke: "#bfd6fa",
    nodeFill: "#ffffff",
    nodeStroke: "#9dc0f5",
    textStrong: "#12304d",
    textMuted: "#4d6783",
  },
};

const LANE_ICON_FALLBACK: Record<ArchitectureProvider, Record<Exclude<DiagramLane, "source">, string>> = {
  aws: {
    edge: "/architecture-icons/aws/elastic-load-balancing.svg",
    application: "/architecture-icons/aws/ec2.svg",
    data: "/architecture-icons/aws/rds.svg",
    operations: "/architecture-icons/aws/cloudwatch.svg",
  },
  azure: {
    edge: "/architecture-icons/azure/front-door.svg",
    application: "/architecture-icons/azure/app-service.svg",
    data: "/architecture-icons/azure/sql-database.svg",
    operations: "/architecture-icons/azure/application-insights.svg",
  },
  gcp: {
    edge: "/architecture-icons/gcp/networking.svg",
    application: "/architecture-icons/gcp/cloud-run.svg",
    data: "/architecture-icons/gcp/cloud-sql.svg",
    operations: "/architecture-icons/gcp/observability.svg",
  },
};

const PROVIDER_ICON_RULES: Record<ArchitectureProvider, IconRule[]> = {
  aws: [
    {
      keywords: ["route 53"],
      label: "Route 53",
      lane: "edge",
      iconPath: "/architecture-icons/aws/route-53.svg",
    },
    {
      keywords: ["api gateway"],
      label: "API Gateway",
      lane: "edge",
      iconPath: "/architecture-icons/aws/api-gateway.svg",
    },
    {
      keywords: ["cloudfront", "cdn"],
      label: "CloudFront",
      lane: "edge",
      iconPath: "/architecture-icons/aws/cloudfront.svg",
    },
    {
      keywords: ["alb", "nlb", "load balancer"],
      label: "Elastic Load Balancing",
      lane: "edge",
      iconPath: "/architecture-icons/aws/elastic-load-balancing.svg",
    },
    {
      keywords: ["vpc"],
      label: "VPC",
      lane: "edge",
      iconPath: "/architecture-icons/aws/vpc.svg",
    },
    {
      keywords: ["lambda"],
      label: "Lambda",
      lane: "application",
      iconPath: "/architecture-icons/aws/lambda.svg",
    },
    {
      keywords: ["eks"],
      label: "EKS",
      lane: "application",
      iconPath: "/architecture-icons/aws/eks.svg",
    },
    {
      keywords: ["ecs", "fargate"],
      label: "ECS",
      lane: "application",
      iconPath: "/architecture-icons/aws/ecs.svg",
    },
    {
      keywords: ["ec2", "compute", "virtual machine"],
      label: "EC2",
      lane: "application",
      iconPath: "/architecture-icons/aws/ec2.svg",
    },
    {
      keywords: ["rds"],
      label: "RDS",
      lane: "data",
      iconPath: "/architecture-icons/aws/rds.svg",
    },
    {
      keywords: ["aurora"],
      label: "Aurora",
      lane: "data",
      iconPath: "/architecture-icons/aws/aurora.svg",
    },
    {
      keywords: ["dynamodb"],
      label: "DynamoDB",
      lane: "data",
      iconPath: "/architecture-icons/aws/dynamodb.svg",
    },
    {
      keywords: ["s3", "storage"],
      label: "S3",
      lane: "data",
      iconPath: "/architecture-icons/aws/s3.svg",
    },
    {
      keywords: ["iam", "auth"],
      label: "IAM",
      lane: "operations",
      iconPath: "/architecture-icons/aws/iam.svg",
    },
    {
      keywords: ["kms", "encryption"],
      label: "KMS",
      lane: "operations",
      iconPath: "/architecture-icons/aws/kms.svg",
    },
    {
      keywords: ["secrets manager", "secret"],
      label: "Secrets Manager",
      lane: "operations",
      iconPath: "/architecture-icons/aws/secrets-manager.svg",
    },
    {
      keywords: ["cloudwatch", "monitor", "log", "trace"],
      label: "CloudWatch",
      lane: "operations",
      iconPath: "/architecture-icons/aws/cloudwatch.svg",
    },
  ],
  azure: [
    {
      keywords: ["front door"],
      label: "Front Door",
      lane: "edge",
      iconPath: "/architecture-icons/azure/front-door.svg",
    },
    {
      keywords: ["application gateway"],
      label: "Application Gateway",
      lane: "edge",
      iconPath: "/architecture-icons/azure/application-gateway.svg",
    },
    {
      keywords: ["load balancer"],
      label: "Load Balancer",
      lane: "edge",
      iconPath: "/architecture-icons/azure/load-balancer.svg",
    },
    {
      keywords: ["traffic manager"],
      label: "Traffic Manager",
      lane: "edge",
      iconPath: "/architecture-icons/azure/traffic-manager.svg",
    },
    {
      keywords: ["vnet", "virtual network"],
      label: "Virtual Network",
      lane: "edge",
      iconPath: "/architecture-icons/azure/vnet.svg",
    },
    {
      keywords: ["api management"],
      label: "API Management",
      lane: "edge",
      iconPath: "/architecture-icons/azure/api-management.svg",
    },
    {
      keywords: ["app service"],
      label: "App Service",
      lane: "application",
      iconPath: "/architecture-icons/azure/app-service.svg",
    },
    {
      keywords: ["functions", "function app"],
      label: "Function App",
      lane: "application",
      iconPath: "/architecture-icons/azure/function-app.svg",
    },
    {
      keywords: ["aks", "kubernetes"],
      label: "AKS",
      lane: "application",
      iconPath: "/architecture-icons/azure/aks.svg",
    },
    {
      keywords: ["sql database"],
      label: "SQL Database",
      lane: "data",
      iconPath: "/architecture-icons/azure/sql-database.svg",
    },
    {
      keywords: ["cosmos db"],
      label: "Cosmos DB",
      lane: "data",
      iconPath: "/architecture-icons/azure/cosmos-db.svg",
    },
    {
      keywords: ["storage account", "storage"],
      label: "Storage Account",
      lane: "data",
      iconPath: "/architecture-icons/azure/storage-account.svg",
    },
    {
      keywords: ["service bus"],
      label: "Service Bus",
      lane: "data",
      iconPath: "/architecture-icons/azure/service-bus.svg",
    },
    {
      keywords: ["event hub"],
      label: "Event Hubs",
      lane: "data",
      iconPath: "/architecture-icons/azure/event-hubs.svg",
    },
    {
      keywords: ["key vault"],
      label: "Key Vault",
      lane: "operations",
      iconPath: "/architecture-icons/azure/key-vault.svg",
    },
    {
      keywords: ["managed identity"],
      label: "Managed Identity",
      lane: "operations",
      iconPath: "/architecture-icons/azure/managed-identity.svg",
    },
    {
      keywords: ["entra", "azure ad"],
      label: "Microsoft Entra",
      lane: "operations",
      iconPath: "/architecture-icons/azure/entra.svg",
    },
    {
      keywords: ["log analytics"],
      label: "Log Analytics",
      lane: "operations",
      iconPath: "/architecture-icons/azure/log-analytics.svg",
    },
    {
      keywords: ["application insights", "azure monitor", "monitor", "logging"],
      label: "Application Insights",
      lane: "operations",
      iconPath: "/architecture-icons/azure/application-insights.svg",
    },
  ],
  gcp: [
    {
      keywords: ["api gateway", "apigee"],
      label: "Apigee",
      lane: "edge",
      iconPath: "/architecture-icons/gcp/apigee.svg",
    },
    {
      keywords: ["load balancing", "cdn", "network"],
      label: "Cloud Networking",
      lane: "edge",
      iconPath: "/architecture-icons/gcp/networking.svg",
    },
    {
      keywords: ["cloud run"],
      label: "Cloud Run",
      lane: "application",
      iconPath: "/architecture-icons/gcp/cloud-run.svg",
    },
    {
      keywords: ["gke", "kubernetes"],
      label: "GKE",
      lane: "application",
      iconPath: "/architecture-icons/gcp/gke.svg",
    },
    {
      keywords: ["compute engine", "compute"],
      label: "Compute Engine",
      lane: "application",
      iconPath: "/architecture-icons/gcp/compute-engine.svg",
    },
    {
      keywords: ["cloud sql"],
      label: "Cloud SQL",
      lane: "data",
      iconPath: "/architecture-icons/gcp/cloud-sql.svg",
    },
    {
      keywords: ["spanner"],
      label: "Cloud Spanner",
      lane: "data",
      iconPath: "/architecture-icons/gcp/cloud-spanner.svg",
    },
    {
      keywords: ["cloud storage", "storage"],
      label: "Cloud Storage",
      lane: "data",
      iconPath: "/architecture-icons/gcp/cloud-storage.svg",
    },
    {
      keywords: ["bigquery"],
      label: "BigQuery",
      lane: "data",
      iconPath: "/architecture-icons/gcp/bigquery.svg",
    },
    {
      keywords: ["iam", "service account", "cloud kms", "secret manager", "security"],
      label: "Security Identity",
      lane: "operations",
      iconPath: "/architecture-icons/gcp/security-identity.svg",
    },
    {
      keywords: ["monitor", "logging", "trace", "observability"],
      label: "Observability",
      lane: "operations",
      iconPath: "/architecture-icons/gcp/observability.svg",
    },
  ],
};

const PROVIDER_DEFAULTS: Record<ArchitectureProvider, DiagramNode[]> = {
  aws: [
    { id: "source-users", label: "Users", lane: "source" },
    {
      id: "node-edge-1",
      label: "Route 53",
      lane: "edge",
      iconPath: "/architecture-icons/aws/route-53.svg",
    },
    {
      id: "node-edge-2",
      label: "API Gateway",
      lane: "edge",
      iconPath: "/architecture-icons/aws/api-gateway.svg",
    },
    {
      id: "node-application-1",
      label: "Lambda",
      lane: "application",
      iconPath: "/architecture-icons/aws/lambda.svg",
    },
    {
      id: "node-data-1",
      label: "DynamoDB",
      lane: "data",
      iconPath: "/architecture-icons/aws/dynamodb.svg",
    },
    {
      id: "node-operations-1",
      label: "CloudWatch",
      lane: "operations",
      iconPath: "/architecture-icons/aws/cloudwatch.svg",
    },
  ],
  azure: [
    { id: "source-users", label: "Users", lane: "source" },
    {
      id: "node-edge-1",
      label: "Front Door",
      lane: "edge",
      iconPath: "/architecture-icons/azure/front-door.svg",
    },
    {
      id: "node-edge-2",
      label: "Application Gateway",
      lane: "edge",
      iconPath: "/architecture-icons/azure/application-gateway.svg",
    },
    {
      id: "node-application-1",
      label: "App Service",
      lane: "application",
      iconPath: "/architecture-icons/azure/app-service.svg",
    },
    {
      id: "node-data-1",
      label: "SQL Database",
      lane: "data",
      iconPath: "/architecture-icons/azure/sql-database.svg",
    },
    {
      id: "node-operations-1",
      label: "Application Insights",
      lane: "operations",
      iconPath: "/architecture-icons/azure/application-insights.svg",
    },
  ],
  gcp: [
    { id: "source-users", label: "Users", lane: "source" },
    {
      id: "node-edge-1",
      label: "Apigee",
      lane: "edge",
      iconPath: "/architecture-icons/gcp/apigee.svg",
    },
    {
      id: "node-edge-2",
      label: "Cloud Networking",
      lane: "edge",
      iconPath: "/architecture-icons/gcp/networking.svg",
    },
    {
      id: "node-application-1",
      label: "Cloud Run",
      lane: "application",
      iconPath: "/architecture-icons/gcp/cloud-run.svg",
    },
    {
      id: "node-data-1",
      label: "Cloud SQL",
      lane: "data",
      iconPath: "/architecture-icons/gcp/cloud-sql.svg",
    },
    {
      id: "node-operations-1",
      label: "Observability",
      lane: "operations",
      iconPath: "/architecture-icons/gcp/observability.svg",
    },
  ],
};

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toTitleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeLabel(token: string) {
  const normalized = token
    .replace(/\baws\b/gi, "AWS")
    .replace(/\bazure\b/gi, "Azure")
    .replace(/\bgcp\b/gi, "GCP")
    .replace(/\bapi\b/gi, "API")
    .replace(/\bdb\b/gi, "DB");
  return toTitleCase(normalized);
}

function normalizeToken(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function laneForToken(token: string): DiagramLane {
  const lower = normalizeToken(token);
  if (
    lower.includes("gateway") ||
    lower.includes("front door") ||
    lower.includes("route 53") ||
    lower.includes("load balancer") ||
    lower.includes("traffic manager") ||
    lower.includes("cdn") ||
    lower.includes("network")
  ) {
    return "edge";
  }

  if (
    lower.includes("lambda") ||
    lower.includes("app service") ||
    lower.includes("cloud run") ||
    lower.includes("cloud functions") ||
    lower.includes("functions") ||
    lower.includes("ec2") ||
    lower.includes("virtual machine") ||
    lower.includes("compute") ||
    lower.includes("eks") ||
    lower.includes("aks") ||
    lower.includes("gke")
  ) {
    return "application";
  }

  if (
    lower.includes("database") ||
    lower.includes("dynamodb") ||
    lower.includes("sql") ||
    lower.includes("cosmos") ||
    lower.includes("spanner") ||
    lower.includes("bigquery") ||
    lower.includes("storage") ||
    lower.includes("s3") ||
    lower.includes("service bus") ||
    lower.includes("event")
  ) {
    return "data";
  }

  if (
    lower.includes("monitor") ||
    lower.includes("cloudwatch") ||
    lower.includes("insights") ||
    lower.includes("log") ||
    lower.includes("trace") ||
    lower.includes("security") ||
    lower.includes("identity")
  ) {
    return "operations";
  }

  return "application";
}

function findIconRule(provider: ArchitectureProvider, token: string) {
  const normalizedToken = normalizeToken(token);
  const rules = PROVIDER_ICON_RULES[provider];
  let bestMatch: { rule: IconRule; length: number } | null = null;

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeToken(keyword);
      if (!normalizedToken.includes(normalizedKeyword)) {
        continue;
      }

      if (!bestMatch || normalizedKeyword.length > bestMatch.length) {
        bestMatch = {
          rule,
          length: normalizedKeyword.length,
        };
      }
    }
  }

  return bestMatch?.rule ?? null;
}

function uniqueByLabel(nodes: DiagramNode[]) {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    const key = node.label.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function collectNodesFromNarrative(provider: ArchitectureProvider, narrative: string) {
  const input = narrative.trim() || DEFAULT_NARRATIVE;
  const tokens = extractServiceTokens(provider, input).filter((token) => !LOW_SIGNAL_TOKENS.has(token));

  const buckets: Record<DiagramLane, DiagramNode[]> = {
    source: [{ id: "source-users", label: "Users", lane: "source" }],
    edge: [],
    application: [],
    data: [],
    operations: [],
  };

  for (const token of tokens) {
    const iconRule = findIconRule(provider, token);
    const lane = iconRule?.lane ?? laneForToken(token);

    if (lane === "source") {
      continue;
    }

    const iconPath = iconRule?.iconPath ?? LANE_ICON_FALLBACK[provider][lane];
    const label = iconRule?.label ?? normalizeLabel(token);

    buckets[lane].push({
      id: `node-${lane}-${buckets[lane].length + 1}`,
      label,
      lane,
      iconPath,
    });
  }

  for (const lane of ["edge", "application", "data", "operations"] as const) {
    const deduped = uniqueByLabel(buckets[lane]).slice(0, MAX_NODES_PER_LANE);
    buckets[lane] = deduped.map((node, index) => ({
      ...node,
      id: `node-${lane}-${index + 1}`,
    }));
  }

  const hasAnyGeneratedNodes =
    buckets.edge.length + buckets.application.length + buckets.data.length + buckets.operations.length > 0;

  if (!hasAnyGeneratedNodes) {
    return PROVIDER_DEFAULTS[provider].map((node) => ({ ...node }));
  }

  return [
    ...buckets.source,
    ...buckets.edge,
    ...buckets.application,
    ...buckets.data,
    ...buckets.operations,
  ];
}

function buildEdges(nodes: DiagramNode[]) {
  const byLane = {
    source: nodes.filter((node) => node.lane === "source"),
    edge: nodes.filter((node) => node.lane === "edge"),
    application: nodes.filter((node) => node.lane === "application"),
    data: nodes.filter((node) => node.lane === "data"),
    operations: nodes.filter((node) => node.lane === "operations"),
  };

  const edges: DiagramEdge[] = [];

  const mainSequence = [
    ...byLane.source.slice(0, 1),
    ...byLane.edge.slice(0, 1),
    ...byLane.application.slice(0, 1),
    ...byLane.data.slice(0, 1),
  ];

  for (let index = 0; index < mainSequence.length - 1; index += 1) {
    edges.push({
      from: mainSequence[index].id,
      to: mainSequence[index + 1].id,
      kind: "primary",
    });
  }

  for (const lane of [byLane.edge, byLane.application, byLane.data]) {
    for (let index = 0; index < lane.length - 1; index += 1) {
      edges.push({
        from: lane[index].id,
        to: lane[index + 1].id,
        kind: "secondary",
      });
    }
  }

  if (byLane.operations.length > 0) {
    const opsTarget = byLane.operations[0];
    for (const sourceNode of [...byLane.application.slice(0, 2), ...byLane.data.slice(0, 2)]) {
      edges.push({
        from: sourceNode.id,
        to: opsTarget.id,
        kind: "secondary",
      });
    }
  }

  return edges;
}

function wrapLabelLines(label: string, maxChars = 24) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [label];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

function renderFallbackNodeIcon(input: {
  x: number;
  y: number;
  accent: string;
  label: string;
}) {
  const initials = input.label
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return [
    `<circle cx="${input.x + 17}" cy="${input.y + 17}" r="17" fill="${input.accent}" opacity="0.18" />`,
    `<text x="${input.x + 17}" y="${input.y + 22}" text-anchor="middle" fill="${input.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11" font-weight="700">${escapeXml(initials || "N")}</text>`,
  ].join("");
}

function renderSvg(input: {
  provider: ArchitectureProvider;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}) {
  const theme = PROVIDER_THEMES[input.provider];

  const width = 1440;
  const laneHeight = 146;
  const laneGap = 20;
  const topPadding = 112;
  const leftPadding = 40;
  const innerWidth = width - leftPadding * 2;
  const height = topPadding + LANE_ORDER.length * (laneHeight + laneGap) + 70;

  const laneY = new Map<DiagramLane, number>();
  LANE_ORDER.forEach((lane, index) => {
    laneY.set(lane, topPadding + index * (laneHeight + laneGap));
  });

  const byLane = LANE_ORDER.map((lane) => ({
    lane,
    nodes: input.nodes.filter((node) => node.lane === lane),
  }));

  const nodeRects = new Map<string, { x: number; y: number; width: number; height: number }>();

  const laneBlocks = byLane
    .map(({ lane }) => {
      const y = laneY.get(lane) ?? topPadding;
      return [
        `<rect x="${leftPadding}" y="${y}" width="${innerWidth}" height="${laneHeight}" rx="18" fill="${theme.laneFill}" stroke="${theme.laneStroke}" stroke-width="1.5" />`,
        `<text x="${leftPadding + 18}" y="${y + 26}" fill="${theme.textMuted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-weight="700" font-size="13" letter-spacing="0.08em">${LANE_LABELS[lane].toUpperCase()}</text>`,
      ].join("");
    })
    .join("");

  const nodeWidth = 244;
  const nodeHeight = 82;
  const nodesSvg = byLane
    .map(({ lane, nodes }) => {
      if (nodes.length === 0) {
        return "";
      }

      const y = (laneY.get(lane) ?? topPadding) + 42;
      const usableWidth = innerWidth - 80;
      const step = nodes.length === 1 ? 0 : Math.max(210, (usableWidth - nodeWidth) / (nodes.length - 1));
      const startX = leftPadding + 40;

      return nodes
        .map((node, index) => {
          const x = startX + step * index;
          nodeRects.set(node.id, { x, y, width: nodeWidth, height: nodeHeight });

          const lines = wrapLabelLines(node.label);
          const textX = x + 68;
          const textY = y + 36 - (lines.length - 1) * 8;
          const labelText = lines
            .map(
              (line, lineIndex) =>
                `<tspan x="${textX}" y="${textY + lineIndex * 18}">${escapeXml(line)}</tspan>`,
            )
            .join("");

          const icon = node.iconPath
            ? `<image href="${escapeXml(node.iconPath)}" x="${x + 15}" y="${y + 25}" width="26" height="26" preserveAspectRatio="xMidYMid meet" />`
            : renderFallbackNodeIcon({ x: x + 10, y: y + 23, accent: theme.accent, label: node.label });

          return [
            `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="14" fill="${theme.nodeFill}" stroke="${theme.nodeStroke}" stroke-width="1.5" filter="url(#node-shadow)" />`,
            `<rect x="${x}" y="${y}" width="${nodeWidth}" height="12" rx="12" fill="${theme.accentSoft}" />`,
            `<rect x="${x + 10}" y="${y + 22}" width="38" height="38" rx="11" fill="#ffffff" stroke="${theme.nodeStroke}" stroke-width="1" />`,
            icon,
            `<text x="${textX}" y="${y + 44}" fill="${theme.textStrong}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="14" font-weight="700">${labelText}</text>`,
          ].join("");
        })
        .join("");
    })
    .join("");

  const edgesSvg = input.edges
    .map((edge) => {
      const from = nodeRects.get(edge.from);
      const to = nodeRects.get(edge.to);
      if (!from || !to) {
        return "";
      }

      const startX = from.x + from.width;
      const startY = from.y + from.height / 2;
      const endX = to.x;
      const endY = to.y + to.height / 2;
      const dx = Math.max(52, Math.abs(endX - startX) * 0.4);
      const path = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
      const dash = edge.kind === "secondary" ? ' stroke-dasharray="7 6" opacity="0.9"' : "";
      const marker = edge.kind === "secondary" ? "arrow-secondary" : "arrow-primary";

      return `<path d="${path}" fill="none" stroke="${theme.accent}" stroke-width="2"${dash} marker-end="url(#${marker})" />`;
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(input.title)}">`,
    "<defs>",
    '<filter id="node-shadow" x="-20%" y="-20%" width="140%" height="160%">',
    '<feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-opacity="0.12"/>',
    "</filter>",
    '<marker id="arrow-primary" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">',
    `<path d="M0,0 L8,4 L0,8 Z" fill="${theme.accent}" />`,
    "</marker>",
    '<marker id="arrow-secondary" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">',
    `<path d="M0,0 L7,3.5 L0,7 Z" fill="${theme.accent}" />`,
    "</marker>",
    "</defs>",
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.background}" />`,
    `<rect x="0" y="0" width="${width}" height="74" fill="${theme.accentSoft}" />`,
    `<text x="34" y="45" fill="${theme.textStrong}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="31" font-weight="760">${escapeXml(input.title)}</text>`,
    `<text x="34" y="66" fill="${theme.textMuted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="13">Provider-authentic service icon mapping with deterministic flow layout</text>`,
    `<text x="${width - 148}" y="45" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" font-weight="760">${input.provider.toUpperCase()}</text>`,
    laneBlocks,
    edgesSvg,
    nodesSvg,
    `<text x="34" y="${height - 16}" fill="${theme.textMuted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11">Icons sourced from official ${input.provider.toUpperCase()} architecture icon packs.</text>`,
    "</svg>",
  ].join("");
}

export function generateArchitectureDiagramFromNarrative(input: {
  provider: ArchitectureProvider;
  narrative: string;
}): GeneratedArchitectureDiagram {
  const trimmed = input.narrative.trim();
  const nodes = collectNodesFromNarrative(input.provider, trimmed);
  const edges = buildEdges(nodes);
  const title = `${input.provider.toUpperCase()} reference architecture`;
  const svg = renderSvg({
    provider: input.provider,
    title,
    nodes,
    edges,
  });

  return {
    provider: input.provider,
    svg,
    nodes,
    edges,
    title,
  };
}

export function makeGeneratedDiagramSvgFile(input: {
  provider: ArchitectureProvider;
  svg: string;
  at?: Date;
}) {
  const now = input.at ?? new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const filename = `generated-${input.provider}-architecture-${stamp}.svg`;
  return new File([input.svg], filename, {
    type: "image/svg+xml",
  });
}
