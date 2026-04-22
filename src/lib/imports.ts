import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import { ImportItemStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAdminProduct, updateAdminProduct } from "@/lib/admin";
import { buildCatalogImportPresentation, resolveCatalogImportLocalCategory } from "@/lib/catalog-import-copy";
import {
  getImportMediaDirectoryFromUrl,
  getImportStorageRoot,
  getLegacyImportPublicRoot,
} from "@/lib/import-media";
import { adminProductPayloadSchema, type AdminProductPayload } from "@/lib/validation/admin";

function getImportSourcePayload(payload: AdminProductPayload) {
  return payload.sourcePayload && typeof payload.sourcePayload === "object" && !Array.isArray(payload.sourcePayload)
    ? (payload.sourcePayload as Record<string, unknown>)
    : undefined;
}

function getNestedRecord(input: Record<string, unknown> | undefined, key: string) {
  const value = input?.[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function extractImportMediaDirectoriesFromNormalizedData(data: Prisma.JsonValue | null) {
  const parsed = adminProductPayloadSchema.safeParse(data);
  if (!parsed.success) {
    return [];
  }

  const urls = [parsed.data.imageUrl, ...parsed.data.galleryImages.map((image) => image.url)];
  return [...new Set(urls.map((url) => getImportMediaDirectoryFromUrl(url)).filter((value): value is string => Boolean(value)))];
}

async function getReferencedImportMediaDirectories() {
  const [items, productImages] = await Promise.all([
    prisma.importItem.findMany({
      select: {
        normalizedData: true,
      },
    }),
    prisma.productImage.findMany({
      where: {
        OR: [{ url: { startsWith: "/api/media/imports/" } }, { url: { startsWith: "/imports/" } }],
      },
      select: {
        url: true,
      },
    }),
  ]);

  const referencedDirectories = new Set<string>();

  for (const item of items) {
    for (const directory of extractImportMediaDirectoriesFromNormalizedData(item.normalizedData)) {
      referencedDirectories.add(directory);
    }
  }

  for (const image of productImages) {
    const directory = getImportMediaDirectoryFromUrl(image.url);
    if (directory) {
      referencedDirectories.add(directory);
    }
  }

  return referencedDirectories;
}

async function cleanupUnusedImportMediaDirectories(directories: Iterable<string>) {
  const pending = [...new Set(Array.from(directories).map((value) => value.trim()).filter(Boolean))];
  if (pending.length === 0) {
    return [];
  }

  const referencedDirectories = await getReferencedImportMediaDirectories();
  const cleaned: string[] = [];

  for (const directory of pending) {
    if (referencedDirectories.has(directory)) {
      continue;
    }

    const segments = directory.split("/").filter(Boolean);
    if (segments.length === 0) {
      continue;
    }

    await Promise.all([
      fs.rm(path.join(getImportStorageRoot(), ...segments), { recursive: true, force: true }),
      fs.rm(path.join(getLegacyImportPublicRoot(), ...segments), { recursive: true, force: true }),
    ]);
    cleaned.push(directory);
  }

  return cleaned;
}

async function findExistingImportedProduct(payload: AdminProductPayload) {
  const sourcePayload = getImportSourcePayload(payload);
  const upstream = getNestedRecord(sourcePayload, "upstream");
  const provider = typeof upstream?.provider === "string" ? upstream.provider : undefined;
  const asin = typeof upstream?.asin === "string" ? upstream.asin : undefined;

  if (provider && asin) {
    const imported = await prisma.product.findFirst({
      where: {
        AND: [
          {
            sourcePayload: {
              path: ["upstream", "provider"],
              equals: provider,
            },
          },
          {
            sourcePayload: {
              path: ["upstream", "asin"],
              equals: asin,
            },
          },
        ],
      },
      select: { id: true },
    });

    if (imported) {
      return imported;
    }
  }

  return prisma.product.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  });
}

const sourceCategories = ["womens-jewellery", "home-decoration", "womens-bags"] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function uniqueSlug(title: string, externalId: number) {
  return `${slugify(title)}-dj-${externalId}`;
}

function compareAtPrice(price: number, discountPercentage?: number) {
  if (!discountPercentage || discountPercentage <= 0 || discountPercentage >= 100) {
    return undefined;
  }
  return Number((price / (1 - discountPercentage / 100)).toFixed(2));
}

function buildDummyGalleryImages(product: DummyProduct, coverImage: string, titleZh: string) {
  return (product.images ?? [])
    .filter((url) => url && url !== coverImage)
    .map((url, index) => ({
      url,
      altEn: `${product.title} gallery ${index + 1}`,
      altZh: `${titleZh} 展示图 ${index + 1}`,
    }));
}

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: { width?: number; height?: number; depth?: number };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail?: string;
  images?: string[];
};

function normalizeDummyProduct(product: DummyProduct, categoryId: string): AdminProductPayload {
  const presentation = buildCatalogImportPresentation(product);
  const imageUrl = product.images?.[0] ?? product.thumbnail ?? "/products/cloud-tray.svg";
  const galleryImages = buildDummyGalleryImages(product, imageUrl, presentation.titleZh);

  return adminProductPayloadSchema.parse({
    slug: uniqueSlug(product.title, product.id),
    categoryId,
    status: "PUBLISHED",
    nameEn: product.title,
    nameZh: presentation.titleZh,
    subtitleEn: presentation.subtitleEn,
    subtitleZh: presentation.subtitleZh,
    descriptionEn: presentation.descriptionEn,
    descriptionZh: presentation.descriptionZh,
    storyEn: presentation.storyEn,
    storyZh: presentation.storyZh,
    leadTimeEn: product.shippingInformation ?? "Ships in 3-5 business days",
    leadTimeZh: product.shippingInformation ?? "3-5 个工作日发货",
    shippingNoteEn: presentation.shippingNoteEn,
    shippingNoteZh: presentation.shippingNoteZh,
    imageUrl,
    galleryImages,
    price: product.price,
    compareAtPrice: compareAtPrice(product.price, product.discountPercentage),
    featured: presentation.localCategory === "jewelry",
    isNew: true,
    tags: [...new Set([...(presentation.tags ?? []), presentation.localCategory])],
    variants: [
      {
        labelEn: product.brand ? `${product.brand} default` : "Default",
        labelZh: product.brand ? `${product.brand} 默认款` : "默认款",
        price: product.price,
        inventory: product.stock ?? 10,
      },
    ],
    specs: [
      ...(product.brand ? [{ labelEn: "Brand", labelZh: "品牌", valueEn: product.brand, valueZh: product.brand }] : []),
      ...(product.sku ? [{ labelEn: "Supplier SKU", labelZh: "供应商 SKU", valueEn: product.sku, valueZh: product.sku }] : []),
      ...(typeof product.weight === "number"
        ? [{ labelEn: "Weight", labelZh: "重量", valueEn: `${product.weight} g`, valueZh: `${product.weight} 克` }]
        : []),
      ...(product.dimensions
        ? [
            {
              labelEn: "Dimensions",
              labelZh: "尺寸",
              valueEn: `${product.dimensions.width ?? "-"} × ${product.dimensions.height ?? "-"} × ${product.dimensions.depth ?? "-"} cm`,
              valueZh: `${product.dimensions.width ?? "-"} × ${product.dimensions.height ?? "-"} × ${product.dimensions.depth ?? "-"} 厘米`,
            },
          ]
        : []),
      ...(product.warrantyInformation
        ? [{ labelEn: "Warranty", labelZh: "质保", valueEn: product.warrantyInformation, valueZh: product.warrantyInformation }]
        : []),
      ...(product.availabilityStatus
        ? [{ labelEn: "Availability", labelZh: "库存状态", valueEn: product.availabilityStatus, valueZh: product.availabilityStatus }]
        : []),
      ...(product.minimumOrderQuantity
        ? [{ labelEn: "MOQ", labelZh: "最小起订量", valueEn: String(product.minimumOrderQuantity), valueZh: String(product.minimumOrderQuantity) }]
        : []),
    ],
    // sourcePayload data is written via admin lib to preserve downstream PDP fields
  });
}

async function fetchCategoryProducts(category: string) {
  const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=6`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`获取商品源数据失败: ${category}`);
  }

  const data = (await response.json()) as { products: DummyProduct[] };
  return data.products;
}

export async function importDummyjsonSampleBatch() {
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ["jewelry", "gifts"],
      },
    },
    select: { id: true, slug: true },
  });
  const categoryIdMap = new Map(categories.map((category) => [category.slug, category.id]));
  const fetchedGroups = await Promise.all(sourceCategories.map((category) => fetchCategoryProducts(category)));
  const flattened = fetchedGroups.flat();

  const batch = await prisma.importBatch.create({
    data: {
      name: `catalog-import-${new Date().toISOString()}`,
      source: "catalog-feed",
      status: "IMPORTED",
      totalItems: flattened.length,
      items: {
        create: flattened.map((product) => {
          const localCategorySlug = resolveCatalogImportLocalCategory(product);
          const categoryId = categoryIdMap.get(localCategorySlug);
          if (!categoryId) {
            throw new Error(`本地分类缺失: ${localCategorySlug}`);
          }
          const normalized = normalizeDummyProduct(product, categoryId);
          return {
            sourceId: String(product.id),
            status: ImportItemStatus.APPROVED,
            rawPayload: product as unknown as Prisma.InputJsonValue,
            normalizedData: normalized as unknown as Prisma.InputJsonValue,
            reviewNotes: `Imported from source category ${product.category}`,
          };
        }),
      },
    },
    select: { id: true },
  });

  return batch;
}

export async function publishImportBatch(batchId: string, options?: { categoryId?: string }) {
  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    include: { items: true },
  });

  if (!batch) {
    throw new Error("导入批次不存在");
  }

  if (options?.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: options.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new Error("指定的发布分类不存在");
    }

    const normalizedCategoryIds = new Set(
      batch.items
        .filter((item) => item.normalizedData && item.status !== ImportItemStatus.REJECTED)
        .map((item) => adminProductPayloadSchema.parse(item.normalizedData).categoryId),
    );

    if (normalizedCategoryIds.size > 1) {
      throw new Error("这个批次包含多个原始分类，不能整体覆盖到单一分类。请保持原分类或拆分后再发布。");
    }
  }

  let publishedCount = 0;

  for (const item of batch.items) {
    if (!item.normalizedData || item.status === ImportItemStatus.REJECTED) {
      continue;
    }

    let draftPayload = adminProductPayloadSchema.parse(item.normalizedData);

    const rawPayload = item.rawPayload as Record<string, unknown> | null;
    if (rawPayload?.source === "amazon-import") {
      const { renormalizeStoredAmazonImportItem } = await import("@/lib/amazon-imports");
      const normalized = await renormalizeStoredAmazonImportItem({
        rawPayload: item.rawPayload,
        normalizedData: item.normalizedData,
      });

      if (normalized?.payload) {
        draftPayload = normalized.payload;
      }
    }

    const payload = adminProductPayloadSchema.parse({
      ...draftPayload,
      categoryId: options?.categoryId ?? draftPayload.categoryId,
      status: "PUBLISHED",
    });
    const existing = await findExistingImportedProduct(payload);

    let productId = existing?.id;

    if (existing) {
      const updated = await updateAdminProduct(existing.id, payload);
      productId = updated.id;
    } else {
      const created = await createAdminProduct(payload);
      productId = created.id;
    }

    await prisma.importItem.update({
      where: { id: item.id },
      data: {
        status: ImportItemStatus.PUBLISHED,
        normalizedData: {
          ...(payload as unknown as Record<string, unknown>),
          publishedProductId: productId,
          publishedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    publishedCount += 1;
  }

  await prisma.importBatch.update({
    where: { id: batchId },
    data: {
      status: publishedCount > 0 ? "PUBLISHED" : batch.status,
    },
  });

  return { publishedCount };
}

export async function deleteImportBatch(batchId: string) {
  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    include: {
      items: {
        select: {
          id: true,
          normalizedData: true,
        },
      },
    },
  });

  if (!batch) {
    throw new Error("导入批次不存在");
  }

  const linkedProductIds = new Set(
    batch.items
      .map((item) => {
        const data = item.normalizedData as Record<string, unknown> | null;
        return typeof data?.publishedProductId === "string" ? data.publishedProductId : null;
      })
      .filter((value): value is string => Boolean(value)),
  );
  const importMediaDirectories = new Set(
    batch.items.flatMap((item) => extractImportMediaDirectoriesFromNormalizedData(item.normalizedData)),
  );

  await prisma.importBatch.delete({
    where: { id: batchId },
  });

  const cleanedMediaDirectories = await cleanupUnusedImportMediaDirectories(importMediaDirectories);

  return {
    deletedBatchId: batch.id,
    deletedItemCount: batch.items.length,
    linkedProductCount: linkedProductIds.size,
    cleanedMediaDirectoryCount: cleanedMediaDirectories.length,
  };
}

export async function getAdminImportBatches() {
  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return batches.map((batch) => {
    const approvedCount = batch.items.filter((item) => item.status === ImportItemStatus.APPROVED).length;
    const publishedCount = batch.items.filter((item) => item.status === ImportItemStatus.PUBLISHED).length;
    const previewTitles = batch.items.slice(0, 3).map((item) => {
      const data = item.normalizedData as Record<string, unknown> | null;
      return typeof data?.nameEn === "string" ? data.nameEn : item.sourceId ?? item.id;
    });

    return {
      id: batch.id,
      name: batch.name,
      source: batch.source ?? "unknown",
      status: batch.status,
      totalItems: batch.totalItems,
      approvedCount,
      publishedCount,
      createdAt: batch.createdAt.toISOString(),
      previewTitles,
    };
  });
}
