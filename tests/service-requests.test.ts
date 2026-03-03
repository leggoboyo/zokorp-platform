import { describe, expect, it } from "vitest";

import { generateServiceTrackingCode } from "@/lib/service-requests";

describe("service request helpers", () => {
  it("generates stable tracking code prefix", () => {
    const code = generateServiceTrackingCode(new Date("2026-03-03T00:00:00.000Z"));

    expect(code).toMatch(/^SR-260303-[A-Z0-9]{5}$/);
  });
});
