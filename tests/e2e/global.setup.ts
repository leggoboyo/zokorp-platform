import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import { Role } from "@prisma/client";
import { chromium, type FullConfig } from "@playwright/test";

import { db } from "../../lib/db";
import { hashPassword } from "../../lib/password-auth";
import {
  adminStorageStatePath,
  appBaseUrl,
  authDir,
  localAdminEmail,
  localAuthBootstrapEnabled,
  localPassword,
  localUserEmail,
  userStorageStatePath,
} from "./auth";

async function upsertVerifiedUser(input: {
  email: string;
  name: string;
  role?: Role;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const user = await db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      emailVerified: now,
      role: input.role ?? Role.USER,
    },
    create: {
      email: input.email,
      name: input.name,
      emailVerified: now,
      role: input.role ?? Role.USER,
    },
  });

  await db.userAuth.upsert({
    where: { userId: user.id },
    update: {
      passwordHash,
      passwordUpdatedAt: now,
      failedLoginAttempts: 0,
      lockedUntil: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
    create: {
      userId: user.id,
      passwordHash,
      passwordUpdatedAt: now,
    },
  });
}

async function signInAndSaveState(input: {
  email: string;
  password: string;
  storageStatePath: string;
}) {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.goto(new URL("/login?callbackUrl=/software", appBaseUrl).toString(), {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");
    await page.locator("#email").fill(input.email);
    await page.locator("#password").fill(input.password);

    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 }),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);
    await page.waitForLoadState("networkidle");

    await page.context().storageState({ path: input.storageStatePath });
  } finally {
    await browser.close();
  }
}

async function prepareLocalAccounts() {
  await db.$queryRaw`SELECT 1`;

  await upsertVerifiedUser({
    email: localUserEmail,
    name: "E2E Reviewer",
    password: localPassword,
  });
  await upsertVerifiedUser({
    email: localAdminEmail,
    name: "E2E Admin",
    role: Role.ADMIN,
    password: localPassword,
  });

  await signInAndSaveState({
    email: localUserEmail,
    password: localPassword,
    storageStatePath: userStorageStatePath,
  });
  await signInAndSaveState({
    email: localAdminEmail,
    password: localPassword,
    storageStatePath: adminStorageStatePath,
  });
}

async function prepareRemoteAccount(emailEnv: string | undefined, passwordEnv: string | undefined, storageStatePath: string) {
  if (!emailEnv || !passwordEnv) {
    return;
  }

  await signInAndSaveState({
    email: emailEnv,
    password: passwordEnv,
    storageStatePath,
  });
}

export default async function globalSetup(_config: FullConfig) {
  loadEnvConfig(process.cwd());

  rmSync(authDir, { recursive: true, force: true });
  mkdirSync(path.dirname(userStorageStatePath), { recursive: true });

  try {
    if (localAuthBootstrapEnabled) {
      await prepareLocalAccounts();
      return;
    }

    await prepareRemoteAccount(process.env.JOURNEY_EMAIL, process.env.JOURNEY_PASSWORD, userStorageStatePath);
    await prepareRemoteAccount(
      process.env.JOURNEY_ADMIN_EMAIL,
      process.env.JOURNEY_ADMIN_PASSWORD,
      adminStorageStatePath,
    );
  } catch (error) {
    console.warn("Playwright auth bootstrap skipped", error);
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}
