import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rewriteImportAssetUrl } from "@/lib/import-media";
import type { Category, LocalizedText, Product, ProductImage, ProductReview, ProductSpec } from "@/lib/types";

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

type ShopPagination = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

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
  reviews?: Array<{
    id?: string;
    title?: string | { en?: string; zh?: string };
    author?: string;
    content?: string | { en?: string; zh?: string };
    rating?: number;
    date?: string;
    verified?: boolean;
  }>;
  raw?: {
    product?: {
      reviews?: Array<{
        id?: string;
        title?: string;
        author?: string;
        content?: string;
        rating?: number;
        timestamp?: string;
        is_verified?: boolean;
      }>;
    };
  };
};

function parseReviewItems(sourcePayload: ProductSourcePayload): ProductReview[] {
  const sourceReviews = Array.isArray(sourcePayload.reviews)
    ? sourcePayload.reviews
    : Array.isArray(sourcePayload.raw?.product?.reviews)
      ? sourcePayload.raw.product.reviews.map((review) => ({
          id: review.id,
          title: review.title,
          author: review.author,
          content: review.content,
          rating: review.rating,
          date: review.timestamp,
          verified: review.is_verified,
        }))
      : [];

  return sourceReviews
    .filter((review) => typeof review === "object" && review !== null)
    .map((review, index) => ({
      id: review.id ?? `review-${index + 1}`,
      title: review.title
        ? typeof review.title === "object"
          ? localized(review.title.en, review.title.zh)
          : localized(review.title, review.title)
        : undefined,
      author: review.author?.trim() || "Verified customer",
      content: typeof review.content === "object"
        ? localized(review.content.en, review.content.zh)
        : localized(review.content, review.content),
      rating: typeof review.rating === "number" ? review.rating : 5,
      date: review.date?.replace(/^Reviewed in .*? on /i, "").replace(/^Reviewed in .*? /i, "").trim() || undefined,
      verified: review.verified,
    }))
    .filter((review) => Boolean(review.content.en || review.content.zh))
    .slice(0, 6);
}

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
    url: rewriteImportAssetUrl(image.url),
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
      sku: variant.sku ?? undefined,
      price: toNumber(variant.price),
      inventory: variant.inventory,
    })),
    specs: parseSpecs(record.attributes),
    reviewSummary: sourcePayload.reviewSummary?.rating && sourcePayload.reviewSummary?.count
      ? {
          rating: Number(sourcePayload.reviewSummary.rating),
          count: Number(sourcePayload.reviewSummary.count),
        }
      : undefined,
    reviews: parseReviewItems(sourcePayload),
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

export async function getCategorySitemapEntries() {
  const records = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
      products: {
        where: {
          status: "PUBLISHED",
        },
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return records.map((record) => ({
    slug: record.slug,
    updatedAt: record.products[0]?.updatedAt ?? record.updatedAt,
  }));
}

export async function getCatalogLastModified() {
  const [product, category] = await Promise.all([
    prisma.product.findFirst({
      where: { status: "PUBLISHED" },
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findFirst({
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return product?.updatedAt ?? category?.updatedAt ?? new Date("2026-04-21T00:00:00.000Z");
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

export async function getHomepageProducts(input?: { featuredTake?: number; latestTake?: number }) {
  const featuredTake = input?.featuredTake ?? 4;
  const latestTake = input?.latestTake ?? 3;

  const [featured, latest] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: productWithRelations.include,
      orderBy: [{ createdAt: "desc" }],
      take: featuredTake,
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isNew: true },
      include: productWithRelations.include,
      orderBy: [{ createdAt: "desc" }],
      take: latestTake,
    }),
  ]);

  return {
    featured: featured.map(mapProduct),
    latest: latest.map(mapProduct),
  };
}

export async function getShopProducts(input?: { category?: string; q?: string; sort?: ShopSort; page?: number; pageSize?: number }) {
  const sort = input?.sort ?? "featured";
  const requestedPage = typeof input?.page === "number" && Number.isFinite(input.page) ? Math.max(1, Math.floor(input.page)) : 1;
  const requestedPageSize = typeof input?.pageSize === "number" && Number.isFinite(input.pageSize) ? Math.max(1, Math.floor(input.pageSize)) : undefined;
  const where = buildPublishedProductWhere(input);
  const categoriesPromise = getCatalogCategories();

  if (!requestedPageSize) {
    const [categories, products] = await Promise.all([
      categoriesPromise,
      prisma.product.findMany({
        where,
        include: productWithRelations.include,
        orderBy: buildSort(sort),
      }),
    ]);

    const pagination: ShopPagination = {
      totalCount: products.length,
      pageSize: products.length > 0 ? products.length : 1,
      currentPage: 1,
      totalPages: products.length > 0 ? 1 : 0,
      hasPrevPage: false,
      hasNextPage: false,
    };

    return {
      categories,
      products: products.map(mapProduct),
      pagination,
    };
  }

  const [categories, totalCount] = await Promise.all([
    categoriesPromise,
    prisma.product.count({
      where,
    }),
  ]);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / requestedPageSize) : 0;
  const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  const products = await prisma.product.findMany({
    where,
    include: productWithRelations.include,
    orderBy: buildSort(sort),
    skip: totalPages > 0 ? (currentPage - 1) * requestedPageSize : 0,
    take: requestedPageSize,
  });

  const pagination: ShopPagination = {
    totalCount,
    pageSize: requestedPageSize,
    currentPage,
    totalPages,
    hasPrevPage: currentPage > 1,
    hasNextPage: totalPages > 0 && currentPage < totalPages,
  };

  return {
    categories,
    products: products.map(mapProduct),
    pagination,
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

export async function getPublishedProductSitemapEntries() {
  const records = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
      images: {
        select: {
          url: true,
          isCover: true,
          sortOrder: true,
          createdAt: true,
        },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => ({
    slug: record.slug,
    updatedAt: record.updatedAt,
    images: record.images.map((image) => image.url),
  }));
}
