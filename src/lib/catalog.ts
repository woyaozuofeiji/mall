import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Category, LocalizedText, Product, ProductImage, ProductSpec } from "@/lib/types";

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: true,
    images: {
      orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    },
    variants: {
      orderBy: { createdAt: "asc" },
    },
    tags: {
      include: { tag: true },
    },
  },
});

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

type ShopSort = "featured" | "newest" | "price_low" | "price_high";

type ProductSpecRecord = {
  labelEn?: string;
  labelZh?: string;
  valueEn?: string;
  valueZh?: string;
};

type ProductSourcePayload = {
  sku?: string;
  availabilityStatus?: string;
  reviewSummary?: {
    rating?: number;
    count?: number;
  };
};

function localized(en?: string | null, zh?: string | null): LocalizedText {
  return {
    en: en ?? "",
    zh: zh ?? en ?? "",
  };
}

function toNumber(value?: Prisma.Decimal | null) {
  if (value == null) return undefined;
  return Number(value);
}

function parseSpecs(raw: Prisma.JsonValue | null): ProductSpec[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return [];
  }

  const specs = Reflect.get(raw, "specs");
  if (!Array.isArray(specs)) {
    return [];
  }

  return specs
    .filter((item): item is ProductSpecRecord => typeof item === "object" && item !== null)
    .map((item) => ({
      label: localized(item.labelEn, item.labelZh),
      value: localized(item.valueEn, item.valueZh),
    }))
    .filter((item) => item.label.en || item.label.zh || item.value.en || item.value.zh);
}

function mapCategory(record: {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
}): Category {
  return {
    id: record.id,
    slug: record.slug,
    name: localized(record.nameEn, record.nameZh),
    description: localized(record.descriptionEn, record.descriptionZh),
  };
}

function mapProductImages(record: ProductWithRelations): ProductImage[] {
  const images = record.images.map((image, index) => ({
    url: image.url,
    alt: localized(image.altEn, image.altZh),
    isCover: image.isCover,
    sortOrder: image.sortOrder ?? index,
  }));

  if (images.length > 0) {
    return images;
  }

  return [
    {
      url: "/products/aurora-bunny.svg",
      alt: localized(record.nameEn, record.nameZh),
      isCover: true,
      sortOrder: 0,
    },
  ];
}

function mapProduct(record: ProductWithRelations): Product {
  const images = mapProductImages(record);
  const coverImage = images.find((image) => image.isCover)?.url ?? images[0]?.url ?? "/products/aurora-bunny.svg";
  const sourcePayload = (record.sourcePayload ?? {}) as ProductSourcePayload;

  return {
    id: record.id,
    slug: record.slug,
    categorySlug: record.category.slug,
    name: localized(record.nameEn, record.nameZh),
    subtitle: localized(record.subtitleEn, record.subtitleZh),
    description: localized(record.descriptionEn, record.descriptionZh),
    story: localized(record.storyEn, record.storyZh),
    tags: record.tags.map((item) => item.tag.slug),
    sku: sourcePayload.sku,
    availability: sourcePayload.availabilityStatus ? localized(sourcePayload.availabilityStatus, sourcePayload.availabilityStatus) : undefined,
    price: Number(record.price),
    compareAtPrice: toNumber(record.compareAtPrice),
    featured: record.featured,
    isNew: record.isNew,
    leadTime: localized(record.leadTimeEn, record.leadTimeZh),
    shippingNote: localized(record.shippingNoteEn, record.shippingNoteZh),
    image: coverImage,
    images,
    variants: record.variants.map((variant) => ({
      id: variant.id,
      label: localized(variant.labelEn, variant.labelZh),
    })),
    specs: parseSpecs(record.attributes),
    reviewSummary: sourcePayload.reviewSummary?.rating && sourcePayload.reviewSummary?.count
      ? {
          rating: Number(sourcePayload.reviewSummary.rating),
          count: Number(sourcePayload.reviewSummary.count),
        }
      : undefined,
  };
}

function buildSort(sort: ShopSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ isNew: "desc" }, { createdAt: "desc" }];
    case "price_low":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_high":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "featured":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

function buildPublishedProductWhere(input?: { category?: string; q?: string }): Prisma.ProductWhereInput {
  const category = input?.category && input.category !== "all" ? input.category : undefined;
  const q = input?.q?.trim();

  return {
    status: "PUBLISHED",
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { nameEn: { contains: q, mode: "insensitive" } },
            { nameZh: { contains: q, mode: "insensitive" } },
            { subtitleEn: { contains: q, mode: "insensitive" } },
            { subtitleZh: { contains: q, mode: "insensitive" } },
            {
              tags: {
                some: {
                  tag: {
                    OR: [
                      { slug: { contains: q, mode: "insensitive" } },
                      { labelEn: { contains: q, mode: "insensitive" } },
                      { labelZh: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function getCatalogCategories() {
  const records = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  return records.map(mapCategory);
}

export async function getCategoryBySlug(slug: string) {
  const record = await prisma.category.findUnique({
    where: { slug },
  });

  if (!record) {
    return null;
  }

  return mapCategory(record);
}

export async function getHomepageProducts() {
  const [featured, latest] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: productWithRelations.include,
      orderBy: [{ createdAt: "desc" }],
      take: 4,
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isNew: true },
      include: productWithRelations.include,
      orderBy: [{ createdAt: "desc" }],
      take: 3,
    }),
  ]);

  return {
    featured: featured.map(mapProduct),
    latest: latest.map(mapProduct),
  };
}

export async function getShopProducts(input?: { category?: string; q?: string; sort?: ShopSort }) {
  const sort = input?.sort ?? "featured";
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    prisma.product.findMany({
      where: buildPublishedProductWhere(input),
      include: productWithRelations.include,
      orderBy: buildSort(sort),
    }),
  ]);

  return {
    categories,
    products: products.map(mapProduct),
  };
}

export async function getProductBySlug(slug: string) {
  const record = await prisma.product.findUnique({
    where: { slug },
    include: productWithRelations.include,
  });

  if (!record || record.status !== "PUBLISHED") {
    return null;
  }

  return mapProduct(record);
}

export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) {
    return [];
  }

  const records = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      slug: {
        in: slugs,
      },
    },
    include: productWithRelations.include,
  });

  const mapped = new Map(records.map((record) => [record.slug, mapProduct(record)]));
  return slugs.map((slug) => mapped.get(slug)).filter((product): product is Product => Boolean(product));
}

export async function getRelatedProducts(input: { categorySlug: string; excludeProductId: string; take?: number }) {
  const records = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      category: {
        slug: input.categorySlug,
      },
      id: {
        not: input.excludeProductId,
      },
    },
    include: productWithRelations.include,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: input.take ?? 3,
  });

  return records.map(mapProduct);
}

export async function getSearchProducts(q?: string) {
  const keyword = q?.trim();
  if (!keyword) {
    return [];
  }

  const records = await prisma.product.findMany({
    where: buildPublishedProductWhere({ q: keyword }),
    include: productWithRelations.include,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return records.map(mapProduct);
}

export async function getPublishedProductSlugs() {
  const records = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  return records;
}
