import { ImageResponse } from "next/og";
import { getCategoryBySlug, getProductBySlug } from "@/lib/catalog";
import { categoryContent, isSeoCategorySlug } from "@/lib/category-content";
import { getGuideBySlug } from "@/lib/guide-content";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { createOgCard, ogSize } from "@/lib/og";

export const runtime = "nodejs";

function fallbackImage(locale: "en" | "zh") {
  const dictionary = getDictionary(locale);

  return createOgCard({
    eyebrow: locale === "zh" ? "首页" : "Homepage",
    title: locale === "zh" ? "毛绒玩偶、饰品与礼物精选" : "Boutique Plush Toys, Jewelry & Gift Ideas",
    description: dictionary.hero.description,
    locale: locale === "zh" ? "ZH" : "EN",
    variant: "default",
  });
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string[] }>;
  },
) {
  const { slug } = await params;
  const [localeSegment, ...segments] = slug;
  const resolvedLocale = isLocale(localeSegment) ? localeSegment : "en";

  if (segments.length === 0) {
    return new ImageResponse(fallbackImage(resolvedLocale), ogSize);
  }

  if (segments.length === 1 && segments[0] === "guides") {
    return new ImageResponse(
      createOgCard({
        eyebrow: resolvedLocale === "zh" ? "指南" : "Guides",
        title: resolvedLocale === "zh" ? "选购指南与送礼灵感" : "Buying Guides & Gift Ideas",
        description:
          resolvedLocale === "zh"
            ? "围绕毛绒玩偶、饰品和轻礼品的送礼场景、商品选择和运输说明的 evergreen 内容。"
            : "Evergreen content about gifting use cases, product selection and shipping expectations for plush toys, jewelry and compact gift items.",
        locale: resolvedLocale === "zh" ? "ZH" : "EN",
        variant: "guide",
      }),
      ogSize,
    );
  }

  if (segments[0] === "guides" && segments.length === 2) {
    const guide = getGuideBySlug(segments[1]);

    return new ImageResponse(
      createOgCard({
        eyebrow: resolvedLocale === "zh" ? "指南文章" : "Guide article",
        title: guide ? guide.title[resolvedLocale] : resolvedLocale === "zh" ? "选购指南" : "Buying guide",
        description: guide?.description[resolvedLocale],
        locale: resolvedLocale === "zh" ? "ZH" : "EN",
        variant: "guide",
        footer: guide ? `${guide.readingMinutes} min read · Northstar Atelier` : undefined,
      }),
      ogSize,
    );
  }

  if (segments[0] === "shop" && segments[1] === "category" && segments[2]) {
    const category = await getCategoryBySlug(segments[2]);
    const variant = category && isSeoCategorySlug(category.slug) ? category.slug : "default";
    const copy = category && isSeoCategorySlug(category.slug) ? categoryContent[category.slug][resolvedLocale] : null;

    return new ImageResponse(
      createOgCard({
        eyebrow: resolvedLocale === "zh" ? "商品分类" : "Collection",
        title: copy?.title ?? (category ? t(resolvedLocale, category.name) : resolvedLocale === "zh" ? "精选分类" : "Curated collection"),
        description: copy?.description ?? (category ? t(resolvedLocale, category.description) : undefined),
        locale: resolvedLocale === "zh" ? "ZH" : "EN",
        variant,
      }),
      ogSize,
    );
  }

  if (segments[0] === "shop" && segments[1]) {
    const product = await getProductBySlug(segments[1]);
    const variant =
      product?.categorySlug === "plush" || product?.categorySlug === "jewelry" || product?.categorySlug === "gifts"
        ? product.categorySlug
        : "default";

    return new ImageResponse(
      createOgCard({
        eyebrow: resolvedLocale === "zh" ? "商品详情" : "Product detail",
        title: product ? t(resolvedLocale, product.name) : resolvedLocale === "zh" ? "精选商品" : "Curated product",
        description: product ? t(resolvedLocale, product.subtitle) : undefined,
        locale: resolvedLocale === "zh" ? "ZH" : "EN",
        variant,
        footer: product ? `${product.categorySlug.toUpperCase()} · Northstar Atelier` : undefined,
      }),
      ogSize,
    );
  }

  return new ImageResponse(fallbackImage(resolvedLocale), ogSize);
}

