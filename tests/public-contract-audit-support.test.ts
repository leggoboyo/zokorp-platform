/* @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  buildAuditIngestPayload,
  classifyAuditSummary,
} from "@/scripts/public_contract_audit_support.mjs";

describe("public contract audit support", () => {
  it("classifies fully passing audits as healthy", () => {
    const classification = classifyAuditSummary({
      steps: [
        {
          id: "marketing_home",
          label: "Marketing page: Homepage",
          status: "pass",
        },
      ],
    });

    expect(classification).toMatchObject({
      kind: "healthy",
      label: "healthy",
    });
  });

  it("treats 200 marker drift as an undeployed content mismatch", () => {
    const classification = classifyAuditSummary({
      steps: [
        {
          id: "marketing_services",
          label: "Marketing page: Services",
          status: "fail",
          statusCode: 200,
          error: "Expected page marker missing from response body.",
        },
      ],
    });

    expect(classification).toMatchObject({
      kind: "undeployed content mismatch",
    });
  });

  it("treats missing audit credentials or secrets as operator access limits", () => {
    const classification = classifyAuditSummary({
      steps: [
        {
          id: "journey_login",
          label: "Audit sign-in",
          status: "blocked",
          error:
            "401 at /api/auth/callback/credentials; trigger `browser-customer-journey-upkeep.yml` for the normal rotation path or rerun `npm run journey:setup:production` for manual local recovery.",
        },
      ],
    });

    expect(classification).toMatchObject({
      kind: "missing operator secret/provider access",
    });
  });

  it("treats redirect, canonical, or runtime failures as true regressions", () => {
    const classification = classifyAuditSummary({
      steps: [
        {
          id: "app_services_redirect",
          label: "App-host services route redirects to the marketing host",
          status: "fail",
          statusCode: 200,
          error: "Expected redirect to marketing host but received a normal page response.",
        },
      ],
    });

    expect(classification).toMatchObject({
      kind: "true regression",
    });
  });

  it("builds an ingest payload with the derived classification and run url", () => {
    const payload = buildAuditIngestPayload(
      {
        checkedAt: "2026-04-12T23:30:00.000Z",
        outcome: "fail",
        totals: {
          pass: 12,
          fail: 1,
          blocked: 0,
          skipped: 0,
        },
        baseUrls: {
          marketing: "https://www.zokorp.com",
          app: "https://app.zokorp.com",
          apex: "https://zokorp.com",
        },
        steps: [
          {
            id: "marketing_services",
            label: "Marketing page: Services",
            status: "fail",
            statusCode: 200,
            error: "Expected page marker missing from response body.",
            url: "https://www.zokorp.com/services",
          },
        ],
      },
      "production_smoke_check",
      {
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_REPOSITORY: "leggoboyo/zokorp-platform",
        GITHUB_RUN_ID: "1234567890",
      } as unknown as NodeJS.ProcessEnv,
    );

    expect(payload.classification.kind).toBe("undeployed content mismatch");
    expect(payload.environment).toBe("production");
    expect(payload.runUrl).toBe("https://github.com/leggoboyo/zokorp-platform/actions/runs/1234567890");
  });
});
