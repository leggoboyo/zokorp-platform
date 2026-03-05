import { describe, expect, it } from "vitest";

import { buildDeterministicReviewFindings, extractServiceTokens } from "@/lib/architecture-review/engine";

describe("architecture deterministic engine", () => {
  it("extracts provider-relevant service tokens from OCR text", () => {
    const tokens = extractServiceTokens(
      "aws",
      "API Gateway routes requests to Lambda and stores output in DynamoDB. CloudWatch monitors latency.",
    );

    expect(tokens).toContain("api gateway");
    expect(tokens).toContain("lambda");
    expect(tokens).toContain("dynamodb");
    expect(tokens).toContain("cloudwatch");
  });

  it("adds deductions when metadata and core pillars are missing", () => {
    const findings = buildDeterministicReviewFindings({
      provider: "azure",
      paragraph: "Traffic enters app service then writes to SQL.",
      ocrText: "app service sql database", // intentionally sparse controls
      serviceTokens: ["app service", "sql database", "azure monitor", "key vault"],
      metadata: {
        title: "",
        owner: "",
        lastUpdated: "",
        version: "",
        legend: "",
      },
    });

    expect(findings.some((finding) => finding.ruleId === "MSFT-META-TITLE")).toBe(true);
    expect(findings.some((finding) => finding.ruleId === "PILLAR-SECURITY")).toBe(true);
    expect(findings.some((finding) => finding.ruleId === "PILLAR-RELIABILITY")).toBe(true);
  });
});
