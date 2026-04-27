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
type CategorySlug = "plush" | "gifts";
type ProductType =
  | "plush-keychain"
  | "plush-toy"
  | "plush-pillow"
  | "plush-collectible"
  | "desk-figurine"
  | "sand-art-decor"
  | "jewelry-box"
  | "desk-calendar"
  | "led-night-light"
  | "display-rack"
  | "decor-sculpture";

type Token = {
  en: string;
  zh: string;
  slug: string;
  matchers: string[];
};

type Analysis = {
  rawTitle: string;
  titleText: string;
  combinedText: string;
  category: CategorySlug;
  productType: ProductType;
  animals: Token[];
  themes: Token[];
  materials: Token[];
  styles: Token[];
  sizeHint?: string;
  colorHint?: string;
  currentAvailability?: string;
};

type CleanVariant = {
  labelEn: string;
  labelZh: string;
  sku: string;
  price: Prisma.Decimal | null;
  inventory: number | null;
};

const plushAnimalTokens: Token[] = [
  { en: "Otter", zh: "海獭", slug: "otter", matchers: ["海獭", "水濑", "水獭"] },
  { en: "Dog", zh: "小狗", slug: "dog", matchers: ["修狗", "小狗", "狗狗", "犬", "狗"] },
  { en: "Groundhog", zh: "土拨鼠", slug: "groundhog", matchers: ["土拨鼠"] },
  { en: "Sheep", zh: "小羊", slug: "sheep", matchers: ["小羊", "绵羊", "羊"] },
  { en: "Bear", zh: "小熊", slug: "bear", matchers: ["小熊", "棕熊", "熊"] },
  { en: "Goose", zh: "白鹅", slug: "goose", matchers: ["白鹅", "鹅"] },
  { en: "Crab", zh: "螃蟹", slug: "crab", matchers: ["螃蟹"] },
  { en: "Lobster", zh: "龙虾", slug: "lobster", matchers: ["龙虾"] },
  { en: "Bunny", zh: "兔子", slug: "bunny", matchers: ["小兔", "兔子", "兔"] },
  { en: "Cat", zh: "猫咪", slug: "cat", matchers: ["猫咪", "猫猫", "猫"] },
  { en: "Ocean Animal", zh: "海洋动物", slug: "ocean-animal", matchers: ["海洋动物"] },
];

const plushThemeTokens: Token[] = [
  { en: "Cute", zh: "可爱", slug: "cute", matchers: ["可爱", "超萌", "萌", "萌趣"] },
  { en: "Cartoon", zh: "卡通", slug: "cartoon", matchers: ["卡通"] },
  { en: "Fruit Party", zh: "水果派对", slug: "fruit-party", matchers: ["水果派对", "水果"] },
  { en: "Scarf", zh: "围巾", slug: "scarf", matchers: ["围巾"] },
  { en: "Game-Inspired", zh: "游戏周边", slug: "game-inspired", matchers: ["周边", "forsaken chance plus", "被遗忘的游戏"] },
  { en: "Friendship", zh: "闺蜜款", slug: "friendship", matchers: ["闺蜜", "情侣"] },
  { en: "Comfort", zh: "安抚", slug: "comfort", matchers: ["安抚"] },
];

const giftThemeTokens: Token[] = [
  { en: "Princess", zh: "公主", slug: "princess", matchers: ["公主"] },
  { en: "Lucky God", zh: "财神", slug: "lucky-god", matchers: ["财神", "招财"] },
  { en: "Astronaut", zh: "宇航员", slug: "astronaut", matchers: ["宇航员", "太空人"] },
  { en: "Yoga", zh: "瑜伽", slug: "yoga", matchers: ["瑜伽"] },
  { en: "Frog", zh: "青蛙", slug: "frog", matchers: ["frog", "青蛙"] },
  { en: "Lion Dance", zh: "醒狮", slug: "lion-dance", matchers: ["醒狮", "舞狮"] },
  { en: "Zodiac", zh: "生肖", slug: "zodiac", matchers: ["十二生肖", "生肖"] },
  { en: "Deer", zh: "鹿", slug: "deer", matchers: ["鹿"] },
  { en: "Fairy Tale", zh: "童话", slug: "fairy-tale", matchers: ["童话"] },
  { en: "Geometric", zh: "几何", slug: "geometric", matchers: ["几何", "方型", "方形"] },
  { en: "Deer Antler", zh: "鹿角", slug: "deer-antler", matchers: ["鹿角"] },
  { en: "Animal", zh: "动物", slug: "animal", matchers: ["动物"] },
  { en: "Cat", zh: "小黑猫", slug: "cat", matchers: ["小黑猫", "猫", "罗小黑"] },
  { en: "Stress Relief", zh: "解压", slug: "stress-relief", matchers: ["解压", "不倒翁", "平衡"] },
  { en: "Star", zh: "星星", slug: "star", matchers: ["星星"] },
];

const giftMaterialTokens: Token[] = [
  { en: "Resin", zh: "树脂", slug: "resin", matchers: ["树脂"] },
  { en: "Ceramic", zh: "陶瓷", slug: "ceramic", matchers: ["陶瓷"] },
  { en: "Glass", zh: "玻璃", slug: "glass", matchers: ["玻璃"] },
  { en: "Wood", zh: "木质", slug: "wood", matchers: ["木质", "木制", "木"] },
  { en: "Metal", zh: "金属", slug: "metal", matchers: ["金色", "金属", "铁艺"] },
  { en: "Iron", zh: "铁艺", slug: "iron", matchers: ["铁艺", "铁人"] },
  { en: "3D Printed", zh: "3D打印", slug: "3d-printed", matchers: ["3d打印"] },
];

const giftStyleTokens: Token[] = [
  { en: "Creative", zh: "创意", slug: "creative", matchers: ["创意"] },
  { en: "Nordic", zh: "北欧", slug: "nordic", matchers: ["北欧"] },
  { en: "Minimalist", zh: "简约", slug: "minimalist", matchers: ["简约", "现代简约"] },
  { en: "Abstract", zh: "抽象", slug: "abstract", matchers: ["抽象"] },
  { en: "Modern", zh: "现代", slug: "modern", matchers: ["现代"] },
];

const zhNoisePatterns = [
  /【厂家直销】/g,
  /厂家直销/g,
  /厂家批发/g,
  /批发/g,
  /爆款/g,
  /网红/g,
  /跨境热卖/g,
  /跨境新品/g,
  /跨境新款/g,
  /跨境/g,
  /热卖/g,
  /热销/g,
  /现货/g,
  /礼物批发/g,
  /同$/g,
];

const zhVariantReplacements: Array<[RegExp, string]> = [
  [/&gt;?/gi, " / "],
  [/厘米/g, "cm"],
  [/英寸/g, "寸"],
  [/左右/g, ""],
  [/颜色平均（单个价格）/g, "混色单只"],
  [/平分【单个价】/g, "随机单只"],
  [/挂链/g, "挂链款"],
  [/金色扣/g, "金扣款"],
  [/白框/g, "白框"],
  [/黑框/g, "黑框"],
  [/镜边/g, "镜边"],
  [/旋转/g, "旋转"],
  [/支架/g, "支架"],
];

const enVariantReplacements: Array<[RegExp, string]> = [
  [/&gt;?/gi, " / "],
  [/厘米/g, "cm"],
  [/英寸/g, "in"],
  [/左右/g, ""],
  [/浅棕色/g, "Light Brown"],
  [/棕色/g, "Brown"],
  [/灰色/g, "Gray"],
  [/黑色/g, "Black"],
  [/白色/g, "White"],
  [/粉色/g, "Pink"],
  [/蓝色/g, "Blue"],
  [/绿色/g, "Green"],
  [/紫色/g, "Purple"],
  [/红色/g, "Red"],
  [/黄色/g, "Yellow"],
  [/咖啡色/g, "Coffee"],
  [/咖啡/g, "Coffee"],
  [/混色单只/g, "Mixed Single Piece"],
  [/随机单只/g, "Random Single Piece"],
  [/挂链款/g, "Hanging Loop"],
  [/金扣款/g, "Gold Clasp"],
  [/大号/g, "Large"],
  [/小号/g, "Small"],
  [/单个价/g, "Single Piece"],
  [/白框/g, "White Frame"],
  [/黑框/g, "Black Frame"],
  [/镜边/g, "Mirror Edge"],
  [/旋转/g, "Rotating"],
  [/支架/g, "Stand"],
  [/圆形/g, "Round"],
  [/方型/g, "Square"],
  [/方形/g, "Square"],
  [/款/g, ""],
  [/围巾小羊/g, "Scarf Sheep"],
  [/乌萨奇/g, "Usagi"],
  [/吉伊/g, "Chiikawa"],
  [/小八/g, "Hachiware"],
  [/小黑猫/g, "Black Cat"],
  [/公主/g, "Princess"],
  [/宇航员/g, "Astronaut"],
  [/太空人/g, "Astronaut"],
  [/沙漏/g, "Hourglass"],
  [/流沙画/g, "Flowing Sand Art"],
  [/首饰盒/g, "Jewelry Box"],
  [/日历/g, "Calendar"],
  [/小夜灯/g, "Night Light"],
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
  return value.replace(/\s+/g, " ").replace(/^\W+|\W+$/g, "").trim();
}

function matchTokens(text: string, tokens: Token[]) {
  const normalized = text.toLowerCase();
  return tokens.filter((token) => token.matchers.some((matcher) => normalized.includes(matcher.toLowerCase())));
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

function extractRawTitle(product: ProductRecord) {
  const sourcePayload = product.sourcePayload as Record<string, unknown> | null;
  const raw = sourcePayload?.raw as Record<string, unknown> | undefined;
  const rawProduct = raw?.product as Record<string, unknown> | undefined;
  const title = typeof rawProduct?.title === "string" ? rawProduct.title : product.nameZh || product.nameEn;
  return decodeSupplierText(title);
}

function extractAvailability(product: ProductRecord) {
  const sourcePayload = product.sourcePayload as Record<string, unknown> | null;
  return typeof sourcePayload?.availabilityStatus === "string" ? sourcePayload.availabilityStatus : undefined;
}

function detectPlushType(text: string): ProductType {
  if (/(抱枕)/.test(text)) return "plush-pillow";
  if (/(挂件|挂饰|钥匙扣|包包挂饰)/.test(text)) return "plush-keychain";
  if (/(周边|潮玩)/.test(text)) return "plush-collectible";
  return "plush-toy";
}

function detectGiftType(text: string): ProductType {
  if (/(首饰盒|喜糖盒)/.test(text)) return "jewelry-box";
  if (/(沙漏|流沙画)/.test(text)) return "sand-art-decor";
  if (/(日历)/.test(text)) return "desk-calendar";
  if (/(小夜灯|led)/i.test(text)) return "led-night-light";
  if (/(架子|置物架)/.test(text)) return "display-rack";
  if (/(雕像|雕塑|抽象)/.test(text)) return "decor-sculpture";
  return "desk-figurine";
}

function analyzeProduct(product: ProductRecord): Analysis {
  const category = product.category.slug as CategorySlug;
  const rawTitle = extractRawTitle(product);
  const titleText = cleanZhTitle(rawTitle);
  const variantText = product.variants.map((variant) => decodeSupplierText(`${variant.labelZh} ${variant.labelEn}`)).join(" ");
  const tagText = product.tags.map((item) => item.tag.slug).join(" ");
  const primaryText = `${titleText} ${product.nameEn} ${product.nameZh} ${tagText}`;
  const combinedText = `${primaryText} ${variantText}`;
  const sizeHint = /(\d+(?:\.\d+)?\s*(?:cm|厘米|寸|英寸))/.exec(combinedText)?.[1];
  const colorHint = /(粉色|蓝色|绿色|紫色|红色|黄色|黑色|白色|棕色|灰色)/.exec(combinedText)?.[1];

  if (category === "plush") {
    return {
      rawTitle,
      titleText,
      combinedText,
      category,
      productType: detectPlushType(primaryText),
      animals: uniqueBy(matchTokens(primaryText, plushAnimalTokens), (item) => item.slug),
      themes: uniqueBy(matchTokens(primaryText, plushThemeTokens), (item) => item.slug),
      materials: [],
      styles: uniqueBy(matchTokens(primaryText, plushThemeTokens), (item) => item.slug),
      sizeHint,
      colorHint,
      currentAvailability: extractAvailability(product),
    };
  }

  return {
    rawTitle,
    titleText,
    combinedText,
    category,
    productType: detectGiftType(primaryText),
    animals: [],
    themes: uniqueBy(matchTokens(primaryText, giftThemeTokens), (item) => item.slug),
    materials: uniqueBy(matchTokens(primaryText, giftMaterialTokens), (item) => item.slug),
    styles: uniqueBy(matchTokens(primaryText, giftStyleTokens), (item) => item.slug),
    sizeHint,
    colorHint,
    currentAvailability: extractAvailability(product),
  };
}

function typeLabels(category: CategorySlug, type: ProductType) {
  if (category === "plush") {
    switch (type) {
      case "plush-keychain":
        return { en: "Plush Keychain", zh: "毛绒挂件" };
      case "plush-pillow":
        return { en: "Plush Pillow", zh: "毛绒抱枕" };
      case "plush-collectible":
        return { en: "Collectible Plush", zh: "毛绒周边" };
      case "plush-toy":
      default:
        return { en: "Plush Toy", zh: "毛绒玩偶" };
    }
  }

  switch (type) {
    case "sand-art-decor":
      return { en: "Sand Art Decor", zh: "流沙摆件" };
    case "jewelry-box":
      return { en: "Jewelry Box", zh: "首饰盒" };
    case "desk-calendar":
      return { en: "Desk Calendar", zh: "桌面日历" };
    case "led-night-light":
      return { en: "LED Night Light", zh: "LED小夜灯" };
    case "display-rack":
      return { en: "Display Rack", zh: "展示架" };
    case "decor-sculpture":
      return { en: "Decor Sculpture", zh: "装饰雕塑" };
    case "desk-figurine":
    default:
      return { en: "Desk Figurine", zh: "桌面摆件" };
  }
}

function pickDescriptorTokens(analysis: Analysis) {
  if (analysis.category === "plush") {
    const preferredTheme = analysis.themes.find((item) => item.slug !== "cute" && item.slug !== "comfort");
    return uniqueBy(
      [preferredTheme, analysis.animals[0], analysis.themes[0]].filter(Boolean) as Token[],
      (item) => item.slug,
    );
  }

  return uniqueBy(
    [analysis.styles[0], analysis.themes[0], analysis.materials[0]].filter(Boolean) as Token[],
    (item) => item.slug,
  );
}

function buildNameEn(analysis: Analysis) {
  const labels = typeLabels(analysis.category, analysis.productType);
  if (analysis.category === "plush") {
    const theme = analysis.themes.find((item) => item.slug !== "comfort");
    const animal = analysis.animals[0];
    const parts = [
      theme?.slug === "cute" ? theme.en : undefined,
      theme?.slug && !["cute", "comfort"].includes(theme.slug) ? theme.en : undefined,
      animal?.en,
      theme?.slug === "comfort" ? theme.en : undefined,
      labels.en,
    ].filter(Boolean) as string[];

    return titleCase(parts.join(" "));
  }

  const descriptors = pickDescriptorTokens(analysis).map((item) => item.en).filter(Boolean);

  if (descriptors.length === 0) {
    return labels.en;
  }

  return titleCase(`${descriptors.slice(0, 2).join(" ")} ${labels.en}`);
}

function buildNameZh(analysis: Analysis) {
  const labels = typeLabels(analysis.category, analysis.productType);
  if (analysis.category === "plush") {
    const theme = analysis.themes.find((item) => item.slug !== "comfort");
    const animal = analysis.animals[0];
    const parts = [
      theme?.slug === "cute" ? theme.zh : undefined,
      theme?.slug && !["cute", "comfort"].includes(theme.slug) ? theme.zh : undefined,
      animal?.zh,
      theme?.slug === "comfort" ? theme.zh : undefined,
      labels.zh,
    ].filter(Boolean) as string[];

    return parts.join("");
  }

  const descriptors = pickDescriptorTokens(analysis).map((item) => item.zh).filter(Boolean);

  if (descriptors.length === 0) {
    return labels.zh;
  }

  return `${descriptors.slice(0, 2).join("")}${labels.zh}`;
}

function getUseCaseText(analysis: Analysis) {
  if (analysis.category === "plush") {
    switch (analysis.productType) {
      case "plush-keychain":
        return {
          en: "bag styling, keychain gifting and casual display moments",
          zh: "包袋点缀、钥匙扣送礼与日常摆放",
        };
      case "plush-pillow":
        return {
          en: "sofa, bedside and comfort-focused gifting",
          zh: "沙发、床头与陪伴型送礼场景",
        };
      default:
        return {
          en: "gifting, desk styling and cozy companion display",
          zh: "送礼、桌面陈列与陪伴型摆放",
        };
    }
  }

  switch (analysis.productType) {
    case "jewelry-box":
      return {
        en: "ring storage, dresser styling and small gift moments",
        zh: "首饰收纳、梳妆台陈列与小礼物场景",
      };
    case "sand-art-decor":
      return {
        en: "desk relaxation, shelf styling and compact gifting",
        zh: "桌面解压、书架摆放与轻礼物场景",
      };
    case "desk-calendar":
      return {
        en: "office desks, study corners and practical gifting",
        zh: "办公桌、书房角落与实用礼赠场景",
      };
    default:
      return {
        en: "desk decor, shelf styling and gift-ready display",
        zh: "桌面装饰、层架陈列与礼品展示",
      };
  }
}

function buildContent(nameEn: string, nameZh: string, analysis: Analysis) {
  const useCase = getUseCaseText(analysis);

  if (analysis.category === "plush") {
    return {
      subtitleEn: `${nameEn} for ${useCase.en}.`,
      subtitleZh: `${nameZh}，适合${useCase.zh}。`,
      descriptionEn: `${nameEn} is rewritten for storefront use with cleaner naming, simpler options and a softer gifting presentation. It works well as a playful accent item for bags, desktops, seasonal bundles or comfort-focused gift boxes.`,
      descriptionZh: `${nameZh}已按前台零售上架逻辑重新整理，命名更清晰，规格更直观，也更适合礼物型商品展示。适合作为包挂、桌面陪伴摆件、节日组合或轻量送礼商品使用。`,
      storyEn: `This plush listing focuses on approachable styling, easy gifting and a cleaner option structure without supplier-facing noise. The result is better suited for boutique merchandising, landing pages and bilingual storefront presentation.`,
      storyZh: `这条毛绒商品数据重点强化了亲和力、送礼属性与前台可读性，去除了供应端噪音信息，并将规格整理为更适合双语店铺展示的结构。`,
      leadTimeEn: "Ships in 3-5 business days",
      leadTimeZh: "3-5 个工作日内发货",
      shippingNoteEn: "Packed with protective wrapping to help preserve shape during transit. Minor batch differences in fabric tone or stuffing firmness may occur.",
      shippingNoteZh: "发货时采用防护包装以减少运输挤压，不同批次在面料色泽或填充软硬度上可能存在轻微差异。",
    };
  }

  return {
    subtitleEn: `${nameEn} for ${useCase.en}.`,
    subtitleZh: `${nameZh}，适合${useCase.zh}。`,
    descriptionEn: `${nameEn} is presented as a retail-ready gift and decor item with simplified naming, cleaner bilingual copy and more usable variant labels. It fits desk setups, shelf styling, seasonal gifting and compact home-display edits.`,
    descriptionZh: `${nameZh}已按零售上架标准整理为更适合礼物与装饰场景的商品数据，命名更清晰，中英文文案更完整，规格标签也更适合前台展示。可用于桌面布置、家居陈列、节日礼赠与轻装饰搭配。`,
    storyEn: `This listing was cleaned for storefront merchandising with emphasis on display value, giftability and readable product options. Supplier-side sourcing traces were removed so the item can function as a polished catalog entry.`,
    storyZh: `这条商品数据围绕展示价值、礼赠属性和前台可读性进行了重整，移除了供应端采集痕迹，使其更适合作为正式商品目录中的礼物与摆件条目。`,
    leadTimeEn: "Ships in 3-5 business days",
    leadTimeZh: "3-5 个工作日内发货",
    shippingNoteEn: "Packed with protective wrap to reduce scratches and transit movement. Slight batch differences in finish, paint tone or surface texture may appear.",
    shippingNoteZh: "采用防护包装发货，以减少运输过程中的磨损和晃动；不同批次在漆面、色泽或表面纹理上可能存在轻微差异。",
  };
}

function buildSpecs(analysis: Analysis) {
  const useCase = getUseCaseText(analysis);

  if (analysis.category === "plush") {
    const themeEn = analysis.animals[0]?.en ?? analysis.themes[0]?.en ?? "Character plush";
    const themeZh = analysis.animals[0]?.zh ?? analysis.themes[0]?.zh ?? "角色毛绒";
    return [
      {
        labelEn: "Material",
        labelZh: "材质",
        valueEn: "Soft plush exterior / PP cotton filling",
        valueZh: "柔软毛绒面料 / PP棉填充",
      },
      {
        labelEn: "Theme",
        labelZh: "主题",
        valueEn: themeEn,
        valueZh: themeZh,
      },
      ...(analysis.sizeHint
        ? [
            {
              labelEn: "Size",
              labelZh: "尺寸",
              valueEn: analysis.sizeHint.replace("厘米", "cm"),
              valueZh: analysis.sizeHint,
            },
          ]
        : []),
      {
        labelEn: "Best for",
        labelZh: "适用场景",
        valueEn: useCase.en,
        valueZh: useCase.zh,
      },
      {
        labelEn: "Packaging",
        labelZh: "包装",
        valueEn: "Protective polybag or gift-ready wrap",
        valueZh: "防护袋或礼赠包装",
      },
    ];
  }

  const materialEn = analysis.materials[0]?.en ?? "Mixed decorative material";
  const materialZh = analysis.materials[0]?.zh ?? "综合装饰材质";
  const styleEn = uniqueBy([...analysis.styles, ...analysis.themes], (item) => item.slug)
    .map((item) => item.en)
    .slice(0, 2)
    .join(" / ") || "Desk-ready decorative style";
  const styleZh = uniqueBy([...analysis.styles, ...analysis.themes], (item) => item.slug)
    .map((item) => item.zh)
    .slice(0, 2)
    .join(" / ") || "桌面装饰风格";

  return [
    {
      labelEn: "Material",
      labelZh: "材质",
      valueEn: materialEn,
      valueZh: materialZh,
    },
    {
      labelEn: "Style",
      labelZh: "风格",
      valueEn: styleEn,
      valueZh: styleZh,
    },
    ...(analysis.sizeHint
      ? [
          {
            labelEn: "Size",
            labelZh: "尺寸",
            valueEn: analysis.sizeHint.replace("厘米", "cm"),
            valueZh: analysis.sizeHint,
          },
        ]
      : []),
    {
      labelEn: "Placement",
      labelZh: "摆放场景",
      valueEn: "Desk / shelf / console display",
      valueZh: "桌面 / 层架 / 台面陈列",
    },
    {
      labelEn: "Best for",
      labelZh: "适用场景",
      valueEn: useCase.en,
      valueZh: useCase.zh,
    },
    {
      labelEn: "Packaging",
      labelZh: "包装",
      valueEn: "Protective wrap or gift-ready packing",
      valueZh: "防护包装或礼赠包装",
    },
  ].slice(0, 5);
}

function humanizeOptionIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function isVariantLabelNoisy(value: string) {
  const openParenCount = (value.match(/\(/g) ?? []).length;
  const closeParenCount = (value.match(/\)/g) ?? []).length;
  return value.includes(">") || value.includes("【") || value.includes("】") || openParenCount !== closeParenCount || value.length > 32;
}

function cleanVariantZh(raw: string, index: number) {
  let value = decodeSupplierText(raw);
  for (const [pattern, replacement] of zhVariantReplacements) {
    value = value.replace(pattern, replacement);
  }
  value = value.replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ").replace(/^\W+|\W+$/g, "").trim();

  if (!value) return `款式 ${humanizeOptionIndex(index)}`;
  if (/^款式\s+[A-Za-z0-9_-]+$/i.test(value)) return value;
  if (isVariantLabelNoisy(value)) return `款式 ${humanizeOptionIndex(index)}`;
  if (/^[A-Za-z0-9_-]+$/.test(value)) return `款式 ${value}`;
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
  value = value.replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ").replace(/^\W+|\W+$/g, "").trim();

  if (!value) return `Style ${humanizeOptionIndex(index)}`;
  if (/^[A-Za-z0-9 _()./-]+$/.test(value) && !hasChinese(value)) {
    return titleCase(value);
  }
  if (isVariantLabelNoisy(value)) return `Style ${humanizeOptionIndex(index)}`;
  if (hasChinese(value)) return `Style ${humanizeOptionIndex(index)}`;
  return titleCase(value);
}

function normalizeInventory(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return 48;
  }
  return Math.min(Math.max(Math.round(value), 8), 240);
}

function prefixForCategory(category: CategorySlug) {
  return category === "plush" ? "PL" : "GF";
}

function buildCleanVariants(product: ProductRecord, analysis: Analysis) {
  const prefix = prefixForCategory(analysis.category);
  const suffix = product.id.slice(-8).toUpperCase();

  return product.variants.map((variant, index) => {
    const rawLabel = decodeSupplierText(variant.labelZh || variant.labelEn || "");
    const labelZh = cleanVariantZh(rawLabel, index);
    const labelEn = cleanVariantEn(rawLabel, labelZh, index);
    return {
      labelEn,
      labelZh,
      sku: `${prefix}-${suffix}-${String(index + 1).padStart(2, "0")}`,
      price: variant.price ?? null,
      inventory: normalizeInventory(variant.inventory ?? null),
    } satisfies CleanVariant;
  });
}

function buildTags(analysis: Analysis) {
  if (analysis.category === "plush") {
    return [...new Set([
      "plush",
      slugify(typeLabels(analysis.category, analysis.productType).en),
      analysis.animals[0]?.slug,
      analysis.themes[0]?.slug,
      analysis.productType === "plush-keychain" ? "bag-charm" : "gift-ready",
      "gift-ready",
    ].filter(Boolean))].slice(0, 6) as string[];
  }

  return [...new Set([
    "gifts",
    slugify(typeLabels(analysis.category, analysis.productType).en),
    analysis.materials[0]?.slug,
    analysis.themes[0]?.slug,
    analysis.styles[0]?.slug,
    "desk-decor",
    "gift-ready",
  ].filter(Boolean))].slice(0, 7) as string[];
}

function buildSourcePayload(product: ProductRecord, analysis: Analysis) {
  const prefix = prefixForCategory(analysis.category);
  const availability = analysis.currentAvailability?.toLowerCase().includes("out") ? "Out of stock" : "In stock";
  return {
    sku: `${prefix}-${product.id.slice(-8).toUpperCase()}`,
    availabilityStatus: availability,
  } satisfies Prisma.InputJsonValue;
}

function buildSlug(nameEn: string, product: ProductRecord, analysis: Analysis) {
  const base = slugify(nameEn) || (analysis.category === "plush" ? "plush-item" : "gift-item");
  return `${base}-${product.id.slice(-8).toLowerCase()}`;
}

function buildImageAlts(nameEn: string, nameZh: string, index: number) {
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

function parseRequestedCategories() {
  const explicit = process.argv.filter((arg): arg is CategorySlug => arg === "plush" || arg === "gifts");
  return explicit.length > 0 ? explicit : (["plush", "gifts"] as CategorySlug[]);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const categories = parseRequestedCategories();
  const records = await prisma.product.findMany({
    where: {
      category: {
        slug: {
          in: categories,
        },
      },
    },
    ...productQuery,
  });

  const preview: Array<Record<string, unknown>> = [];

  for (const product of records) {
    const analysis = analyzeProduct(product);
    const nameEn = buildNameEn(analysis);
    const nameZh = buildNameZh(analysis);
    const slug = buildSlug(nameEn, product, analysis);
    const content = buildContent(nameEn, nameZh, analysis);
    const specs = buildSpecs(analysis);
    const variants = buildCleanVariants(product, analysis);
    const tags = buildTags(analysis);
    const sourcePayload = buildSourcePayload(product, analysis);

    if (dryRun) {
      preview.push({
        category: analysis.category,
        beforeSlug: product.slug,
        afterSlug: slug,
        beforeNameEn: product.nameEn,
        afterNameEn: nameEn,
        beforeNameZh: product.nameZh,
        afterNameZh: nameZh,
        type: analysis.productType,
        afterTags: tags,
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
          leadTimeEn: content.leadTimeEn,
          leadTimeZh: content.leadTimeZh,
          shippingNoteEn: content.shippingNoteEn,
          shippingNoteZh: content.shippingNoteZh,
          attributes: {
            specs,
          } as Prisma.InputJsonValue,
          sourcePayload: sourcePayload as Prisma.InputJsonValue,
        },
      });

      for (let index = 0; index < product.images.length; index += 1) {
        const image = product.images[index];
        const alt = buildImageAlts(nameEn, nameZh, index);
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

      const prefix = prefixForCategory(analysis.category);
      for (let index = 0; index < product.variants.length; index += 1) {
        const variant = product.variants[index];
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: `TMP-${prefix}-${product.id.slice(-8).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
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
          categories,
          preview: preview.slice(0, 20),
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
        categories,
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
