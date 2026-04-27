import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productQuery = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: {
      select: {
        slug: true,
      },
    },
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
  },
});

type ProductRecord = Prisma.ProductGetPayload<typeof productQuery>;

type ProductType =
  | "necklace"
  | "layering-necklace"
  | "choker-necklace"
  | "bracelet"
  | "ring"
  | "earrings"
  | "collection";

type KeywordKind = "style" | "material" | "motif" | "audience" | "finish";

type KeywordToken = {
  kind: KeywordKind;
  en: string;
  zh: string;
  matchers: string[];
};

type Analysis = {
  rawTitle: string;
  titleText: string;
  tagText: string;
  combinedText: string;
  productType: ProductType;
  styles: KeywordToken[];
  materials: KeywordToken[];
  motifs: KeywordToken[];
  audiences: KeywordToken[];
  finishes: KeywordToken[];
  sizeHint?: string;
  fitHint?: string;
  typeSet: Set<string>;
};

type CleanVariant = {
  labelEn: string;
  labelZh: string;
  sku: string;
  price: Prisma.Decimal | null;
  inventory: number | null;
};

const keywordTokens: KeywordToken[] = [
  { kind: "style", en: "Minimalist", zh: "简约", matchers: ["minimalist", "简约", "极简", "百搭"] },
  { kind: "style", en: "Vintage", zh: "复古", matchers: ["vintage", "复古", "文艺", "怀旧"] },
  { kind: "style", en: "Fashion", zh: "时尚", matchers: ["fashion", "时尚", "新款"] },
  { kind: "style", en: "Refined", zh: "轻奢", matchers: ["高级感", "轻奢", "精致"] },
  { kind: "style", en: "Punk", zh: "朋克", matchers: ["punk", "朋克"] },
  { kind: "style", en: "Ethnic", zh: "民族风", matchers: ["民族风", "藏式", "西藏", "tibetan"] },
  { kind: "style", en: "Fresh", zh: "清新", matchers: ["小清新", "清新"] },
  { kind: "style", en: "Color Pop", zh: "多彩", matchers: ["多巴胺", "糖果色", "彩色"] },
  { kind: "style", en: "Chinese-Inspired", zh: "新中式", matchers: ["新中式"] },
  { kind: "material", en: "Stainless Steel", zh: "不锈钢", matchers: ["stainless steel", "不锈钢"] },
  { kind: "material", en: "Titanium Steel", zh: "钛钢", matchers: ["titanium steel", "钛钢"] },
  { kind: "material", en: "Sterling Silver", zh: "S925银", matchers: ["sterling silver", "925", "925银", "s925", "纯银"] },
  { kind: "material", en: "Moissanite", zh: "莫桑石", matchers: ["moissanite", "莫桑", "莫桑石"] },
  { kind: "material", en: "Crystal", zh: "水晶", matchers: ["crystal", "水晶"] },
  { kind: "material", en: "Zircon", zh: "锆石", matchers: ["zircon", "锆石"] },
  { kind: "material", en: "Acrylic", zh: "亚克力", matchers: ["acrylic", "亚克力"] },
  { kind: "material", en: "Obsidian", zh: "黑曜石", matchers: ["obsidian", "黑曜石", "银曜石", "金曜"] },
  { kind: "material", en: "Agate", zh: "玛瑙", matchers: ["agate", "玛瑙", "南红"] },
  { kind: "material", en: "Agarwood", zh: "沉香", matchers: ["沉香", "奇楠"] },
  { kind: "material", en: "Wood", zh: "木质", matchers: ["檀", "桃木", "木"] },
  { kind: "material", en: "Velvet Lace", zh: "绒带蕾丝", matchers: ["绒带", "蕾丝"] },
  { kind: "material", en: "Gold-Tone Alloy", zh: "金色合金", matchers: ["沙金", "镀金", "合金"] },
  { kind: "motif", en: "Geometric", zh: "几何", matchers: ["geometric", "几何", "不规则"] },
  { kind: "motif", en: "Heart", zh: "爱心", matchers: ["heart", "爱心", "桃心", "心形"] },
  { kind: "motif", en: "Cross", zh: "十字", matchers: ["cross", "十字", "十字架"] },
  { kind: "motif", en: "Sunflower", zh: "向日葵", matchers: ["sunflower", "向日葵", "太阳花"] },
  { kind: "motif", en: "Star", zh: "星芒", matchers: ["star", "五角星", "星"] },
  { kind: "motif", en: "Rose", zh: "玫瑰", matchers: ["rose flower", "rose pendant", "玫瑰花"] },
  { kind: "motif", en: "Floral", zh: "花朵", matchers: ["floral", "flower", "花朵", "小花", "碎花"] },
  { kind: "motif", en: "Butterfly", zh: "蝴蝶结", matchers: ["bow", "蝴蝶结"] },
  { kind: "motif", en: "Ocean Heart", zh: "海洋之心", matchers: ["ocean heart", "海洋之心", "泰坦尼克"] },
  { kind: "motif", en: "Pendant", zh: "吊坠", matchers: ["pendant", "吊坠"] },
  { kind: "motif", en: "Tennis", zh: "网球链", matchers: ["tennis", "网球链"] },
  { kind: "motif", en: "Beaded", zh: "串珠", matchers: ["beaded", "串珠", "佛珠", "圆珠"] },
  { kind: "motif", en: "Bone Chain", zh: "龙骨链", matchers: ["龙骨链"] },
  { kind: "motif", en: "Crossover", zh: "交叉", matchers: ["交叉"] },
  { kind: "audience", en: "Men", zh: "男士", matchers: ["men's", "for men", "男士", "男款"] },
  { kind: "audience", en: "Women", zh: "女士", matchers: ["women's", "for women", "女士", "女款", "女式"] },
  { kind: "finish", en: "Gold Tone", zh: "金色", matchers: ["gold", "金色", "黄金色"] },
  { kind: "finish", en: "Silver Tone", zh: "银色", matchers: ["silver", "银色", "钢色", "白k", "白金"] },
  { kind: "finish", en: "Rose Gold", zh: "玫瑰金", matchers: ["rose gold", "玫瑰金"] },
  { kind: "finish", en: "Black", zh: "黑色", matchers: ["black", "黑色"] },
  { kind: "finish", en: "Blue", zh: "蓝色", matchers: ["blue", "蓝色"] },
];

const zhNoisePatterns = [
  /【厂家直销】/g,
  /厂家直销/g,
  /厂家批发/g,
  /厂家批发精品/g,
  /精品/g,
  /批发/g,
  /跨境专供/g,
  /跨境电商/g,
  /跨境现货/g,
  /跨境/g,
  /亚马逊热销/g,
  /亚马逊/g,
  /热销/g,
  /高品质/g,
  /高档/g,
  /新款/g,
  /欧美/g,
  /日韩风/g,
  /ins/g,
  /2024/g,
  /2025/g,
  /2026/g,
  /可一件代发/g,
  /一件代发/g,
  /直播地摊可/g,
  /现货/g,
  /专供/g,
  /配饰/g,
  /饰品/g,
  /手饰品/g,
  /厂家/g,
];

const zhVariantReplacements: Array<[RegExp, string]> = [
  [/&gt;?/gi, " / "],
  [/pendant/gi, "吊坠"],
  [/necklace/gi, "项链"],
  [/bracelet/gi, "手链"],
  [/earrings?/gi, "耳环"],
  [/ring/gi, "戒指"],
  [/gold/gi, "金色"],
  [/rose gold/gi, "玫瑰金"],
  [/silver/gi, "银色"],
  [/steel/gi, "钢色"],
  [/black/gi, "黑色"],
  [/white/gi, "白色"],
  [/blue/gi, "蓝色"],
  [/green/gi, "绿色"],
  [/pink/gi, "粉色"],
  [/purple/gi, "紫色"],
  [/transparent/gi, "透明"],
  [/brown/gi, "棕色"],
  [/deep coffee/gi, "深咖"],
  [/ginger yellow/gi, "姜黄色"],
  [/主图袋子/g, "礼品袋"],
  [/袋子/g, "礼品袋"],
  [/金属礼盒/g, "金属礼盒"],
  [/带灯礼盒\+双证书（国检\+GRA\)/g, "礼盒套装"],
  [/带灯礼盒/g, "礼盒套装"],
  [/双证书/g, "证书款"],
  [/含GRA证/g, "证书款"],
  [/美码/g, "美码"],
  [/开口可调节/g, "开口可调"],
];

const enVariantReplacements: Array<[RegExp, string]> = [
  [/&gt;?/gi, " / "],
  [/玫瑰金/g, "Rose Gold"],
  [/金色/g, "Gold"],
  [/银色/g, "Silver"],
  [/钢色/g, "Silver"],
  [/白k/gi, "White Gold"],
  [/白金/g, "White Gold"],
  [/黑色/g, "Black"],
  [/白色/g, "White"],
  [/蓝色/g, "Blue"],
  [/绿色/g, "Green"],
  [/粉色/g, "Pink"],
  [/紫色/g, "Purple"],
  [/透明色/g, "Clear"],
  [/透明/g, "Clear"],
  [/深咖/g, "Dark Brown"],
  [/姜黄色/g, "Mustard"],
  [/项链/g, "Necklace"],
  [/锁骨链/g, "Layering Necklace"],
  [/颈链/g, "Choker"],
  [/吊坠/g, "Pendant"],
  [/手链/g, "Bracelet"],
  [/手串/g, "Beaded Bracelet"],
  [/耳环/g, "Earrings"],
  [/戒指/g, "Ring"],
  [/十字架/g, "Cross"],
  [/爱心/g, "Heart"],
  [/桃心/g, "Heart"],
  [/太阳花/g, "Sunflower"],
  [/向日葵/g, "Sunflower"],
  [/五角星/g, "Star"],
  [/蝴蝶结/g, "Bow"],
  [/礼品袋/g, "Gift Pouch"],
  [/礼盒套装/g, "Gift Box Set"],
  [/金属礼盒/g, "Metal Gift Box"],
  [/证书款/g, "Certificate Edition"],
  [/开口可调节/g, "Adjustable Open Fit"],
  [/开口可调/g, "Adjustable Open Fit"],
  [/美码/g, "US"],
  [/号/g, ""],
  [/克拉/g, " ct"],
  [/指圈周长/g, "Inner Circumference "],
  [/英寸/g, " in"],
  [/真空/g, "Vacuum Finish "],
  [/钢/g, "Steel"],
  [/粗/g, "Thick "],
  [/细/g, "Fine "],
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
    .map((part) => {
      if (/^[A-Z0-9-]+$/.test(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function hasChinese(input: string) {
  return /[\u3400-\u9fff]/.test(input);
}

function decodeSupplierText(input: string) {
  return input
    .replace(/&gt;?/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/[（）]/g, (value) => (value === "（" ? "(" : ")"))
    .replace(/[，]/g, ",")
    .replace(/[：]/g, ":")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanZhTitle(input: string) {
  let value = decodeSupplierText(input);
  for (const pattern of zhNoisePatterns) {
    value = value.replace(pattern, "");
  }
  return value
    .replace(/[+]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim();
}

function matchKeywordToken(text: string, kind: KeywordKind) {
  const normalized = text.toLowerCase();
  const tokens = keywordTokens.filter(
    (token) => token.kind === kind && token.matchers.some((matcher) => normalized.includes(matcher.toLowerCase())),
  );
  return tokens.filter((token, index) => tokens.findIndex((candidate) => candidate.en === token.en) === index);
}

function detectVariantType(text: string) {
  const normalized = text.toLowerCase();
  const set = new Set<string>();
  if (/(choker|颈链|项圈)/.test(normalized)) set.add("choker");
  if (/(锁骨链|layering)/.test(normalized)) set.add("layering");
  if (/(项链|necklace|吊坠|pendant|毛衣链)/.test(normalized)) set.add("necklace");
  if (/(手链|手串|bracelet|佛珠)/.test(normalized)) set.add("bracelet");
  if (/(戒指|指环|ring)/.test(normalized)) set.add("ring");
  if (/(耳环|耳钉|earring)/.test(normalized)) set.add("earrings");
  return set;
}

function detectProductType(primaryText: string, variantTexts: string[]) {
  const titleTypes = detectVariantType(primaryText);
  const variantTypeSet = new Set<string>();
  for (const variantText of variantTexts) {
    for (const type of detectVariantType(variantText)) {
      variantTypeSet.add(type);
    }
  }

  const mergedTypes = new Set<string>([...titleTypes, ...variantTypeSet]);
  const nonChainTypes = [...mergedTypes].filter((type) => !["necklace", "layering", "choker"].includes(type));

  if (variantTypeSet.size >= 2 || (titleTypes.size >= 2 && /(系列|套装|套组|组合)/.test(primaryText))) {
    return { type: "collection" as ProductType, typeSet: mergedTypes };
  }

  if (mergedTypes.has("ring") && (mergedTypes.has("bracelet") || mergedTypes.has("earrings") || mergedTypes.has("necklace"))) {
    return { type: "collection" as ProductType, typeSet: mergedTypes };
  }

  if (titleTypes.has("ring")) return { type: "ring" as ProductType, typeSet: mergedTypes };
  if (titleTypes.has("bracelet")) return { type: "bracelet" as ProductType, typeSet: mergedTypes };
  if (titleTypes.has("earrings")) return { type: "earrings" as ProductType, typeSet: mergedTypes };
  if (titleTypes.has("choker")) return { type: "choker-necklace" as ProductType, typeSet: mergedTypes };
  if (titleTypes.has("layering")) return { type: "layering-necklace" as ProductType, typeSet: mergedTypes };
  if (titleTypes.has("necklace")) return { type: "necklace" as ProductType, typeSet: mergedTypes };
  if (nonChainTypes[0] === "bracelet") return { type: "bracelet" as ProductType, typeSet: mergedTypes };
  if (nonChainTypes[0] === "ring") return { type: "ring" as ProductType, typeSet: mergedTypes };
  if (nonChainTypes[0] === "earrings") return { type: "earrings" as ProductType, typeSet: mergedTypes };
  if (mergedTypes.has("choker")) return { type: "choker-necklace" as ProductType, typeSet: mergedTypes };
  if (mergedTypes.has("layering")) return { type: "layering-necklace" as ProductType, typeSet: mergedTypes };
  return { type: "necklace" as ProductType, typeSet: mergedTypes };
}

function extractRawTitle(product: ProductRecord) {
  const sourcePayload = product.sourcePayload as Record<string, unknown> | null;
  const raw = sourcePayload?.raw as Record<string, unknown> | undefined;
  const rawProduct = raw?.product as Record<string, unknown> | undefined;
  const title = typeof rawProduct?.title === "string" ? rawProduct.title : product.nameZh || product.nameEn;
  return decodeSupplierText(title);
}

function analyzeProduct(product: ProductRecord): Analysis {
  const rawTitle = extractRawTitle(product);
  const variantTexts = product.variants.map((variant) => decodeSupplierText(`${variant.labelZh} ${variant.labelEn}`));
  const tagText = product.tags.map((item) => item.tag.slug).join(" ");
  const primaryText = [rawTitle, product.nameEn, product.nameZh, tagText].join(" ");
  const combinedText = [primaryText, ...variantTexts].join(" ");
  const titleText = cleanZhTitle(rawTitle);
  const { type, typeSet } = detectProductType(primaryText, variantTexts);
  const styles = matchKeywordToken(`${rawTitle} ${product.nameEn}`, "style");
  const materials = matchKeywordToken(combinedText, "material");
  const motifs = matchKeywordToken(combinedText, "motif");
  const audiences = matchKeywordToken(combinedText, "audience");
  const finishes = matchKeywordToken(combinedText, "finish");
  const sizeHint = /(\d+(?:\.\d+)?\s*(?:mm|cm|CM|in|英寸))/.exec(combinedText)?.[1]?.replace(/\s+/g, " ");
  const fitHint =
    /(开口可调|可调节|adjustable)/i.test(combinedText)
      ? "Adjustable"
      : /(美码|US)/i.test(combinedText)
        ? "US size options"
        : undefined;

  return {
    rawTitle,
    titleText,
    tagText,
    combinedText,
    productType: type,
    styles,
    materials,
    motifs,
    audiences,
    finishes,
    sizeHint,
    fitHint,
    typeSet,
  };
}

function typeLabels(type: ProductType) {
  switch (type) {
    case "layering-necklace":
      return { en: "Layering Necklace", zh: "锁骨链" };
    case "choker-necklace":
      return { en: "Choker Necklace", zh: "颈链" };
    case "bracelet":
      return { en: "Bracelet", zh: "手链" };
    case "ring":
      return { en: "Ring", zh: "戒指" };
    case "earrings":
      return { en: "Earrings", zh: "耳饰" };
    case "collection":
      return { en: "Jewelry Collection", zh: "系列饰品" };
    case "necklace":
    default:
      return { en: "Necklace", zh: "项链" };
  }
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function pickDescriptorTokens(analysis: Analysis) {
  const styles = uniqueBy(analysis.styles, (item) => item.en);
  const motifs = uniqueBy(
    analysis.finishes.some((item) => item.en === "Rose Gold")
      ? analysis.motifs.filter((item) => item.en !== "Rose")
      : analysis.motifs,
    (item) => item.en,
  );
  const materials = uniqueBy(analysis.materials, (item) => item.en);
  const finishes = uniqueBy(
    analysis.finishes.filter((item) => {
      if (item.en === "Gold Tone" && analysis.finishes.some((candidate) => candidate.en === "Rose Gold")) {
        return false;
      }
      if (item.en === "Silver Tone" && analysis.materials.some((candidate) => ["Sterling Silver", "Stainless Steel"].includes(candidate.en))) {
        return false;
      }
      if (item.en === "Gold Tone" && analysis.materials.some((candidate) => candidate.en === "Gold-Tone Alloy")) {
        return false;
      }
      return true;
    }),
    (item) => item.en,
  );

  return uniqueBy(
    [styles[0], ...motifs.slice(0, 2), materials[0], finishes[0]].filter(Boolean) as KeywordToken[],
    (item) => item.en,
  );
}

function buildNameEn(product: ProductRecord, analysis: Analysis) {
  const labels = typeLabels(analysis.productType);
  const descriptors = pickDescriptorTokens(analysis)
    .map((item) => item.en)
    .filter((value) => !labels.en.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 3);

  if (analysis.productType === "collection") {
    const anchor = descriptors[0] ?? "Curated";
    return titleCase(`${anchor} ${labels.en}`);
  }

  if (descriptors.length > 0) {
    return titleCase(`${descriptors.join(" ")} ${labels.en}`);
  }

  const currentName = decodeSupplierText(product.nameEn);
  if (currentName && !hasChinese(currentName) && currentName.split(/\s+/).length > 1) {
    return titleCase(currentName);
  }

  return titleCase(labels.en);
}

function buildNameZh(analysis: Analysis) {
  const labels = typeLabels(analysis.productType);
  const descriptors = pickDescriptorTokens(analysis)
    .map((item) => item.zh)
    .filter((value) => !labels.zh.includes(value))
    .slice(0, 3);

  if (analysis.productType === "collection") {
    const anchor = descriptors[0] ?? "精选";
    return `${anchor}${labels.zh}`;
  }

  if (descriptors.length > 0) {
    return `${descriptors.join("")}${labels.zh}`;
  }

  return labels.zh;
}

function audienceUseCase(type: ProductType) {
  switch (type) {
    case "bracelet":
      return {
        en: "stacked styling, gifting and everyday wear",
        zh: "叠戴搭配、送礼与日常佩戴",
      };
    case "ring":
      return {
        en: "daily wear, special occasions and gift moments",
        zh: "日常佩戴、纪念场景与送礼时刻",
      };
    case "earrings":
      return {
        en: "dress-up looks, gifting and polished styling",
        zh: "造型点缀、送礼与精致搭配",
      };
    case "collection":
      return {
        en: "mix-and-match styling and curated gifting",
        zh: "成套搭配与精选送礼",
      };
    case "choker-necklace":
      return {
        en: "party looks, layering and boutique gifting",
        zh: "派对穿搭、叠搭造型与精品送礼",
      };
    case "layering-necklace":
      return {
        en: "layering, everyday styling and gift-ready edits",
        zh: "叠戴造型、日常穿搭与礼赠场景",
      };
    case "necklace":
    default:
      return {
        en: "everyday styling, gifting and boutique add-ons",
        zh: "日常穿搭、送礼与精品加购",
      };
  }
}

function buildDescriptorSentence(analysis: Analysis) {
  const descriptorTokens = pickDescriptorTokens(analysis);
  const parts = descriptorTokens
    .map((item) => item.en.toLowerCase())
    .slice(0, 3);
  if (parts.length === 0) {
    return {
      en: "clean lines and a polished boutique finish",
      zh: "利落线条与精致陈列感",
    };
  }
  return {
    en: parts.join(", "),
    zh: descriptorTokens.map((item) => item.zh).slice(0, 3).join("、"),
  };
}

function buildContent(nameEn: string, nameZh: string, analysis: Analysis) {
  const useCase = audienceUseCase(analysis.productType);
  const descriptor = buildDescriptorSentence(analysis);

  const subtitleEn = `${nameEn} for ${useCase.en}.`;
  const subtitleZh = `${nameZh}，适合${useCase.zh}。`;
  const descriptionEn = `${nameEn} balances ${descriptor.en} in a compact accessory profile that works well on its own or inside curated gift assortments. It is positioned for retail presentation with clearer options, polished bilingual copy and easy everyday appeal.`;
  const descriptionZh = `${nameZh}融合了${descriptor.zh}，适合作为单独佩戴的饰品，也适合放入礼盒组合或节日专题中展示。商品信息已按零售上架逻辑整理，便于前台清晰展示规格、风格与搭配场景。`;
  const storyEn = `This piece was selected for boutique jewelry merchandising, with emphasis on ${descriptor.en} and a cleaner option structure for storefront comparison. It fits seasonal launches, gift campaigns and compact accessory edits without carrying supplier-facing noise.`;
  const storyZh = `这款商品面向精品饰品陈列与零售上架场景整理，重点突出${descriptor.zh}，并将规格选项改写为更适合前台比较的结构。适合节日活动、礼品组合与轻量配饰系列销售，不再保留供应端噪音信息。`;

  return {
    subtitleEn,
    subtitleZh,
    descriptionEn,
    descriptionZh,
    storyEn,
    storyZh,
  };
}

function buildSpecs(analysis: Analysis) {
  const descriptorTokens = pickDescriptorTokens(analysis);
  const materialValueEn =
    uniqueBy([...analysis.materials, ...analysis.finishes], (item) => item.en)
      .map((item) => item.en)
      .slice(0, 2)
      .join(" / ") || "Fashion jewelry material";
  const materialValueZh =
    uniqueBy([...analysis.materials, ...analysis.finishes], (item) => item.zh)
      .map((item) => item.zh)
      .slice(0, 2)
      .join(" / ") || "饰品材质";
  const styleValueEn =
    descriptorTokens
      .map((item) => item.en)
      .slice(0, 3)
      .join(" / ") || "Boutique everyday styling";
  const styleValueZh =
    descriptorTokens
      .map((item) => item.zh)
      .slice(0, 3)
      .join(" / ") || "精品日常风格";
  const useCase = audienceUseCase(analysis.productType);
  const packagingEn = analysis.productType === "collection" ? "Gift-ready pouch or box set" : "Protective pouch packaging";
  const packagingZh = analysis.productType === "collection" ? "礼品袋或礼盒包装" : "防护袋包装";

  const specs = [
    {
      labelEn: "Material",
      labelZh: "材质",
      valueEn: materialValueEn,
      valueZh: materialValueZh,
    },
    {
      labelEn: "Style",
      labelZh: "风格",
      valueEn: styleValueEn,
      valueZh: styleValueZh,
    },
    {
      labelEn: "Packaging",
      labelZh: "包装",
      valueEn: packagingEn,
      valueZh: packagingZh,
    },
    {
      labelEn: "Best for",
      labelZh: "适用场景",
      valueEn: useCase.en,
      valueZh: useCase.zh,
    },
  ] as Array<{ labelEn: string; labelZh: string; valueEn: string; valueZh: string }>;

  if (analysis.fitHint || analysis.sizeHint) {
    specs.splice(2, 0, {
      labelEn: "Size / Fit",
      labelZh: "尺寸 / 佩戴",
      valueEn: [analysis.sizeHint, analysis.fitHint].filter(Boolean).join(" / "),
      valueZh: [analysis.sizeHint, analysis.fitHint === "Adjustable" ? "可调节" : analysis.fitHint === "US size options" ? "美码可选" : undefined]
        .filter(Boolean)
        .join(" / "),
    });
  }

  return specs.slice(0, 5);
}

function humanizeOptionIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function isVariantLabelNoisy(value: string) {
  const openParenCount = (value.match(/\(/g) ?? []).length;
  const closeParenCount = (value.match(/\)/g) ?? []).length;
  return (
    value.includes(">") ||
    value.includes("【") ||
    value.includes("】") ||
    openParenCount !== closeParenCount ||
    /项链.*手链|手链.*项链|项链.*戒指|戒指.*项链/.test(value) ||
    value.length > 36
  );
}

function cleanVariantZh(raw: string, index: number) {
  let value = decodeSupplierText(raw);
  for (const [pattern, replacement] of zhVariantReplacements) {
    value = value.replace(pattern, replacement);
  }
  value = value
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim();

  if (!value) {
    return `款式 ${humanizeOptionIndex(index)}`;
  }

  if (/^款式\s+[A-Za-z0-9_-]+$/i.test(value)) {
    return value;
  }

  if (isVariantLabelNoisy(value)) {
    return `款式 ${humanizeOptionIndex(index)}`;
  }

  if (/^[A-Za-z0-9_-]+$/.test(value)) {
    return `款式 ${value}`;
  }

  return value;
}

function cleanVariantEn(raw: string, fallbackZh: string, index: number) {
  const styleMatch = /^款式\s+([A-Za-z0-9_-]+)$/i.exec(fallbackZh);
  if (styleMatch) {
    return `Style ${styleMatch[1]}`;
  }

  let value = decodeSupplierText(raw);
  for (const [pattern, replacement] of enVariantReplacements) {
    value = value.replace(pattern, replacement);
  }
  value = value
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim();

  if (!value) {
    return `Style ${humanizeOptionIndex(index)}`;
  }

  if (/^[A-Za-z0-9_-]+$/.test(value)) {
    return `Style ${value}`;
  }

  if (isVariantLabelNoisy(value)) {
    return `Style ${humanizeOptionIndex(index)}`;
  }

  if (hasChinese(value)) {
    const compact = value.replace(/[\u3400-\u9fff]/g, "").replace(/\s+/g, " ").trim();
    if (compact.length >= 3) {
      return titleCase(compact);
    }
    if (/^[\u3400-\u9fff A-Za-z0-9/_().-]+$/.test(fallbackZh) && fallbackZh.length <= 20) {
      return `Style ${humanizeOptionIndex(index)}`;
    }
    return `Option ${humanizeOptionIndex(index)}`;
  }

  return titleCase(value);
}

function normalizeInventory(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return 48;
  }
  return Math.min(Math.max(Math.round(value), 8), 240);
}

function buildCleanVariants(product: ProductRecord) {
  const suffix = product.id.slice(-8).toUpperCase();
  return product.variants.map((variant, index) => {
    const rawLabel = decodeSupplierText(variant.labelZh || variant.labelEn || "");
    const labelZh = cleanVariantZh(rawLabel, index);
    const labelEn = cleanVariantEn(rawLabel, labelZh, index);
    return {
      labelEn,
      labelZh,
      sku: `JW-${suffix}-${String(index + 1).padStart(2, "0")}`,
      price: variant.price ?? null,
      inventory: normalizeInventory(variant.inventory ?? null),
    } satisfies CleanVariant;
  });
}

function buildTags(analysis: Analysis) {
  const labels = typeLabels(analysis.productType);
  const values = [
    "jewelry",
    slugify(labels.en),
    ...analysis.styles.map((item) => slugify(item.en)),
    ...analysis.materials.map((item) => slugify(item.en)),
    ...analysis.motifs.map((item) => slugify(item.en)),
    ...analysis.audiences.map((item) => slugify(item.en)),
    "gift-ready",
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value !== "collection")
    .slice(0, 7);

  return [...new Set(values)];
}

function buildSourcePayload(product: ProductRecord) {
  return {
    sku: `JW-${product.id.slice(-8).toUpperCase()}`,
    availabilityStatus: "In stock",
  } satisfies Prisma.InputJsonValue;
}

function buildSlug(nameEn: string, product: ProductRecord) {
  const base = slugify(nameEn) || "jewelry-item";
  return `${base}-${product.id.slice(-8).toLowerCase()}`;
}

function buildImageAlts(nameEn: string, nameZh: string, imageCount: number, index: number) {
  if (index === 0) {
    return {
      altEn: nameEn,
      altZh: nameZh,
    };
  }
  return {
    altEn: `${nameEn} detail view ${index}`,
    altZh: `${nameZh} 细节图 ${index}`,
  };
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
        select: {
          productId: true,
        },
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
        slug: "jewelry",
      },
    },
    ...productQuery,
  });

  const preview: Array<Record<string, unknown>> = [];

  for (const product of records) {
    const analysis = analyzeProduct(product);
    const nameEn = buildNameEn(product, analysis);
    const nameZh = buildNameZh(analysis);
    const slug = buildSlug(nameEn, product);
    const content = buildContent(nameEn, nameZh, analysis);
    const specs = buildSpecs(analysis);
    const variants = buildCleanVariants(product);
    const tags = buildTags(analysis);
    const sourcePayload = buildSourcePayload(product);

    if (dryRun) {
      preview.push({
        beforeSlug: product.slug,
        afterSlug: slug,
        beforeNameEn: product.nameEn,
        afterNameEn: nameEn,
        beforeNameZh: product.nameZh,
        afterNameZh: nameZh,
        afterTags: tags,
        type: analysis.productType,
      });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: {
          slug,
          nameEn,
          nameZh,
          subtitleEn: content.subtitleEn,
          subtitleZh: content.subtitleZh,
          descriptionEn: content.descriptionEn,
          descriptionZh: content.descriptionZh,
          storyEn: content.storyEn,
          storyZh: content.storyZh,
          leadTimeEn: "Ships in 3-5 business days",
          leadTimeZh: "3-5 个工作日内发货",
          shippingNoteEn: "Packed with a protective pouch or gift-ready wrap. Minor variations in finish and color may appear across batches.",
          shippingNoteZh: "采用防护袋或礼赠包装发货，不同批次在色泽与表面工艺上可能存在轻微差异。",
          attributes: {
            specs,
          } as Prisma.InputJsonValue,
          sourcePayload: sourcePayload as Prisma.InputJsonValue,
        },
      });

      for (let index = 0; index < product.images.length; index += 1) {
        const image = product.images[index];
        const alt = buildImageAlts(nameEn, nameZh, product.images.length, index);
        await tx.productImage.update({
          where: { id: image.id },
          data: {
            altEn: alt.altEn,
            altZh: alt.altZh,
            sortOrder: index,
            isCover: index === 0,
          },
        });
      }

      for (let index = 0; index < product.variants.length; index += 1) {
        const variant = product.variants[index];
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: `TMP-${product.id.slice(-8).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
          },
        });
      }

      for (let index = 0; index < product.variants.length; index += 1) {
        const variant = product.variants[index];
        const cleanVariant = variants[index];
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: cleanVariant.sku,
            labelEn: cleanVariant.labelEn,
            labelZh: cleanVariant.labelZh,
            price: cleanVariant.price,
            inventory: cleanVariant.inventory,
            metadata: {
              managedInAdmin: true,
              normalizedForStorefront: true,
            } as Prisma.InputJsonValue,
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
          matchedProducts: records.length,
          preview: preview.slice(0, 12),
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
        repairedProducts: records.length,
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
