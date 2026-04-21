import type { Locale } from "@/lib/types";

type GuideCategory = "plush" | "jewelry" | "gifts" | "general";

export interface GuideRecord {
  slug: string;
  category: GuideCategory;
  relatedProductSlugs?: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  intro: Record<Locale, string>;
  sections: Array<{
    heading: Record<Locale, string>;
    body: Record<Locale, string>;
  }>;
}

export const guides: GuideRecord[] = [
  {
    slug: "gift-guide",
    category: "gifts",
    relatedProductSlugs: ["star-note-gift-set", "cloud-ceramic-tray"],
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "How to choose small gift items for cross-border orders",
      zh: "如何挑选适合跨境订单的小礼物商品",
    },
    description: {
      en: "A practical guide to choosing gift-ready products that look premium, ship easily and work well as add-on purchases.",
      zh: "从送礼属性、包装友好度和发货便利性出发，帮助你挑选更适合作为轻礼物和加购商品的小件商品。",
    },
    intro: {
      en: "Small gift products are often the easiest way to improve assortment quality and add-on conversion without increasing fulfillment complexity.",
      zh: "轻小件礼物商品通常是提升商城精选感和加购转化最直接的一类商品，同时不会明显增加履约复杂度。",
    },
    sections: [
      {
        heading: {
          en: "Start with gifting intent, not just price",
          zh: "先看送礼场景，不只看价格",
        },
        body: {
          en: "Customers buy gift items because they solve a moment: a birthday add-on, a desk surprise or a seasonal bundle. A product that clearly fits one of those moments usually performs better than a random low-priced item.",
          zh: "用户购买礼物类商品，通常是为了解决某个具体场景，例如生日加购、桌面小惊喜或节日礼盒补充。能明确对应这些场景的商品，往往比单纯便宜的商品更容易转化。",
        },
      },
      {
        heading: {
          en: "Prioritize packaging and parcel friendliness",
          zh: "优先考虑包装友好和小包发货友好",
        },
        body: {
          en: "For cross-border orders, compact packaging, low breakage risk and lightweight dimensions matter. A gift item should still feel presentable after a long shipping route.",
          zh: "对于跨境订单来说，包装体积、抗破损能力和重量都很重要。真正适合作为礼物的小件商品，需要在跨境运输之后仍然保持完整和体面。",
        },
      },
      {
        heading: {
          en: "Build add-on value into the assortment",
          zh: "让商品天然适合加购",
        },
        body: {
          en: "The best small gift items are easy to pair with plush toys, jewelry or stationery. When a product can be added without forcing a big budget decision, it becomes more valuable for the storefront.",
          zh: "优秀的小礼物商品通常能和毛绒、饰品或文具类商品自然组合。当用户不需要做很重的预算决策就能顺手加入购物车，这类商品的商业价值就会更高。",
        },
      },
    ],
  },
  {
    slug: "plush-buying-guide",
    category: "plush",
    relatedProductSlugs: ["aurora-bunny-plush", "luna-cat-pocket-doll"],
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 6,
    title: {
      en: "Plush buying guide: what shoppers check before ordering",
      zh: "毛绒玩偶选购指南：用户下单前最在意什么",
    },
    description: {
      en: "Learn what customers usually look for in plush toys, from size and softness to gifting suitability and shipping expectations.",
      zh: "从尺寸、手感、送礼适配度到发货预期，整理用户购买毛绒玩偶前最常关注的关键点。",
    },
    intro: {
      en: "Plush products are highly visual, but strong photos alone are not enough. Customers also want to know whether the item feels soft, giftable and proportionate to the price.",
      zh: "毛绒商品非常依赖视觉表现，但只有图片还不够。用户同样会关心手感、送礼属性，以及尺寸和价格是否匹配。",
    },
    sections: [
      {
        heading: {
          en: "Show scale clearly",
          zh: "把尺寸说清楚",
        },
        body: {
          en: "One of the most common reasons plush shoppers hesitate is uncertainty about size. Include exact height or width and describe where the item fits best, such as a desk, shelf or bedside table.",
          zh: "毛绒商品最常见的犹豫点之一就是尺寸不明确。页面里最好给出准确高度或宽度，并说明更适合摆在桌面、书架还是床头等场景。",
        },
      },
      {
        heading: {
          en: "Describe texture and finish in plain language",
          zh: "用清楚的话描述手感和做工",
        },
        body: {
          en: "Customers cannot touch the item before ordering, so fabric type, softness, embroidery detail and filling feel should be described simply and directly.",
          zh: "用户在下单前无法触摸实物，因此面料类型、柔软程度、刺绣细节和填充感受，都需要用简单直接的语言说明清楚。",
        },
      },
      {
        heading: {
          en: "Tie the product to gifting use cases",
          zh: "把商品和送礼场景关联起来",
        },
        body: {
          en: "Plush toys convert better when the shopper can imagine the moment they will be used in: birthday gifting, room decor, desk styling or collector display.",
          zh: "当用户能想象这件商品会在什么场景里被使用时，毛绒商品更容易转化，比如生日送礼、房间布置、桌面陈列或收藏展示。",
        },
      },
    ],
  },
  {
    slug: "jewelry-gift-guide",
    category: "jewelry",
    relatedProductSlugs: ["starlight-pearl-earrings", "moon-ribbon-bracelet"],
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Jewelry gift guide for small boutique stores",
      zh: "小型精品商城的饰品送礼指南",
    },
    description: {
      en: "See how boutique stores can position jewelry and accessories for gifting, add-on purchases and premium-looking presentation.",
      zh: "看看精品商城如何把饰品和轻珠宝做成更适合送礼、加购和高质感展示的商品类型。",
    },
    intro: {
      en: "Jewelry works especially well in a curated store because it adds perceived value without adding much shipping weight or storage pressure.",
      zh: "饰品类商品特别适合精选型商城，因为它能提高页面精致度和感知价值，同时不会明显增加仓储和发货负担。",
    },
    sections: [
      {
        heading: {
          en: "Close-up photography matters more than quantity",
          zh: "近景细节比铺货数量更重要",
        },
        body: {
          en: "A smaller jewelry assortment can still feel premium if the product pages clearly show plating, texture, stone color and packaging. Shoppers need confidence in finish quality before they buy.",
          zh: "哪怕 SKU 不多，只要商品页能清晰展示镀层、纹理、颜色和包装，饰品类商品依然可以看起来很高级。用户下单前最需要的是对细节做工的信心。",
        },
      },
      {
        heading: {
          en: "Use jewelry as a gift and add-on category",
          zh: "把饰品当作礼物和加购型分类来运营",
        },
        body: {
          en: "Earrings, bracelets and similar accessories are easy to add to an existing cart because they feel lightweight in both budget and shipping cost. This makes them valuable for order mix optimization.",
          zh: "耳饰、手链这类商品很适合作为已有购物车里的顺手加购，因为它们在价格感知和运费压力上都比较轻，适合优化订单结构。",
        },
      },
      {
        heading: {
          en: "Explain packaging and care expectations",
          zh: "说明包装与佩戴护理预期",
        },
        body: {
          en: "Gift shoppers want to know whether the product arrives presentable. Jewelry buyers also expect basic care guidance, such as keeping items dry and stored separately.",
          zh: "送礼用户会关心商品到手时是否足够体面，而饰品购买者通常也会希望看到最基础的护理建议，例如保持干燥、分开收纳等。",
        },
      },
    ],
  },
  {
    slug: "shipping-guide",
    category: "general",
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Shipping guide: what to explain before an order ships",
      zh: "配送说明指南：发货前应该让用户知道什么",
    },
    description: {
      en: "A simple framework for explaining handling time, delivery windows, tracking updates and delay expectations on a boutique store.",
      zh: "用更清楚的方式说明备货时间、配送区间、物流更新和延迟预期，帮助精品商城减少售前疑问。",
    },
    intro: {
      en: "Clear shipping communication protects trust. Customers do not just want a fast estimate—they want to know how the order will move and when they can expect updates.",
      zh: "清楚的配送说明能保护用户信任。用户不只关心快不快，还关心订单会如何推进、什么时候能收到物流更新。",
    },
    sections: [
      {
        heading: {
          en: "Separate handling time from delivery time",
          zh: "把备货时间和运输时间分开说明",
        },
        body: {
          en: "Customers often assume the delivery window includes everything. Clarifying preparation time, dispatch timing and transit time helps avoid unrealistic expectations.",
          zh: "很多用户默认配送时效包含全部流程。把备货、出库和运输区间分开说明，能减少对签收时间的误解。",
        },
      },
      {
        heading: {
          en: "Explain when tracking becomes available",
          zh: "说明物流单号什么时候会出现",
        },
        body: {
          en: "Tracking is not useful until customers know when it should appear. Tell them whether the number shows immediately after dispatch or after carrier scanning.",
          zh: "物流单号只有在用户知道它何时更新时才真正有用。最好说明是发货后立即出现，还是承运商首次扫描后再同步。",
        },
      },
      {
        heading: {
          en: "Document common delay reasons early",
          zh: "提前解释常见延迟原因",
        },
        body: {
          en: "Cross-border orders may slow down because of weather, customs or holiday backlogs. Writing that upfront reduces confusion when delivery timelines move.",
          zh: "跨境订单可能受到天气、海关或节假日排仓影响。提前写清楚这些情况，能在时效波动时减少用户困惑。",
        },
      },
    ],
  },
  {
    slug: "desk-gift-ideas",
    category: "gifts",
    relatedProductSlugs: ["cloud-ceramic-tray", "star-note-gift-set"],
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Desk gift ideas that work well for boutique stores",
      zh: "适合精品商城的桌面礼物灵感",
    },
    description: {
      en: "See which desk-friendly products make strong gift ideas for add-on purchases, seasonal edits and compact parcel shipping.",
      zh: "看看哪些桌面小物更适合作为加购礼物、节日专题商品和轻小件跨境发货商品。",
    },
    intro: {
      en: "Desk gifts are effective because they feel useful, decorative and easy to ship. That makes them ideal for boutique stores that rely on curated, low-friction purchases.",
      zh: "桌面礼物类商品之所以有效，是因为它们兼具实用性、装饰性和易发货属性，很适合精选型、轻决策的精品商城。",
    },
    sections: [
      {
        heading: {
          en: "Choose items with visible everyday use",
          zh: "优先选择日常用途明显的商品",
        },
        body: {
          en: "Trays, note sets and small organizers work because shoppers can immediately imagine where the item belongs. Practical clarity improves conversion.",
          zh: "托盘、便签礼盒和小型收纳类商品容易转化，因为用户能立刻想象它会摆在哪里、怎么使用。",
        },
      },
      {
        heading: {
          en: "Keep the parcel light and the packaging neat",
          zh: "保持轻体积和包装整洁",
        },
        body: {
          en: "Compact goods are easier to bundle and less risky in cross-border shipping, especially when they can be presented neatly without oversized protective materials.",
          zh: "体积小的商品更适合组合销售，也更利于跨境发货，特别是在不需要过度防护包装的情况下更有优势。",
        },
      },
      {
        heading: {
          en: "Use desk gifts to raise basket value naturally",
          zh: "把桌面礼物做成自然抬高客单价的商品",
        },
        body: {
          en: "A shopper may hesitate on a large purchase, but a compact add-on often feels easy to approve. This makes desk gifts strong candidates for checkout-side recommendations.",
          zh: "用户可能会犹豫是否购买更高价商品，但对轻加购小物更容易快速决策，因此这类商品很适合用于加购推荐。",
        },
      },
    ],
  },
  {
    slug: "earrings-buying-guide",
    category: "jewelry",
    relatedProductSlugs: ["starlight-pearl-earrings"],
    publishedAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Earrings buying guide for gift-ready accessory pages",
      zh: "耳饰选购指南：如何把商品页做得更适合送礼",
    },
    description: {
      en: "A practical guide to presenting earrings with better close-up detail, gifting context and care expectations.",
      zh: "从近景展示、送礼场景和护理说明出发，帮助耳饰商品页更清楚地建立购买信心。",
    },
    intro: {
      en: "Earrings are often small enough to buy quickly, but they still require trust. Finish quality, close-up detail and packaging confidence matter before a shopper adds them to cart.",
      zh: "耳饰虽然属于轻决策商品，但用户下单前仍然需要信任基础，尤其是近景细节、做工质感和包装说明。",
    },
    sections: [
      {
        heading: {
          en: "Use close-up detail to show finish quality",
          zh: "用近景细节展示做工",
        },
        body: {
          en: "Color, surface finish and small stone or pearl details are easier to judge with dedicated close-up images. These images often matter more than generic lifestyle scenes.",
          zh: "颜色、表面质感和珍珠或小石材细节，需要通过近景图才能建立信任。这类图片通常比泛场景图更关键。",
        },
      },
      {
        heading: {
          en: "Frame earrings as a complete gift",
          zh: "把耳饰当成完整礼物来表达",
        },
        body: {
          en: "Jewelry pages convert better when the customer knows how the item arrives—gift card, pouch, insert card or box. That packaging context helps justify the purchase.",
          zh: "如果页面能说明耳饰到手时会配什么卡片、袋子或礼盒，用户更容易把它理解为一份完成度更高的礼物。",
        },
      },
      {
        heading: {
          en: "Keep care guidance short and practical",
          zh: "护理说明保持简洁实用",
        },
        body: {
          en: "Simple reminders like keeping items dry, avoiding perfume contact and storing separately make the product page feel more professional and trustworthy.",
          zh: "像保持干燥、避免接触香水、分开存放这类简单护理说明，会让商品页显得更专业、更可信。",
        },
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export function getGuideSummaries(locale: Locale) {
  return guides.map((guide) => ({
    slug: guide.slug,
    category: guide.category,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    readingMinutes: guide.readingMinutes,
    title: guide.title[locale],
    description: guide.description[locale],
    intro: guide.intro[locale],
  }));
}

export function getRelatedGuides(category: GuideCategory | "all", locale: Locale, excludeSlug?: string) {
  return guides
    .filter((guide) => guide.slug !== excludeSlug && (category === "all" || guide.category === category))
    .map((guide) => ({
      slug: guide.slug,
      category: guide.category,
      readingMinutes: guide.readingMinutes,
      title: guide.title[locale],
      description: guide.description[locale],
    }));
}
