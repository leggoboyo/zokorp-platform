import { describe, expect, it } from "vitest";

import {
  generateArchitectureDiagramFromNarrative,
  makeGeneratedDiagramSvgFile,
} from "@/lib/architecture-review/diagram-generator";

describe("architecture diagram generator", () => {
  it("generates deterministic svg output for the same narrative", () => {
    const input = {
      provider: "aws" as const,
      narrative:
        "Users call API Gateway, Lambda handles requests, DynamoDB stores records, and CloudWatch monitors errors.",
    };

    const first = generateArchitectureDiagramFromNarrative(input);
    const second = generateArchitectureDiagramFromNarrative(input);

    expect(first.svg).toBe(second.svg);
    expect(first.nodes.length).toBeGreaterThanOrEqual(4);
    expect(first.edges.length).toBeGreaterThan(0);
    expect(first.svg).toContain("AWS");
    expect(first.svg).toContain("API Gateway");
    expect(first.svg).toContain("data:image/svg+xml;base64,");
    expect(first.nodes.some((node) => node.label === "Lambda")).toBe(true);
  });

  it("falls back to provider defaults for low-signal narrative", () => {
    const generated = generateArchitectureDiagramFromNarrative({
      provider: "azure",
      narrative: "asdf qwer",
    });

    expect(generated.nodes.some((node) => /front door/i.test(node.label))).toBe(true);
    expect(generated.nodes.some((node) => /app service/i.test(node.label))).toBe(true);
    expect(generated.nodes.some((node) => /sql database/i.test(node.label))).toBe(true);
    expect(generated.svg).toContain("Application Insights");
  });

  it("creates downloadable svg files with stable metadata", () => {
    const generated = generateArchitectureDiagramFromNarrative({
      provider: "gcp",
      narrative: "Traffic enters API Gateway, Cloud Run serves requests, and Cloud SQL stores data.",
    });

    const file = makeGeneratedDiagramSvgFile({
      provider: "gcp",
      svg: generated.svg,
      at: new Date("2026-03-06T12:00:00.000Z"),
    });

    expect(file.type).toBe("image/svg+xml");
    expect(file.name).toMatch(/^generated-gcp-architecture-/);
    expect(file.name.endsWith(".svg")).toBe(true);
  });

  it("detects hybrid narratives and adds private connectivity source flow", () => {
    const generated = generateArchitectureDiagramFromNarrative({
      provider: "aws",
      narrative:
        "Users access an ALB while on-prem systems connect over private network links to services in a VPC with RDS.",
    });

    expect(generated.template).toBe("hybrid");
    expect(generated.nodes.some((node) => node.label === "On-Prem Systems")).toBe(true);
    expect(generated.edges.some((edge) => edge.label === "Private link")).toBe(true);
    expect(generated.svg).toContain("AWS Region");
    expect(generated.svg).toContain("VPC");
  });

  it("uses event-driven template for queue/stream narratives", () => {
    const generated = generateArchitectureDiagramFromNarrative({
      provider: "azure",
      narrative:
        "Clients call API Management, requests publish events to Service Bus, and function apps process event consumers into SQL Database.",
    });

    expect(generated.template).toBe("event-driven");
    expect(generated.svg).toContain("Event-driven layout");
    expect(generated.edges.some((edge) => edge.label === "Event consumers")).toBe(true);
  });
});
