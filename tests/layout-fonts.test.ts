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
      "app/fonts/PlusJakartaSans-Regular.ttf",
      "app/fonts/PlusJakartaSans-Medium.ttf",
      "app/fonts/PlusJakartaSans-SemiBold.ttf",
      "app/fonts/PlusJakartaSans-Bold.ttf",
      "app/fonts/SpaceGrotesk-Regular.ttf",
      "app/fonts/SpaceGrotesk-Medium.ttf",
      "app/fonts/SpaceGrotesk-SemiBold.ttf",
      "app/fonts/SpaceGrotesk-Bold.ttf",
      "app/fonts/JetBrainsMono-Regular.ttf",
      "app/fonts/JetBrainsMono-Medium.ttf",
      "app/fonts/JetBrainsMono-Bold.ttf",
    ]) {
      expect(existsSync(path.join(process.cwd(), fontPath))).toBe(true);
    }
  });
});
