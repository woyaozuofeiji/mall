import type { Metadata } from "next";
import Link from "next/link";
import { getShopProducts } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getRelatedGuides } from "@/lib/guide-content";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontInfoPill, StorefrontPanel } from "@/components/storefront/page-hero";
import { Container } from "@/components/ui/container";

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
    path: "/shop/new-arrivals",
    primaryImagePath: getOgImagePath(locale, "/shop/new-arrivals"),
    title: locale === "zh" ? "新品上架与最新礼物精选" : "New Arrivals & Latest Gift Picks",
    description:
      locale === "zh"
        ? "查看最新上架的毛绒玩偶、饰品与礼品小物，适合快速发现新品、节日礼物和轻加购商品。"
        : "Browse the latest plush toys, jewelry and compact gift items for new launches, seasonal gifting and easy add-on purchases.",
    keywords:
      locale === "zh"
        ? ["新品上架", "最新礼物", "毛绒新品", "饰品新品", "礼品小物"]
        : ["new arrivals", "latest gifts", "new plush toys", "new jewelry", "gift picks"],
  });
}

export default async function NewArrivalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const [{ products, pagination }, relatedGuides] = await Promise.all([
    getShopProducts({ sort: "newest" }),
    Promise.resolve(getRelatedGuides("all", locale).slice(0, 3)),
  ]);
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
            name: locale === "zh" ? "新品上架" : "New arrivals",
            item: absoluteUrl(`/${locale}/shop/new-arrivals`),
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: locale === "zh" ? "新品上架" : "New arrivals",
        description:
          locale === "zh"
            ? "最新发布的精选商品列表，覆盖毛绒、饰品和轻礼品。"
            : "A curated list of the newest products across plush, jewelry and compact gifts.",
        url: absoluteUrl(`/${locale}/shop/new-arrivals`),
        hasPart: products.slice(0, 12).map((product) => ({
          "@type": "Product",
          name: product.name[locale],
          url: absoluteUrl(`/${locale}/shop/${product.slug}`),
          image: product.image ? absoluteUrl(product.image) : undefined,
        })),
      },
    ],
  };

  const copy =
    locale === "zh"
      ? {
          eyebrow: "新品上架",
          title: "最新发布的精选商品",
          description: "这里集中展示近期上新的商品，方便你快速发现新款、节日礼物和适合顺手加购的小件商品。",
          count: `${pagination.totalCount} 款新品与最新商品`,
          relatedTitle: "新品选购参考",
          relatedDescription: "这些指南可以帮助你判断新品是否适合送礼、加购或跨境配送。",
        }
      : {
          eyebrow: "New arrivals",
          title: "Latest curated products",
          description: "This page gathers recent arrivals so you can quickly find fresh launches, seasonal gifts and easy add-on items.",
          count: `${pagination.totalCount} new and recent items`,
          relatedTitle: "Buying context for new picks",
          relatedDescription: "These guides help shoppers judge whether a new item works for gifting, add-on purchases or cross-border delivery.",
        };

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <Container className="space-y-8 pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#8f8791]">
          <Link href={`/${locale}`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.shop}
          </Link>
          <span>/</span>
          <span className="text-[#4d4650]">{locale === "zh" ? "新品上架" : "New arrivals"}</span>
        </div>

        <StorefrontPanel className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.eyebrow}</p>
              <h1 className="mt-3 text-[2.15rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.75rem]">
                {copy.title}
              </h1>
              <p className="mt-4 text-sm leading-8 text-[#6d6670] sm:text-[15px]">{copy.description}</p>
            </div>
            <StorefrontInfoPill>{copy.count}</StorefrontInfoPill>
          </div>
        </StorefrontPanel>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} locale={locale} priority={index < 4} />
          ))}
        </section>

        <StorefrontPanel className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                {locale === "zh" ? "延伸阅读" : "Related guides"}
              </p>
              <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{copy.relatedTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6d6670]">{copy.relatedDescription}</p>
            </div>
            <div className="grid gap-3 lg:min-w-[24rem]">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/${locale}/guides/${guide.slug}`}
                  className="rounded-[1.25rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:-translate-y-0.5 hover:text-[#ff6d88]"
                >
                  {guide.title}
                </Link>
              ))}
            </div>
          </div>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
