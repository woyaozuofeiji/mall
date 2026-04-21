import { getSearchProducts } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontPageHero, StorefrontPanel } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);
  const keyword = q?.trim() ?? "";
  const result = await getSearchProducts(keyword);

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Search"
        title={dictionary.nav.search}
        description={
          locale === "zh"
            ? "把搜索页也统一成首页这套粉白精品店风格：输入关键词后，结果页应该依然柔和、轻盈，而不是突然变成工具界面。"
            : "The search page now follows the same soft boutique direction as the homepage, so product discovery still feels light, polished and gift-led instead of purely utilitarian."
        }
        side={
          <div className="space-y-3 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">Search note</p>
            <p className="text-sm leading-7">
              {keyword
                ? locale === "zh"
                  ? `当前关键词：${keyword}，共匹配 ${result.length} 个结果。`
                  : `Current keyword: ${keyword}, with ${result.length} matching results.`
                : locale === "zh"
                  ? "你可以按标题、标签或商品关键词检索。"
                  : "Search by title, subtitle and curated product tags."}
            </p>
          </div>
        }
      />

      <Container className="space-y-8">
        <StorefrontPanel>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder={dictionary.shop.searchPlaceholder}
              className="h-14 w-full rounded-full border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-5 text-[15px] text-[#2f2b32] outline-none transition focus:border-[rgba(255,126,149,0.55)]"
            />
            <Button type="submit" className="sm:w-auto">
              {locale === "zh" ? "搜索" : "Search"}
            </Button>
          </form>
        </StorefrontPanel>

        {keyword ? (
          result.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.map((product, index) => (
                <ProductCard key={product.id} product={product} locale={locale} priority={index < 4} />
              ))}
            </div>
          ) : (
            <StorefrontPanel className="p-10 text-center">
              <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.common.empty}</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">
                {locale === "zh"
                  ? "当前没有匹配结果。试试换个关键词，或者返回商品页继续浏览。"
                  : "No matching products were found. Try another keyword or return to the collection page to keep browsing."}
              </p>
            </StorefrontPanel>
          )
        ) : (
          <StorefrontPanel className="p-10 text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.nav.search}</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">
              {locale === "zh"
                ? "输入关键词后，这里会展示与首页风格统一的搜索结果卡片。"
                : "Enter a keyword and this page will return product cards styled consistently with the homepage."}
            </p>
          </StorefrontPanel>
        )}
      </Container>
    </div>
  );
}
