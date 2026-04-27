import type { MetadataRoute } from "next";
import { PUBLIC_ADMIN_BASE } from "@/lib/admin-path";
import { getSiteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const disallowPaths = [
    "/admin",
    "/admin/",
    PUBLIC_ADMIN_BASE,
    `${PUBLIC_ADMIN_BASE}/`,
    ...locales.flatMap((locale) => [
      `/${locale}/cart`,
      `/${locale}/checkout`,
      `/${locale}/order-tracking`,
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
