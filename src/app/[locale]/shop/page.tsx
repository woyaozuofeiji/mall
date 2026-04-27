import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCatalogCategories } from "@/lib/catalog";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type ShopSearchParams = {
  category?: string | string[];
  sort?: string | string[];
  q?: string | string[];
  page?: string | string[];
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
    path: "/shop",
    title: locale === "zh" ? "商品分类与选购入口" : "Shop Directory & Collection Entry",
    description:
      locale === "zh"
        ? "从这里进入毛绒、饰品与礼品分类，或直接搜索商品、查看选购指南与订单服务。"
        : "Start here for plush, jewelry and gift collections, or jump directly into product search, guides and order services.",
    keywords:
      locale === "zh"
        ? ["商品分类", "商品入口", "毛绒玩偶", "饰品", "送礼"]
        : ["shop directory", "plush toys", "jewelry", "gift ideas", "shop collections"],
  });
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }

  const category = getSingleValue(query.category)?.trim();
  const keyword = getSingleValue(query.q)?.trim();

  if (keyword) {
    redirect(`/${locale}/search?q=${encodeURIComponent(keyword)}`);
  }

  if (category && category !== "all") {
    redirect(`/${locale}/shop/category/${category}`);
  }

  if (getSingleValue(query.sort) === "newest") {
    redirect(`/${locale}/shop/new-arrivals`);
  }

  if (getSingleValue(query.sort) || getSingleValue(query.page)) {
    redirect(`/${locale}/shop`);
  }

  const dictionary = getDictionary(locale);
  const categories = await getCatalogCategories();

  const copy =
    locale === "zh"
      ? {
          introEyebrow: "选购入口",
          introTitle: "先选择你想逛的商品方向",
          introDescription:
            "从毛绒玩具、饰品首饰和桌面礼物开始浏览，也可以直接搜索关键词，快速找到适合送礼或自留的商品。",
          categoryEyebrow: "分类导航",
          categoryTitle: "先选方向，再开始浏览商品",
          categoryDescription:
            "如果你已经知道偏好的风格，直接进入对应分类会更快；每个分类都围绕送礼、陈列和日常使用场景整理。",
          categoryCta: "进入分类",
          searchEyebrow: "快速搜索",
          searchTitle: "如果你已经知道关键词，直接搜索更快",
          searchDescription: "按商品标题、标签或你记得的关键词搜索，搜索结果会单独进入搜索页展示。",
          searchSubmit: "搜索商品",
          serviceEyebrow: "购物服务",
          serviceTitle: "浏览前如果还想确认服务信息，可以从这里继续",
          serviceDescription: "下单前可以先查看配送、售后和常见问题，确认服务细节后再继续选购。",
          serviceLinks: [
            { label: "选购指南", href: `/${locale}/guides`, description: "先看送礼、材质和搭配建议" },
            { label: "常见问题", href: `/${locale}/faq`, description: "查看支付、配送与售后说明" },
            { label: "订单查询", href: `/${locale}/order-tracking`, description: "已下单用户可在这里查状态" },
            { label: "发货政策", href: `/${locale}/policies/shipping`, description: "提前确认配送与时效规则" },
          ],
          bottomNote: "继续从分类、搜索或指南进入，找到更适合当前心意的商品。",
        }
      : {
          introEyebrow: "Shop directory",
          introTitle: "Choose the direction you want to browse first",
          introDescription:
            "Start with plush toys, jewelry, or desk gifts, or search directly by keyword to find something for gifting or keeping.",
          categoryEyebrow: "Collection navigation",
          categoryTitle: "Pick a direction before opening product lists",
          categoryDescription:
            "If you already know the style you prefer, opening the matching collection is faster. Each collection is organized around gifting, display, and everyday use.",
          categoryCta: "Open collection",
          searchEyebrow: "Quick search",
          searchTitle: "If you already know the keyword, search directly",
          searchDescription: "Search by title, tag, or any keyword you remember. Results are shown separately on the search page.",
          searchSubmit: "Search products",
          serviceEyebrow: "Shopping services",
          serviceTitle: "Need service information before browsing? Continue from here",
          serviceDescription:
            "Review shipping, returns, and common questions before you choose, then continue shopping with the details already clear.",
          serviceLinks: [
            { label: "Buying guides", href: `/${locale}/guides`, description: "Read gifting, material and pairing guidance first" },
            { label: "FAQ", href: `/${locale}/faq`, description: "Check payment, shipping and support details" },
            { label: "Track order", href: `/${locale}/order-tracking`, description: "Look up order status after purchase" },
            { label: "Shipping policy", href: `/${locale}/policies/shipping`, description: "Review delivery timing and fulfillment notes" },
          ],
          bottomNote: "Continue through collections, search, or guides to find the product that fits the occasion.",
        };

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <Container className="space-y-8 pt-6 sm:pt-8">
        <StorefrontPanel className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.introEyebrow}</p>
              <h1 className="mt-3 text-[2.15rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.75rem]">
                {copy.introTitle}
              </h1>
              <p className="mt-4 text-sm leading-8 text-[#6d6670] sm:text-[15px]">{copy.introDescription}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StorefrontInfoPill>{locale === "zh" ? `${categories.length} 个核心分类` : `${categories.length} core collections`}</StorefrontInfoPill>
              <StorefrontInfoPill>{locale === "zh" ? "搜索 / 指南 / 售后" : "Search / Guides / Support"}</StorefrontInfoPill>
            </div>
          </div>
        </StorefrontPanel>

        <section className="space-y-5">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.categoryEyebrow}</p>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.25rem]">{copy.categoryTitle}</h2>
            <p className="mt-3 text-sm leading-8 text-[#6d6670]">{copy.categoryDescription}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {categories.map((categoryItem, index) => (
              <Link
                key={categoryItem.id}
                href={`/${locale}/shop/category/${categoryItem.slug}`}
                className="group rounded-[1.8rem] border border-[rgba(241,225,230,0.95)] bg-[linear-gradient(180deg,#fffafb_0%,#ffffff_100%)] p-5 shadow-[0_24px_64px_-48px_rgba(210,167,181,0.42)] transition hover:-translate-y-1 hover:shadow-[0_30px_72px_-46px_rgba(210,167,181,0.54)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c48397]">
                    {locale === "zh" ? `分类 ${String(index + 1).padStart(2, "0")}` : `Collection ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <span className="rounded-full border border-[rgba(241,225,230,0.95)] bg-white px-3 py-1 text-[11px] font-medium text-[#7b7280]">
                    {t(locale, categoryItem.name)}
                  </span>
                </div>
                <h3 className="mt-4 text-[1.5rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{t(locale, categoryItem.name)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{t(locale, categoryItem.description)}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#3b353a] transition group-hover:translate-x-0.5 group-hover:text-[#ff6d88]">
                  {copy.categoryCta}
                  <span aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.searchEyebrow}</p>
            <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.05rem]">{copy.searchTitle}</h2>
            <p className="mt-3 text-sm leading-8 text-[#6d6670]">{copy.searchDescription}</p>

            <form action={`/${locale}/search`} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                name="q"
                placeholder={dictionary.shop.searchPlaceholder}
                className="h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]"
              />
              <Button type="submit" className="sm:w-auto">
                {copy.searchSubmit}
              </Button>
            </form>
          </StorefrontPanel>

          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.serviceEyebrow}</p>
            <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.05rem]">{copy.serviceTitle}</h2>
            <p className="mt-3 text-sm leading-8 text-[#6d6670]">{copy.serviceDescription}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.serviceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)] transition hover:-translate-y-0.5"
                >
                  <p className="text-sm font-semibold text-[#2f2b32]">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6d6670]">{item.description}</p>
                </Link>
              ))}
            </div>
          </StorefrontPanel>
        </div>

        <StorefrontPanel className="p-6 text-sm leading-8 text-[#6d6670] sm:p-7">
          <p>{copy.bottomNote}</p>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
