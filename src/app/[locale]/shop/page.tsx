import { getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontPageHero, StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sort?: "featured" | "newest" | "price_low" | "price_high"; q?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);
  const { categories, products } = await getShopProducts({
    category: query.category,
    sort: query.sort,
    q: query.q,
  });

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Collection"
        title={dictionary.shop.title}
        description={dictionary.shop.description}
        side={
          <div className="space-y-4 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">Collection note</p>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? `当前共有 ${products.length} 个商品结果。列表页会继续保持首页这种柔和、甜美、礼品精品店的浏览氛围。`
                : `${products.length} curated products are currently visible. The collection page continues the same soft, gift-led boutique atmosphere as the homepage.`}
            </p>
          </div>
        }
      />

      <Container className="space-y-8">
        <StorefrontPanel>
          <form className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr_auto] lg:items-end">
            <label className="space-y-2 text-sm text-[#574f5a]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">{dictionary.nav.search}</span>
              <input
                name="q"
                defaultValue={query.q}
                placeholder={dictionary.shop.searchPlaceholder}
                className="h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]"
              />
            </label>

            <label className="space-y-2 text-sm text-[#574f5a]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">{dictionary.shop.filters}</span>
              <select
                name="category"
                defaultValue={query.category ?? "all"}
                className="h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]"
              >
                <option value="all">{dictionary.shop.allCategories}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {t(locale, category.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-[#574f5a]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">{dictionary.shop.sortBy}</span>
              <select
                name="sort"
                defaultValue={query.sort ?? "featured"}
                className="h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]"
              >
                <option value="featured">{dictionary.shop.featured}</option>
                <option value="newest">{dictionary.shop.newest}</option>
                <option value="price_low">{dictionary.shop.priceLow}</option>
                <option value="price_high">{dictionary.shop.priceHigh}</option>
              </select>
            </label>

            <Button type="submit" className="w-full lg:w-auto">
              {locale === "zh" ? "应用筛选" : "Apply"}
            </Button>
          </form>
        </StorefrontPanel>

        <div className="flex flex-wrap gap-2">
          <StorefrontInfoPill>{locale === "zh" ? `商品 ${products.length}` : `${products.length} items`}</StorefrontInfoPill>
          {query.category ? <StorefrontInfoPill>{query.category}</StorefrontInfoPill> : null}
          {query.sort ? <StorefrontInfoPill>{query.sort}</StorefrontInfoPill> : null}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} locale={locale} priority={index < 4} />
            ))}
          </div>
        ) : (
          <StorefrontPanel className="p-10 text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.common.empty}</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">
              {locale === "zh"
                ? "试试换个关键词、分类或排序方式，让结果更接近你现在想看的商品。"
                : "Try another keyword, category or sorting rule to bring the collection closer to what you want to browse right now."}
            </p>
          </StorefrontPanel>
        )}
      </Container>
    </div>
  );
}
