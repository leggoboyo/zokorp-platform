/* @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  diagnoseAuditCredentialFailure,
  resolveAuditDatabaseUrl,
  withSingleConnection,
} from "@/scripts/audit_account_support.mjs";

describe("audit account support helpers", () => {
  it("adds a single-connection guard without dropping existing query params", () => {
    const value = withSingleConnection("postgresql://audit:secret@db.example.com:5432/zokorp?sslmode=require");

    expect(value).toContain("sslmode=require");
    expect(value).toContain("connection_limit=1");
  });

  it("prefers explicit production db overrides before runtime fallbacks", () => {
    const value = resolveAuditDatabaseUrl({
      auditEnv: {
        PRODUCTION_DIRECT_DATABASE_URL: "postgresql://audit:secret@direct.example.com:5432/zokorp",
      },
      runtimeEnv: {
        ...process.env,
        DATABASE_URL: "postgresql://runtime:secret@runtime.example.com:5432/zokorp",
      },
      pulledEnv: {
        DATABASE_URL: "postgresql://pulled:secret@pulled.example.com:5432/zokorp",
      },
    });

    expect(value).toContain("direct.example.com");
    expect(value).toContain("connection_limit=1");
  });

  it("turns credential 401s into an explicit rerun-setup operator message", () => {
    const message = diagnoseAuditCredentialFailure({
      currentUrl: "https://app.zokorp.com/login",
      responseFailures: [
        {
          url: "https://app.zokorp.com/api/auth/callback/credentials",
          status: 401,
        },
      ],
    } as any);

    expect(message).toContain("401 at /api/auth/callback/credentials");
    expect(message).toContain("rerun `npm run journey:setup:production`");
  });
});
