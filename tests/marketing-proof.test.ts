import {
  ACTIVE_FOUNDER_PROOF_VARIANT,
  FOUNDER_PROOF_PAGE_CONTENT,
  FOUNDER_PROOF_VARIANTS,
} from "@/lib/marketing-proof";
import { describe, expect, it } from "vitest";

describe("marketing proof content", () => {
  it("ships all proof variants while keeping the conservative wording live", () => {
    expect(FOUNDER_PROOF_VARIANTS.conservative).toBeTruthy();
    expect(FOUNDER_PROOF_VARIANTS.default).toBeTruthy();
    expect(FOUNDER_PROOF_VARIANTS.stronger).toBeTruthy();
    expect(ACTIVE_FOUNDER_PROOF_VARIANT).toBe("conservative");
    expect(FOUNDER_PROOF_PAGE_CONTENT.home.statement).toBe(FOUNDER_PROOF_VARIANTS.conservative);
  });

  it("keeps the live proof copy free of endorsement or prestige theater language", () => {
    const liveCopy = [
      FOUNDER_PROOF_PAGE_CONTENT.home.statement,
      FOUNDER_PROOF_PAGE_CONTENT.home.support,
      FOUNDER_PROOF_PAGE_CONTENT.about.selectedBackground.statement,
      FOUNDER_PROOF_PAGE_CONTENT.services.statement,
      FOUNDER_PROOF_PAGE_CONTENT.contact.statement,
    ].join(" ");

    expect(liveCopy).not.toMatch(/trusted by/i);
    expect(liveCopy).not.toMatch(/world-class/i);
    expect(liveCopy).not.toMatch(/\belite\b/i);
    expect(liveCopy).not.toMatch(/endorsed by/i);
  });
});
