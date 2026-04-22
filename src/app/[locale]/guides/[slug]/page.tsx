import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductsBySlugs } from "@/lib/catalog";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { getGuideBySlug, getRelatedGuides } from "@/lib/guide-content";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/shop/product-card";
import { StorefrontPageHero, StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const guide = getGuideBySlug(slug);
  if (!guide) {
    return buildPageMetadata({
      locale,
      path: `/guides/${slug}`,
      title: locale === "zh" ? "指南不存在" : "Guide not found",
      description: locale === "zh" ? "未找到对应指南内容。" : "The requested guide could not be found.",
      noIndex: true,
    });
  }

  const metadata = buildPageMetadata({
    locale,
    path: `/guides/${guide.slug}`,
    primaryImagePath: getOgImagePath(locale, `/guides/${guide.slug}`),
    title: guide.title[locale],
    description: guide.description[locale],
    type: "article",
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [SITE_NAME],
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const guide = getGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [related, relatedProducts] = await Promise.all([
    Promise.resolve(getRelatedGuides("all", locale, guide.slug).slice(0, 2)),
    getProductsBySlugs(guide.relatedProductSlugs ?? []),
  ]);
  const guideUrl = absoluteUrl(`/${locale}/guides/${guide.slug}`);
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
            name: locale === "zh" ? "选购指南" : "Guides",
            item: absoluteUrl(`/${locale}/guides`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title[locale],
            item: guideUrl,
          },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title[locale],
        description: guide.description[locale],
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/favicon.ico"),
          },
        },
        mainEntityOfPage: guideUrl,
      },
    ],
  };

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <StorefrontPageHero
        eyebrow={locale === "zh" ? "Guide" : "Guide"}
        title={guide.title[locale]}
        description={guide.description[locale]}
        side={
          <div className="space-y-4 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">
              {locale === "zh" ? "阅读信息" : "Reading info"}
            </p>
            <div className="flex flex-wrap gap-2">
              <StorefrontInfoPill>{guide.category}</StorefrontInfoPill>
              <StorefrontInfoPill className="bg-white">
                {locale === "zh" ? `${guide.readingMinutes} 分钟阅读` : `${guide.readingMinutes} min read`}
              </StorefrontInfoPill>
            </div>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? `发布时间 ${new Date(guide.publishedAt).toISOString().slice(0, 10)}，适合作为商品页、分类页和 FAQ 之外的补充内容入口。`
                : `Published on ${new Date(guide.publishedAt).toISOString().slice(0, 10)}, this guide supports topic coverage beyond product, collection and FAQ pages.`}
            </p>
          </div>
        }
      />

      <Container className="space-y-8">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#8f8791]">
          <Link href={`/${locale}`} className="transition hover:text-[#ff6d88]">
            {dictionary.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/guides`} className="transition hover:text-[#ff6d88]">
            {locale === "zh" ? "指南" : "Guides"}
          </Link>
          <span>/</span>
          <span className="text-[#4d4650]">{guide.title[locale]}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
          <StorefrontPanel className="space-y-6 p-7 sm:p-9">
            <p className="text-base leading-8 text-[#6d6670]">{guide.intro[locale]}</p>

            {guide.sections.map((section, index) => (
              <section key={section.heading.en} className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
                <div className="flex items-center gap-3">
                  <StorefrontInfoPill>{String(index + 1).padStart(2, "0")}</StorefrontInfoPill>
                  <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{section.heading[locale]}</h2>
                </div>
                <p className="mt-4 text-sm leading-8 text-[#6d6670]">{section.body[locale]}</p>
              </section>
            ))}

            {relatedProducts.length > 0 ? (
              <section className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                  {locale === "zh" ? "相关商品" : "Related products"}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">
                  {locale === "zh"
                    ? "这些商品与当前指南主题更接近，适合继续查看详情页、比较规格或直接加入购物车。"
                    : "These products are closely tied to the topic of this guide and are good next steps if you want to compare details or continue shopping."}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} locale={locale} priority={index === 0} />
                  ))}
                </div>
              </section>
            ) : null}
          </StorefrontPanel>

          <div className="space-y-5">
            <StorefrontPanel className="p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                {locale === "zh" ? "延伸阅读" : "Related reading"}
              </p>
              <div className="mt-5 space-y-4">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/guides/${item.slug}`}
                    className="block rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)] transition hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap gap-2">
                      <StorefrontInfoPill>{item.category}</StorefrontInfoPill>
                      <StorefrontInfoPill className="bg-white">
                        {locale === "zh" ? `${item.readingMinutes} 分钟阅读` : `${item.readingMinutes} min read`}
                      </StorefrontInfoPill>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#2f2b32]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6d6670]">{item.description}</p>
                  </Link>
                ))}
              </div>
            </StorefrontPanel>

            <StorefrontPanel className="p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
                {locale === "zh" ? "继续浏览" : "Continue browsing"}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/shop`}
                  className="inline-flex items-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-4 py-2 text-sm font-semibold text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                >
                  {dictionary.nav.shop}
                </Link>
                <Link
                  href={`/${locale}/guides`}
                  className="inline-flex items-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-4 py-2 text-sm font-semibold text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                >
                  {locale === "zh" ? "全部指南" : "All guides"}
                </Link>
                <Link
                  href={`/${locale}/faq`}
                  className="inline-flex items-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-4 py-2 text-sm font-semibold text-[#3a353d] transition hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
                >
                  {dictionary.nav.faq}
                </Link>
              </div>
            </StorefrontPanel>
          </div>
        </div>
      </Container>
    </div>
  );
}
