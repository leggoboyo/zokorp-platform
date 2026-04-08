/* @vitest-environment node */

import { describe, expect, it } from "vitest";

import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as emailPreferencesMetadata } from "@/app/email-preferences/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as softwareMetadata } from "@/app/software/page";

describe("marketing metadata", () => {
  it("uses the www host for public page canonicals", () => {
    expect(aboutMetadata.alternates?.canonical).toBe("https://www.zokorp.com/about");
    expect(softwareMetadata.alternates?.canonical).toBe("https://www.zokorp.com/software");
    expect(emailPreferencesMetadata.alternates?.canonical).toBe("https://app.zokorp.com/email-preferences");
  });

  it("publishes robots and sitemap for the marketing host only", async () => {
    const robotsMetadata = robots();
    const sitemapEntries = await sitemap();

    expect(robotsMetadata.host).toBe("https://www.zokorp.com");
    expect(robotsMetadata.sitemap).toBe("https://www.zokorp.com/sitemap.xml");
    expect(sitemapEntries.every((entry) => entry.url.startsWith("https://www.zokorp.com"))).toBe(true);
    expect(sitemapEntries.some((entry) => entry.url.includes("/case-studies"))).toBe(false);
  });
});
