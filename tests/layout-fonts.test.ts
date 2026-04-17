import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("root layout fonts", () => {
  it("uses vendored local fonts so production builds do not depend on Google font fetches", () => {
    const layoutPath = path.join(process.cwd(), "app/layout.tsx");
    const layoutSource = readFileSync(layoutPath, "utf8");

    expect(layoutSource).toContain('from "next/font/local"');
    expect(layoutSource).not.toContain('from "next/font/google"');

    for (const fontPath of [
      "app/fonts/PlusJakartaSans-Regular.woff2",
      "app/fonts/PlusJakartaSans-Medium.woff2",
      "app/fonts/PlusJakartaSans-SemiBold.woff2",
      "app/fonts/PlusJakartaSans-Bold.woff2",
      "app/fonts/SpaceGrotesk-Regular.woff2",
      "app/fonts/SpaceGrotesk-Medium.woff2",
      "app/fonts/SpaceGrotesk-SemiBold.woff2",
      "app/fonts/SpaceGrotesk-Bold.woff2",
      "app/fonts/JetBrainsMono-Regular.woff2",
      "app/fonts/JetBrainsMono-Bold.woff2",
    ]) {
      expect(existsSync(path.join(process.cwd(), fontPath))).toBe(true);
    }
  });
});
