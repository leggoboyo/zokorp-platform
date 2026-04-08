/* @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  APP_PRODUCT_EXPECTATIONS,
  APP_ROUTE_EXPECTATIONS,
  LEGACY_REDIRECT_EXPECTATIONS,
  MARKETING_ROUTE_EXPECTATIONS,
} from "@/scripts/playwright_audit_contract.mjs";
import { runProductionSmokeCheck } from "@/scripts/production_smoke_check.mjs";

function mockResponse({
  status = 200,
  url,
  body = "",
  headers = {},
}: {
  status?: number;
  url: string;
  body?: string;
  headers?: Record<string, string>;
}) {
  const response = new Response(body, {
    status,
    headers,
  });
  Object.defineProperty(response, "url", {
    value: url,
  });
  return response;
}

describe("runProductionSmokeCheck", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes for a same-origin local target and skips host-split-only checks", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === "http://example.com" || url === "https://vercel.com") {
        return mockResponse({ url, body: "ok" });
      }

      if (url.endsWith("/robots.txt")) {
        return mockResponse({
          url,
          body: "User-agent: *\nSitemap: https://www.zokorp.com/sitemap.xml\n",
        });
      }

      if (url.endsWith("/sitemap.xml")) {
        return mockResponse({
          url,
          body: "<urlset><url><loc>https://www.zokorp.com/</loc></url></urlset>",
        });
      }

      if (init?.redirect === "manual") {
        for (const redirect of LEGACY_REDIRECT_EXPECTATIONS) {
          if (url === `http://127.0.0.1:3000${redirect.from}`) {
            return mockResponse({
              status: 308,
              url,
              headers: { location: `http://127.0.0.1:3000${redirect.to}` },
            });
          }
        }
      }

      for (const route of MARKETING_ROUTE_EXPECTATIONS) {
        if (url === `http://127.0.0.1:3000${route.path}`) {
          return mockResponse({ url, body: route.marker });
        }
      }

      for (const route of APP_ROUTE_EXPECTATIONS) {
        if (url === `http://127.0.0.1:3000${route.path}`) {
          return mockResponse({ url, body: route.marker });
        }
      }

      for (const product of APP_PRODUCT_EXPECTATIONS) {
        if (url === `http://127.0.0.1:3000${product.path}`) {
          return mockResponse({ url, body: product.titleMarker });
        }
      }

      throw new Error(`Unexpected fetch URL in local smoke test: ${url}`);
    });

    const summary = await runProductionSmokeCheck({
      marketingBaseUrl: "http://127.0.0.1:3000",
      appBaseUrl: "http://127.0.0.1:3000",
      apexBaseUrl: "",
      timeoutMs: 5000,
    });

    expect(summary.outcome).toBe("pass");
    expect(summary.steps.find((step) => step.id === "app_root_redirect")?.status).toBe("skipped");
    expect(summary.steps.find((step) => step.id === "app_noindex")?.status).toBe("skipped");
  });

  it("marks production marketing-host drift as blocked instead of failed", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const redirectMode = init?.redirect ?? "follow";

      if (url === "http://example.com" || url === "https://vercel.com") {
        return mockResponse({ url, body: "ok" });
      }

      if (redirectMode === "manual") {
        if (url === "https://zokorp.com") {
          return mockResponse({
            status: 301,
            url,
            headers: { location: "https://www.zokorp.com/" },
          });
        }

        if (url === "https://app.zokorp.com") {
          return mockResponse({
            status: 308,
            url,
            headers: { location: "https://app.zokorp.com/software" },
          });
        }

        for (const redirect of LEGACY_REDIRECT_EXPECTATIONS) {
          if (url === `https://www.zokorp.com${redirect.from}`) {
            return mockResponse({
              status: 308,
              url,
              headers: { location: `https://app.zokorp.com${redirect.to}` },
            });
          }
        }
      }

      if (url.endsWith("/robots.txt")) {
        return mockResponse({
          url: "https://app.zokorp.com/robots.txt",
          body: "User-agent: *\nSitemap: https://www.zokorp.com/sitemap.xml\n",
        });
      }

      if (url.endsWith("/sitemap.xml")) {
        return mockResponse({
          url: "https://app.zokorp.com/sitemap.xml",
          body: "<urlset><url><loc>https://www.zokorp.com/</loc></url></urlset>",
        });
      }

      for (const route of MARKETING_ROUTE_EXPECTATIONS) {
        if (url === `https://www.zokorp.com${route.path}`) {
          return mockResponse({
            url: `https://app.zokorp.com${route.path}`,
            body: route.marker,
          });
        }
      }

      for (const route of APP_ROUTE_EXPECTATIONS) {
        if (url === `https://app.zokorp.com${route.path}`) {
          return mockResponse({
            url,
            body: route.marker,
          });
        }
      }

      for (const product of APP_PRODUCT_EXPECTATIONS) {
        if (url === `https://app.zokorp.com${product.path}`) {
          return mockResponse({
            url,
            body: product.titleMarker,
          });
        }
      }

      if (url === "https://app.zokorp.com/contact") {
        return mockResponse({
          url,
          body: "Start the right conversation without getting pushed into signup first.",
          headers: { "x-robots-tag": "noindex, follow" },
        });
      }

      throw new Error(`Unexpected fetch URL in blocked smoke test: ${url}`);
    });

    const summary = await runProductionSmokeCheck({
      marketingBaseUrl: "https://www.zokorp.com",
      appBaseUrl: "https://app.zokorp.com",
      apexBaseUrl: "https://zokorp.com",
      timeoutMs: 5000,
    });

    expect(summary.outcome).toBe("blocked");
    expect(summary.steps.find((step) => step.id === "marketing_homepage")?.status).toBe("blocked");
    expect(summary.steps.some((step) => step.status === "fail")).toBe(false);
  });
});
