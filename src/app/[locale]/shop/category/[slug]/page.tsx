import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCategoryBySlug, getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { categoryContent, isSeoCategorySlug } from "@/lib/category-content";
import { getRelatedGuides } from "@/lib/guide-content";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontInfoPill, StorefrontPanel } from "@/components/storefront/page-hero";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

const CATEGORY_PAGE_SIZE = 6;

function buildPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const visible = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  for (const page of visible) {
    const last = items[items.length - 1];
    if (typeof last === "number" && page - last > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  }

  return items;
}

function parsePageParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCategoryPagePath(locale: string, slug: string, page: number) {
  return page > 1 ? `/${locale}/shop/category/${slug}?page=${page}` : `/${locale}/shop/category/${slug}`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const query = await searchParams;
  if (!isLocale(locale)) {
    return {};
  }

  const category = await getCategoryBySlug(slug);
  if (!category || !isSeoCategorySlug(category.slug)) {
    return buildPageMetadata({
      locale,
      path: `/shop/category/${slug}`,
      title: locale === "zh" ? "分类不存在" : "Category not found",
      description: locale === "zh" ? "未找到对应商品分类。" : "The requested collection could not be found.",
      noIndex: true,
    });
  }

  const copy = categoryContent[category.slug][locale];
  const requestedPage = parsePageParam(query.page);
  const shop = await getShopProducts({
    category: category.slug,
    sort: "featured",
    page: requestedPage,
    pageSize: CATEGORY_PAGE_SIZE,
  });
  const currentPage = shop.pagination.currentPage;
  const metadataPath = currentPage > 1 ? `/shop/category/${category.slug}?page=${currentPage}` : `/shop/category/${category.slug}`;
  const title = currentPage > 1
    ? locale === "zh"
      ? `${copy.title} - 第 ${currentPage} 页`
      : `${copy.title} - Page ${currentPage}`
    : copy.title;
  const description =
    locale === "zh"
      ? `${copy.description} 当前分类共 ${shop.pagination.totalCount} 款在售商品，适合 ${copy.useCases.slice(0, 2).join("、")} 等场景。`
      : `${copy.description} This collection currently includes ${shop.pagination.totalCount} available products and works especially well for ${copy.useCases.slice(0, 2).join(" and ")}.`;

  return buildPageMetadata({
    locale,
    path: metadataPath,
    primaryImagePath: getOgImagePath(locale, `/shop/category/${category.slug}`),
    title,
    description,
    images: shop.products.slice(0, 4).flatMap((product) => product.images.slice(0, 1).map((image) => image.url)),
    keywords: [t(locale, category.name), category.slug, ...copy.useCases.slice(0, 3), ...shop.products.flatMap((product) => product.tags).slice(0, 6)],
  });
}

export default async function CategoryLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { locale, slug } = await params;
  const query = await searchParams;
  if (!isLocale(locale)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);
  if (!category || !isSeoCategorySlug(category.slug)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy = categoryContent[category.slug][locale];
  const requestedPage = parsePageParam(query.page);
  const { products, pagination } = await getShopProducts({
    category: category.slug,
    sort: "featured",
    page: requestedPage,
    pageSize: CATEGORY_PAGE_SIZE,
  });
  const relatedGuides = getRelatedGuides(category.slug, locale).slice(0, 2);
  const paginationItems = buildPaginationItems(pagination.currentPage, pagination.totalPages);

  if (pagination.totalPages > 0 && requestedPage !== pagination.currentPage) {
    redirect(buildCategoryPagePath(locale, category.slug, pagination.currentPage));
  }

  const currentPagePath = buildCategoryPagePath(locale, category.slug, pagination.currentPage);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: dictionary.nav.home,
            item: absoluteUrl(`/${locale}`),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: dictionary.nav.shop,
            item: absoluteUrl(`/${locale}/shop`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: t(locale, category.name),
            item: absoluteUrl(`/${locale}/shop/category/${category.slug}`),
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: copy.title,
        description: copy.description,
        url: absoluteUrl(currentPagePath),
        hasPart: products.slice(0, 12).map((product) => ({
          "@type": "Product",
          name: t(locale, product.name),
          url: absoluteUrl(`/${locale}/shop/${product.slug}`),
          image: product.image ? absoluteUrl(product.image) : undefined,
        })),
      },
    ],
  };

  return (
    <div className="space-y-8 pb-16 sm:space-y-10 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <Container className="space-y-6 pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#8f8791]">
          <Link href={`/${locale}`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.shop}
          </Link>
          <span>/</span>
          <span className="text-[#4d4650]">{t(locale, category.name)}</span>
        </div>

        <section className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StorefrontInfoPill>{locale === "zh" ? `共 ${pagination.totalCount} 件商品` : `${pagination.totalCount} items`}</StorefrontInfoPill>
                <StorefrontInfoPill>{t(locale, category.name)}</StorefrontInfoPill>
                {pagination.totalPages > 1 ? (
                  <StorefrontInfoPill>
                    {locale === "zh" ? `第 ${pagination.currentPage} / ${pagination.totalPages} 页` : `Page ${pagination.currentPage} / ${pagination.totalPages}`}
                  </StorefrontInfoPill>
                ) : null}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.eyebrow}</p>
                <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.25rem]">
                  {t(locale, category.name)}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6d6670] sm:hidden">
                  {locale === "zh"
                    ? `${pagination.totalCount} 款在售商品，适合 ${copy.useCases[0]}、${copy.useCases[1]} 等场景。`
                    : `${pagination.totalCount} live items curated for ${copy.useCases[0]} and ${copy.useCases[1]}.`}
                </p>
                <p className="mt-2 hidden max-w-3xl text-sm leading-7 text-[#6d6670] sm:block">
                  {locale === "zh"
                    ? `当前分类共 ${pagination.totalCount} 款在售商品，你可以继续浏览商品，也可以查看下方的分类说明、选购建议和使用场景。`
                    : `This collection currently includes ${pagination.totalCount} available items. Continue browsing products or review collection notes, buying tips and use cases below.`}
                </p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
              <Button href={`/${locale}/search`} variant="secondary" className="w-full sm:w-auto">
                {locale === "zh" ? "搜索站内商品" : "Search the catalog"}
              </Button>
              <Button href={`/${locale}/shop`} variant="secondary" className="w-full sm:w-auto">
                {locale === "zh" ? "查看全部商品" : "View all products"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
            <StorefrontInfoPill>{locale === "zh" ? `${pagination.totalCount} 款在售` : `${pagination.totalCount} live items`}</StorefrontInfoPill>
            <StorefrontInfoPill>{copy.useCases[0]}</StorefrontInfoPill>
            <StorefrontInfoPill>{copy.useCases[1]}</StorefrontInfoPill>
            <StorefrontInfoPill>{locale === "zh" ? "可继续查看指南与 FAQ" : "Guides and FAQ available"}</StorefrontInfoPill>
          </div>

          <div className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "分类定位" : "Collection focus"}</p>
              <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{copy.title}</p>
            </div>
            <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "在售数量" : "Available count"}</p>
              <p className="mt-2 text-sm leading-7 text-[#2f2b32]">
                {locale === "zh" ? `${pagination.totalCount} 款在售商品` : `${pagination.totalCount} live products in this collection`}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "适合场景" : "Best for"}</p>
              <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{copy.useCases[0]}</p>
            </div>
            <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "继续浏览" : "Continue from here"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={`/${locale}/guides`} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]">
                  {locale === "zh" ? "看指南" : "Read guides"}
                </Link>
                <Link href={`/${locale}/faq`} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]">
                  {locale === "zh" ? "购物帮助" : "Shopping help"}
                </Link>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} locale={locale} priority={index < 4} />
                  ))}
                </div>

                <div className="rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)] sm:hidden">
                  <p className="font-medium text-[#2f2b32]">{locale === "zh" ? "继续浏览这个分类" : "Keep browsing this collection"}</p>
                  <p className="mt-2">
                    {locale === "zh"
                      ? "更多分类说明、选购建议和相关文章已放在下方，想先快速挑商品可以从上面的列表直接进入详情页。"
                      : "More collection notes, buying tips and related guides continue below. If you prefer to shop first, jump straight into the product cards above."}
                  </p>
                </div>

                {pagination.totalPages > 1 ? (
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-[rgba(241,225,230,0.95)] bg-white/80 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="text-sm text-[#6d6670]">
                    {locale === "zh"
                      ? `第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页`
                      : `Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {pagination.hasPrevPage ? (
                      <Link
                        href={buildCategoryPagePath(locale, category.slug, pagination.currentPage - 1)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-4 text-sm font-medium text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                      >
                        {locale === "zh" ? "上一页" : "Previous"}
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(241,225,230,0.95)] bg-[#fffafb] px-4 text-sm text-[#b2a8b1]">
                        {locale === "zh" ? "上一页" : "Previous"}
                      </span>
                    )}

                    {paginationItems.map((item, index) => {
                      if (item === "ellipsis") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[rgba(241,225,230,0.95)] bg-[#fffafb] px-3 text-sm text-[#b2a8b1]"
                          >
                            …
                          </span>
                        );
                      }

                      const active = item === pagination.currentPage;
                      return active ? (
                        <span
                          key={item}
                          className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] px-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(255,109,136,0.82)]"
                        >
                          {item}
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={buildCategoryPagePath(locale, category.slug, item)}
                          className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-3 text-sm font-medium text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                        >
                          {item}
                        </Link>
                      );
                    })}

                    {pagination.hasNextPage ? (
                      <Link
                        href={buildCategoryPagePath(locale, category.slug, pagination.currentPage + 1)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-4 text-sm font-medium text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                      >
                        {locale === "zh" ? "下一页" : "Next"}
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(241,225,230,0.95)] bg-[#fffafb] px-4 text-sm text-[#b2a8b1]">
                        {locale === "zh" ? "下一页" : "Next"}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <StorefrontPanel className="p-10 text-center">
              <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.common.empty}</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">
                {locale === "zh"
                  ? "当前分类下暂无在售商品，可先返回总商品页继续浏览。"
                  : "There are no available products in this collection right now. You can return to the shop to keep browsing."}
              </p>
            </StorefrontPanel>
          )}
        </section>

        <StorefrontPanel className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                  {locale === "zh" ? "分类说明" : "Collection notes"}
                </p>
                <h2 className="mt-3 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[#2f2b32] sm:text-[2rem]">
                  {copy.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{copy.description}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{copy.intro}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.buyingTitle}</p>
                <ul className="mt-4 grid gap-3">
                  {copy.buyingPoints.map((point) => (
                    <li
                      key={point}
                      className="rounded-[1.2rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-3 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.useCasesTitle}</p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {copy.useCases.map((item) => (
                    <StorefrontInfoPill key={item} className="bg-white">
                      {item}
                    </StorefrontInfoPill>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.35rem] bg-[#fff8fa] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.faqTitle}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{copy.faqAnswer}</p>
              </div>
            </div>
          </div>
        </StorefrontPanel>

        {relatedGuides.length > 0 ? (
          <StorefrontPanel className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                  {locale === "zh" ? "延伸阅读" : "Further reading"}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">
                  {locale === "zh"
                    ? "如果还想继续比较材质、场景或礼盒组合，再看下面这些相关文章。"
                    : "If you want more context on materials, gifting scenes or bundle ideas, continue with these related guides."}
                </p>
              </div>
              <Button href={`/${locale}/guides`} variant="secondary">
                {locale === "zh" ? "全部指南" : "All guides"}
              </Button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/${locale}/guides/${guide.slug}`}
                  className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)] transition hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap gap-2">
                    <StorefrontInfoPill>{guide.category}</StorefrontInfoPill>
                    <StorefrontInfoPill className="bg-white">
                      {locale === "zh" ? `${guide.readingMinutes} 分钟阅读` : `${guide.readingMinutes} min read`}
                    </StorefrontInfoPill>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#2f2b32]">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6d6670]">{guide.description}</p>
                </Link>
              ))}
            </div>
          </StorefrontPanel>
        ) : null}
      </Container>
    </div>
  );
}
