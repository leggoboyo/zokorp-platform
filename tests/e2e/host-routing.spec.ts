import { expect, test } from "@playwright/test";

import {
  appBaseUrl,
  apexBaseUrl,
  buildCanonicalUrl,
  buildUrl,
  expectedAppCanonicalBaseUrl,
  expectedMarketingCanonicalBaseUrl,
  extractCanonicalHref,
  extractRobotsMeta,
  normalizeRobots,
  singleOriginMode,
} from "./helpers";

const appHostMarketingRoutes = [
  "/services",
  "/about",
  "/contact",
  "/pricing",
  "/media",
  "/privacy",
  "/terms",
  "/refunds",
  "/security",
  "/support",
] as const;

test.describe("host routing contract", () => {
  test.skip(singleOriginMode, "Host-split routing checks require distinct marketing and app origins.");

  test("apex redirects to canonical www", async ({ request }) => {
    const response = await request.fetch(apexBaseUrl, {
      failOnStatusCode: false,
      maxRedirects: 0,
    });

    expect([301, 308]).toContain(response.status());
    expect(response.headers()["location"]).toBe(buildCanonicalUrl(expectedMarketingCanonicalBaseUrl, "/"));
  });

  test("app root renders the app landing page and stays canonical to app", async ({ page }) => {
    await page.goto(buildUrl(appBaseUrl, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Account access and software live here\./ })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      buildCanonicalUrl(expectedAppCanonicalBaseUrl, "/"),
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  });

  test("app-host marketing routes redirect to the public marketing host", async ({ request }) => {
    for (const path of appHostMarketingRoutes) {
      const response = await request.fetch(buildUrl(appBaseUrl, path), {
        failOnStatusCode: false,
        maxRedirects: 0,
      });

      expect(response.status(), `${path} should redirect from app host`).toBe(308);
      expect(response.headers()["location"]).toBe(buildCanonicalUrl(expectedMarketingCanonicalBaseUrl, path));
    }
  });

  test("app host stays off the crawl surface except for the software bridge", async ({ request }) => {
    const robotsResponse = await request.get(buildUrl(appBaseUrl, "/robots.txt"), {
      failOnStatusCode: false,
    });
    const robotsBody = await robotsResponse.text();

    expect(robotsResponse.status()).toBe(200);
    expect(robotsBody).toContain("Disallow: /account");
    expect(robotsBody).not.toContain("Host:");
    expect(robotsBody).not.toContain("Sitemap:");

    const sitemapResponse = await request.get(buildUrl(appBaseUrl, "/sitemap.xml"), {
      failOnStatusCode: false,
    });
    expect(sitemapResponse.status()).toBe(404);
  });

  test("app-host software bridge remains canonicalized to marketing and noindex", async ({ request }) => {
    const response = await request.get(buildUrl(appBaseUrl, "/software"), {
      failOnStatusCode: false,
    });
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toBe("noindex, follow");
    expect(extractCanonicalHref(html)).toBe(buildCanonicalUrl(expectedMarketingCanonicalBaseUrl, "/software"));
    expect(normalizeRobots(extractRobotsMeta(html))).toBe("noindex,follow");
  });

  test("protected app routes redirect to sign-in with callback URLs", async ({ request }) => {
    const accountResponse = await request.fetch(buildUrl(appBaseUrl, "/account"), {
      failOnStatusCode: false,
      maxRedirects: 0,
    });
    expect(accountResponse.status()).toBe(307);
    expect(accountResponse.headers()["location"]).toContain("/login?callbackUrl=%2Faccount");

    const billingResponse = await request.fetch(buildUrl(appBaseUrl, "/account/billing"), {
      failOnStatusCode: false,
      maxRedirects: 0,
    });
    expect(billingResponse.status()).toBe(307);
    expect(billingResponse.headers()["location"]).toContain("/login?callbackUrl=%2Faccount%2Fbilling");
  });
});
