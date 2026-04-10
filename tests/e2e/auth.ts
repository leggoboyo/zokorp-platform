import { existsSync } from "node:fs";
import path from "node:path";

export function isLocalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

export const marketingBaseUrl = process.env.JOURNEY_MARKETING_BASE_URL ?? "http://127.0.0.1:3000";
export const appBaseUrl = process.env.JOURNEY_APP_BASE_URL ?? marketingBaseUrl;
export const authDir = path.join(process.cwd(), "tests/e2e/.auth");
export const userStorageStatePath = path.join(authDir, "user.json");
export const adminStorageStatePath = path.join(authDir, "admin.json");
export const localUserEmail = process.env.E2E_LOCAL_USER_EMAIL ?? "e2e-owner@acmecloud.com";
export const localAdminEmail = process.env.E2E_LOCAL_ADMIN_EMAIL ?? "e2e-admin@acmecloud.com";
export const localPassword = process.env.E2E_LOCAL_PASSWORD ?? "LocalE2E!Pass123";
export const localAuthBootstrapEnabled = isLocalUrl(marketingBaseUrl) && isLocalUrl(appBaseUrl);

export function hasUserStorageState() {
  return existsSync(userStorageStatePath);
}

export function hasAdminStorageState() {
  return existsSync(adminStorageStatePath);
}
