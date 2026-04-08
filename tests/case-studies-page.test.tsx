/* @vitest-environment node */

import { describe, expect, it } from "vitest";

import CaseStudiesPage from "@/app/case-studies/page";

describe("CaseStudiesPage", () => {
  it("permanently redirects the deferred route to /about", () => {
    expect(() => CaseStudiesPage()).toThrowError(/NEXT_REDIRECT/);
  });
});
