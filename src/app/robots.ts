import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const disallowPaths = [
    "/admin",
    "/admin/",
    ...locales.flatMap((locale) => [
      `/${locale}/cart`,
      `/${locale}/checkout`,
      `/${locale}/order-tracking`,
      `/${locale}/search`,
    ]),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowPaths,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
