import { describe, expect, it } from "vitest";

import { isStrictDiagramFile } from "@/lib/architecture-review/client";

function createPngHeader() {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
}

describe("architecture diagram file validation", () => {
  it("accepts valid png files", async () => {
    const file = new File([createPngHeader()], "diagram.png", { type: "image/png" });
    await expect(isStrictDiagramFile(file)).resolves.toEqual({
      ok: true,
      format: "png",
      mimeType: "image/png",
    });
  });

  it("accepts valid svg files", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><text>api gateway</text></svg>';
    const file = new File([svg], "diagram.svg", { type: "image/svg+xml" });
    await expect(isStrictDiagramFile(file)).resolves.toEqual({
      ok: true,
      format: "svg",
      mimeType: "image/svg+xml",
    });
  });

  it("rejects unsafe svg files", async () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><text>api gateway</text></svg>';
    const file = new File([svg], "diagram.svg", { type: "image/svg+xml" });
    await expect(isStrictDiagramFile(file)).resolves.toEqual({
      ok: false,
      error: "SVG with script tags is not allowed.",
    });
  });
});
