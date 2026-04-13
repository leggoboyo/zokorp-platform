import { expect, test } from "@playwright/test";

import {
  appBaseUrl,
  assertNoPlaceholderCopy,
  assertSingleH1,
  attachPageDiagnostics,
  buildCanonicalUrl,
  buildUrl,
  expectCanonical,
  expectNoUnexpectedPageFailures,
  expectedMarketingCanonicalBaseUrl,
  marketingBaseUrl,
  measureTextContrast,
  mutationMode,
  readLongestMotionDurations,
  requiredMarketingRoutes,
  singleOriginMode,
} from "./helpers";

const visualRoutes = [
  { path: "/", slug: "home" },
  { path: "/services", slug: "services" },
  { path: "/about", slug: "about" },
  { path: "/pricing", slug: "pricing" },
  { path: "/software", slug: "software" },
  { path: "/contact", slug: "contact" },
] as const;

test.describe("marketing surfaces", () => {
  test("homepage keeps CTA hierarchy, split desktop structure, and readable hero contrast", async ({ page }, testInfo) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(marketingBaseUrl, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    await assertNoPlaceholderCopy(page);
    await assertSingleH1(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('[data-surface="hero-copy"]').getByRole("link", { name: "Book a call" })).toBeVisible();
    await expect(page.locator('[data-surface="hero-copy"]').getByRole("link", { name: "View services" })).toBeVisible();
    await expect(page.url()).not.toContain("/login");
    await expectCanonical(page, buildCanonicalUrl(expectedMarketingCanonicalBaseUrl, "/"));

    if (!singleOriginMode) {
      expect(new URL(page.url()).host).toBe(new URL(marketingBaseUrl).host);
    }

    const headingContrast = await measureTextContrast(
      page,
      page.getByRole("heading", { level: 1 }),
      page.locator('[data-surface="hero-copy"]'),
    );
    expect(headingContrast).toBeGreaterThanOrEqual(3);

    const ledeContrast = await measureTextContrast(
      page,
      page.locator('[data-measure="lede"]'),
      page.locator('[data-surface="hero-copy"]'),
    );
    expect(ledeContrast).toBeGreaterThanOrEqual(4.5);

    if (testInfo.project.name.includes("desktop") || testInfo.project.name.includes("wide")) {
      const body = page.locator("[data-hero-body]");
      const rail = page.locator("[data-hero-rail]");
      await expect(rail).toBeVisible();

      const [bodyBox, railBox, ledeBox] = await Promise.all([
        body.boundingBox(),
        rail.boundingBox(),
        page.locator('[data-measure="lede"]').boundingBox(),
      ]);

      expect(bodyBox).not.toBeNull();
      expect(railBox).not.toBeNull();
      expect(ledeBox).not.toBeNull();
      expect((railBox?.x ?? 0) > (bodyBox?.x ?? 0)).toBe(true);
      expect((ledeBox?.width ?? 0) <= 760).toBe(true);
    }

    expectNoUnexpectedPageFailures(diagnostics, "homepage contract");
  });

  test("public navigation reaches key marketing routes without a login redirect", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(marketingBaseUrl, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    if (test.info().project.name.includes("mobile")) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("dialog", { name: "Mobile navigation" }).getByRole("link", { name: "Services", exact: true }).click();
    } else {
      await page.getByRole("banner").getByRole("link", { name: "Services", exact: true }).click();
    }

    await expect(page).toHaveURL(/\/services$/);

    await page.goto(buildUrl(marketingBaseUrl, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    if (test.info().project.name.includes("mobile")) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("dialog", { name: "Mobile navigation" }).getByRole("link", { name: "Support", exact: true }).click();
    } else {
      await page.getByRole("banner").getByRole("button", { name: "More" }).click();
      await page.getByLabel("More pages").getByRole("link", { name: "Support", exact: true }).click();
    }

    await expect(page).toHaveURL(/\/support$/);
    await expect(page.url()).not.toContain("/login");

    expectNoUnexpectedPageFailures(diagnostics, "navigation contract");
  });

  test("mobile menu closes on escape, click-away, and route change while keeping focus predictable", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "Mobile menu coverage only runs on the mobile project.");

    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(marketingBaseUrl, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const menuTrigger = page.getByRole("button", { name: "Menu" });
    await menuTrigger.click();

    const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuTrigger).toBeFocused();

    await menuTrigger.click();
    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    await page.mouse.click(
      Math.max(2, Math.floor((dialogBox?.x ?? 12) / 2)),
      Math.floor((dialogBox?.y ?? 0) + 120),
    );
    await expect(dialog).toBeHidden();

    await menuTrigger.click();
    await dialog.getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(dialog).toBeHidden();

    expectNoUnexpectedPageFailures(diagnostics, "mobile navigation");
  });

  test("required public routes stay public, readable, and canonicalized to www", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    for (const route of requiredMarketingRoutes) {
      await page.goto(buildUrl(marketingBaseUrl, route.path), { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await assertNoPlaceholderCopy(page);
      await expect(page.url()).not.toContain("/login");
      await expectCanonical(page, buildCanonicalUrl(expectedMarketingCanonicalBaseUrl, route.path));
    }

    expectNoUnexpectedPageFailures(diagnostics, "marketing route sweep");
  });

  for (const route of visualRoutes) {
    test(`${route.slug} full-page visuals stay stable`, async ({ page }, testInfo) => {
      const diagnostics = attachPageDiagnostics(page);
      const pageName = route.path === "/" ? "home" : route.slug;

      await page.goto(buildUrl(marketingBaseUrl, route.path), { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await assertSingleH1(page);

      await expect(page).toHaveScreenshot(`marketing-page-${pageName}-${testInfo.project.name}.png`, { fullPage: true });

      expectNoUnexpectedPageFailures(diagnostics, `${route.slug} visuals`);
    });
  }

  test("service request panel stays readonly by default while still validating required fields", async ({ page }) => {
    test.skip(mutationMode === "mutation", "Readonly validation applies only when mutation mode is disabled.");

    const diagnostics = attachPageDiagnostics(page);
    const requestUrls: string[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/services/requests")) {
        requestUrls.push(request.url());
      }
    });

    await page.goto(buildUrl(marketingBaseUrl, "/services"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const submitButton = page.getByRole("button", { name: /Submit service request/i });
    await submitButton.click();

    const titleField = page.getByLabel("Request title");
    await expect
      .poll(async () => titleField.evaluate((element) => (element as HTMLInputElement).validationMessage.length > 0))
      .toBe(true);

    await page.getByLabel("Work email").fill("tester@zokorp-example.com");
    await page.getByLabel("Your name").fill("ZoKorp Test");
    await page.getByLabel("Company").fill("ZoKorp QA");
    await titleField.fill("Architecture review request for QA validation");
    await page.getByLabel("What do you need?").fill(
      "We need a founder-led AWS architecture review with remediation planning, timeline guidance, and delivery constraints.",
    );

    const form = page.locator("#service-request form");
    await expect
      .poll(async () => form.evaluate((node) => (node as HTMLFormElement).checkValidity()))
      .toBe(true);
    await expect(submitButton).toBeEnabled();
    expect(requestUrls).toEqual([]);

    expectNoUnexpectedPageFailures(diagnostics, "service request readonly validation");
  });

  test("founder portrait stays visible and balanced on the about page", async ({ page }, testInfo) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(marketingBaseUrl, "/about"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const portrait = page.getByRole("img", { name: /Zohaib Khawaja/i });
    await expect(portrait).toBeVisible();

    const box = await portrait.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) > (testInfo.project.name.includes("mobile") ? 180 : 220)).toBe(true);
    expect((box?.height ?? 0) > 260).toBe(true);
    expect(((box?.height ?? 1) / (box?.width ?? 1)) < 2.3).toBe(true);
    expect(((box?.height ?? 1) / (box?.width ?? 1)) > 1.05).toBe(true);

    const naturalSize = await portrait.evaluate((element) => ({
      width: (element as HTMLImageElement).naturalWidth,
      height: (element as HTMLImageElement).naturalHeight,
    }));
    expect(naturalSize.width).toBeGreaterThan(0);
    expect(naturalSize.height).toBeGreaterThan(0);

    await expect(portrait).toHaveScreenshot(`founder-portrait-${testInfo.project.name}.png`);

    expectNoUnexpectedPageFailures(diagnostics, "about founder portrait");
  });

  test("reduced motion mode disables non-essential entrance motion", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(buildUrl(marketingBaseUrl, "/media"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const animatedHero = page.locator("section.animate-fade-up").first();
    await expect(animatedHero).toBeVisible();

    const motion = await readLongestMotionDurations(animatedHero);
    expect(motion.animationDuration).toBeLessThanOrEqual(0.001);
    expect(motion.transitionDuration).toBeLessThanOrEqual(0.001);

    expectNoUnexpectedPageFailures(diagnostics, "reduced motion");
  });

  test("signed-out app routes remain app-focused without exposing marketing login redirects", async ({ page }) => {
    const diagnostics = attachPageDiagnostics(page);

    await page.goto(buildUrl(appBaseUrl, "/software"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Public product pages that show the outcome before you create an account." })).toBeVisible();

    await page.goto(buildUrl(appBaseUrl, "/account"), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Faccount|\/login\?callbackUrl=\/account/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    expectNoUnexpectedPageFailures(diagnostics, "signed-out app route contract");
  });
});
