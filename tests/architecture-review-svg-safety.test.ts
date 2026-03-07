import { describe, expect, it } from "vitest";

import { extractSvgEvidenceFromBytes, isSafeSvgBytes } from "@/lib/architecture-review/server";
import { validateSvgMarkup } from "@/lib/architecture-review/svg-safety";

describe("architecture review svg safety", () => {
  it("accepts safe svg markup", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><text>api gateway</text></svg>';
    expect(validateSvgMarkup(svg)).toEqual({ ok: true });
  });

  it("rejects data uri references", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/svg+xml;base64,abcd" /><text>x</text></svg>';
    expect(validateSvgMarkup(svg)).toEqual({
      ok: false,
      error: "SVG with external or data URI references is not allowed.",
    });
  });

  it("extracts evidence from safe bytes", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><text>edge -> app</text></svg>';
    const bytes = new TextEncoder().encode(svg);
    expect(isSafeSvgBytes(bytes)).toBe(true);
    expect(extractSvgEvidenceFromBytes(bytes)).toEqual({
      text: "edge -> app",
      dimensions: { width: 800, height: 400 },
    });
  });

  it("throws on unsafe svg bytes", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.test/a.svg"/></svg>';
    const bytes = new TextEncoder().encode(svg);
    expect(() => extractSvgEvidenceFromBytes(bytes)).toThrowError("INVALID_SVG_FILE");
  });
});
