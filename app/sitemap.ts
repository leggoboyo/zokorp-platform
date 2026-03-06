import type { MetadataRoute } from "next";

import { getMediaArticles } from "@/data/media-articles";
import { getSoftwareCatalog } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

const staticRoutes = [
  "/",
  "/about",
  "/case-studies",
  "/contact",
  "/media",
  "/pricing",
  "/privacy",
  "/security",
  "/services",
  "/software",
  "/support",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();
  const products = await getSoftwareCatalog();
  const mediaArticles = getMediaArticles();

  return [
    ...staticRoutes.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/software/${product.slug}`,
      lastModified: now,
    })),
    ...mediaArticles.map((article) => ({
      url: `${baseUrl}/media/${article.slug}`,
      lastModified: new Date(article.publishedAt),
    })),
  ];
}
