import type { Locale } from "@/lib/types";

type CategorySlug = "plush" | "jewelry" | "gifts";

export const categoryContent: Record<
  CategorySlug,
  Record<
    Locale,
    {
      eyebrow: string;
      title: string;
      description: string;
      intro: string;
      buyingTitle: string;
      buyingPoints: string[];
      useCasesTitle: string;
      useCases: string[];
      faqTitle: string;
      faqAnswer: string;
    }
  >
> = {
  plush: {
    en: {
      eyebrow: "Plush collection",
      title: "Plush toys and collectible dolls for gifting and display",
      description:
        "Browse soft plush toys and collectible dolls that work well for gift bundles, cozy desk styling and curated boutique assortments.",
      intro:
        "This collection focuses on plush toys and dolls that are easy to photograph, easy to gift and lightweight enough for cross-border fulfillment.",
      buyingTitle: "What shoppers usually care about",
      buyingPoints: [
        "Soft-touch fabric, stitched details and a clean color palette",
        "Gift-friendly sizing for desks, shelves and seasonal bundles",
        "Low-friction shipping thanks to lightweight parcel dimensions",
      ],
      useCasesTitle: "Best use cases",
      useCases: ["Birthday gifts", "Collector-style plush picks", "Desk decor and cozy room accessories"],
      faqTitle: "Why this category converts well",
      faqAnswer:
        "Plush products combine strong visual appeal with clear gifting intent, which makes them suitable for homepage campaigns, seasonal edits and first-order purchases.",
    },
    zh: {
      eyebrow: "毛绒系列",
      title: "适合送礼与陈列的毛绒玩偶和收藏系玩偶",
      description:
        "浏览适合送礼、桌面陈列和轻礼品组合的毛绒玩偶与收藏感玩偶，兼顾颜值、轻体积和跨境发货友好度。",
      intro:
        "这个分类聚焦柔软、好拍、好送礼的毛绒类商品，既适合首页主推，也适合节日礼盒和轻收藏场景。",
      buyingTitle: "用户最关注什么",
      buyingPoints: [
        "面料手感、刺绣细节和整体配色是否足够温柔耐看",
        "尺寸是否适合桌面、床头或礼盒搭配",
        "体积和包装是否便于跨境小包发货",
      ],
      useCasesTitle: "常见购买场景",
      useCases: ["生日礼物", "收藏型毛绒选择", "桌面摆件与居家陪伴小物"],
      faqTitle: "为什么这个分类更容易转化",
      faqAnswer:
        "毛绒商品本身具备强视觉吸引力和明确送礼场景，既适合做首页活动，也适合首单用户快速决策。",
    },
  },
  jewelry: {
    en: {
      eyebrow: "Jewelry collection",
      title: "Gift-ready jewelry and boutique accessories",
      description:
        "Explore earrings, bracelets and small jewelry accessories designed for gifting, seasonal campaigns and premium-looking product presentation.",
      intro:
        "Jewelry and accessories help a boutique storefront look more polished while remaining compact, affordable to ship and easy to pair into curated edits.",
      buyingTitle: "What shoppers usually care about",
      buyingPoints: [
        "Material notes, finish quality and how the piece looks in close-up photos",
        "Whether the item feels gift-ready for birthdays, holidays or add-on orders",
        "Compact packaging and low breakage risk during delivery",
      ],
      useCasesTitle: "Best use cases",
      useCases: ["Gift box add-ons", "Holiday launches", "Low-weight accessories with higher perceived value"],
      faqTitle: "Why this category matters",
      faqAnswer:
        "Small jewelry SKUs often improve both average order mix and visual sophistication, especially when the store focuses on curated gifting instead of bulk catalog volume.",
    },
    zh: {
      eyebrow: "饰品系列",
      title: "适合送礼的首饰与精品配饰",
      description:
        "浏览耳饰、手链和轻珠宝配饰，适合做礼盒加购、节日专题和更高质感的精品陈列。",
      intro:
        "首饰和配饰能快速拉高页面精致度，同时保持轻体积、好包装、跨境发货压力较低的优势。",
      buyingTitle: "用户最关注什么",
      buyingPoints: [
        "材质说明、做工细节和近景展示是否足够清楚",
        "是否适合作为生日、节日或加购礼物",
        "包装是否紧凑、防护是否到位、运输破损风险是否低",
      ],
      useCasesTitle: "常见购买场景",
      useCases: ["礼盒组合加购", "节日活动上新", "轻体积高质感配饰商品"],
      faqTitle: "为什么这个分类重要",
      faqAnswer:
        "对于强调精选和礼品感的商城来说，饰品类 SKU 往往能提升整体客单结构和页面质感，而不会明显增加履约复杂度。",
    },
  },
  gifts: {
    en: {
      eyebrow: "Desk gifts",
      title: "Desk gifts and boutique lifestyle add-ons",
      description:
        "Shop compact gift ideas, desk accessories and boutique add-ons suitable for impulse gifting, seasonal edits and lifestyle bundles.",
      intro:
        "This category is built around small lifestyle goods that feel easy to gift, easy to bundle and easy to place into boutique product stories.",
      buyingTitle: "What shoppers usually care about",
      buyingPoints: [
        "Whether the item feels useful, decorative and instantly giftable",
        "How well it fits desks, shelves, workspaces or small-room styling",
        "If it can be bundled with plush, jewelry or stationery purchases",
      ],
      useCasesTitle: "Best use cases",
      useCases: ["Desk styling gifts", "Seasonal bundle fillers", "Small add-on items for higher basket value"],
      faqTitle: "Why this category helps",
      faqAnswer:
        "Desk gifts and compact lifestyle items are effective for cross-sell moments because they feel low-risk, practical and easy to add before checkout.",
    },
    zh: {
      eyebrow: "桌面礼品",
      title: "适合加购和送礼的桌面礼品与生活方式小物",
      description:
        "选购适合冲动消费、节日送礼和组合销售的桌面礼品、生活小物与精品加购商品。",
      intro:
        "这个分类围绕轻体积、好搭配、好送礼的生活方式商品展开，适合放进精品商城的节日专题和加购逻辑里。",
      buyingTitle: "用户最关注什么",
      buyingPoints: [
        "商品是否兼具实用性、装饰性和送礼属性",
        "是否适合桌面、工作区、书架或小空间布置",
        "能否与毛绒、饰品、文具等商品做组合销售",
      ],
      useCasesTitle: "常见购买场景",
      useCases: ["桌面送礼", "节日礼盒补充商品", "提升客单价的轻加购小物"],
      faqTitle: "为什么这个分类有价值",
      faqAnswer:
        "桌面礼品和轻生活方式商品适合做交叉销售，因为它们下单门槛低、用途明确，也更容易在结账前被追加进购物车。",
    },
  },
};

export function isSeoCategorySlug(value: string): value is CategorySlug {
  return value === "plush" || value === "jewelry" || value === "gifts";
}

