import "server-only";

import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminProductPayload } from "@/lib/validation/admin";

const productDetailInclude = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: true,
    images: {
      orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    },
    variants: {
      orderBy: { createdAt: "asc" },
    },
    tags: {
      include: {
        tag: true,
      },
      orderBy: {
        tag: {
          slug: "asc",
        },
      },
    },
    orderItems: {
      select: {
        id: true,
      },
    },
  },
});

type ProductDetailRecord = Prisma.ProductGetPayload<typeof productDetailInclude>;

type ProductSpecRecord = {
  labelEn?: string;
  labelZh?: string;
  valueEn?: string;
  valueZh?: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseSpecs(raw: Prisma.JsonValue | null) {
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
      labelEn: item.labelEn ?? "",
      labelZh: item.labelZh ?? item.labelEn ?? "",
      valueEn: item.valueEn ?? "",
      valueZh: item.valueZh ?? item.valueEn ?? "",
    }));
}

function toTextLines(input: Array<string>) {
  return input.join(", ");
}

function toVariantLines(record: ProductDetailRecord) {
  return record.variants
    .map((variant) => [variant.labelEn, variant.labelZh, variant.price ? Number(variant.price).toString() : "", variant.inventory?.toString() ?? ""].join("|"))
    .join("\n");
}

function toSpecLines(record: ProductDetailRecord) {
  return parseSpecs(record.attributes)
    .map((spec) => [spec.labelEn, spec.labelZh, spec.valueEn, spec.valueZh].join("|"))
    .join("\n");
}

function buildVariantSku(slug: string, index: number) {
  return `${slug.toUpperCase().replace(/-/g, "_")}_${String(index + 1).padStart(2, "0")}`;
}

function normalizeGalleryImages(payload: AdminProductPayload) {
  const seen = new Set<string>();
  const images: Array<{ url: string; altEn: string; altZh: string; isCover: boolean; sortOrder: number }> = [];

  const pushImage = (url: string | undefined, altEn: string, altZh: string, isCover: boolean) => {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl || seen.has(normalizedUrl)) {
      return;
    }
    seen.add(normalizedUrl);
    images.push({
      url: normalizedUrl,
      altEn,
      altZh,
      isCover,
      sortOrder: images.length,
    });
  };

  pushImage(payload.imageUrl, payload.nameEn, payload.nameZh, true);

  for (const image of payload.galleryImages) {
    pushImage(image.url, image.altEn ?? payload.nameEn, image.altZh ?? payload.nameZh, false);
  }

  return images.map((image, index) => ({
    ...image,
    sortOrder: index,
    isCover: index === 0,
  }));
}

function toGalleryLines(record: ProductDetailRecord) {
  return record.images
    .filter((image) => !image.isCover)
    .map((image) => [image.url, image.altEn ?? "", image.altZh ?? ""].join("|"))
    .join("\n");
}

async function syncProductRelations(tx: Prisma.TransactionClient, productId: string, payload: AdminProductPayload) {
  await tx.productImage.deleteMany({ where: { productId } });
  await tx.productVariant.deleteMany({ where: { productId } });
  await tx.productTag.deleteMany({ where: { productId } });

  const galleryImages = normalizeGalleryImages(payload);

  if (galleryImages.length > 0) {
    await tx.productImage.createMany({
      data: galleryImages.map((image) => ({
        productId,
        url: image.url,
        altEn: image.altEn,
        altZh: image.altZh,
        sortOrder: image.sortOrder,
        isCover: image.isCover,
      })),
    });
  }

  if (payload.variants.length > 0) {
    await tx.productVariant.createMany({
      data: payload.variants.map((variant, index) => ({
        productId,
        sku: buildVariantSku(payload.slug, index),
        labelEn: variant.labelEn,
        labelZh: variant.labelZh,
        price: variant.price,
        inventory: variant.inventory,
        metadata: { managedInAdmin: true },
      })),
    });
  }

  if (payload.tags.length > 0) {
    const tagIds: string[] = [];
    for (const rawTag of payload.tags) {
      const label = rawTag.trim();
      if (!label) continue;
      const slug = slugify(label);
      const tag = await tx.tag.upsert({
        where: { slug },
        update: {
          labelEn: label,
          labelZh: label,
        },
        create: {
          slug,
          labelEn: label,
          labelZh: label,
        },
      });
      tagIds.push(tag.id);
    }

    if (tagIds.length > 0) {
      await tx.productTag.createMany({
        data: tagIds.map((tagId) => ({
          productId,
          tagId,
        })),
      });
    }
  }
}

function buildProductCoreData(payload: AdminProductPayload): Prisma.ProductUncheckedCreateInput {
  return {
    slug: payload.slug,
    categoryId: payload.categoryId,
    status: payload.status,
    nameEn: payload.nameEn,
    nameZh: payload.nameZh,
    subtitleEn: payload.subtitleEn ?? null,
    subtitleZh: payload.subtitleZh ?? null,
    descriptionEn: payload.descriptionEn ?? null,
    descriptionZh: payload.descriptionZh ?? null,
    storyEn: payload.storyEn ?? null,
    storyZh: payload.storyZh ?? null,
    price: payload.price,
    compareAtPrice: payload.compareAtPrice ?? null,
    featured: payload.featured,
    isNew: payload.isNew,
    leadTimeEn: payload.leadTimeEn ?? null,
    leadTimeZh: payload.leadTimeZh ?? null,
    shippingNoteEn: payload.shippingNoteEn ?? null,
    shippingNoteZh: payload.shippingNoteZh ?? null,
    attributes: {
      specs: payload.specs.map((spec) => ({
        labelEn: spec.labelEn,
        labelZh: spec.labelZh,
        valueEn: spec.valueEn,
        valueZh: spec.valueZh,
      })),
    },
    sourcePayload: {
      source: "admin",
      tags: payload.tags,
      sku: payload.variants[0]?.labelEn ? `${payload.slug.toUpperCase().replace(/-/g, "_")}_PRIMARY` : undefined,
      availabilityStatus: payload.status === "PUBLISHED" ? "In stock" : "Draft",
      reviewSummary: {
        rating: payload.featured ? 4.9 : 4.7,
        count: payload.featured ? 38 : 12,
      },
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function getAdminDashboardStats() {
  const [categoryCount, productCount, featuredCount, orderCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED, featured: true } }),
    prisma.order.count(),
  ]);

  return {
    categoryCount,
    productCount,
    featuredCount,
    orderCount,
  };
}

export async function getAdminProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    nameEn: product.nameEn,
    nameZh: product.nameZh,
    category: product.category.nameEn,
    price: Number(product.price),
    status: product.status.toLowerCase(),
    featured: product.featured,
    variantCount: product.variants.length,
    createdAt: product.createdAt.toISOString(),
  }));
}

export async function getAdminProductFormMeta() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameZh: true,
    },
  });

  return {
    categories,
    statusOptions: ["DRAFT", "PUBLISHED", "ARCHIVED"] as const,
  };
}

export async function getAdminProductById(id: string) {
  const record = await prisma.product.findUnique({
    where: { id },
    include: productDetailInclude.include,
  });

  if (!record) {
    return null;
  }

  const coverImage = record.images.find((image) => image.isCover)?.url ?? record.images[0]?.url ?? "";
  const galleryImagesText = toGalleryLines(record);

  return {
    id: record.id,
    slug: record.slug,
    categoryId: record.categoryId,
    status: record.status,
    nameEn: record.nameEn,
    nameZh: record.nameZh,
    subtitleEn: record.subtitleEn ?? "",
    subtitleZh: record.subtitleZh ?? "",
    descriptionEn: record.descriptionEn ?? "",
    descriptionZh: record.descriptionZh ?? "",
    storyEn: record.storyEn ?? "",
    storyZh: record.storyZh ?? "",
    price: Number(record.price),
    compareAtPrice: record.compareAtPrice ? Number(record.compareAtPrice) : undefined,
    featured: record.featured,
    isNew: record.isNew,
    leadTimeEn: record.leadTimeEn ?? "",
    leadTimeZh: record.leadTimeZh ?? "",
    shippingNoteEn: record.shippingNoteEn ?? "",
    shippingNoteZh: record.shippingNoteZh ?? "",
    imageUrl: coverImage,
    galleryImagesText,
    tagsText: toTextLines(record.tags.map((item) => item.tag.slug)),
    variantsText: toVariantLines(record),
    specsText: toSpecLines(record),
    orderItemCount: record.orderItems.length,
  };
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const exists = await prisma.product.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  });

  if (exists) {
    throw new Error(`slug 已存在：${payload.slug}`);
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: buildProductCoreData(payload),
      select: { id: true },
    });

    await syncProductRelations(tx, created.id, payload);
    return created;
  });

  return product;
}

export async function updateAdminProduct(id: string, payload: AdminProductPayload) {
  const conflict = await prisma.product.findFirst({
    where: {
      slug: payload.slug,
      id: {
        not: id,
      },
    },
    select: { id: true },
  });

  if (conflict) {
    throw new Error(`slug 已存在：${payload.slug}`);
  }

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: buildProductCoreData(payload),
      select: { id: true },
    });

    await syncProductRelations(tx, id, payload);
    return updated;
  });

  return product;
}

export async function archiveOrDeleteAdminProduct(id: string) {
  const record = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: {
        select: { id: true },
      },
    },
  });

  if (!record) {
    throw new Error("商品不存在");
  }

  if (record.orderItems.length > 0) {
    await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });

    return { mode: "archived" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.productTag.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  return { mode: "deleted" as const };
}
