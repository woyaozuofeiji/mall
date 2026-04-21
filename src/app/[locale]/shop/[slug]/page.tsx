import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { ProductGallery } from "@/components/shop/product-gallery";
import { StorefrontInfoPill, StorefrontPanel } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const related = await getRelatedProducts({
    categorySlug: product.categorySlug,
    excludeProductId: product.id,
    take: 3,
  });
  const heroSpecs = product.specs.slice(0, 3);

  return (
    <div className="space-y-10 pb-16 pt-8 sm:space-y-12 sm:pb-20 sm:pt-10">
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
          <span className="text-[#4d4650]">{t(locale, product.name)}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] xl:items-start">
          <div>
            <ProductGallery key={product.id} product={product} locale={locale} />
          </div>

          <StorefrontPanel className="space-y-5 p-5 lg:sticky lg:top-28 lg:h-fit sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{product.categorySlug}</Badge>
              {product.featured ? <Badge className="border-transparent bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] text-white">{locale === "zh" ? "热销" : "Bestseller"}</Badge> : null}
              {product.isNew ? <Badge className="bg-[#fff3f6] text-[#ff6d88]">{locale === "zh" ? "新品" : "New"}</Badge> : null}
              <span className="inline-flex items-center rounded-full bg-[#fff8fa] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f8791] ring-1 ring-[rgba(241,225,230,0.95)]">
                {product.availability ? t(locale, product.availability) : locale === "zh" ? "有库存" : "In stock"}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[#2f2b32] sm:text-[3.3rem]">{t(locale, product.name)}</h1>
              <p className="max-w-2xl text-[15px] leading-7 text-[#6d6670]">{t(locale, product.subtitle)}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{formatCurrency(product.price, locale)}</p>
                {product.compareAtPrice ? <p className="pb-1 text-base text-[#b3a8b2] line-through">{formatCurrency(product.compareAtPrice, locale)}</p> : null}
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

            <div className="flex flex-wrap gap-2">
              {heroSpecs.map((spec) => (
                <StorefrontInfoPill key={spec.label.en}>{t(locale, spec.label)} · {t(locale, spec.value)}</StorefrontInfoPill>
              ))}
            </div>

            <AddToCartButton product={product} locale={locale} cta={dictionary.common.addToCart} added={dictionary.common.added} />
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

        <section id="product-content" className="scroll-mt-32 space-y-8">
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">Product information</p>
            <h2 className="text-[2.4rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[3rem]">
              {locale === "zh" ? "更完整的商品内容区" : "A fuller product content area"}
            </h2>
            <p className="max-w-3xl text-sm leading-8 text-[#6d6670]">
              {locale === "zh"
                ? "详情页会继续承接首页的柔和精品店调性，把描述、参数、配送和评价拆成更清晰的层级。"
                : "The product page continues the homepage’s soft boutique direction while separating description, details, shipping and reviews into clearer layers."}
            </p>
          </div>
          <ProductDetailTabs product={product} locale={locale} />
        </section>

        <section className="space-y-8 border-t border-[rgba(241,225,230,0.95)] pt-12">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">Related editing</p>
            <h2 className="mt-4 text-[2.4rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[3rem]">{dictionary.shop.relatedProducts}</h2>
            <p className="mt-4 text-sm leading-8 text-[#6d6670]">
              {locale === "zh"
                ? "关联商品继续保持首页和列表页的同一套卡片系统，让浏览体验更完整。"
                : "Related products use the same card language as the homepage and collection page to keep the browsing flow visually consistent."}
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
