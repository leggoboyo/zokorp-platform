import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

describe("root-domain redirect middleware", () => {
  it("redirects apex traffic to app.zokorp.com and preserves path/query", () => {
    const request = new NextRequest("https://zokorp.com/pricing?plan=ftr", {
      headers: {
        host: "zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://app.zokorp.com/pricing?plan=ftr");
  });

  it("leaves canonical app traffic alone", () => {
    const request = new NextRequest("https://app.zokorp.com/contact", {
      headers: {
        host: "app.zokorp.com",
      },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
