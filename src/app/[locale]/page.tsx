import type { Metadata } from "next";
import { HomeReferenceCategories } from "@/components/home/home-reference-categories";
import { HomeReferenceGuides } from "@/components/home/home-reference-guides";
import { HomeReferenceHighlights } from "@/components/home/home-reference-highlights";
import { HomeReferenceNewsletter } from "@/components/home/home-reference-newsletter";
import { HomeReferenceProductRow } from "@/components/home/home-reference-product-row";
import { getHomepageProducts, getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

function uniqueProducts(list: Product[]) {
  const map = new Map<string, Product>();
  for (const item of list) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  return buildPageMetadata({
    locale,
    path: "",
    primaryImagePath: getOgImagePath(locale),
    title: locale === "zh" ? "毛绒玩偶、饰品与礼物精选" : "Boutique Plush Toys, Jewelry & Gift Ideas",
    description:
      locale === "zh"
        ? "浏览精选毛绒玩偶、精致饰品与送礼好物，支持中英双语浏览、便捷下单与订单追踪。"
        : "Shop curated plush toys, sparkling jewelry and gift-ready accessories with bilingual browsing, secure checkout and order tracking.",
    keywords:
      locale === "zh"
        ? ["毛绒玩偶", "礼物商店", "饰品", "精品商城", "北极星工坊"]
        : ["plush toys", "gift shop", "jewelry", "boutique gifts", "Northstar Atelier"],
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const [{ featured, latest }, shop] = await Promise.all([getHomepageProducts(), getShopProducts({ sort: "featured" })]);
  const allProducts = shop.products;

  const bestSellers = uniqueProducts([...featured, ...allProducts]).slice(0, 5);
  const newArrivals = uniqueProducts([...latest, ...allProducts.filter((product) => !bestSellers.some((item) => item.id === product.id))]).slice(0, 5);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/favicon.ico"),
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl("/"),
        inLanguage: locale === "zh" ? "zh-CN" : "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl(`/${locale}/search`)}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <HomeReferenceCategories locale={locale} />
      <HomeReferenceHighlights locale={locale} />

      <HomeReferenceProductRow
        locale={locale}
        title={locale === "zh" ? "热销推荐" : "Best Sellers"}
        viewAllLabel={dictionary.common.viewAll}
        viewAllHref={`/${locale}/shop`}
        products={bestSellers}
        badge={locale === "zh" ? "热销" : "Bestseller"}
      />

      <HomeReferenceProductRow
        locale={locale}
        title={locale === "zh" ? "新品上架" : "New Arrivals"}
        viewAllLabel={dictionary.common.viewAll}
        viewAllHref={`/${locale}/shop?sort=newest`}
        products={newArrivals}
        badge={locale === "zh" ? "新品" : "New"}
      />

      <HomeReferenceGuides locale={locale} />
      <HomeReferenceNewsletter locale={locale} />
    </div>
  );
}
