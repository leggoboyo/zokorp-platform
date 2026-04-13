import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  appBaseUrl,
  attachPageDiagnostics,
  buildUrl,
  expectNoUnexpectedPageFailures,
  marketingBaseUrl,
  requiredMarketingRoutes,
} from "./helpers";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

async function expectNoSeriousViolations(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  const blockingViolations = result.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );

  expect(
    blockingViolations,
    `${label} should not have serious or critical accessibility violations`,
  ).toEqual([]);
}

test.describe("accessibility coverage", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Axe coverage runs on desktop to keep the suite fast and stable.");
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  for (const route of requiredMarketingRoutes) {
    test(`marketing route ${route.path} has no serious accessibility violations`, async ({ page }) => {
      const diagnostics = attachPageDiagnostics(page);

      await page.goto(buildUrl(marketingBaseUrl, route.path), { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expectNoSeriousViolations(page, route.path);
      expectNoUnexpectedPageFailures(diagnostics, `accessibility ${route.path}`);
    });
  }

  test("signed-out software bridge has no serious accessibility violations", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(appBaseUrl, "/software"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "See the product outcome before you create an account." })).toBeVisible();
    await expectNoSeriousViolations(page, "app /software");
    expectNoUnexpectedPageFailures(diagnostics, "accessibility app /software");
  });

  test("login page has no serious accessibility violations", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(appBaseUrl, "/login"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expectNoSeriousViolations(page, "app /login");
    expectNoUnexpectedPageFailures(diagnostics, "accessibility app /login");
  });
});
