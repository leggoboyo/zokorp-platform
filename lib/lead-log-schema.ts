import { db } from "@/lib/db";

type ExistsRow = { exists: boolean };

let ensurePromise: Promise<boolean> | null = null;

async function hasLeadLogTable() {
  const result = await db.$queryRaw<ExistsRow[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'LeadLog'
    ) AS "exists"
  `;

  return result[0]?.exists === true;
}

export async function ensureLeadLogSchemaReady() {
  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    try {
      return await hasLeadLogTable();
    } catch (error) {
      console.error("Failed to verify LeadLog schema readiness.", error);
      return false;
    }
  })();

  const ready = await ensurePromise;
  if (!ready) {
    ensurePromise = null;
  }

  return ready;
}
