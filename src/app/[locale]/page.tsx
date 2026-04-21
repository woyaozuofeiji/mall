import { HomeReferenceCategories } from "@/components/home/home-reference-categories";
import { HomeReferenceHero } from "@/components/home/home-reference-hero";
import { HomeReferenceHighlights } from "@/components/home/home-reference-highlights";
import { HomeReferenceNewsletter } from "@/components/home/home-reference-newsletter";
import { HomeReferenceProductRow } from "@/components/home/home-reference-product-row";
import { getHomepageProducts, getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
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

  const plushProduct = allProducts.find((product) => product.categorySlug === "plush") ?? bestSellers[0];
  const accentProduct = allProducts.find((product) => product.id !== plushProduct?.id && product.categorySlug === "plush") ?? newArrivals[0];
  const giftProduct = allProducts.find((product) => product.categorySlug === "jewelry") ?? bestSellers[1];

  return (
    <div className="pb-8">
      <HomeReferenceHero locale={locale} plushProduct={plushProduct} accentProduct={accentProduct} giftProduct={giftProduct} />
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

      <HomeReferenceNewsletter locale={locale} />
    </div>
  );
}
