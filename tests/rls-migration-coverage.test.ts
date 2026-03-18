import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const migrationPath = path.join(
  process.cwd(),
  "prisma",
  "migrations",
  "0012_enable_rls_on_public_tables",
  "migration.sql",
);

function loadPrismaModelNames() {
  const schema = fs.readFileSync(schemaPath, "utf8");

  return Array.from(schema.matchAll(/^model\s+(\w+)\s+\{/gm), (match) => match[1]);
}

describe("public table RLS hardening migration", () => {
  it("covers every current Prisma model plus _prisma_migrations", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");
    const expectedTables = new Set([...loadPrismaModelNames(), "_prisma_migrations"]);

    for (const tableName of expectedTables) {
      expect(migration).toContain(
        `ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`,
      );
    }
  });

  it("does not force RLS on owner or bypassrls roles", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");

    expect(migration).not.toMatch(
      /ALTER TABLE\s+"public"\."[^"]+"\s+FORCE\s+ROW\s+LEVEL\s+SECURITY;/i,
    );
  });
});
