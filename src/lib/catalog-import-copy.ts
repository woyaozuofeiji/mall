type SourceCategory = "womens-jewellery" | "home-decoration" | "womens-bags";
type LocalCategory = "jewelry" | "gifts";

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

const subtitleZhMap: Record<string, string> = {
  "Green Crystal Earring": "适合礼盒陈列与轻礼物场景的彩色耳饰款。",
  "Green Oval Earring": "线条简洁，适合日常搭配和精品站详情页展示。",
  "Tropical Earring": "适合活动页与度假风礼盒组合陈列的耳饰款。",
  "Decoration Swing": "适合桌面礼品与家居装饰专题陈列的小型摆件。",
  "Family Tree Photo Frame": "适合礼物专题和家居频道陈列的纪念相框。",
  "House Showpiece Plant": "适合桌面装饰和礼品组合陈列的小型摆件。",
  "Plant Pot": "适合桌面生活方式栏目陈列的小型花盆。",
  "Table Lamp": "适合桌面礼物和生活方式栏目的柔和台灯。",
  "Blue Women's Handbag": "适合通勤搭配和送礼场景的女士手提包。",
  "Heshe Women's Leather Bag": "适合精品配饰页面陈列的质感皮包。",
  "Prada Women Bag": "适合高客单配饰栏目陈列的品牌风格包款。",
  "White Faux Leather Backpack": "适合礼品与配件专题的轻便双肩包。",
  "Women Handbag Black": "适合日常通勤和送礼场景的黑色手提包。",
};

const categoryMapping: Record<SourceCategory, LocalCategory> = {
  "womens-jewellery": "jewelry",
  "home-decoration": "gifts",
  "womens-bags": "gifts",
};

const sourceCategoryCopy: Record<
  SourceCategory,
  {
    subtitleEn: string;
    subtitleZh: string;
    descriptionZh: string;
    storyEn: string;
    storyZh: string;
  }
> = {
  "womens-jewellery": {
    subtitleEn: "Gift-ready jewelry with a polished finish and lightweight everyday styling.",
    subtitleZh: "适合送礼与日常搭配的轻巧饰品。",
    descriptionZh: "这类饰品适合礼盒陈列、节日选品页和轻量加购场景，容易与店内其他礼物商品做组合推荐。",
    storyEn: "This jewelry piece was selected for boutique accessory edits, gifting campaigns and compact international fulfillment.",
    storyZh: "这类轻巧饰品适合做礼物组合、首页精选和日常搭配推荐，也便于跨境小包履约。",
  },
  "home-decoration": {
    subtitleEn: "Decor accent designed for desk styling, shelf display and easy gifting.",
    subtitleZh: "适合桌面布置、家居陈列和轻礼物场景的装饰小物。",
    descriptionZh: "这类家居摆件适合放在桌面、书架和礼物专题页里，既能补足氛围，也方便做组合销售。",
    storyEn: "This decor item works well in desk-gift edits, lifestyle photography and gift-oriented landing pages.",
    storyZh: "这类装饰单品很适合桌面礼物专题、生活方式拍摄和节日送礼落地页。",
  },
  "womens-bags": {
    subtitleEn: "An everyday carry piece selected for boutique accessory edits and giftable styling.",
    subtitleZh: "适合通勤搭配与送礼场景的精品包袋。",
    descriptionZh: "这类包袋更适合放在配饰专题、通勤礼物推荐和高客单组合场景中，便于拉升客单价。",
    storyEn: "This bag was normalized for accessory-led merchandising, premium gifting stories and higher-value bundle positioning.",
    storyZh: "这类包袋适合做配饰专题、通勤送礼推荐和较高客单价的组合陈列。",
  },
};

function isSourceCategory(value: string): value is SourceCategory {
  return value === "womens-jewellery" || value === "home-decoration" || value === "womens-bags";
}

function extractSourceCategoryFromTags(tags?: string[]) {
  return tags?.find((tag) => isSourceCategory(tag));
}

export function resolveCatalogImportSourceCategory(input: { category?: string; tags?: string[] }) {
  if (input.category && isSourceCategory(input.category)) {
    return input.category;
  }

  const fromTags = extractSourceCategoryFromTags(input.tags);
  if (fromTags) {
    return fromTags;
  }

  return undefined;
}

export function resolveCatalogImportLocalCategory(input: { category?: string; tags?: string[] }): LocalCategory {
  const sourceCategory = resolveCatalogImportSourceCategory(input);
  if (sourceCategory) {
    return categoryMapping[sourceCategory];
  }

  return input.tags?.includes("jewelry") ? "jewelry" : "gifts";
}

function buildCustomerFacingDescriptionZh(sourceCategory: SourceCategory, description?: string) {
  const fallback = sourceCategoryCopy[sourceCategory].descriptionZh;
  const normalized = description?.trim();

  if (!normalized) {
    return fallback;
  }

  return `${fallback} ${normalized}`;
}

function buildShippingNoteEn(availabilityStatus?: string, returnPolicy?: string) {
  const availability = availabilityStatus?.trim() || "In stock";
  const afterSales = returnPolicy?.trim() || "Covered by the store return review process.";
  return `${availability}. ${afterSales}`;
}

function buildShippingNoteZh(availabilityStatus?: string, returnPolicy?: string) {
  const availability = availabilityStatus?.trim() || "当前可下单";
  const afterSales = returnPolicy?.trim() || "售后处理请以店铺退换政策页为准。";
  return `${availability}。${afterSales}`;
}

export function buildCatalogImportPresentation(input: {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  brand?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
}) {
  const sourceCategory = resolveCatalogImportSourceCategory(input) ?? "home-decoration";
  const copy = sourceCategoryCopy[sourceCategory];
  const localCategory = resolveCatalogImportLocalCategory(input);
  const cleanedTags = (input.tags ?? []).filter((tag) => tag !== "catalog-import" && !isSourceCategory(tag));

  return {
    localCategory,
    titleZh: titleZhMap[input.title] ?? input.title,
    subtitleEn: copy.subtitleEn,
    subtitleZh: subtitleZhMap[input.title] ?? copy.subtitleZh,
    descriptionEn: input.description?.trim() || undefined,
    descriptionZh: buildCustomerFacingDescriptionZh(sourceCategory, input.description),
    storyEn: copy.storyEn,
    storyZh: copy.storyZh,
    shippingNoteEn: buildShippingNoteEn(input.availabilityStatus, input.returnPolicy),
    shippingNoteZh: buildShippingNoteZh(input.availabilityStatus, input.returnPolicy),
    tags: [...new Set([...cleanedTags, localCategory, input.brand].filter((value): value is string => Boolean(value)))],
  };
}
