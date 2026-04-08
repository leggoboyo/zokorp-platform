import type { MetadataRoute } from "next";

import { getMarketingSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/admin",
          "/login",
          "/register",
          "/email-preferences",
          "/access-denied",
          "/forbidden",
        ],
      },
    ],
    sitemap: `${getMarketingSiteUrl()}/sitemap.xml`,
    host: getMarketingSiteUrl(),
  };
}
