import type { Metadata } from "next";
import Link from "next/link";
import { getSearchProducts } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontPageHero, StorefrontPanel } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

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
    path: "/search",
    title: locale === "zh" ? "搜索商品" : "Search Products",
    description: locale === "zh" ? "按关键词查找商品。" : "Search the catalog by keyword.",
    noIndexFollow: true,
  });
}

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
  const suggestedKeywords =
    locale === "zh"
      ? ["毛绒玩偶", "耳饰", "生日礼物", "桌面礼品", "礼盒加购", "珍珠首饰"]
      : ["plush toy", "earrings", "birthday gift", "desk gift", "gift box add-on", "pearl jewelry"];
  const quickCategories =
    locale === "zh"
      ? [
          { label: "毛绒玩具", href: `/${locale}/shop/category/plush` },
          { label: "饰品首饰", href: `/${locale}/shop/category/jewelry` },
          { label: "桌面礼品", href: `/${locale}/shop/category/gifts` },
        ]
      : [
          { label: "Plush toys", href: `/${locale}/shop/category/plush` },
          { label: "Jewelry", href: `/${locale}/shop/category/jewelry` },
          { label: "Desk gifts", href: `/${locale}/shop/category/gifts` },
        ];

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Search"
        title={dictionary.nav.search}
        description={
          locale === "zh"
            ? "输入关键词查找毛绒玩具、饰品或桌面礼物，快速回到适合当前心意的商品。"
            : "Search plush toys, jewelry or desk gifts by keyword and quickly return to pieces that fit the moment."
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
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
                {locale === "zh" ? "热门搜索方向" : "Popular search ideas"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedKeywords.map((item) => (
                  <Link
                    key={item}
                    href={`/${locale}/search?q=${encodeURIComponent(item)}`}
                    className="rounded-full bg-[#fff8fa] px-3 py-1.5 text-xs font-medium text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
                {locale === "zh" ? "也可以直接进入分类" : "Or jump straight into a collection"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full bg-[#fff8fa] px-3 py-1.5 text-xs font-medium text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </StorefrontPanel>

        {keyword ? (
          result.length > 0 ? (
            <div className="space-y-5">
              <StorefrontPanel className="p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "匹配结果" : "Matches found"}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? `共 ${result.length} 个结果` : `${result.length} matching products`}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "搜索建议" : "Search tip"}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "如果结果过多，可尝试加上材质、用途或送礼场景。" : "If the result list is broad, add material, usage or gifting intent to refine it."}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "继续浏览" : "Keep browsing"}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "也可以进入对应分类页继续按场景浏览。" : "You can also switch into a collection page to browse by use case."}</p>
                  </div>
                </div>
              </StorefrontPanel>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.map((product, index) => (
                  <ProductCard key={product.id} product={product} locale={locale} priority={index < 4} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <StorefrontPanel className="p-10 text-center">
                <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.common.empty}</p>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">
                  {locale === "zh"
                    ? "当前没有匹配结果。试试换个关键词，或者返回商品页继续浏览。"
                    : "No matching products were found. Try another keyword or return to the collection page to keep browsing."}
                </p>
              </StorefrontPanel>
              <StorefrontPanel className="p-6 sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
                  {locale === "zh" ? "试试这些方向" : "Try one of these instead"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {suggestedKeywords.slice(0, 4).map((item) => (
                    <Link
                      key={item}
                      href={`/${locale}/search?q=${encodeURIComponent(item)}`}
                      className="rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
                <Button href={`/${locale}/shop`} variant="secondary" className="mt-4 w-full">
                  {locale === "zh" ? "返回全部商品" : "Browse all products"}
                </Button>
              </StorefrontPanel>
            </div>
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
