import type { MetadataRoute } from "next";
import { products as fallbackProducts } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { getPublishedProductSlugs } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://example.com";
  const staticRoutes = ["", "/shop", "/search", "/cart", "/checkout", "/order-tracking", "/faq", "/contact"];

  let productRoutes = fallbackProducts.map((product) => ({
    slug: product.slug,
    updatedAt: new Date(),
  }));

  if (process.env.DATABASE_URL) {
    try {
      const records = await getPublishedProductSlugs();
      productRoutes = records.map((record) => ({
        slug: record.slug,
        updatedAt: record.updatedAt,
      }));
    } catch {
      // fallback to seeded local mock list when database is unavailable
    }
  }

  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: `${base}/${locale}${route}`,
        lastModified: new Date(),
      })),
    ),
    ...locales.flatMap((locale) =>
      productRoutes.map((product) => ({
        url: `${base}/${locale}/shop/${product.slug}`,
        lastModified: product.updatedAt,
      })),
    ),
  ];
}
