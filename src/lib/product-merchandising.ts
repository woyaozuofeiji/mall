import type { Locale, Product, ProductReview, ProductSpec } from "@/lib/types";
import { t } from "@/lib/i18n";
import { truncateDescription } from "@/lib/seo";

type FactKey = "material" | "size" | "packaging" | "use" | "care";

export interface ProductFact {
  key: FactKey;
  label: string;
  value: string;
}

const factMatchers: Record<FactKey, string[]> = {
  material: ["material", "fabric", "材质", "面料"],
  size: ["size", "dimension", "dimensions", "height", "length", "尺寸", "高度", "长度"],
  packaging: ["packaging", "package", "set includes", "包装", "套装内容"],
  use: ["usage", "recommended use", "use case", "用途", "适用场景"],
  care: ["care", "cleaning", "护理", "清洁"],
};

function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

function matchesFact(label: string, candidates: string[]) {
  const normalized = normalizeLabel(label);
  return candidates.some((candidate) => normalized.includes(candidate));
}

function findFactValue(product: Product, locale: Locale, candidates: string[]) {
  const match = product.specs.find((spec) => {
    const labelEn = spec.label.en ? matchesFact(spec.label.en, candidates) : false;
    const labelZh = spec.label.zh ? matchesFact(spec.label.zh, candidates) : false;
    return labelEn || labelZh;
  });

  return match ? t(locale, match.value) : undefined;
}

function buildGiftMoments(product: Product, locale: Locale) {
  switch (product.categorySlug) {
    case "plush":
      return locale === "zh"
        ? ["生日礼物和陪伴型小惊喜", "桌面、床头或书架摆放", "节日礼盒里的温柔主角"]
        : ["Birthday gifts and comfort-focused surprises", "Desk, bedside or shelf styling", "A soft hero item inside seasonal gift sets"];
    case "jewelry":
      return locale === "zh"
        ? ["生日、纪念日与节日送礼", "轻量加购和礼盒搭配", "通勤或约会造型点缀"]
        : ["Birthday, anniversary and holiday gifting", "Lightweight add-ons for curated gift boxes", "Easy everyday styling for work or dinner looks"];
    default:
      return locale === "zh"
        ? ["结账前的轻加购礼物", "桌面、书房和居家角落布置", "和毛绒或饰品组合销售"]
        : ["Low-friction checkout add-ons", "Desk, study and home-corner styling", "Easy bundle pairing with plush toys or accessories"];
  }
}

export function getProductFacts(product: Product, locale: Locale): ProductFact[] {
  const labels =
    locale === "zh"
      ? {
          material: "材质",
          size: "尺寸",
          packaging: "包装",
          use: "适用场景",
          care: "护理",
        }
      : {
          material: "Material",
          size: "Size",
          packaging: "Packaging",
          use: "Best for",
          care: "Care",
        };

  const orderedKeys: FactKey[] = ["material", "size", "packaging", "use", "care"];

  return orderedKeys
    .map((key) => {
      const value = findFactValue(product, locale, factMatchers[key]);
      return value
        ? {
            key,
            label: labels[key],
            value,
          }
        : null;
    })
    .filter((item): item is ProductFact => Boolean(item))
    .slice(0, 4);
}

export function getProductGiftMoments(product: Product, locale: Locale) {
  return buildGiftMoments(product, locale);
}

export function buildProductMetaDescription(product: Product, locale: Locale) {
  const facts = getProductFacts(product, locale);
  const factText = facts
    .slice(0, 3)
    .map((fact) => `${fact.label}: ${fact.value}`)
    .join(locale === "zh" ? "；" : " · ");

  const closing =
    locale === "zh"
      ? product.categorySlug === "plush"
        ? "适合作为送礼和桌面陈列的精选毛绒商品。"
        : product.categorySlug === "jewelry"
          ? "适合作为礼盒加购和节日送礼的精品饰品。"
          : "适合作为轻礼物、桌面点缀和组合销售的小型精品。"
      : product.categorySlug === "plush"
        ? "A curated plush pick for gifting and cozy display moments."
      : product.categorySlug === "jewelry"
        ? "A boutique accessory for gift boxes, seasonal launches and polished everyday wear."
        : "A compact boutique add-on for gifting, desk styling and easy bundle moments.";

  return truncateDescription(
    [t(locale, product.subtitle), factText, closing].filter(Boolean).join(" "),
    170,
  );
}

function mapReviewAuthor(review: ProductReview) {
  return review.author.trim() || "Verified customer";
}

export function getProductSchemaDetails(product: Product, locale: Locale) {
  const facts = getProductFacts(product, locale);
  const material = facts.find((fact) => fact.key === "material")?.value;
  const size = facts.find((fact) => fact.key === "size")?.value;
  const packaging = facts.find((fact) => fact.key === "packaging")?.value;

  return {
    material,
    size,
    additionalProperty: product.specs.map((spec: ProductSpec) => ({
      "@type": "PropertyValue",
      name: t(locale, spec.label),
      value: t(locale, spec.value),
    })),
    review: (product.reviews ?? []).slice(0, 4).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: mapReviewAuthor(review),
      },
      reviewBody: t(locale, review.content),
      ...(review.title
        ? {
            name: t(locale, review.title),
          }
        : {}),
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
    })),
    packaging,
    giftMoments: getProductGiftMoments(product, locale),
  };
}
