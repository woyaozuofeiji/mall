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
      zh: "如何挑选适合跨境配送的小礼物",
    },
    description: {
      en: "A practical guide to choosing gift-ready products that look premium, ship easily and work well as add-on purchases.",
      zh: "从送礼属性、包装友好度和发货便利性出发，帮助你挑选更适合作为轻礼物和加购商品的小件商品。",
    },
    intro: {
      en: "Small gifts work best when they feel personal, travel well and are easy to pair with a larger present.",
      zh: "轻小件礼物最适合需要心意明确、运输压力低、又能和其他礼物自然组合的场景。",
    },
    sections: [
      {
        heading: {
          en: "Start with gifting intent, not just price",
          zh: "先看送礼场景，不只看价格",
        },
        body: {
          en: "Small gifts are easier to choose when they match a real moment: a birthday add-on, a desk surprise or a seasonal note. A clear use case matters more than the lowest price.",
          zh: "小礼物更适合对应具体场景，例如生日加购、桌面小惊喜或节日礼盒补充。用途清楚，往往比单纯便宜更重要。",
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
          en: "The best small gifts pair naturally with plush toys, jewelry or stationery. They should feel easy to add without turning the order into a major budget decision.",
          zh: "优秀的小礼物通常能和毛绒、饰品或文具自然组合，也不会让整笔订单突然变成很重的预算决定。",
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
      en: "Plush buying guide: what to check before ordering",
      zh: "毛绒玩偶选购指南：下单前要看什么",
    },
    description: {
      en: "Check size, softness, gifting suitability and shipping expectations before choosing a plush toy.",
      zh: "从尺寸、手感、送礼适配度到发货预期，整理购买毛绒玩偶前值得关注的关键点。",
    },
    intro: {
      en: "Plush toys are visual, but photos are only part of the decision. Softness, size, gifting fit and price also matter before checkout.",
      zh: "毛绒商品很依赖图片，但只有图片还不够。手感、尺寸、送礼适配度和价格是否匹配，同样值得下单前确认。",
    },
    sections: [
      {
        heading: {
          en: "Show scale clearly",
          zh: "把尺寸说清楚",
        },
        body: {
          en: "One of the most common reasons to hesitate is uncertainty about size. Look for exact height or width and where the item fits best, such as a desk, shelf or bedside table.",
          zh: "毛绒商品最常见的犹豫点之一就是尺寸不明确。建议确认准确高度或宽度，并判断更适合摆在桌面、书架还是床头。",
        },
      },
      {
        heading: {
          en: "Describe texture and finish in plain language",
          zh: "用清楚的话描述手感和做工",
        },
        body: {
          en: "Because you cannot touch the item before ordering, fabric type, softness, embroidery detail and filling feel are worth checking carefully.",
          zh: "下单前无法触摸实物，因此面料类型、柔软程度、刺绣细节和填充感受都值得认真查看。",
        },
      },
      {
        heading: {
          en: "Tie the product to gifting use cases",
          zh: "把商品和送礼场景关联起来",
        },
        body: {
          en: "A plush toy is easier to choose when you can picture the moment: birthday gifting, room decor, desk styling or collector display.",
          zh: "当你能想象它会出现在哪个场景里，选择会更容易，比如生日送礼、房间布置、桌面陈列或收藏展示。",
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
      en: "Jewelry gift guide: choosing small accessories with care",
      zh: "饰品送礼指南：如何挑选精致小配饰",
    },
    description: {
      en: "Choose jewelry and accessories for gifting by checking finish, styling range, packaging and care expectations.",
      zh: "从做工、搭配范围、包装和护理预期出发，挑选更适合作为礼物的饰品和轻珠宝。",
    },
    intro: {
      en: "Jewelry can feel personal without being difficult to ship. The key is choosing pieces that are easy to style and clear in their details.",
      zh: "饰品能表达细腻心意，又不会带来太重的配送负担。关键是选择容易搭配、细节说明清楚的款式。",
    },
    sections: [
      {
        heading: {
          en: "Close-up detail matters",
          zh: "近景细节很重要",
        },
        body: {
          en: "Before buying jewelry online, check whether the photos clearly show plating, texture, stone color and packaging. Finish quality is easier to judge through close details.",
          zh: "线上购买饰品前，建议查看镀层、纹理、颜色和包装是否展示清楚。近景细节能帮助你判断做工质感。",
        },
      },
      {
        heading: {
          en: "Choose pieces that are easy to pair",
          zh: "选择容易搭配的款式",
        },
        body: {
          en: "Earrings, bracelets and similar accessories are easier to gift when they work with both everyday outfits and slightly dressier moments.",
          zh: "耳饰、手链这类配饰如果能兼顾日常穿搭和稍正式场合，送礼时会更稳妥。",
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
      en: "Understand handling time, delivery windows, tracking updates and common delay expectations before placing an order.",
      zh: "下单前了解备货时间、配送区间、物流更新和常见延迟原因，让收货预期更清楚。",
    },
    intro: {
      en: "Clear shipping information is about more than speed. It helps you know how the order moves and when tracking updates should appear.",
      zh: "清楚的配送说明不只是告诉你快不快，也能让你知道订单如何推进、什么时候会收到物流更新。",
    },
    sections: [
      {
        heading: {
          en: "Separate handling time from delivery time",
          zh: "把备货时间和运输时间分开说明",
        },
        body: {
          en: "Delivery windows can be easier to understand when preparation time, dispatch timing and transit time are separated.",
          zh: "把备货、出库和运输区间分开看，会更容易判断实际签收时间。",
        },
      },
      {
        heading: {
          en: "Explain when tracking becomes available",
          zh: "说明物流单号什么时候会出现",
        },
        body: {
          en: "Tracking may appear after dispatch or after the carrier scans the parcel. If it does not update immediately, allow some time for the carrier system to refresh.",
          zh: "物流单号可能在发货后出现，也可能等承运商首次扫描后才同步。如果没有立刻更新，可以预留一些系统刷新时间。",
        },
      },
      {
        heading: {
          en: "Document common delay reasons early",
          zh: "提前解释常见延迟原因",
        },
        body: {
          en: "Cross-border orders may slow down because of weather, customs or holiday backlogs. Knowing these reasons early makes timeline changes easier to understand.",
          zh: "跨境订单可能受到天气、海关或节假日排仓影响。提前了解这些原因，能在时效波动时减少困惑。",
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
      en: "Desk gift ideas for small everyday surprises",
      zh: "适合日常小惊喜的桌面礼物灵感",
    },
    description: {
      en: "See which desk-friendly products make strong gift ideas for add-on purchases, seasonal edits and compact parcel shipping.",
      zh: "看看哪些桌面小物适合作为加购礼物、节日心意和轻小件跨境配送商品。",
    },
    intro: {
      en: "Desk gifts are practical, decorative and easy to ship. They work well when you want something small that still feels considered.",
      zh: "桌面礼物兼具实用性、装饰性和易配送属性，适合想送一份不夸张但有心意的小礼物。",
    },
    sections: [
      {
        heading: {
          en: "Choose items with visible everyday use",
          zh: "优先选择日常用途明显的商品",
        },
        body: {
          en: "Trays, note sets and small organizers are easier to choose when you can immediately imagine where the item belongs.",
          zh: "托盘、便签礼盒和小型收纳类商品，如果能立刻想象它会摆在哪里、怎么使用，就更容易挑选。",
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
          en: "Use desk gifts as thoughtful add-ons",
          zh: "把桌面礼物作为贴心加购",
        },
        body: {
          en: "A compact desk gift can pair well with plush toys, jewelry or stationery when you want the package to feel more complete.",
          zh: "如果想让礼物更完整，轻巧的桌面小物可以和毛绒、饰品或文具自然搭配。",
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
      en: "Earrings buying guide for gift-ready accessories",
      zh: "耳饰选购指南：如何挑选适合送礼的耳饰",
    },
    description: {
      en: "A practical guide to presenting earrings with better close-up detail, gifting context and care expectations.",
      zh: "从近景细节、送礼场景和护理说明出发，挑选更适合送礼的耳饰。",
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
          en: "It helps to know how the earrings arrive: gift card, pouch, insert card or box. That packaging context makes the gift feel more complete.",
          zh: "如果能提前了解耳饰到手时会配什么卡片、袋子或礼盒，就更容易判断它是否是一份完整礼物。",
        },
      },
      {
        heading: {
          en: "Keep care guidance short and practical",
          zh: "护理说明保持简洁实用",
        },
        body: {
          en: "Simple reminders like keeping items dry, avoiding perfume contact and storing separately can help the earrings stay presentable for longer.",
          zh: "保持干燥、避免接触香水、分开存放等简单护理方式，可以帮助耳饰更久保持体面。",
        },
      },
    ],
  },
  {
    slug: "birthday-gifts-for-her",
    category: "gifts",
    relatedProductSlugs: ["starlight-pearl-earrings", "aurora-bunny-plush", "cloud-ceramic-tray"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Birthday gift ideas for her: plush, jewelry and small keepsakes",
      zh: "送女生生日礼物怎么选：毛绒、饰品与轻小纪念礼物",
    },
    description: {
      en: "A focused guide to choosing birthday gifts that feel thoughtful, easy to ship and suited to everyday style.",
      zh: "围绕生日送礼场景，整理毛绒、饰品和轻小纪念礼物的选择思路。",
    },
    intro: {
      en: "A good birthday gift does not have to be expensive. It should feel personal, easy to present and aligned with the recipient's daily style.",
      zh: "好的生日礼物不一定要很贵，但需要有心意、拿到手足够体面，并且能贴近对方的日常风格。",
    },
    sections: [
      {
        heading: { en: "Use personality to narrow the category", zh: "先按性格缩小商品类别" },
        body: {
          en: "Soft plush toys work for warm and expressive recipients, jewelry suits a more polished daily style, and desk gifts fit practical users who enjoy small details.",
          zh: "温柔外向的人更适合毛绒礼物，日常穿搭精致的人更适合饰品，而注重实用细节的人通常会喜欢桌面小物。",
        },
      },
      {
        heading: { en: "Choose gifts that look complete on arrival", zh: "选择到手即完整的礼物" },
        body: {
          en: "For birthday gifts, presentation matters. Check whether the item includes a pouch, box, note card or neat protective packaging.",
          zh: "生日礼物很讲究到手呈现。建议确认是否有收纳袋、礼盒、留言卡或整洁保护包装。",
        },
      },
      {
        heading: { en: "Keep the decision simple", zh: "降低选择负担" },
        body: {
          en: "A few strong options are usually easier to compare than a large mixed list. Start with the recipient's style and the occasion.",
          zh: "少量明确选择通常比大量混合商品更容易比较。可以先从对方风格和生日场景开始判断。",
        },
      },
    ],
  },
  {
    slug: "cute-plush-gifts",
    category: "plush",
    relatedProductSlugs: ["aurora-bunny-plush", "luna-cat-pocket-doll"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Cute plush gifts: how to choose soft toys that feel gift-ready",
      zh: "可爱毛绒礼物怎么选：让玩偶更适合送礼的关键点",
    },
    description: {
      en: "Learn how to compare cute plush gifts by size, softness, face design, packaging and display use cases.",
      zh: "从尺寸、手感、表情设计、包装和摆放场景出发，判断一款毛绒是否真的适合送礼。",
    },
    intro: {
      en: "Cute plush gifts work best when the shopper can quickly understand the size, texture and emotional tone of the character.",
      zh: "可爱毛绒礼物最重要的是快速理解尺寸、手感和角色气质。",
    },
    sections: [
      {
        heading: { en: "Face design drives emotional appeal", zh: "表情设计决定情绪吸引力" },
        body: {
          en: "Eyes, embroidery and small expression details often decide whether a plush feels warm, playful or collectible.",
          zh: "眼睛、刺绣和表情细节往往决定毛绒看起来是温柔、俏皮还是更偏收藏感。",
        },
      },
      {
        heading: { en: "Match size with the gifting moment", zh: "让尺寸匹配送礼场景" },
        body: {
          en: "Small plush items suit desk surprises and add-ons, while larger pieces work better as a main birthday or holiday gift.",
          zh: "小尺寸毛绒适合桌面惊喜和加购，大尺寸则更适合作为生日或节日主礼物。",
        },
      },
      {
        heading: { en: "Explain cleaning and storage simply", zh: "简单说明清洁和收纳" },
        body: {
          en: "Short care guidance reduces hesitation, especially for plush toys that may be kept on beds, shelves or work desks.",
          zh: "简短护理说明能降低顾虑，尤其是会放在床头、书架或办公桌上的毛绒玩偶。",
        },
      },
    ],
  },
  {
    slug: "affordable-jewelry-gifts",
    category: "jewelry",
    relatedProductSlugs: ["starlight-pearl-earrings", "moon-ribbon-bracelet"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Affordable jewelry gifts that still feel polished",
      zh: "平价但有质感的饰品礼物怎么选",
    },
    description: {
      en: "A guide to selecting affordable jewelry gifts that feel thoughtful through finish, packaging and everyday wearability.",
      zh: "从做工、包装和日常佩戴适配度出发，挑选价格友好但仍有质感的饰品礼物。",
    },
    intro: {
      en: "Affordable jewelry can still feel polished when finish quality, styling range and presentation are clear.",
      zh: "平价饰品依然可以显得有质感，关键是做工、搭配范围和到手呈现足够清楚。",
    },
    sections: [
      {
        heading: { en: "Focus on finish rather than size", zh: "重点看做工而不是体积" },
        body: {
          en: "Small earrings or bracelets can look premium when plating, surface texture and detail photos are strong.",
          zh: "小耳饰或手链只要镀层、表面质感和细节图足够清楚，也能形成较强的高级感。",
        },
      },
      {
        heading: { en: "Choose easy daily styling", zh: "选择日常好搭配的款式" },
        body: {
          en: "Gift jewelry is easier to choose when you can imagine the recipient wearing it with both casual and dressier outfits.",
          zh: "当你能想象对方在日常和稍正式穿搭中都能佩戴时，饰品礼物会更稳妥。",
        },
      },
      {
        heading: { en: "Use packaging to lift perceived value", zh: "用包装提升感知价值" },
        body: {
          en: "A small pouch, insert card or gift box can make a modestly priced accessory feel much more complete.",
          zh: "一个小收纳袋、卡片或礼盒，就能让价格不高的饰品显得更完整、更适合送礼。",
        },
      },
    ],
  },
  {
    slug: "small-gifts-under-30",
    category: "gifts",
    relatedProductSlugs: ["star-note-gift-set", "cloud-ceramic-tray"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Small gifts under $30: practical picks for easy checkout",
      zh: "30 美元以内小礼物：适合快速决策和顺手加购的选择",
    },
    description: {
      en: "How to choose compact gifts under $30 that feel useful, attractive and easy to add to a cart.",
      zh: "如何挑选 30 美元以内、实用好看且容易加入购物车的小礼物。",
    },
    intro: {
      en: "Lower-priced gifts work best when the shopper immediately understands who they are for and how they will be used.",
      zh: "低价位礼物最重要的是马上能判断适合送给谁、怎么用、为什么值得顺手买。",
    },
    sections: [
      {
        heading: { en: "Keep the use case visible", zh: "让使用场景一眼可见" },
        body: {
          en: "Desk trays, note sets, plush minis and small accessories are easier to buy when they show a clear daily use case.",
          zh: "桌面托盘、便签套装、小毛绒和轻饰品，只要场景清楚，就更容易形成快速购买决策。",
        },
      },
      {
        heading: { en: "Make the gift feel intentional", zh: "让小礼物显得有心意" },
        body: {
          en: "Short copy around birthdays, thank-you moments or desk refreshes helps small items feel more thoughtful.",
          zh: "围绕生日、感谢、桌面焕新等场景写清楚，小件商品就不会显得随意。",
        },
      },
      {
        heading: { en: "Use bundles carefully", zh: "谨慎设计组合搭配" },
        body: {
          en: "Pairing a small gift with a plush toy or accessory can make the overall present feel more complete, as long as the match feels natural.",
          zh: "小礼物可以和毛绒或饰品组合，让整份礼物更完整，但搭配逻辑要自然、容易理解。",
        },
      },
    ],
  },
  {
    slug: "gift-packaging-guide",
    category: "gifts",
    relatedProductSlugs: ["star-note-gift-set"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Gift packaging guide for compact products",
      zh: "轻小件商品的礼物包装指南",
    },
    description: {
      en: "A guide to explaining packaging, protection and gift presentation for compact products.",
      zh: "说明轻小件商品的包装呈现、防护方式和送礼完整度。",
    },
    intro: {
      en: "Packaging affects confidence before checkout. It helps to know whether the item will arrive protected and presentable.",
      zh: "包装会影响下单前的判断。你需要知道商品是否能被妥善保护，以及到手是否足够体面。",
    },
    sections: [
      {
        heading: { en: "Separate protective packaging from gift packaging", zh: "区分防护包装和礼物包装" },
        body: {
          en: "Protective packaging prevents damage, while gift packaging affects presentation. Check both before ordering.",
          zh: "防护包装负责减少破损，礼物包装影响呈现效果。下单前建议分别确认。",
        },
      },
      {
        heading: { en: "Show what is included", zh: "说明包含哪些包装物" },
        body: {
          en: "If an item includes a pouch, box, insert card or wrapping, it is easier to decide whether extra packaging is needed.",
          zh: "如果商品包含袋子、盒子、卡片或包纸，就更容易判断是否还需要额外包装。",
        },
      },
      {
        heading: { en: "Keep packaging claims accurate", zh: "包装描述必须准确" },
        body: {
          en: "Avoid implying premium gift wrapping unless it is consistently included. Accurate packaging copy protects expectations.",
          zh: "除非商品明确包含高级礼盒，否则应以实际包装说明为准。准确描述能保护收货预期。",
        },
      },
    ],
  },
  {
    slug: "long-distance-gift-shopping",
    category: "general",
    relatedProductSlugs: ["aurora-bunny-plush", "starlight-pearl-earrings"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 5,
    title: {
      en: "Long-distance gift shopping: what to check before ordering",
      zh: "异地送礼下单前应该确认什么",
    },
    description: {
      en: "A practical checklist for buying gifts online when the recipient is far away.",
      zh: "异地线上送礼时，下单前需要确认的地址、包装、时效和售后问题。",
    },
    intro: {
      en: "Long-distance gifting depends on confidence. When you cannot check the package in person, clear information matters more.",
      zh: "异地送礼更依赖信任，因为你无法亲手检查包裹，因此商品和配送信息越清楚越重要。",
    },
    sections: [
      {
        heading: { en: "Confirm the recipient address early", zh: "尽早确认收件信息" },
        body: {
          en: "Address accuracy, phone number and postal code matter more when the buyer and recipient are not in the same place.",
          zh: "当购买者和收件人不在同一地点时，地址、电话和邮编的准确性更关键。",
        },
      },
      {
        heading: { en: "Check handling and delivery windows", zh: "确认备货和配送时间" },
        body: {
          en: "A gift can be perfect but still miss the moment if the delivery window is unclear. Always separate handling time from transit time.",
          zh: "礼物再合适，如果时效不清楚也可能错过场景。最好区分备货时间和运输时间。",
        },
      },
      {
        heading: { en: "Use products that travel well", zh: "选择更适合运输的商品" },
        body: {
          en: "Compact plush, jewelry and small desk gifts usually travel better than fragile or oversized items.",
          zh: "小型毛绒、饰品和桌面小物通常比易碎或超大件商品更适合跨区域运输。",
        },
      },
    ],
  },
  {
    slug: "plush-toy-care-guide",
    category: "plush",
    relatedProductSlugs: ["aurora-bunny-plush", "luna-cat-pocket-doll"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Plush toy care guide for display and everyday use",
      zh: "毛绒玩偶护理指南：日常摆放和使用怎么保养",
    },
    description: {
      en: "Simple plush care guidance for keeping soft toys on beds, shelves, desks or collector displays.",
      zh: "面向床头、书架、桌面和收藏陈列场景的毛绒玩偶基础护理建议。",
    },
    intro: {
      en: "Basic plush care helps the item stay clean and presentable after purchase.",
      zh: "基础护理可以帮助毛绒商品在到手后保持干净和体面。",
    },
    sections: [
      {
        heading: { en: "Dust lightly and regularly", zh: "轻柔定期除尘" },
        body: {
          en: "For display plush toys, light dusting and gentle brushing usually matter more than frequent washing.",
          zh: "用于陈列的毛绒玩偶，轻柔除尘和梳理通常比频繁清洗更重要。",
        },
      },
      {
        heading: { en: "Avoid damp storage", zh: "避免潮湿收纳" },
        body: {
          en: "Keep plush items away from damp corners and direct moisture so the fabric and filling stay comfortable.",
          zh: "毛绒商品应避免放在潮湿角落或直接接触水汽，以保持面料和填充状态。",
        },
      },
      {
        heading: { en: "Read product-specific notes", zh: "查看商品专属说明" },
        body: {
          en: "Some plush toys include embroidery, accessories or special fabric, so product-specific care notes should be followed first.",
          zh: "部分毛绒含有刺绣、配件或特殊面料，应优先参考商品的专属护理说明。",
        },
      },
    ],
  },
  {
    slug: "jewelry-care-guide",
    category: "jewelry",
    relatedProductSlugs: ["starlight-pearl-earrings", "moon-ribbon-bracelet"],
    publishedAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    readingMinutes: 4,
    title: {
      en: "Jewelry care guide: keeping small accessories ready to wear",
      zh: "饰品护理指南：让小饰品保持适合日常佩戴的状态",
    },
    description: {
      en: "Basic care tips for affordable jewelry and boutique accessories, including storage, moisture and daily wear.",
      zh: "适用于平价饰品和精品配饰的基础护理建议，覆盖收纳、防潮和日常佩戴。",
    },
    intro: {
      en: "Simple care habits can help plated jewelry and small accessories stay ready to wear for longer.",
      zh: "简单护理习惯可以帮助镀层饰品和小配饰更久保持适合佩戴的状态。",
    },
    sections: [
      {
        heading: { en: "Keep jewelry dry", zh: "尽量保持干燥" },
        body: {
          en: "Avoid wearing small accessories in showers, pools or heavy workouts unless the product details say they are designed for that use.",
          zh: "除非商品说明明确适合，否则不建议在洗澡、泳池或大量出汗运动时佩戴小饰品。",
        },
      },
      {
        heading: { en: "Store pieces separately", zh: "分开收纳减少摩擦" },
        body: {
          en: "Separate storage reduces scratches, tangles and surface wear, especially for earrings and bracelets.",
          zh: "分开收纳能减少刮擦、缠绕和表面磨损，尤其适合耳饰和手链。",
        },
      },
      {
        heading: { en: "Put jewelry on after fragrance", zh: "香水之后再佩戴饰品" },
        body: {
          en: "Perfume, lotion and cosmetics can affect finish over time, so jewelry is usually best worn after those products dry.",
          zh: "香水、乳液和化妆品可能长期影响表面质感，建议等这些产品干后再佩戴饰品。",
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
