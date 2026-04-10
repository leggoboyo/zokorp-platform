import { describe, expect, it } from "vitest";

import {
  buildDeterministicNarrative,
  buildDeterministicReviewFindings,
  extractServiceTokens,
} from "@/lib/architecture-review/engine";

describe("architecture deterministic engine", () => {
  it("extracts AWS service tokens from OCR text", () => {
    const tokens = extractServiceTokens(
      "aws",
      "API Gateway routes requests to Lambda and stores output in DynamoDB while CloudWatch tracks latency.",
    );

    expect(tokens).toContain("api gateway");
    expect(tokens).toContain("lambda");
    expect(tokens).toContain("dynamodb");
    expect(tokens).toContain("cloudwatch");
  });

  it("routes non-architecture uploads into the consultation-only contradiction path", () => {
    const findings = buildDeterministicReviewFindings({
      provider: "aws",
      paragraph: "Clients call HTTPS through a load balancer and the service stores state.",
      ocrText: "Expanded Tradeline List Total Unsecured Debt $42,200 Balance Utilization Account number JPMCB CARD",
      serviceTokens: [],
      metadata: {
        title: "Payments API",
        owner: "Platform Team",
        lastUpdated: "2026-03-06",
        version: "v1.0",
        legend: "",
      },
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "shared:diagram_narrative_core_component_mismatch",
          pointsDeducted: 5,
        }),
      ]),
    );
    expect(findings).toHaveLength(1);

    const narrative = buildDeterministicNarrative({
      provider: "aws",
      paragraph: "Clients call HTTPS through a load balancer and the service stores state.",
      ocrText: "Expanded Tradeline List Total Unsecured Debt $42,200 Balance Utilization Account number JPMCB CARD",
      serviceTokens: [],
      metadata: {
        title: "Payments API",
        owner: "Platform Team",
        lastUpdated: "2026-03-06",
        version: "v1.0",
        legend: "",
      },
    });

    expect(narrative.toLowerCase()).toContain("could not trust");
    expect(narrative.toLowerCase()).toContain("architecture diagram");
  });

  it("flags explicit blocker-grade AWS anti-patterns", () => {
    const findings = buildDeterministicReviewFindings({
      provider: "aws",
      paragraph:
        "Production web traffic uses HTTP only through an ALB. The app runs on a single EC2 instance, RDS is in a public subnet, backups do not exist, and SSH 0.0.0.0/0 is allowed.",
      ocrText: "ALB EC2 RDS public subnet SSH 0.0.0.0/0 no backups single instance",
      serviceTokens: ["alb", "ec2", "rds"],
      metadata: {
        title: "Legacy web app",
        owner: "Platform",
        lastUpdated: "2026-03-06",
        version: "v1.0",
        legend: "",
        environment: "prod",
      },
    });

    expect(findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining([
        "aws:internet_facing_endpoint_without_tls",
        "aws:public_database_exposure",
        "aws:unrestricted_admin_ports_from_internet",
        "aws:single_instance_production_compute",
        "aws:no_backup_strategy_for_stateful_data",
      ]),
    );
  });

  it("does not deduct explicit good AWS baseline controls", () => {
    const findings = buildDeterministicReviewFindings({
      provider: "aws",
      paragraph:
        "Production traffic enters CloudFront and an ALB over HTTPS/TLS with ACM. Compute runs across multiple AZs behind an Auto Scaling Group. RDS is Multi-AZ and encrypted at rest with KMS. CloudTrail is multi-region, logs go to CloudWatch Logs, alarms notify via SNS, and secrets live in Secrets Manager.",
      ocrText: "CloudFront ALB HTTPS TLS ACM Auto Scaling Group RDS Multi-AZ KMS CloudTrail CloudWatch Logs SNS Secrets Manager",
      serviceTokens: ["cloudfront", "alb", "rds", "cloudtrail", "cloudwatch", "secrets manager"],
      metadata: {
        title: "Production API",
        owner: "Platform",
        lastUpdated: "2026-03-06",
        version: "v1.0",
        legend: "",
        environment: "prod",
      },
    });

    expect(findings.some((finding) => finding.ruleId === "aws:internet_facing_endpoint_without_tls")).toBe(false);
    expect(findings.some((finding) => finding.ruleId === "aws:single_instance_production_compute")).toBe(false);
    expect(findings.some((finding) => finding.ruleId === "aws:single_az_database_for_production")).toBe(false);
    expect(findings.some((finding) => finding.ruleId === "aws:secrets_management_centralized")).toBe(false);
    expect(findings.some((finding) => finding.ruleId === "aws:cloudtrail_multi_region_enabled")).toBe(false);
  });

  it("uses a low-signal narrative fallback instead of echoing gibberish", () => {
    const bundle = {
      provider: "aws" as const,
      paragraph: "rfejiogfje",
      ocrText: "CloudFront routes static requests to S3 and ALB forwards API calls to EC2 in production.",
      serviceTokens: ["cloudfront", "s3", "alb", "ec2"],
      metadata: {
        title: "Edge + API Architecture",
        owner: "Platform Team",
        lastUpdated: "2026-03-06",
        version: "v1.0",
        legend: "",
      },
    };

    const narrative = buildDeterministicNarrative(bundle);
    expect(narrative.toLowerCase()).toContain("low-signal");
    expect(narrative).not.toContain("rfejiogfje");
  });
});
