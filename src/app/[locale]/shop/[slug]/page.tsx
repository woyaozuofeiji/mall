import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { getCategoryBySlug, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getRelatedGuides } from "@/lib/guide-content";
import { formatCurrency, getDiscountPercent } from "@/lib/format";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { buildProductMetaDescription, getProductFacts, getProductGiftMoments, getProductSchemaDetails } from "@/lib/product-merchandising";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { ProductGallery } from "@/components/shop/product-gallery";
import { StorefrontInfoPill, StorefrontPanel } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const getProductBySlugCached = cache(getProductBySlug);

function getSchemaAvailability(value?: string) {
  if (!value) {
    return "https://schema.org/InStock";
  }

  return /out\s*of\s*stock|sold\s*out|unavailable/i.test(value)
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const product = await getProductBySlugCached(slug);
  if (!product) {
    return buildPageMetadata({
      locale,
      path: `/shop/${slug}`,
      title: locale === "zh" ? "商品不存在" : "Product not found",
      description: locale === "zh" ? "未找到对应商品。" : "The requested product could not be found.",
      noIndex: true,
    });
  }

  const description = buildProductMetaDescription(product, locale);
  const productFacts = getProductFacts(product, locale);

  return buildPageMetadata({
    locale,
    path: `/shop/${product.slug}`,
    primaryImagePath: getOgImagePath(locale, `/shop/${product.slug}`),
    title: t(locale, product.name),
    description,
    images: product.images.map((image) => image.url),
    keywords: [t(locale, product.name), product.categorySlug, ...productFacts.slice(0, 3).map((fact) => fact.value), ...product.tags.slice(0, 4)],
    type: "article",
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const product = await getProductBySlugCached(slug);
  if (!product) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [related, category] = await Promise.all([
    getRelatedProducts({
      categorySlug: product.categorySlug,
      excludeProductId: product.id,
      take: 3,
    }),
    getCategoryBySlug(product.categorySlug),
  ]);
  const relatedGuides = getRelatedGuides(product.categorySlug as "plush" | "jewelry" | "gifts", locale).slice(0, 2);
  const heroSpecs = product.specs.slice(0, 3);
  const productFacts = getProductFacts(product, locale);
  const giftMoments = getProductGiftMoments(product, locale);
  const schemaDetails = getProductSchemaDetails(product, locale);
  const discountPercent = getDiscountPercent(product.price, product.compareAtPrice);
  const productUrl = absoluteUrl(`/${locale}/shop/${product.slug}`);
  const productDescription = buildProductMetaDescription(product, locale);
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
            name: category ? t(locale, category.name) : product.categorySlug,
            item: absoluteUrl(`/${locale}/shop/category/${product.categorySlug}`),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: t(locale, product.name),
            item: productUrl,
          },
        ],
      },
      {
        "@type": "Product",
        name: t(locale, product.name),
        description: productDescription,
        sku: product.sku ?? product.slug,
        category: category ? t(locale, category.name) : product.categorySlug,
        url: productUrl,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        image: product.images.map((image) => absoluteUrl(image.url)),
        ...(schemaDetails.material ? { material: schemaDetails.material } : {}),
        ...(schemaDetails.size ? { size: schemaDetails.size } : {}),
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "USD",
          price: product.price.toFixed(2),
          availability: getSchemaAvailability(product.availability ? t(locale, product.availability) : undefined),
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        },
        additionalProperty: schemaDetails.additionalProperty,
        ...(schemaDetails.review.length > 0
          ? {
              review: schemaDetails.review,
            }
          : {}),
        ...(product.reviewSummary
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.reviewSummary.rating.toFixed(1),
                reviewCount: product.reviewSummary.count,
              },
            }
          : {}),
      },
    ],
  };

  return (
    <div className="space-y-10 pb-12 pt-8 sm:space-y-12 sm:pb-16 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <Container className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#8f8791]">
          <Link href={`/${locale}`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.shop}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop/category/${product.categorySlug}`} className="transition hover:text-[#ff6d88]">
            {category ? t(locale, category.name) : product.categorySlug}
          </Link>
          <span>/</span>
          <span className="text-[#4d4650]">{t(locale, product.name)}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] xl:items-start">
          <div>
            <ProductGallery key={product.id} product={product} locale={locale} />
          </div>

          <StorefrontPanel className="mx-auto w-full max-w-[24rem] min-w-0 space-y-4 overflow-hidden p-4 sm:max-w-none sm:space-y-5 sm:p-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${locale}/shop/category/${product.categorySlug}`} className="transition hover:-translate-y-0.5">
                <Badge>{category ? t(locale, category.name) : product.categorySlug}</Badge>
              </Link>
              {product.featured ? <Badge className="border-transparent bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] text-white">{locale === "zh" ? "热销" : "Bestseller"}</Badge> : null}
              {product.isNew ? <Badge className="bg-[#fff3f6] text-[#ff6d88]">{locale === "zh" ? "新品" : "New"}</Badge> : null}
              {discountPercent ? <Badge className="border-transparent bg-[#2f2b32] text-white">{locale === "zh" ? `省 ${discountPercent}%` : `Save ${discountPercent}%`}</Badge> : null}
              <span className="inline-flex items-center rounded-full bg-[#fff8fa] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f8791] ring-1 ring-[rgba(241,225,230,0.95)]">
                {product.availability ? t(locale, product.availability) : locale === "zh" ? "有库存" : "In stock"}
              </span>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <h1 className="break-words text-[clamp(1.9rem,8.5vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#2f2b32] sm:text-[3.3rem]">
                {t(locale, product.name)}
              </h1>
              <p className="max-w-none text-sm leading-6 text-[#6d6670] sm:max-w-2xl sm:text-[15px] sm:leading-7">{t(locale, product.subtitle)}</p>
              {discountPercent ? (
                <p className="text-sm leading-6 text-[#8f8791] sm:leading-7">
                  {locale === "zh"
                    ? `当前折扣约 ${discountPercent}% ，适合作为节日送礼、礼盒加购或搭配购买时快速决策。`
                    : `Currently marked at about ${discountPercent}% off, which works well for gifting edits, bundle add-ons and quicker purchase decisions.`}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <p className="text-[clamp(1.7rem,7vw,2rem)] font-semibold tracking-[-0.03em] text-[#2f2b32]">{formatCurrency(product.price, locale)}</p>
                {product.compareAtPrice ? (
                  <p className="pb-0.5 text-sm text-[#b3a8b2] line-through sm:pb-1 sm:text-base">
                    {locale === "zh" ? "原价 " : "Was "}
                    {formatCurrency(product.compareAtPrice, locale)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6670]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8fa] px-3.5 py-2 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <Star className="h-4 w-4 fill-[#ffbe3b] text-[#ffbe3b]" />
                  <span>{product.reviewSummary ? `${product.reviewSummary.rating.toFixed(1)} / 5` : "4.8 / 5"}</span>
                </div>
                <div className="text-sm text-[#8f8791]">
                  {product.reviewSummary
                    ? locale === "zh"
                      ? `${product.reviewSummary.count} 条评价`
                      : `${product.reviewSummary.count} reviews`
                    : locale === "zh"
                      ? "客户评价"
                      : "Customer reviews"}
                </div>
              </div>
            </div>

            <div id="quick-buy">
              <AddToCartButton product={product} locale={locale} cta={dictionary.common.addToCart} added={dictionary.common.added} />
            </div>

            <div className="flex flex-wrap gap-2">
              {heroSpecs.map((spec) => (
                <StorefrontInfoPill key={spec.label.en} className="whitespace-normal text-center leading-5">
                  {t(locale, spec.label)} · {t(locale, spec.value)}
                </StorefrontInfoPill>
              ))}
            </div>

            {productFacts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {productFacts.map((fact) => (
                  <div key={fact.key} className="rounded-[1.2rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{fact.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{fact.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </StorefrontPanel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "购买前摘要" : "Before you buy"}
            </p>
            <p className="mt-4 text-base leading-8 text-[#6d6670]">{t(locale, product.description)}</p>
            {heroSpecs.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {heroSpecs.map((spec) => (
                  <div key={spec.label.en} className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{t(locale, spec.label)}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{t(locale, spec.value)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </StorefrontPanel>

          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "交付与服务" : "Delivery & service"}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{dictionary.shop.leadTime}</p>
                <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{t(locale, product.leadTime)}</p>
              </div>
              <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)] sm:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{dictionary.shop.shipping}</p>
                <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{t(locale, product.shippingNote)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="flex items-start gap-3 rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
                <Truck className="mt-1 h-4 w-4 text-[#ff7e95]" />
                <span>{locale === 'zh' ? '支持全球配送说明与订单状态同步，发货后可继续查看物流进度。' : 'Shipping guidance and order status stay aligned here, and live tracking can be reviewed after dispatch.'}</span>
              </div>
              <div className="flex items-start gap-3 rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
                <ShieldCheck className="mt-1 h-4 w-4 text-[#ff7e95]" />
                <span>{locale === "zh" ? "售后、退换和包装承诺适合继续在这一屏里完整解释。" : "After-sales support, returns and packaging promises can continue to be explained cleanly in this section."}</span>
              </div>
            </div>
          </StorefrontPanel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "送礼与搭配灵感" : "Gift and styling ideas"}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {giftMoments.map((item) => (
                <div key={item} className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <p className="text-sm leading-7 text-[#2f2b32]">{item}</p>
                </div>
              ))}
            </div>
          </StorefrontPanel>

          <StorefrontPanel className="p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "为什么适合当前分类" : "Why it fits this collection"}
            </p>
            <div className="mt-4 space-y-4 text-sm leading-8 text-[#6d6670]">
              <p>
                {locale === "zh"
                  ? product.categorySlug === "plush"
                    ? "毛绒类商品更依赖柔软手感、尺寸感知和礼物氛围，这件商品已经把材质、尺寸与包装信息前置展示，方便用户快速判断。"
                    : product.categorySlug === "jewelry"
                      ? "饰品类商品更强调近景质感、佩戴场景和礼盒感，这件商品将材质、尺寸与礼品包装信息集中展示，更利于转化。"
                      : "礼物和生活方式小物更看重用途明确、体积友好和搭配空间，这件商品更适合做轻加购或组合推荐。"
                  : product.categorySlug === "plush"
                    ? "Plush products convert best when softness, scale and gifting atmosphere are easy to judge. This page surfaces those details early so the buying decision feels lighter."
                    : product.categorySlug === "jewelry"
                      ? "Jewelry products rely on close-up quality, wearability and gift-box appeal. This page brings material, sizing and packaging details forward to support conversion."
                      : "Gift and lifestyle add-ons work best when usefulness, compact sizing and pairing potential are immediately clear. This page keeps those signals visible from the start."}
              </p>
              <p>
                {locale === "zh"
                  ? "如果你还在犹豫，可以继续查看下方参数、发货说明、评价和相关推荐，再决定是否加入购物车。"
                  : "If you are still comparing options, keep scrolling for detailed specs, shipping notes, reviews and related products before adding it to cart."}
              </p>
            </div>
          </StorefrontPanel>
        </div>

        <section id="product-content" className="scroll-mt-32 space-y-8">
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "商品信息" : "Product information"}
            </p>
            <h2 className="text-[2.4rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[3rem]">
              {locale === "zh" ? "材质、尺寸与送礼信息" : "Materials, sizing and gifting details"}
            </h2>
            <p className="max-w-3xl text-sm leading-8 text-[#6d6670]">
              {locale === "zh"
                ? "在这里重点查看商品材质、尺寸、包装、配送说明和购买前需要确认的信息，帮助用户在下单前快速判断是否适合作为自用或送礼。"
                : "Use this section to review material notes, dimensions, packaging, shipping guidance and the key details customers usually check before buying for themselves or as a gift."}
            </p>
          </div>
          <ProductDetailTabs product={product} locale={locale} />
        </section>

        {relatedGuides.length > 0 ? (
          <section className="space-y-8 border-t border-[rgba(241,225,230,0.95)] pt-12">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                {locale === "zh" ? "相关指南" : "Related guides"}
              </p>
              <h2 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.7rem]">
                {locale === "zh" ? "先了解，再决定是否购买" : "Read first, then decide what to buy"}
              </h2>
              <p className="mt-4 text-sm leading-8 text-[#6d6670]">
                {locale === "zh"
                  ? "如果你还在比较材质、送礼场景或搭配方式，可以先看相关指南，再返回商品页做最终选择。"
                  : "If you are still comparing materials, gifting use cases or bundle ideas, these guides can help before you make the final buying decision."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/${locale}/guides/${guide.slug}`}
                  className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)] transition hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap gap-2">
                    <StorefrontInfoPill>{guide.category}</StorefrontInfoPill>
                    <StorefrontInfoPill className="bg-white">
                      {locale === "zh" ? `${guide.readingMinutes} 分钟阅读` : `${guide.readingMinutes} min read`}
                    </StorefrontInfoPill>
                  </div>
                  <h3 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6d6670]">{guide.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-8 border-t border-[rgba(241,225,230,0.95)] pt-12">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
              {locale === "zh" ? "相关推荐" : "Related products"}
            </p>
            <h2 className="mt-4 text-[2.4rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[3rem]">{dictionary.shop.relatedProducts}</h2>
            <p className="mt-4 text-sm leading-8 text-[#6d6670]">
              {locale === "zh"
                ? "如果你正在比较同类商品，这里可以继续查看相近材质、价位或送礼场景的商品，帮助提升搭配购买和加购效率。"
                : "If you are comparing similar items, this section helps you review related products with comparable materials, pricing or gifting use cases for easier bundle and add-on decisions."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} locale={locale} priority={index < 2} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
