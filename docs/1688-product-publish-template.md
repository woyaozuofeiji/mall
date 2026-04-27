# 1688 商品发布 JSON 模板

这个模板用于调用站点接口：

- `GET /api/integrations/products`
- `POST /api/integrations/products`

接口鉴权方式：

- `Authorization: Bearer <PRODUCT_PUBLISH_API_TOKEN>`

这份模板不是“理论字段表”，而是按当前项目实际消费逻辑整理的：

- 商品入库校验：`src/lib/validation/admin.ts`
- 商品创建/更新：`src/lib/admin.ts`
- 前台商品映射：`src/lib/catalog.ts`

## 1. 字段分层

建议把上报数据分成 4 层：

1. 商品基础字段
2. 图片、规格、变体
3. 双语内容字段
4. `sourcePayload` 扩展字段

其中：

- 基础字段、图片、变体、规格是正式商品字段
- `sourcePayload` 是扩展数据容器，前台评分/评论/SKU/库存文案会从这里读取

## 2. 推荐完整模板

```json
{
  "slug": "1688-pearl-earring-38382225057",
  "categorySlug": "womens-jewellery",
  "status": "PUBLISHED",

  "nameEn": "Stainless Steel Geometric Pendant Chain Necklace",
  "nameZh": "不锈钢几何吊坠链条项链",
  "subtitleEn": "A lightweight stainless steel chain for pendants and layered styling.",
  "subtitleZh": "轻量不锈钢链条，适合吊坠搭配与叠戴造型。",

  "descriptionEn": "This stainless steel necklace is designed for daily wear, pendant pairing, and layered styling. It offers multiple chain lengths and finishes suitable for fashion jewellery stores, gifting bundles, and everyday accessory edits.",
  "descriptionZh": "这款不锈钢项链适合日常佩戴、吊坠搭配与叠戴造型，提供多种链长与颜色，适合饰品店铺做日常配饰、送礼组合或穿搭加购款。",

  "storyEn": "Sourced from 1688 and curated for lightweight fashion-jewellery collections. The product is selected for strong visual presentation, broad size coverage, and flexible pairing with pendants and layered outfits.",
  "storyZh": "商品采自 1688，并经过店铺选品整理，适合轻饰品系列上架。主要看中其视觉展示效果、尺寸覆盖范围以及与吊坠和叠戴风格的搭配能力。",

  "leadTimeEn": "3-5 business days",
  "leadTimeZh": "3-5 个工作日",
  "shippingNoteEn": "Packed after manual quality check. Color and finish may vary slightly across batches.",
  "shippingNoteZh": "人工质检后打包发货，不同批次在色泽和表面处理上可能存在轻微差异。",

  "imageUrl": "https://cbu01.alicdn.com/img/ibank/1362225156_1309599598.jpg",
  "galleryImages": [
    {
      "url": "https://cbu01.alicdn.com/img/ibank/3880946377_1309599598.jpg",
      "altEn": "Chain necklace detail view",
      "altZh": "链条项链细节图"
    },
    {
      "url": "https://cbu01.alicdn.com/img/ibank/O1CN01viNYhs1ImHDhaTIdQ_!!2038490935-0-cib.jpg",
      "altEn": "Chain necklace lifestyle image",
      "altZh": "链条项链场景展示图"
    }
  ],

  "price": 2.6,
  "compareAtPrice": 4.9,
  "featured": true,
  "isNew": true,

  "tags": ["1688", "necklace", "stainless-steel", "layering", "pendant-chain"],

  "variants": [
    {
      "labelEn": "Steel / 45cm / 3mm",
      "labelZh": "钢色 / 45厘米 / 3毫米",
      "price": 2.0,
      "inventory": 1380
    },
    {
      "labelEn": "Steel / 50cm / 3mm",
      "labelZh": "钢色 / 50厘米 / 3毫米",
      "price": 2.18,
      "inventory": 1883
    },
    {
      "labelEn": "Gold / 60cm / 3mm",
      "labelZh": "金色 / 60厘米 / 3毫米",
      "price": 5.99,
      "inventory": 28
    }
  ],

  "specs": [
    {
      "labelEn": "Material",
      "labelZh": "材质",
      "valueEn": "Stainless steel",
      "valueZh": "不锈钢"
    },
    {
      "labelEn": "Finish",
      "labelZh": "表面工艺",
      "valueEn": "Polished metallic finish",
      "valueZh": "抛光金属质感"
    },
    {
      "labelEn": "Suitable For",
      "labelZh": "适用场景",
      "valueEn": "Pendant pairing, daily wear, layered styling",
      "valueZh": "吊坠搭配、日常佩戴、叠戴造型"
    },
    {
      "labelEn": "Origin",
      "labelZh": "发货地",
      "valueEn": "Jinhua, Zhejiang",
      "valueZh": "浙江金华"
    }
  ],

  "sourcePayload": {
    "source": "local-1688-import",
    "sku": "1688-38382225057",
    "availabilityStatus": "In stock",

    "reviewSummary": {
      "rating": 4.8,
      "count": 126
    },

    "reviews": [
      {
        "id": "review-001",
        "title": "Great finish and useful chain length",
        "author": "A***n",
        "content": "The metallic finish looks clean and the chain works well for pendant styling. Good value for the price.",
        "rating": 5,
        "date": "2026-04-20",
        "verified": true
      },
      {
        "id": "review-002",
        "title": "适合做基础百搭链",
        "author": "张**",
        "content": "颜色比较正，长度选择多，适合搭配小吊坠或者单戴。",
        "rating": 4,
        "date": "2026-04-18",
        "verified": true
      }
    ],

    "upstream": {
      "provider": "1688",
      "itemId": "38382225057",
      "externalId": "38382225057",
      "shopName": "义乌市孔亚兵电子商务商行",
      "shopUrl": "https://shop.1688.com/",
      "sellerCity": "浙江金华",
      "currency": "CNY",
      "minOrderQuantity": 2,
      "salesText": "成交1万+笔",
      "repurchaseRateText": "复购率 48%"
    },

    "rawUrl": "https://detail.1688.com/offer/38382225057.html",

    "raw": {
      "product": {
        "title": "不锈钢项链钛钢男士链子手工菱形链女生吊坠配链瓜子链饰品配饰",
        "mainImages": [
          "https://cbu01.alicdn.com/img/ibank/1362225156_1309599598.jpg"
        ],
        "reviews": [
          {
            "id": "raw-review-01",
            "title": "Nice chain",
            "author": "J***",
            "content": "Looks good in person and fits pendant matching.",
            "rating": 5,
            "timestamp": "2026-04-20",
            "is_verified": true
          }
        ]
      }
    }
  }
}
```

## 3. 当前前台真正会用到哪些字段

### 3.1 基础展示字段

这些字段会直接展示在前台：

- `nameEn`
- `nameZh`
- `subtitleEn`
- `subtitleZh`
- `descriptionEn`
- `descriptionZh`
- `storyEn`
- `storyZh`
- `leadTimeEn`
- `leadTimeZh`
- `shippingNoteEn`
- `shippingNoteZh`
- `imageUrl`
- `galleryImages`
- `price`
- `compareAtPrice`
- `featured`
- `isNew`
- `tags`
- `variants`
- `specs`

### 3.2 前台评分与评论字段

前台商品页会优先从 `sourcePayload` 读取：

- `sourcePayload.reviewSummary.rating`
- `sourcePayload.reviewSummary.count`
- `sourcePayload.reviews`

如果没有 `sourcePayload.reviews`，当前代码还支持从下面这个兼容路径读取：

- `sourcePayload.raw.product.reviews`

推荐你优先传：

```json
"reviewSummary": {
  "rating": 4.8,
  "count": 126
},
"reviews": [...]
```

这样最清晰，也最稳定。

### 3.3 SKU 与库存文案

前台还会消费这些扩展字段：

- `sourcePayload.sku`
- `sourcePayload.availabilityStatus`

## 4. 1688 本地采集器推荐最少补齐的数据

如果你不想一开始就把所有字段都做满，至少建议做到这一档：

```json
{
  "slug": "1688-xxx",
  "categorySlug": "womens-jewellery",
  "status": "PUBLISHED",
  "nameEn": "Translated English title",
  "nameZh": "中文标题",
  "subtitleEn": "One-line English subtitle",
  "subtitleZh": "一句中文副标题",
  "descriptionEn": "至少 2 到 4 句英文商品介绍",
  "descriptionZh": "至少 2 到 4 句中文商品介绍",
  "storyEn": "英文选品说明",
  "storyZh": "中文选品说明",
  "leadTimeEn": "3-5 business days",
  "leadTimeZh": "3-5 个工作日",
  "shippingNoteEn": "英文发货说明",
  "shippingNoteZh": "中文发货说明",
  "imageUrl": "主图 URL",
  "galleryImages": [],
  "price": 9.9,
  "featured": false,
  "isNew": true,
  "tags": ["1688"],
  "variants": [],
  "specs": [],
  "sourcePayload": {
    "source": "local-1688-import",
    "sku": "1688-xxx",
    "availabilityStatus": "In stock",
    "reviewSummary": {
      "rating": 4.7,
      "count": 35
    },
    "upstream": {
      "provider": "1688",
      "itemId": "xxx",
      "externalId": "xxx"
    },
    "rawUrl": "详情页 URL"
  }
}
```

## 5. 字段填写建议

### 5.1 `nameEn`

不要再把中文标题原样塞到 `nameEn`。

建议：

- 做本地翻译
- 或至少做人工整理后的英文短标题

不建议：

- 直接把中文标题复制到 `nameEn`

### 5.2 `descriptionEn` / `descriptionZh`

不要只塞：

- 商品标题
- 供应商
- 发货地
- 商品 ID

建议至少包含：

- 适合什么人群/穿搭/场景
- 材质或视觉风格
- 佩戴方式或搭配方式
- 作为礼物/日常款/叠戴款的卖点

### 5.3 `variants`

如果 1688 详情页有 SKU 规格，建议把规格名整理得更适合前台展示。

例如把：

- `钢色粗3MM>50CM`

整理成：

- `Steel / 50cm / 3mm`
- `钢色 / 50厘米 / 3毫米`

### 5.4 `specs`

建议把 1688 原始属性归类后写入：

- 材质
- 颜色
- 尺寸
- 风格
- 工艺
- 发货地
- 适用场景

### 5.5 `reviews`

如果你能从本地采集器拿到评价数据，推荐统一成：

```json
{
  "id": "review-001",
  "title": "Short review title",
  "author": "Masked user",
  "content": "Review content",
  "rating": 5,
  "date": "2026-04-20",
  "verified": true
}
```

## 6. 推荐 cURL 示例

```bash
curl -sS 'https://mall.67win.cc/api/integrations/products' \
  -H 'Authorization: Bearer YOUR_PRODUCT_PUBLISH_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d @product.json
```

## 7. 返回结果

创建成功：

```json
{
  "id": "cmxxxxxxxxxxxxxxxx",
  "mode": "created",
  "category": {
    "id": "cmcategoryid",
    "slug": "womens-jewellery",
    "nameEn": "Women's Jewellery",
    "nameZh": "女饰"
  }
}
```

更新成功：

```json
{
  "id": "cmxxxxxxxxxxxxxxxx",
  "mode": "updated",
  "category": {
    "id": "cmcategoryid",
    "slug": "womens-jewellery",
    "nameEn": "Women's Jewellery",
    "nameZh": "女饰"
  }
}
```

## 8. 备注

当前外部发布接口是“直接创建/更新正式商品”，不是导入批次流程。

所以它：

- 会直接进入商品库
- 不会生成 `ImportBatch`
- 不会进入后台“导入”审核页

如果后面你要把本地采集器也接成“导入批次 -> 后台审核 -> 发布”的流程，需要再单独扩展一层导入接口。
