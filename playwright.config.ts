import { defineConfig, devices } from "@playwright/test";

function isLocalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

const marketingBaseUrl = process.env.JOURNEY_MARKETING_BASE_URL ?? "http://127.0.0.1:3000";
const appBaseUrl = process.env.JOURNEY_APP_BASE_URL ?? marketingBaseUrl;
const shouldLaunchLocalServer = isLocalUrl(marketingBaseUrl) && isLocalUrl(appBaseUrl);
const localDevUrl = shouldLaunchLocalServer ? new URL(marketingBaseUrl) : null;
const localDevHost = localDevUrl?.hostname ?? "127.0.0.1";
const localDevPort = localDevUrl?.port || "3000";
const defaultLocalAdminEmail = process.env.E2E_LOCAL_ADMIN_EMAIL ?? "e2e-admin@acmecloud.com";

if (shouldLaunchLocalServer && !process.env.ZOKORP_ADMIN_EMAILS) {
  process.env.ZOKORP_ADMIN_EMAILS = defaultLocalAdminEmail;
}

const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
);

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global.setup.ts",
  fullyParallel: true,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"]],
  retries: process.env.CI ? 1 : 0,
  outputDir: "output/playwright/test-results",
  use: {
    baseURL: marketingBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
    headless: process.env.PLAYWRIGHT_HEADLESS !== "false",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 960 },
      },
    },
    {
      name: "wide-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: shouldLaunchLocalServer
    ? {
        command: `npm run dev -- --hostname ${localDevHost} --port ${localDevPort}`,
        url: marketingBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: webServerEnv,
      }
    : undefined,
});
