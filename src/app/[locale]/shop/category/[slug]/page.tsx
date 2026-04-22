import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { categoryContent, isSeoCategorySlug } from "@/lib/category-content";
import { getRelatedGuides } from "@/lib/guide-content";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontInfoPill, StorefrontPageHero, StorefrontPanel } from "@/components/storefront/page-hero";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
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
  const shop = await getShopProducts({ category: category.slug, sort: "featured" });

  return buildPageMetadata({
    locale,
    path: `/shop/category/${category.slug}`,
    primaryImagePath: getOgImagePath(locale, `/shop/category/${category.slug}`),
    title: copy.title,
    description: copy.description,
    images: shop.products.slice(0, 4).flatMap((product) => product.images.slice(0, 1).map((image) => image.url)),
    keywords: [t(locale, category.name), category.slug, ...shop.products.flatMap((product) => product.tags).slice(0, 8)],
  });
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);
  if (!category || !isSeoCategorySlug(category.slug)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy = categoryContent[category.slug][locale];
  const { products } = await getShopProducts({ category: category.slug, sort: "featured" });
  const relatedGuides = getRelatedGuides(category.slug, locale).slice(0, 2);

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
        url: absoluteUrl(`/${locale}/shop/category/${category.slug}`),
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
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <StorefrontPageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        side={
          <div className="space-y-4 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">
              {locale === "zh" ? "选购建议" : "Shopping guidance"}
            </p>
            <p className="text-sm leading-7">{copy.intro}</p>
            <div className="flex flex-wrap gap-2">
              <StorefrontInfoPill>{locale === "zh" ? `${products.length} 件商品` : `${products.length} items`}</StorefrontInfoPill>
              <StorefrontInfoPill>{t(locale, category.name)}</StorefrontInfoPill>
            </div>
          </div>
        }
      />

      <Container className="space-y-8">
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

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.buyingTitle}</p>
            <div className="mt-5 grid gap-3">
              {copy.buyingPoints.map((point) => (
                <div key={point} className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <p className="text-sm leading-7 text-[#2f2b32]">{point}</p>
                </div>
              ))}
            </div>
          </StorefrontPanel>

          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.useCasesTitle}</p>
            <div className="mt-5 grid gap-3">
              {copy.useCases.map((item) => (
                <div key={item} className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <p className="text-sm leading-7 text-[#2f2b32]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.35rem] bg-[#fff8fa] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.faqTitle}</p>
              <p className="mt-3 text-sm leading-7 text-[#6d6670]">{copy.faqAnswer}</p>
            </div>
          </StorefrontPanel>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.25rem]">{t(locale, category.name)}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[#6d6670]">
              {locale === "zh"
                ? `当前分类展示 ${products.length} 款精选商品，可继续浏览、加入购物车，或返回总商品页查看更多搭配选择。`
                : `${products.length} curated products are currently listed in this collection. Continue browsing, add items to cart or return to the full shop for a wider mix.`}
            </p>
          </div>
          <Button href={`/${locale}/shop`} variant="secondary">
            {locale === "zh" ? "查看全部商品" : "View all products"}
          </Button>
        </div>

        {relatedGuides.length > 0 ? (
          <StorefrontPanel className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                  {locale === "zh" ? "相关指南" : "Related guides"}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">
                  {locale === "zh"
                    ? "如果你还在比较这一类商品，可以继续阅读相关选购指南，了解材质、送礼场景和加购思路。"
                    : "If you are still comparing this category, these guides explain material choices, gifting use cases and add-on buying logic in more detail."}
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
                ? "当前分类下暂无已发布商品，可先返回总商品页继续浏览。"
                : "There are no published products in this collection right now. You can return to the shop to keep browsing."}
            </p>
          </StorefrontPanel>
        )}
      </Container>
    </div>
  );
}
