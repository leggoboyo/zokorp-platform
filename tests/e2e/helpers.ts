import { expect, type Locator, type Page } from "@playwright/test";

export const marketingBaseUrl = process.env.JOURNEY_MARKETING_BASE_URL ?? "http://127.0.0.1:3000";
export const appBaseUrl = process.env.JOURNEY_APP_BASE_URL ?? marketingBaseUrl;
export const apexBaseUrl = process.env.JOURNEY_APEX_BASE_URL ?? "https://zokorp.com";
export const mutationMode = (process.env.E2E_MUTATION_MODE ?? "readonly").toLowerCase();

export const requiredMarketingRoutes = [
  { path: "/", heading: "AWS architecture, validation, and optimization for SMB teams that need a clear next step." },
  { path: "/services", heading: "Six clear offers. Each one is defined, scoped, and priced." },
  { path: "/about", heading: "Built by a technical founder who has spent time inside AWS, Microsoft, and real delivery work." },
  { path: "/contact", heading: "Start the right conversation without getting pushed into signup first." },
  { path: "/pricing", heading: "Public price anchors for consulting, and straightforward pricing for the software that is ready." },
  { path: "/software", heading: "Software that supports the consulting model instead of pretending to replace it." },
  { path: "/media", heading: "Guides, notes, and operating perspectives" },
  { path: "/privacy", heading: "Privacy overview" },
  { path: "/terms", heading: "Platform terms" },
  { path: "/refunds", heading: "Refund posture" },
  { path: "/security", heading: "Current platform security posture" },
  { path: "/support", heading: "Support lives with the platform" },
] as const;

export function sameOrigin(left: string, right: string) {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return false;
  }
}

export const singleOriginMode = sameOrigin(marketingBaseUrl, appBaseUrl);

function inferLocalCanonicalBaseUrl(baseUrl: string, subdomain: "www" | "app") {
  try {
    const url = new URL(baseUrl);
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      return null;
    }

    return `http://${subdomain}.${url.hostname}.nip.io${url.port ? `:${url.port}` : ""}`;
  } catch {
    return null;
  }
}

export const expectedMarketingCanonicalBaseUrl =
  process.env.JOURNEY_EXPECTED_MARKETING_CANONICAL_BASE_URL ??
  (singleOriginMode ? null : inferLocalCanonicalBaseUrl(marketingBaseUrl, "www")) ??
  "https://www.zokorp.com";
export const expectedAppCanonicalBaseUrl =
  process.env.JOURNEY_EXPECTED_APP_CANONICAL_BASE_URL ??
  (singleOriginMode ? null : inferLocalCanonicalBaseUrl(appBaseUrl, "app")) ??
  "https://app.zokorp.com";

export function buildUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

export function buildCanonicalUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

export function canonicalUrlsEquivalent(expectedHref: string, actualHref: string | null) {
  if (!actualHref) {
    return false;
  }

  try {
    const expected = new URL(expectedHref);
    const actual = new URL(actualHref);
    const expectedPath = expected.pathname === "" ? "/" : expected.pathname;
    const actualPath = actual.pathname === "" ? "/" : actual.pathname;

    return (
      expected.origin === actual.origin &&
      expectedPath === actualPath &&
      expected.search === actual.search &&
      expected.hash === actual.hash
    );
  } catch {
    return expectedHref === actualHref;
  }
}

export function normalizeRobots(value: string | null) {
  return value?.replaceAll(/\s+/g, "").toLowerCase() ?? null;
}

export function extractCanonicalHref(html: string) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null;
}

export function extractRobotsMeta(html: string) {
  return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null;
}

export function attachPageDiagnostics(page: Page) {
  const diagnostics = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
    requestFailures: [] as string[],
  };

  page.on("console", (message) => {
    const text = message.text();
    const isDevHmrNoise =
      text.includes("/_next/webpack-hmr") && text.includes("ERR_INVALID_HTTP_RESPONSE");

    if (message.type() === "error" && !isDevHmrNoise) {
      diagnostics.consoleErrors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push(error instanceof Error ? error.message : String(error));
  });

  page.on("requestfailed", (request) => {
    const failureText = request.failure()?.errorText ?? "unknown";
    const isSpeedInsightsDebugScript =
      failureText === "net::ERR_BLOCKED_BY_ORB" &&
      request.url().includes("va.vercel-scripts.com/v1/speed-insights/script.debug.js");

    if (failureText === "net::ERR_ABORTED" || isSpeedInsightsDebugScript) {
      return;
    }

    diagnostics.requestFailures.push(`${request.method()} ${request.url()} :: ${failureText}`);
  });

  return diagnostics;
}

export function expectNoUnexpectedPageFailures(
  diagnostics: ReturnType<typeof attachPageDiagnostics>,
  message: string,
) {
  expect(diagnostics.consoleErrors, `${message}: console errors`).toEqual([]);
  expect(diagnostics.pageErrors, `${message}: page errors`).toEqual([]);
  expect(diagnostics.requestFailures, `${message}: request failures`).toEqual([]);
}

export async function assertNoPlaceholderCopy(page: Page) {
  await expect(page.getByText(/Broad-launch replacement slot/i)).toHaveCount(0);
  await expect(page.getByText(/replace this block/i)).toHaveCount(0);
  await expect(page.getByText(/TODO replace/i)).toHaveCount(0);
}

export async function assertSingleH1(page: Page) {
  await expect(page.locator("h1")).toHaveCount(1);
}

export async function expectCanonical(page: Page, expectedHref: string) {
  const actualHref = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonicalUrlsEquivalent(expectedHref, actualHref)).toBe(true);
}

export async function expectRobotsMeta(page: Page, expectedValue: string) {
  const actualValue = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(normalizeRobots(actualValue)).toBe(normalizeRobots(expectedValue));
}

function parseRgb(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    return match.slice(1, 4).map((value) => Number.parseInt(value, 10));
  }

  const normalizedHex = color.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(normalizedHex)) {
    return normalizedHex
      .slice(1)
      .split("")
      .map((value) => Number.parseInt(`${value}${value}`, 16));
  }
  if (/^#[0-9a-f]{6}$/i.test(normalizedHex)) {
    return [
      Number.parseInt(normalizedHex.slice(1, 3), 16),
      Number.parseInt(normalizedHex.slice(3, 5), 16),
      Number.parseInt(normalizedHex.slice(5, 7), 16),
    ];
  }

  const labMatch = color.match(/lab\(\s*([-.\d]+%?)\s+([-.\d]+)\s+([-.\d]+)/i);
  if (labMatch) {
    const lightness = labMatch[1].endsWith("%")
      ? Number.parseFloat(labMatch[1])
      : Number.parseFloat(labMatch[1]);
    const a = Number.parseFloat(labMatch[2]);
    const b = Number.parseFloat(labMatch[3]);

    const fy = (lightness + 16) / 116;
    const fx = fy + (a / 500);
    const fz = fy - (b / 200);
    const epsilon = 216 / 24389;
    const kappa = 24389 / 27;

    const cubeOrLinear = (value: number) =>
      value ** 3 > epsilon ? value ** 3 : ((116 * value) - 16) / kappa;

    const xD50 = 0.96422 * cubeOrLinear(fx);
    const yD50 = lightness > (kappa * epsilon) ? fy ** 3 : lightness / kappa;
    const zD50 = 0.82521 * cubeOrLinear(fz);

    const x = (0.9555766 * xD50) + (-0.0230393 * yD50) + (0.0631636 * zD50);
    const y = (-0.0282895 * xD50) + (1.0099416 * yD50) + (0.0210077 * zD50);
    const z = (0.0122982 * xD50) + (-0.020483 * yD50) + (1.3299098 * zD50);

    const linearRed = (3.2404542 * x) + (-1.5371385 * y) + (-0.4985314 * z);
    const linearGreen = (-0.969266 * x) + (1.8760108 * y) + (0.041556 * z);
    const linearBlue = (0.0556434 * x) + (-0.2040259 * y) + (1.0572252 * z);

    const toChannel = (value: number) => {
      const clamped = Math.min(1, Math.max(0, value));
      const gammaCorrected =
        clamped <= 0.0031308
          ? 12.92 * clamped
          : (1.055 * (clamped ** (1 / 2.4))) - 0.055;

      return Math.round(gammaCorrected * 255);
    };

    return [toChannel(linearRed), toChannel(linearGreen), toChannel(linearBlue)];
  }

  throw new Error(`Unsupported color format: ${color}`);
}

function channelToLuminance(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToLuminance(rgb: number[]) {
  return (0.2126 * channelToLuminance(rgb[0])) + (0.7152 * channelToLuminance(rgb[1])) + (0.0722 * channelToLuminance(rgb[2]));
}

export async function measureTextContrast(page: Page, textLocator: Locator, backgroundLocator: Locator) {
  const [textHandle, backgroundHandle] = await Promise.all([
    textLocator.elementHandle(),
    backgroundLocator.elementHandle(),
  ]);

  if (!textHandle || !backgroundHandle) {
    throw new Error("Unable to resolve text or background element for contrast measurement.");
  }

  const colors = await page.evaluate(
    ([textElement, backgroundElement]) => {
      const normalizeColor = (value: string) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          return value;
        }

        context.fillStyle = "#000000";
        context.fillStyle = value;
        return context.fillStyle;
      };
      const textStyle = window.getComputedStyle(textElement as Element);
      const backgroundStyle = window.getComputedStyle(backgroundElement as Element);

      return {
        textColor: normalizeColor(textStyle.color),
        backgroundColor: normalizeColor(backgroundStyle.backgroundColor),
      };
    },
    [textHandle, backgroundHandle],
  );

  const foreground = parseRgb(colors.textColor);
  const background = parseRgb(colors.backgroundColor);
  const foregroundLuminance = rgbToLuminance(foreground);
  const backgroundLuminance = rgbToLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export async function readLongestMotionDurations(locator: Locator) {
  return await locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const animationDurations = style.animationDuration
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    const transitionDurations = style.transitionDuration
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);

    return {
      animationDuration: animationDurations.reduce((max, token) => {
        const value = token.endsWith("ms") ? Number.parseFloat(token) / 1000 : Number.parseFloat(token);
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 0),
      transitionDuration: transitionDurations.reduce((max, token) => {
        const value = token.endsWith("ms") ? Number.parseFloat(token) / 1000 : Number.parseFloat(token);
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 0),
    };
  });
}
