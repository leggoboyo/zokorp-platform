import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

describe("host routing proxy", () => {
  it("redirects apex traffic to canonical www and preserves path/query", () => {
    const request = new NextRequest("https://zokorp.com/pricing?plan=ftr", {
      headers: {
        host: "zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.zokorp.com/pricing?plan=ftr");
  });

  it("redirects app root traffic into the software hub", () => {
    const request = new NextRequest("https://app.zokorp.com/", {
      headers: {
        host: "app.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://app.zokorp.com/software");
  });

  it("redirects legacy Squarespace pages to the current marketing IA", () => {
    const request = new NextRequest("https://www.zokorp.com/about-us", {
      headers: {
        host: "www.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://www.zokorp.com/about");
  });

  it("redirects legacy blog pages to media", () => {
    const request = new NextRequest("https://www.zokorp.com/blog/gemma-2", {
      headers: {
        host: "www.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://www.zokorp.com/media");
  });

  it("redirects marketing-host auth pages to the app host", () => {
    const request = new NextRequest("https://www.zokorp.com/register?callbackUrl=%2Fsoftware", {
      headers: {
        host: "www.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://app.zokorp.com/register?callbackUrl=%2Fsoftware");
  });

  it("marks app-host page responses as noindex", () => {
    const request = new NextRequest("https://app.zokorp.com/contact", {
      headers: {
        host: "app.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
  });

  it("leaves canonical marketing traffic alone", () => {
    const request = new NextRequest("https://www.zokorp.com/contact", {
      headers: {
        host: "www.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBeNull();
  });
});
