import type { Metadata } from "next";

export const siteConfig = {
  name: "ZoKorp",
  platformName: "ZoKorp Platform",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zokorp-web.vercel.app",
  description:
    "ZoKorp combines AWS AI delivery, account-linked software, and practical validation workflows in one customer platform.",
  supportEmail: "zkhawaja@zokorp.com",
  location: "Houston, Texas, United States",
};

export function getSiteUrl() {
  try {
    return new URL(siteConfig.url).origin;
  } catch {
    return "https://zokorp-web.vercel.app";
  }
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = new URL(input.path, getSiteUrl());

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url.pathname,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: url.toString(),
      siteName: siteConfig.platformName,
      type: input.type ?? "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: ["/twitter-image"],
    },
  };
}
