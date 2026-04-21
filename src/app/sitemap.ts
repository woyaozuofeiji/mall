import type { MetadataRoute } from "next";
import { categories as fallbackCategories, products as fallbackProducts } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { getCatalogCategories, getPublishedProductSlugs } from "@/lib/catalog";
import { guides } from "@/lib/guide-content";
import { absoluteUrl } from "@/lib/site";
import { getLanguageAlternates } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
    { path: "/policies/privacy", priority: 0.5, changeFrequency: "monthly" },
    { path: "/policies/returns", priority: 0.5, changeFrequency: "monthly" },
    { path: "/policies/shipping", priority: 0.5, changeFrequency: "monthly" },
    { path: "/policies/terms", priority: 0.5, changeFrequency: "monthly" },
  ] satisfies Array<{
    path: string;
    priority: number;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  }>;

  let productRoutes = fallbackProducts.map((product) => ({
    slug: product.slug,
    updatedAt: new Date(),
  }));
  let categoryRoutes = fallbackCategories.map((category) => category.slug);

  if (process.env.DATABASE_URL) {
    try {
      const [records, categoryRecords] = await Promise.all([getPublishedProductSlugs(), getCatalogCategories()]);
      productRoutes = records.map((record) => ({
        slug: record.slug,
        updatedAt: record.updatedAt,
      }));
      categoryRoutes = categoryRecords.map((record) => record.slug);
    } catch {
      // fallback to seeded local mock list when database is unavailable
    }
  }

  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: absoluteUrl(`/${locale}${route.path}`),
        lastModified: new Date(),
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: route.priority,
        alternates: {
          languages: getLanguageAlternates(route.path),
        },
      })),
    ),
    ...locales.flatMap((locale) =>
      categoryRoutes.map((slug) => ({
        url: absoluteUrl(`/${locale}/shop/category/${slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: 0.8,
        alternates: {
          languages: getLanguageAlternates(`/shop/category/${slug}`),
        },
      })),
    ),
    ...locales.flatMap((locale) =>
      guides.map((guide) => ({
        url: absoluteUrl(`/${locale}/guides/${guide.slug}`),
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly" as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: 0.7,
        alternates: {
          languages: getLanguageAlternates(`/guides/${guide.slug}`),
        },
      })),
    ),
    ...locales.flatMap((locale) =>
      productRoutes.map((product) => ({
        url: absoluteUrl(`/${locale}/shop/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: 0.8,
        alternates: {
          languages: getLanguageAlternates(`/shop/${product.slug}`),
        },
      })),
    ),
  ];
}
