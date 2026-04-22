import { PrismaClient, type Prisma } from "@prisma/client";
import { buildCatalogImportPresentation, resolveCatalogImportLocalCategory } from "../src/lib/catalog-import-copy";
import { categories, products } from "../src/lib/data";

const prisma = new PrismaClient();

type ProductRecord = Awaited<ReturnType<typeof prisma.product.findMany>>[number] & {
  category: { slug: string };
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildSeedSourcePayload(product: (typeof products)[number]) {
  return {
    source: "seed-sync",
    tags: product.tags,
    sku: `${product.slug.toUpperCase().replace(/-/g, "_")}_PRIMARY`,
    availabilityStatus: "In stock",
    reviewSummary: {
      rating: product.featured ? 4.9 : 4.7,
      count: product.featured ? 38 : 18,
    },
    updatedAt: new Date().toISOString(),
  } as Prisma.InputJsonValue;
}

async function ensureCategories() {
  const categoryIdMap = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        nameEn: category.name.en,
        nameZh: category.name.zh,
        descriptionEn: category.description.en,
        descriptionZh: category.description.zh,
      },
      create: {
        slug: category.slug,
        nameEn: category.name.en,
        nameZh: category.name.zh,
        descriptionEn: category.description.en,
        descriptionZh: category.description.zh,
      },
      select: { id: true, slug: true },
    });

    categoryIdMap.set(record.slug, record.id);
  }

  return categoryIdMap;
}

async function syncTags(tx: Prisma.TransactionClient, productId: string, tagValues: string[]) {
  await tx.productTag.deleteMany({ where: { productId } });

  if (tagValues.length === 0) {
    return;
  }

  const tagIds: string[] = [];
  for (const value of [...new Set(tagValues.map((item) => item.trim()).filter(Boolean))]) {
    const tag = await tx.tag.upsert({
      where: { slug: slugify(value) },
      update: {
        labelEn: value,
        labelZh: value,
      },
      create: {
        slug: slugify(value),
        labelEn: value,
        labelZh: value,
      },
      select: { id: true },
    });

    tagIds.push(tag.id);
  }

  await tx.productTag.createMany({
    data: tagIds.map((tagId) => ({
      productId,
      tagId,
    })),
  });
}

async function syncDemoProducts(categoryIdMap: Map<string, string>) {
  let syncedCount = 0;

  for (const product of products) {
    const categoryId = categoryIdMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`缺少分类: ${product.categorySlug}`);
    }

    await prisma.$transaction(async (tx) => {
      const base = await tx.product.upsert({
        where: { slug: product.slug },
        update: {
          status: "PUBLISHED",
          categoryId,
          nameEn: product.name.en,
          nameZh: product.name.zh,
          subtitleEn: product.subtitle.en,
          subtitleZh: product.subtitle.zh,
          descriptionEn: product.description.en,
          descriptionZh: product.description.zh,
          storyEn: product.story.en,
          storyZh: product.story.zh,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          featured: Boolean(product.featured),
          isNew: Boolean(product.isNew),
          leadTimeEn: product.leadTime.en,
          leadTimeZh: product.leadTime.zh,
          shippingNoteEn: product.shippingNote.en,
          shippingNoteZh: product.shippingNote.zh,
          attributes: {
            specs: product.specs.map((spec) => ({
              labelEn: spec.label.en,
              labelZh: spec.label.zh,
              valueEn: spec.value.en,
              valueZh: spec.value.zh,
            })),
          },
          sourcePayload: buildSeedSourcePayload(product),
        },
        create: {
          slug: product.slug,
          status: "PUBLISHED",
          categoryId,
          nameEn: product.name.en,
          nameZh: product.name.zh,
          subtitleEn: product.subtitle.en,
          subtitleZh: product.subtitle.zh,
          descriptionEn: product.description.en,
          descriptionZh: product.description.zh,
          storyEn: product.story.en,
          storyZh: product.story.zh,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          featured: Boolean(product.featured),
          isNew: Boolean(product.isNew),
          leadTimeEn: product.leadTime.en,
          leadTimeZh: product.leadTime.zh,
          shippingNoteEn: product.shippingNote.en,
          shippingNoteZh: product.shippingNote.zh,
          attributes: {
            specs: product.specs.map((spec) => ({
              labelEn: spec.label.en,
              labelZh: spec.label.zh,
              valueEn: spec.value.en,
              valueZh: spec.value.zh,
            })),
          },
          sourcePayload: buildSeedSourcePayload(product),
        },
        select: { id: true },
      });

      await tx.productImage.deleteMany({ where: { productId: base.id } });
      await tx.productVariant.deleteMany({ where: { productId: base.id } });

      await tx.productImage.createMany({
        data: product.images.map((image, index) => ({
          productId: base.id,
          url: image.url,
          altEn: image.alt.en,
          altZh: image.alt.zh,
          sortOrder: image.sortOrder ?? index,
          isCover: image.isCover ?? index === 0,
        })),
      });

      await tx.productVariant.createMany({
        data: product.variants.map((variant, index) => ({
          productId: base.id,
          sku: `${product.slug.toUpperCase().replace(/-/g, "_")}_${String(index + 1).padStart(2, "0")}`,
          labelEn: variant.label.en,
          labelZh: variant.label.zh,
          metadata: { source: "seed-sync" },
        })),
      });

      await syncTags(tx, base.id, product.tags);
    });

    syncedCount += 1;
  }

  return syncedCount;
}

function getSourcePayloadTags(product: ProductRecord) {
  const payload = product.sourcePayload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const tags = Reflect.get(payload, "tags");
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function looksLikeCatalogImport(product: ProductRecord, tags: string[]) {
  return product.slug.includes("-dj-") || tags.includes("catalog-import");
}

async function repairCatalogProducts(categoryIdMap: Map<string, string>) {
  const records = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: {
        select: { slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  let categoryFixCount = 0;
  let copyFixCount = 0;

  for (const product of records) {
    const tags = getSourcePayloadTags(product);
    const isCatalogProduct = looksLikeCatalogImport(product, tags);
    const desiredCategorySlug = resolveCatalogImportLocalCategory({
      tags,
    });
    const shouldRepairCategory = isCatalogProduct && desiredCategorySlug !== product.category.slug;

    const updates: Prisma.ProductUpdateInput = {};
    let normalizedTags: string[] = [];

    if (shouldRepairCategory) {
      const categoryId = categoryIdMap.get(desiredCategorySlug);
      if (categoryId) {
        updates.category = {
          connect: {
            id: categoryId,
          },
        };
        categoryFixCount += 1;
      }
    }

    if (isCatalogProduct) {
      const presentation = buildCatalogImportPresentation({
        title: product.nameEn,
        description: product.descriptionEn ?? undefined,
        tags,
      });

      updates.nameZh = presentation.titleZh;
      updates.subtitleEn = presentation.subtitleEn;
      updates.subtitleZh = presentation.subtitleZh;
      updates.descriptionZh = presentation.descriptionZh;
      updates.storyEn = presentation.storyEn;
      updates.storyZh = presentation.storyZh;
      updates.shippingNoteEn = presentation.shippingNoteEn;
      updates.shippingNoteZh = presentation.shippingNoteZh;
      normalizedTags = presentation.tags;
      copyFixCount += 1;
    }

    if (Object.keys(updates).length > 0 || normalizedTags.length > 0) {
      await prisma.$transaction(async (tx) => {
        if (Object.keys(updates).length > 0) {
          await tx.product.update({
            where: { id: product.id },
            data: updates,
          });
        }

        if (normalizedTags.length > 0) {
          await syncTags(tx, product.id, normalizedTags);
        }
      });
    }
  }

  return {
    categoryFixCount,
    copyFixCount,
  };
}

async function main() {
  const categoryIdMap = await ensureCategories();
  const syncedDemoProducts = await syncDemoProducts(categoryIdMap);
  const repaired = await repairCatalogProducts(categoryIdMap);

  console.log(
    JSON.stringify(
      {
        syncedDemoProducts,
        repairedCategoryAssignments: repaired.categoryFixCount,
        refreshedCatalogCopy: repaired.copyFixCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
