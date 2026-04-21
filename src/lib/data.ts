import type { Category, Product, ProductImage } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-plush",
    slug: "plush",
    name: { en: "Plush & Dolls", zh: "玩偶 / 毛绒" },
    description: {
      en: "Soft, display-friendly plush and charming collectible dolls.",
      zh: "柔软、适合陈列拍摄的毛绒与收藏感玩偶。",
    },
  },
  {
    id: "cat-jewelry",
    slug: "jewelry",
    name: { en: "Jewelry & Accessories", zh: "首饰 / 配饰" },
    description: {
      en: "Small premium-looking pieces for gift-ready styling.",
      zh: "适合礼品站呈现的小而精配饰商品。",
    },
  },
  {
    id: "cat-gifts",
    slug: "gifts",
    name: { en: "Desk Gifts", zh: "桌面礼品" },
    description: {
      en: "Compact lifestyle items for impulse gifting moments.",
      zh: "适合冲动消费和节日送礼的轻小件。",
    },
  },
];

const galleryPresets: Record<"plush" | "jewelry" | "gifts", Array<{ url: string; altEn: string; altZh: string }>> = {
  plush: [
    { url: "/products/plush-closeup.svg", altEn: "Material close-up", altZh: "材质细节图" },
    { url: "/products/plush-lifestyle.svg", altEn: "Lifestyle scene", altZh: "场景展示图" },
    { url: "/products/plush-packaging.svg", altEn: "Packaging preview", altZh: "包装展示图" },
  ],
  jewelry: [
    { url: "/products/jewelry-closeup.svg", altEn: "Craft detail", altZh: "工艺细节图" },
    { url: "/products/jewelry-lifestyle.svg", altEn: "Wearing reference", altZh: "佩戴展示图" },
    { url: "/products/jewelry-packaging.svg", altEn: "Gift packaging", altZh: "礼盒包装图" },
  ],
  gifts: [
    { url: "/products/gifts-closeup.svg", altEn: "Detail view", altZh: "细节展示图" },
    { url: "/products/gifts-lifestyle.svg", altEn: "Desk styling", altZh: "桌面场景图" },
    { url: "/products/gifts-packaging.svg", altEn: "Gift-ready packaging", altZh: "礼品包装图" },
  ],
};

function buildGallery(
  coverUrl: string,
  name: { en: string; zh: string },
  category: "plush" | "jewelry" | "gifts",
): ProductImage[] {
  return [
    {
      url: coverUrl,
      alt: { en: `${name.en} cover`, zh: `${name.zh} 主图` },
      isCover: true,
      sortOrder: 0,
    },
    ...galleryPresets[category].map((item, index) => ({
      url: item.url,
      alt: { en: `${name.en} · ${item.altEn}`, zh: `${name.zh} · ${item.altZh}` },
      isCover: false,
      sortOrder: index + 1,
    })),
  ];
}

const auroraName = { en: "Aurora Bunny Plush", zh: "极光兔毛绒玩偶" };
const lunaName = { en: "Luna Cat Pocket Doll", zh: "露娜猫口袋玩偶" };
const starlightName = { en: "Starlight Pearl Earrings", zh: "星辉珍珠耳饰" };
const moonName = { en: "Moon Ribbon Bracelet", zh: "月影丝带手链" };
const cloudName = { en: "Cloud Ceramic Tray", zh: "云朵陶瓷托盘" };
const starName = { en: "Star Note Gift Set", zh: "星语便签礼盒" };

export const products: Product[] = [
  {
    id: "prd-aurora-bunny",
    slug: "aurora-bunny-plush",
    categorySlug: "plush",
    name: auroraName,
    subtitle: {
      en: "A pastel plush made for cozy desk styling and gifting.",
      zh: "适合桌面陈列与送礼的奶油系兔兔毛绒。",
    },
    description: {
      en: "This signature plush combines soft-touch fabric, polished embroidery and an editorial color palette that feels premium in a boutique storefront.",
      zh: "这款主打毛绒结合了柔软面料、精致刺绣和高级低饱和配色，很适合精品外贸站作为形象商品。",
    },
    story: {
      en: "Designed for boutique-style product pages, the Aurora Bunny is the type of item that benefits from fewer SKUs and stronger visual storytelling.",
      zh: "它适合少 SKU、重视觉表达和强调礼品感的站点，非常适合作为首页或分类页主推商品。",
    },
    tags: ["plush", "gift", "soft pastel"],
    price: 29,
    compareAtPrice: 36,
    featured: true,
    isNew: true,
    leadTime: { en: "5-7 business days", zh: "5-7 个工作日" },
    shippingNote: {
      en: "Ships from supplier warehouse after manual QC confirmation.",
      zh: "经人工质检确认后由供应商仓库发出。",
    },
    image: "/products/aurora-bunny.svg",
    images: buildGallery("/products/aurora-bunny.svg", auroraName, "plush"),
    variants: [
      { id: "cream", label: { en: "Cream", zh: "奶油白" } },
      { id: "blush", label: { en: "Blush Pink", zh: "浅粉" } },
    ],
    specs: [
      { label: { en: "Material", zh: "材质" }, value: { en: "Polyester plush", zh: "聚酯纤维毛绒" } },
      { label: { en: "Height", zh: "高度" }, value: { en: "28 cm", zh: "28 厘米" } },
      { label: { en: "Packaging", zh: "包装" }, value: { en: "Gift-ready polybag", zh: "礼品袋装" } },
    ],
  },
  {
    id: "prd-luna-cat",
    slug: "luna-cat-pocket-doll",
    categorySlug: "plush",
    name: lunaName,
    subtitle: {
      en: "Small scale collectible plush with a storybook silhouette.",
      zh: "小尺寸收藏系玩偶，带有故事书气质。",
    },
    description: {
      en: "Ideal for curated product grids, gift sets and seasonal merchandising edits.",
      zh: "适合做集合页重点陈列，也适合作为节日礼物组合中的轻小件商品。",
    },
    story: {
      en: "A low-footprint item that fits your supplier dropshipping model and keeps freight cost easy to control.",
      zh: "它体积小、运费友好，很适合工厂代发模式下的轻量商品结构。",
    },
    tags: ["doll", "collectible", "small gift"],
    price: 18,
    compareAtPrice: 24,
    featured: true,
    leadTime: { en: "4-6 business days", zh: "4-6 个工作日" },
    shippingNote: {
      en: "Compact parcel friendly item for standard cross-border shipping.",
      zh: "适合标准跨境小包发货。",
    },
    image: "/products/luna-cat.svg",
    images: buildGallery("/products/luna-cat.svg", lunaName, "plush"),
    variants: [
      { id: "navy", label: { en: "Midnight Navy", zh: "午夜蓝" } },
      { id: "grey", label: { en: "Soft Grey", zh: "雾灰" } },
    ],
    specs: [
      { label: { en: "Material", zh: "材质" }, value: { en: "Short plush + cotton fill", zh: "短毛绒 + 棉填充" } },
      { label: { en: "Height", zh: "高度" }, value: { en: "18 cm", zh: "18 厘米" } },
      { label: { en: "Recommended use", zh: "适用场景" }, value: { en: "Shelf decor / gifting", zh: "桌面摆件 / 送礼" } },
    ],
  },
  {
    id: "prd-starlight-earrings",
    slug: "starlight-pearl-earrings",
    categorySlug: "jewelry",
    name: starlightName,
    subtitle: {
      en: "Minimal jewelry with boutique gift-box appeal.",
      zh: "适合礼盒陈列的极简珍珠耳饰。",
    },
    description: {
      en: "A lightweight accessory designed for premium-looking PDP layouts and gifting campaigns.",
      zh: "一款轻小、页面表现高级、适合礼物营销场景的耳饰商品。",
    },
    story: {
      en: "Jewelry lifts the visual sophistication of a curated storefront without adding heavy logistics overhead.",
      zh: "首饰类商品有助于拉升站点质感，同时不会明显增加物流复杂度。",
    },
    tags: ["jewelry", "pearl", "gift-ready"],
    price: 22,
    compareAtPrice: 28,
    isNew: true,
    leadTime: { en: "3-5 business days", zh: "3-5 个工作日" },
    shippingNote: {
      en: "Shipped in padded mailer with boutique card insert.",
      zh: "采用防震信封袋与卡片插页发货。",
    },
    image: "/products/starlight-earrings.svg",
    images: buildGallery("/products/starlight-earrings.svg", starlightName, "jewelry"),
    variants: [
      { id: "gold", label: { en: "Gold tone", zh: "金色" } },
      { id: "silver", label: { en: "Silver tone", zh: "银色" } },
    ],
    specs: [
      { label: { en: "Material", zh: "材质" }, value: { en: "Alloy + faux pearl", zh: "合金 + 仿珍珠" } },
      { label: { en: "Length", zh: "长度" }, value: { en: "3.2 cm", zh: "3.2 厘米" } },
      { label: { en: "Weight", zh: "重量" }, value: { en: "8 g / pair", zh: "8 克 / 对" } },
    ],
  },
  {
    id: "prd-moon-ribbon",
    slug: "moon-ribbon-bracelet",
    categorySlug: "jewelry",
    name: moonName,
    subtitle: {
      en: "Soft metallic detail with feminine gift-store polish.",
      zh: "带有女性化礼品感的轻奢丝带手链。",
    },
    description: {
      en: "A strong accessory choice for seasonal edits, lifestyle shoots and gift bundling.",
      zh: "适合做季节性专题、生活方式图和礼品组合销售。",
    },
    story: {
      en: "This type of SKU works well when your store strategy values aesthetics over aggressive volume expansion.",
      zh: "如果你的站点强调精品感而不是铺货量，这类 SKU 很合适。",
    },
    tags: ["bracelet", "gift", "boutique"],
    price: 19,
    featured: true,
    leadTime: { en: "3-5 business days", zh: "3-5 个工作日" },
    shippingNote: {
      en: "Packed flat for efficient fulfillment and low breakage risk.",
      zh: "平放包装，利于代发与降低破损风险。",
    },
    image: "/products/moon-ribbon.svg",
    images: buildGallery("/products/moon-ribbon.svg", moonName, "jewelry"),
    variants: [
      { id: "rose-gold", label: { en: "Rose gold", zh: "玫瑰金" } },
      { id: "silver", label: { en: "Silver", zh: "银色" } },
    ],
    specs: [
      { label: { en: "Material", zh: "材质" }, value: { en: "Copper alloy", zh: "铜合金" } },
      { label: { en: "Length", zh: "长度" }, value: { en: "Adjustable 16-22 cm", zh: "可调节 16-22 厘米" } },
      { label: { en: "Packaging", zh: "包装" }, value: { en: "Card + pouch", zh: "卡片 + 小袋" } },
    ],
  },
  {
    id: "prd-cloud-tray",
    slug: "cloud-ceramic-tray",
    categorySlug: "gifts",
    name: cloudName,
    subtitle: {
      en: "Lifestyle prop for jewelry styling and desktop gift curation.",
      zh: "适合首饰摆拍和桌面礼品陈列的生活方式小物。",
    },
    description: {
      en: "A content-friendly decor SKU that improves the overall visual identity of your storefront.",
      zh: "这类桌面道具能提升整个站点视觉调性，也适合和首饰类商品搭配。",
    },
    story: {
      en: "Useful for cross-selling: the tray makes accessory pages feel more complete and editorial.",
      zh: "它适合做配件类商品的联带销售，让详情页更像编辑式内容。",
    },
    tags: ["tray", "desktop", "gift"],
    price: 26,
    leadTime: { en: "6-8 business days", zh: "6-8 个工作日" },
    shippingNote: {
      en: "Packed with foam protection for safer international delivery.",
      zh: "采用泡棉防护包装，适合跨境运输。",
    },
    image: "/products/cloud-tray.svg",
    images: buildGallery("/products/cloud-tray.svg", cloudName, "gifts"),
    variants: [
      { id: "ivory", label: { en: "Ivory", zh: "象牙白" } },
      { id: "blush", label: { en: "Blush", zh: "浅粉" } },
    ],
    specs: [
      { label: { en: "Material", zh: "材质" }, value: { en: "Ceramic", zh: "陶瓷" } },
      { label: { en: "Size", zh: "尺寸" }, value: { en: "15 x 11 cm", zh: "15 x 11 厘米" } },
      { label: { en: "Usage", zh: "用途" }, value: { en: "Desktop / jewelry / decor", zh: "桌面 / 首饰 / 摆设" } },
    ],
  },
  {
    id: "prd-star-note",
    slug: "star-note-gift-set",
    categorySlug: "gifts",
    name: starName,
    subtitle: {
      en: "Small stationery gift set built for checkout add-ons.",
      zh: "非常适合结算页加购的小型文具礼盒。",
    },
    description: {
      en: "This entry-price item works well for bundles, checkout add-ons and seasonal campaigns.",
      zh: "低客单价的礼盒很适合组合销售、加购推荐和节日专题页。",
    },
    story: {
      en: "Keep a few SKUs like this to balance your store between aesthetic flagships and fast-moving gift add-ons.",
      zh: "建议站内保留一些这种加购型商品，用来平衡视觉主推款和快销小件。",
    },
    tags: ["stationery", "gift set", "add-on"],
    price: 14,
    isNew: true,
    leadTime: { en: "3-4 business days", zh: "3-4 个工作日" },
    shippingNote: {
      en: "Ships flat and combines well with accessory orders.",
      zh: "平装发货，适合和其他轻小件合单。",
    },
    image: "/products/star-note.svg",
    images: buildGallery("/products/star-note.svg", starName, "gifts"),
    variants: [
      { id: "night-sky", label: { en: "Night Sky", zh: "夜空蓝" } },
      { id: "rose-dawn", label: { en: "Rose Dawn", zh: "晨曦粉" } },
    ],
    specs: [
      { label: { en: "Set includes", zh: "套装内容" }, value: { en: "Memo pad, stickers, mini card", zh: "便签本、贴纸、迷你卡片" } },
      { label: { en: "Package size", zh: "包装尺寸" }, value: { en: "13 x 9 cm", zh: "13 x 9 厘米" } },
      { label: { en: "Use case", zh: "适用场景" }, value: { en: "Gift add-on / seasonal campaign", zh: "礼品加购 / 节日活动" } },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
