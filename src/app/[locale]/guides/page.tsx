import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata, getOgImagePath, serializeJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getGuideSummaries } from "@/lib/guide-content";
import { Container } from "@/components/ui/container";
import { StorefrontPageHero, StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";

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
    path: "/guides",
    primaryImagePath: getOgImagePath(locale, "/guides"),
    title: locale === "zh" ? "选购指南与礼物灵感" : "Buying Guides & Gift Ideas",
    description:
      locale === "zh"
        ? "浏览毛绒玩偶、饰品和桌面礼品的选购指南，帮助用户在下单前更快理解商品和送礼场景。"
        : "Explore buying guides for plush toys, jewelry and gift-ready accessories to help shoppers choose with more confidence.",
    keywords:
      locale === "zh"
        ? ["选购指南", "送礼灵感", "毛绒玩偶", "饰品指南", "礼物推荐"]
        : ["buying guides", "gift ideas", "plush guide", "jewelry guide", "gift shop tips"],
  });
}

export default async function GuidesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const items = getGuideSummaries(locale);
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
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: items.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/${locale}/guides/${guide.slug}`),
          name: guide.title,
        })),
      },
    ],
  };

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <StorefrontPageHero
        eyebrow={locale === "zh" ? "Guides" : "Guides"}
        title={locale === "zh" ? "选购指南与送礼灵感" : "Buying guides and gift ideas"}
        description={
          locale === "zh"
            ? "这些内容页帮助用户理解毛绒、饰品和轻礼品的选购重点，也能为搜索引擎提供更稳定的主题内容入口。"
            : "These evergreen content pages explain how to choose plush toys, jewelry and compact gift items while giving search engines stronger topic-specific landing pages."
        }
        side={
          <div className="space-y-4 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">
              {locale === "zh" ? "内容方向" : "Content focus"}
            </p>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? "内容围绕送礼场景、商品选择、包装运输和加购逻辑展开，适合持续补充成长尾流量入口。"
                : "The guide hub focuses on gifting use cases, product selection, packaging, shipping expectations and add-on buying decisions for longer-tail search traffic."}
            </p>
            <div className="flex flex-wrap gap-2">
              <StorefrontInfoPill>{locale === "zh" ? `${items.length} 篇指南` : `${items.length} guides`}</StorefrontInfoPill>
              <StorefrontInfoPill>{locale === "zh" ? "持续可扩展内容" : "Evergreen content"}</StorefrontInfoPill>
            </div>
          </div>
        }
      />

      <Container className="space-y-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((guide) => (
            <StorefrontPanel key={guide.slug} className="flex h-full flex-col p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <StorefrontInfoPill>{guide.category}</StorefrontInfoPill>
                <StorefrontInfoPill className="bg-white">{locale === "zh" ? `${guide.readingMinutes} 分钟阅读` : `${guide.readingMinutes} min read`}</StorefrontInfoPill>
              </div>
              <h2 className="mt-5 text-[1.55rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{guide.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#6d6670]">{guide.description}</p>
              <p className="mt-4 text-sm leading-8 text-[#6d6670]">{guide.intro}</p>
              <Link
                href={`/${locale}/guides/${guide.slug}`}
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#ff6d88] transition hover:translate-x-0.5"
              >
                {locale === "zh" ? "阅读全文" : "Read guide"}
              </Link>
            </StorefrontPanel>
          ))}
        </div>
      </Container>
    </div>
  );
}
