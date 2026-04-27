import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productQuery = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: {
      select: {
        slug: true,
      },
    },
    variants: {
      orderBy: { sku: "asc" },
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
  },
});

type ProductRecord = Prisma.ProductGetPayload<typeof productQuery>;

type ProductSpec = {
  labelEn: string;
  labelZh: string;
  valueEn: string;
  valueZh: string;
};

const keywordToTag: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: "rose-gold", patterns: [/rose gold/i, /玫瑰金/] },
  { slug: "silver-tone", patterns: [/silver tone/i, /银色/] },
  { slug: "gold-tone", patterns: [/gold tone/i, /金色/] },
  { slug: "black", patterns: [/\bblack\b/i, /黑色/] },
  { slug: "blue", patterns: [/\bblue\b/i, /蓝色/] },
  { slug: "green", patterns: [/\bgreen\b/i, /绿色/] },
  { slug: "pink", patterns: [/\bpink\b/i, /粉色/] },
  { slug: "cute", patterns: [/\bcute\b/i, /可爱/] },
  { slug: "cartoon", patterns: [/\bcartoon\b/i, /卡通/] },
  { slug: "fruit-party", patterns: [/fruit party/i, /水果派对/] },
  { slug: "game-inspired", patterns: [/game-inspired/i, /游戏周边/] },
  { slug: "frog", patterns: [/\bfrog\b/i, /青蛙/] },
  { slug: "lion-dance", patterns: [/lion dance/i, /醒狮|舞狮/] },
  { slug: "zodiac", patterns: [/\bzodiac\b/i, /生肖/] },
  { slug: "astronaut", patterns: [/\bastronaut\b/i, /宇航员|太空人/] },
  { slug: "princess", patterns: [/\bprincess\b/i, /公主/] },
  { slug: "animal", patterns: [/\banimal\b/i, /动物/] },
  { slug: "resin", patterns: [/\bresin\b/i, /树脂/] },
  { slug: "glass", patterns: [/\bglass\b/i, /玻璃/] },
  { slug: "ceramic", patterns: [/\bceramic\b/i, /陶瓷/] },
  { slug: "wood", patterns: [/\bwood\b/i, /木质|木制/] },
  { slug: "metal", patterns: [/\bmetal\b/i, /金属|铁艺/] },
  { slug: "stainless-steel", patterns: [/stainless steel/i, /不锈钢/] },
  { slug: "sterling-silver", patterns: [/sterling silver/i, /S925银|纯银|925银/] },
  { slug: "moissanite", patterns: [/\bmoissanite\b/i, /莫桑石/] },
  { slug: "crystal", patterns: [/\bcrystal\b/i, /水晶/] },
  { slug: "agate", patterns: [/\bagate\b/i, /玛瑙/] },
  { slug: "beaded", patterns: [/\bbeaded\b/i, /串珠/] },
  { slug: "ethnic", patterns: [/\bethnic\b/i, /民族风/] },
  { slug: "vintage", patterns: [/\bvintage\b/i, /复古/] },
  { slug: "minimalist", patterns: [/\bminimalist\b/i, /简约/] },
  { slug: "fashion", patterns: [/\bfashion\b/i, /时尚/] },
  { slug: "geometric", patterns: [/\bgeometric\b/i, /几何/] },
  { slug: "butterfly", patterns: [/\bbutterfly\b/i, /蝴蝶结/] },
  { slug: "cross", patterns: [/\bcross\b/i, /十字/] },
  { slug: "heart", patterns: [/\bheart\b/i, /爱心/] },
  { slug: "tennis", patterns: [/\btennis\b/i, /网球链/] },
  { slug: "otter", patterns: [/\botter\b/i, /海獭|水濑/] },
  { slug: "dog", patterns: [/\bdog\b/i, /小狗|狗/] },
  { slug: "bear", patterns: [/\bbear\b/i, /小熊|熊/] },
  { slug: "bunny", patterns: [/\bbunny\b/i, /兔子|兔/] },
  { slug: "goose", patterns: [/\bgoose\b/i, /白鹅|鹅/] },
  { slug: "groundhog", patterns: [/\bgroundhog\b/i, /土拨鼠/] },
  { slug: "crab", patterns: [/\bcrab\b/i, /螃蟹/] },
  { slug: "sheep", patterns: [/\bsheep\b/i, /小羊|绵羊/] },
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
    .filter((item): item is Record<string, string> => typeof item === "object" && item !== null)
    .map((item) => ({
      labelEn: typeof item.labelEn === "string" ? item.labelEn : "",
      labelZh: typeof item.labelZh === "string" ? item.labelZh : "",
      valueEn: typeof item.valueEn === "string" ? item.valueEn : "",
      valueZh: typeof item.valueZh === "string" ? item.valueZh : "",
    }));
}

function getSpecValue(specs: ProductSpec[], label: string) {
  const found = specs.find((spec) => spec.labelEn === label || spec.labelZh === label);
  return found
    ? {
        en: found.valueEn || found.valueZh,
        zh: found.valueZh || found.valueEn,
      }
    : undefined;
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function normalizeSize(value?: string) {
  if (!value) return undefined;
  return value
    .replace(/厘米/g, "cm")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/，/g, " / ")
    .replace(/,/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasMeaningfulSize(value?: string) {
  return Boolean(value && /(\d+(?:\.\d+)?\s*(?:cm|mm|CM|寸|in))/i.test(value));
}

function buildPolishedName(product: ProductRecord, specs: ProductSpec[]) {
  const size = getSpecValue(specs, "Size") ?? getSpecValue(specs, "尺寸");
  const normalizedSizeEn = normalizeSize(size?.en);
  const normalizedSizeZh = normalizeSize(size?.zh);

  const genericNameSet = new Set([
    "Cute Plush Toy",
    "Cute Plush Keychain",
    "Plush Toy",
    "Plush Pillow",
    "Desk Figurine",
    "Creative Desk Figurine",
    "Resin Desk Figurine",
    "Glass Desk Figurine",
    "Beaded Bracelet",
    "Ethnic Bracelet",
    "Vintage Bracelet",
    "Rose Gold Bracelet",
  ]);

  let nameEn = product.nameEn;
  let nameZh = product.nameZh;

  if (genericNameSet.has(product.nameEn) && hasMeaningfulSize(normalizedSizeEn)) {
    nameEn = `${product.nameEn} ${normalizedSizeEn}`;
    nameZh = `${product.nameZh} ${normalizedSizeZh ?? normalizedSizeEn}`;
  }

  return { nameEn, nameZh };
}

function buildTagSet(product: ProductRecord, specs: ProductSpec[]) {
  const sourceTags = product.tags.map((item) => item.tag.slug);
  const haystack = [
    product.nameEn,
    product.nameZh,
    ...specs.flatMap((spec) => [spec.valueEn, spec.valueZh, spec.labelEn, spec.labelZh]),
  ].join(" ");

  const derived = keywordToTag
    .filter((entry) => entry.patterns.some((pattern) => pattern.test(haystack)))
    .map((entry) => entry.slug);

  return unique([...sourceTags, ...derived]).slice(0, 8);
}

function cleanVariantLabel(value: string) {
  return value
    .replace(/[，,]/g, " / ")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVariantLabels(product: ProductRecord, specs: ProductSpec[]) {
  const size = getSpecValue(specs, "Size") ?? getSpecValue(specs, "尺寸");
  const normalizedSizeEn = normalizeSize(size?.en);
  const normalizedSizeZh = normalizeSize(size?.zh);
  const singleVariant = product.variants.length === 1;

  return product.variants.map((variant) => {
    const normalizedEn = cleanVariantLabel(variant.labelEn);
    const normalizedZh = cleanVariantLabel(variant.labelZh);
    const genericEn = /^Style\s+\d+$/i.test(normalizedEn) || /^Style\s+0\d+$/i.test(normalizedEn);
    const genericZh = /^款式\s+\d+$/i.test(normalizedZh) || /^款式\s+0\d+$/i.test(normalizedZh);

    if (singleVariant && (genericEn || genericZh) && hasMeaningfulSize(normalizedSizeEn)) {
      return {
        id: variant.id,
        labelEn: normalizedSizeEn!,
        labelZh: normalizedSizeZh ?? normalizedSizeEn!,
      };
    }

    return {
      id: variant.id,
      labelEn: normalizedEn,
      labelZh: normalizedZh,
    };
  });
}

async function syncTags(tx: Prisma.TransactionClient, productId: string, tags: string[]) {
  await tx.productTag.deleteMany({
    where: { productId },
  });

  for (const tagValue of tags) {
    const slug = slugify(tagValue);
    const tag = await tx.tag.upsert({
      where: { slug },
      update: {
        labelEn: titleCase(tagValue.replace(/-/g, " ")),
        labelZh: tagValue,
      },
      create: {
        slug,
        labelEn: titleCase(tagValue.replace(/-/g, " ")),
        labelZh: tagValue,
      },
      select: { id: true },
    });

    await tx.productTag.create({
      data: {
        productId,
        tagId: tag.id,
      },
    });
  }
}

async function cleanupUnusedTags() {
  const tags = await prisma.tag.findMany({
    include: {
      products: {
        select: { productId: true },
        take: 1,
      },
    },
  });

  const unusedTagIds = tags.filter((tag) => tag.products.length === 0).map((tag) => tag.id);
  if (unusedTagIds.length > 0) {
    await prisma.tag.deleteMany({
      where: {
        id: {
          in: unusedTagIds,
        },
      },
    });
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const records = await prisma.product.findMany({
    where: {
      category: {
        slug: {
          in: ["jewelry", "plush", "gifts"],
        },
      },
    },
    ...productQuery,
  });

  const preview: Array<Record<string, unknown>> = [];

  for (const product of records) {
    const specs = parseSpecs(product.attributes);
    const polishedName = buildPolishedName(product, specs);
    const tags = buildTagSet(product, specs);
    const variants = normalizeVariantLabels(product, specs);

    const changed =
      polishedName.nameEn !== product.nameEn ||
      polishedName.nameZh !== product.nameZh ||
      JSON.stringify(tags) !== JSON.stringify(product.tags.map((item) => item.tag.slug)) ||
      JSON.stringify(variants.map((item) => [item.labelEn, item.labelZh])) !==
        JSON.stringify(product.variants.map((item) => [item.labelEn, item.labelZh]));

    if (!changed) {
      continue;
    }

    if (dryRun) {
      preview.push({
        category: product.category.slug,
        slug: product.slug,
        beforeNameEn: product.nameEn,
        afterNameEn: polishedName.nameEn,
        beforeNameZh: product.nameZh,
        afterNameZh: polishedName.nameZh,
        tags,
        firstVariant: variants[0] ?? null,
      });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: {
          nameEn: polishedName.nameEn,
          nameZh: polishedName.nameZh,
        },
      });

      for (const variant of variants) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            labelEn: variant.labelEn,
            labelZh: variant.labelZh,
          },
        });
      }

      await syncTags(tx, product.id, tags);
    });
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          changedProducts: preview.length,
          preview: preview.slice(0, 40),
        },
        null,
        2,
      ),
    );
    return;
  }

  await cleanupUnusedTags();

  console.log(
    JSON.stringify(
      {
        processedProducts: records.length,
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
