import "server-only";

import { ImportItemStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAdminProduct, updateAdminProduct } from "@/lib/admin";
import { adminProductPayloadSchema, type AdminProductPayload } from "@/lib/validation/admin";

const titleZhMap: Record<string, string> = {
  "Green Crystal Earring": "绿色水晶耳环",
  "Green Oval Earring": "绿色椭圆耳饰",
  "Tropical Earring": "热带风耳饰",
  "Decoration Swing": "装饰秋千摆件",
  "Family Tree Photo Frame": "家谱树相框",
  "House Showpiece Plant": "房屋造型装饰盆栽",
  "Plant Pot": "装饰花盆",
  "Table Lamp": "桌面台灯",
  "Blue Women's Handbag": "蓝色女士手提包",
  "Heshe Women's Leather Bag": "Heshe 女士皮包",
  "Prada Women Bag": "Prada 女士包",
  "White Faux Leather Backpack": "白色仿皮双肩包",
  "Women Handbag Black": "黑色女士手提包",
};

const titleSubtitleZhMap: Record<string, string> = {
  "Green Crystal Earring": "适合礼品站陈列的彩色耳饰款",
  "Green Oval Earring": "适合精品站详情页展示的简洁耳饰款",
  "Tropical Earring": "适合活动页与礼盒组合陈列的耳饰款",
  "Decoration Swing": "适合桌面礼品与家居装饰陈列的摆件",
  "Family Tree Photo Frame": "适合礼物专题和家居频道陈列的相框",
  "House Showpiece Plant": "适合桌面装饰和礼品组合陈列的小型摆件",
  "Plant Pot": "适合桌面生活方式栏目陈列的小型花盆",
  "Table Lamp": "适合桌面礼物和生活方式栏目的台灯",
  "Blue Women's Handbag": "适合配饰频道陈列的女士手提包",
  "Heshe Women's Leather Bag": "适合精品配饰页面陈列的皮包",
  "Prada Women Bag": "适合高客单配饰栏目的品牌风格包款",
  "White Faux Leather Backpack": "适合礼品与配件栏目的双肩包",
  "Women Handbag Black": "适合通勤礼品和配饰页面的黑色手提包",
};

const categoryMapping: Record<string, "jewelry" | "gifts"> = {
  "womens-jewellery": "jewelry",
  "home-decoration": "gifts",
  "womens-bags": "gifts",
};

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

function buildDummyGalleryImages(product: DummyProduct, coverImage: string) {
  return (product.images ?? [])
    .filter((url) => url && url !== coverImage)
    .map((url, index) => ({
      url,
      altEn: `${product.title} gallery ${index + 1}`,
      altZh: `${titleZhMap[product.title] ?? product.title} 展示图 ${index + 1}`,
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
  const localCategory = categoryMapping[product.category] ?? "gifts";
  const imageUrl = product.images?.[0] ?? product.thumbnail ?? "/products/cloud-tray.svg";
  const titleZh = titleZhMap[product.title] ?? product.title;
  const subtitleZh = titleSubtitleZhMap[product.title] ?? product.description;
  const subtitleEn = `${product.brand ?? product.category} catalog import item`;
  const galleryImages = buildDummyGalleryImages(product, imageUrl);

  return adminProductPayloadSchema.parse({
    slug: uniqueSlug(product.title, product.id),
    categoryId,
    status: "PUBLISHED",
    nameEn: product.title,
    nameZh: titleZh,
    subtitleEn,
    subtitleZh,
    descriptionEn: product.description,
    descriptionZh: product.description,
    storyEn: `Imported catalog product from source category ${product.category}, normalized for review and publication.`,
    storyZh: `该商品来自商品源 ${product.category}，已完成规范化处理，可用于审核与发布流程。`,
    leadTimeEn: product.shippingInformation ?? "Ships in 3-5 business days",
    leadTimeZh: product.shippingInformation ?? "3-5 个工作日发货",
    shippingNoteEn: `${product.availabilityStatus ?? "In Stock"}. ${product.returnPolicy ?? "Manual policy review required."}`,
    shippingNoteZh: `${product.availabilityStatus ?? "有库存"}。${product.returnPolicy ?? "需要人工确认售后政策。"}`,
    imageUrl,
    galleryImages,
    price: product.price,
    compareAtPrice: compareAtPrice(product.price, product.discountPercentage),
    featured: localCategory === "jewelry",
    isNew: true,
    tags: [...new Set([...(product.tags ?? []), product.category, product.brand ?? "catalog-import", localCategory])],
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
          const localCategorySlug = categoryMapping[product.category] ?? "gifts";
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

export async function publishImportBatch(batchId: string) {
  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    include: { items: true },
  });

  if (!batch) {
    throw new Error("导入批次不存在");
  }

  let publishedCount = 0;

  for (const item of batch.items) {
    if (!item.normalizedData || item.status === ImportItemStatus.REJECTED) {
      continue;
    }

    const payload = adminProductPayloadSchema.parse(item.normalizedData);
    const existing = await prisma.product.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });

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
