import type { Metadata } from "next";

import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";

const DEFAULT_MARKETING_SITE_URL = "https://www.zokorp.com";
const DEFAULT_APP_SITE_URL = "https://app.zokorp.com";

export const siteConfig = {
  name: "ZoKorp",
  platformName: "ZoKorp Platform",
  marketingUrl: process.env.MARKETING_SITE_URL ?? DEFAULT_MARKETING_SITE_URL,
  appUrl: process.env.APP_SITE_URL ?? DEFAULT_APP_SITE_URL,
  legacySiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_SITE_URL ?? DEFAULT_APP_SITE_URL,
  description:
    "Founder-led AWS architecture, validation, and optimization for SMB teams that need a clear next step.",
  platformDescription:
    "ZoKorp combines account-linked software, AWS validation workflows, and practical founder-led follow-through in one customer platform.",
  supportEmail: PUBLIC_LAUNCH_CONTACT.primaryEmail,
  location: PUBLIC_LAUNCH_CONTACT.location,
  linkedInUrl: PUBLIC_LAUNCH_CONTACT.linkedInUrl,
};

const APP_DEFAULT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

function normalizeOrigin(value: string, fallback: string) {
  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

export function getMarketingSiteUrl() {
  return normalizeOrigin(siteConfig.marketingUrl, DEFAULT_MARKETING_SITE_URL);
}

export function getAppSiteUrl() {
  return normalizeOrigin(siteConfig.appUrl, DEFAULT_APP_SITE_URL);
}

export function toMarketingSiteUrl(path: string) {
  return new URL(path, getMarketingSiteUrl()).toString();
}

export function toAppSiteUrl(path: string) {
  return new URL(path, getAppSiteUrl()).toString();
}

/**
 * @deprecated Prefer getMarketingSiteUrl() or getAppSiteUrl() explicitly so
 * route ownership stays obvious.
 */
export function getSiteUrl() {
  return normalizeOrigin(siteConfig.legacySiteUrl, DEFAULT_APP_SITE_URL);
}

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  siteName?: string;
};

export function buildMarketingPageMetadata(input: MetadataInput): Metadata {
  const url = new URL(input.path, getMarketingSiteUrl());

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url.toString(),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: url.toString(),
      siteName: input.siteName ?? siteConfig.name,
      type: input.type ?? "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: ["/twitter-image"],
    },
    robots: input.robots,
  };
}

export function buildAppPageMetadata(input: MetadataInput): Metadata {
  const url = new URL(input.path, getAppSiteUrl());

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url.toString(),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: url.toString(),
      siteName: input.siteName ?? siteConfig.platformName,
      type: input.type ?? "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: ["/twitter-image"],
    },
    robots: input.robots ?? APP_DEFAULT_ROBOTS,
  };
}

export function buildPageMetadata(input: MetadataInput): Metadata {
  return buildAppPageMetadata(input);
}
