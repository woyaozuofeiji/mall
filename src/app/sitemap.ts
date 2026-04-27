import type { MetadataRoute } from "next";
import { categories as fallbackCategories, products as fallbackProducts } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { getCatalogLastModified, getCategorySitemapEntries, getPublishedProductSitemapEntries } from "@/lib/catalog";
import { guides } from "@/lib/guide-content";
import { absoluteUrl } from "@/lib/site";
import { getLanguageAlternates, getOgImagePath } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily", lastModified: "catalog" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily", lastModified: "catalog" },
    { path: "/shop/new-arrivals", priority: 0.82, changeFrequency: "daily", lastModified: "catalog" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly", lastModified: "static" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly", lastModified: "static" },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly", lastModified: "guides" },
    { path: "/policies/privacy", priority: 0.5, changeFrequency: "monthly", lastModified: "static" },
    { path: "/policies/returns", priority: 0.5, changeFrequency: "monthly", lastModified: "static" },
    { path: "/policies/shipping", priority: 0.5, changeFrequency: "monthly", lastModified: "static" },
    { path: "/policies/terms", priority: 0.5, changeFrequency: "monthly", lastModified: "static" },
  ] satisfies Array<{
    path: string;
    priority: number;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
    lastModified: "catalog" | "guides" | "static";
  }>;

  const staticLastModified = new Date("2026-04-21T00:00:00.000Z");
  const guideLastModified = guides.reduce(
    (latest, guide) => {
      const updatedAt = new Date(guide.updatedAt);
      return updatedAt > latest ? updatedAt : latest;
    },
    staticLastModified,
  );
  let catalogLastModified = staticLastModified;
  let productRoutes = fallbackProducts.map((product) => ({
    slug: product.slug,
    updatedAt: staticLastModified,
    images: product.images.map((image) => image.url),
  }));
  let categoryRoutes = fallbackCategories.map((category) => ({
    slug: category.slug,
    updatedAt: staticLastModified,
  }));

  if (process.env.DATABASE_URL) {
    try {
      const [records, categoryRecords, catalogUpdatedAt] = await Promise.all([
        getPublishedProductSitemapEntries(),
        getCategorySitemapEntries(),
        getCatalogLastModified(),
      ]);
      productRoutes = records.map((record) => ({
        slug: record.slug,
        updatedAt: record.updatedAt,
        images: record.images,
      }));
      categoryRoutes = categoryRecords;
      catalogLastModified = catalogUpdatedAt;
    } catch {
      // fallback to seeded local mock list when database is unavailable
    }
  }

  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: absoluteUrl(`/${locale}${route.path}`),
        lastModified:
          route.lastModified === "catalog"
            ? catalogLastModified
            : route.lastModified === "guides"
              ? guideLastModified
              : staticLastModified,
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: route.priority,
        images: [absoluteUrl(route.path === "/guides" ? getOgImagePath(locale, "/guides") : getOgImagePath(locale))],
        alternates: {
          languages: getLanguageAlternates(route.path),
        },
      })),
    ),
    ...locales.flatMap((locale) =>
      categoryRoutes.map((category) => ({
        url: absoluteUrl(`/${locale}/shop/category/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: 0.8,
        images: [absoluteUrl(getOgImagePath(locale, `/shop/category/${category.slug}`))],
        alternates: {
          languages: getLanguageAlternates(`/shop/category/${category.slug}`),
        },
      })),
    ),
    ...locales.flatMap((locale) =>
      guides.map((guide) => ({
        url: absoluteUrl(`/${locale}/guides/${guide.slug}`),
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly" as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: 0.7,
        images: [absoluteUrl(getOgImagePath(locale, `/guides/${guide.slug}`))],
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
        images: Array.from(
          new Set([
            ...product.images.map((image) => absoluteUrl(image)),
            absoluteUrl(getOgImagePath(locale, `/shop/${product.slug}`)),
          ]),
        ),
        alternates: {
          languages: getLanguageAlternates(`/shop/${product.slug}`),
        },
      })),
    ),
  ];
}
