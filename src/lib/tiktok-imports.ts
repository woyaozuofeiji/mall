import "server-only";

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ImportItemStatus, type Prisma } from "@prisma/client";
import { buildImportMediaUrl, getImportStorageRoot } from "@/lib/import-media";
import { prisma } from "@/lib/prisma";
import { publishImportBatch } from "@/lib/imports";
import { fetchTikTokShopProductHtml, fetchTikTokShopSearchHtml } from "@/lib/oxylabs";
import { adminProductPayloadSchema, type AdminProductPayload } from "@/lib/validation/admin";
import { tiktokImportCronRequestSchema, tiktokImportRequestSchema, type TikTokImportRequest } from "@/lib/validation/imports";

const TIKTOK_SPEC_LABEL_ZH_MAP: Record<string, string> = {
  Shop: "店铺",
  "Shop Rating": "店铺评分",
  "Official Shop": "官方店铺",
  Sold: "销量",
  Reviews: "评论数",
  Delivery: "配送时效",
  "Shipping Fee": "运费",
  "Business Name": "经营主体",
  "Business Address": "经营地址",
  "Seller ID": "卖家 ID",
  Specification: "规格",
};

const MAX_IMAGE_COUNT = 10;
const MARKETPLACE_TERM_PATTERNS = [
  /\btik[\s-]*tok(?:[\s-]*shop)?\b/gi,
  /\btt[\s-]*shop\b/gi,
  /抖音(?:\s*商城|\s*小店|\s*商店)?/g,
] as const;
const PUBLIC_TAG_BLOCKLIST = new Set(["tiktok", "tiktok-shop", "tik-tok", "tt-shop", "ttshop", "douyin", "oxylabs"]);

type SourcePayloadRecord = Record<string, unknown>;

type ImportEvaluation = {
  approved: boolean;
  reasons: string[];
};

type NormalizedImportItem = {
  productId: string;
  payload: AdminProductPayload;
  score: number;
  evaluation: ImportEvaluation;
  rawPayload: SourcePayloadRecord;
};

export interface TikTokImportExecutionResult {
  batchId: string;
  batchName: string;
  source: string;
  totalItems: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  autoPublish: boolean;
}

export type TikTokImportProgressPhase =
  | "initializing"
  | "fetching_search"
  | "processing_candidates"
  | "saving_batch"
  | "publishing_batch"
  | "completed";

export interface TikTokImportProgressEvent {
  phase: TikTokImportProgressPhase;
  percent: number;
  current?: number;
  total?: number;
  approvedCount?: number;
  rejectedCount?: number;
  candidateCount?: number;
  batchId?: string;
  publishedCount?: number;
  currentProductId?: string;
  currentTitle?: string;
  detail?: string;
}

interface TikTokImportOptions {
  onProgress?: (event: TikTokImportProgressEvent) => void | Promise<void>;
}

interface TikTokImage {
  height?: number;
  width?: number;
  uri?: string;
  url_list?: string[];
  [key: string]: unknown;
}

interface TikTokPriceInfo {
  sku_id?: string;
  currency_name?: string;
  currency_symbol?: string;
  sale_price_decimal?: number | string;
  origin_price_decimal?: number | string;
  single_product_price_decimal?: number | string;
  sale_price_format?: string;
  origin_price_format?: string;
  discount_format?: string;
  [key: string]: unknown;
}

interface TikTokSearchSkuInfo {
  SkuId?: string;
  PriceInfo?: TikTokPriceInfo;
  [key: string]: unknown;
}

interface TikTokSearchProduct {
  product_id?: string;
  title?: string;
  image?: TikTokImage;
  product_price_info?: TikTokPriceInfo;
  rate_info?: {
    score?: number | string;
    review_count?: number | string;
    [key: string]: unknown;
  };
  sold_info?: {
    sold_count?: number | string;
    [key: string]: unknown;
  };
  seller_info?: {
    seller_id?: string;
    shop_name?: string;
    shop_link?: string;
    shop_rating?: number | string;
    shop_logo?: TikTokImage;
    shop_identity_label?: {
      identity_label_text?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  seo_url?: {
    canonical_url?: string;
    slug?: string;
    [key: string]: unknown;
  };
  brand_info?: {
    brand_name?: string;
    [key: string]: unknown;
  };
  sku_info?: TikTokSearchSkuInfo[];
  [key: string]: unknown;
}

interface TikTokPropertyValue {
  property_value_id?: string | number;
  property_value_name?: string;
  [key: string]: unknown;
}

interface TikTokProperty {
  property_id?: string | number;
  property_name?: string;
  property_values?: TikTokPropertyValue[];
  property_label?: {
    legal_property?: boolean;
    hide_c_side_property?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TikTokSkuPropertyPair {
  sku_property_id?: string | number;
  sku_property_value_id?: string | number;
  sku_property_name?: string;
  sku_property_value_name?: string;
  [key: string]: unknown;
}

interface TikTokSku {
  sku_id?: string;
  sku_name?: string;
  property_pairs?: TikTokSkuPropertyPair[];
  sku_quantity?: {
    available_quantity?: number | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TikTokProductModel {
  product_id?: string;
  seller_id?: string;
  sold_count?: number | string;
  name?: string;
  images?: TikTokImage[];
  sale_properties?: TikTokProperty[];
  product_properties?: TikTokProperty[];
  skus?: TikTokSku[];
  videos?: Array<Record<string, unknown>>;
  biz_type?: number | string;
  [key: string]: unknown;
}

interface TikTokProductInfoModel {
  product_model?: TikTokProductModel;
  logistic_model?: Record<string, unknown>;
  promotion_model?: Record<string, unknown>;
  review_model?: {
    product_overall_score?: number | string;
    product_review_count?: number | string;
    [key: string]: unknown;
  };
  seller_model?: {
    shop_name?: string;
    shop_logo?: TikTokImage;
    [key: string]: unknown;
  };
  safety_model?: {
    business_compliance_info?: {
      business_name?: string;
      business_address?: string;
      [key: string]: unknown;
    };
    legit_warnings?: unknown[];
    [key: string]: unknown;
  };
  availability_model?: {
    reason?: number | string;
    [key: string]: unknown;
  };
  base_resp?: Record<string, unknown>;
}

interface TikTokReviewInfo {
  review_id?: string;
  reviewer_name?: string;
  review_text?: string;
  review_rating?: number | string;
  sku_specification?: string;
  review_country?: string;
  display_image_url?: string;
  review_images?: string[];
  [key: string]: unknown;
}

interface TikTokProductPageData {
  productInfo: TikTokProductInfoModel;
  shopInfo?: Record<string, unknown>;
  reviewsInfo?: {
    total_reviews?: number | string;
    product_reviews?: TikTokReviewInfo[];
    review_ratings?: unknown[];
    base_resp?: Record<string, unknown>;
    [key: string]: unknown;
  };
  hotReviews?: TikTokReviewInfo[];
  categoryInfo?: Record<string, unknown>;
  routeInfo?: Record<string, unknown>;
}

interface TikTokSearchPageData {
  products: TikTokSearchProduct[];
  routeInfo?: Record<string, unknown>;
}

type CleanedReviewItem = {
  id?: string;
  author: string;
  content: string;
  rating?: number;
  sku?: string;
  country?: string;
};

type DeliveryInfo = {
  minDays?: number;
  maxDays?: number;
  shippingFee?: number;
  currency?: string;
};

async function emitProgress(callback: TikTokImportOptions["onProgress"], event: TikTokImportProgressEvent) {
  if (!callback) {
    return;
  }

  await callback({
    ...event,
    percent: Math.max(0, Math.min(100, Math.round(event.percent))),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNestedRecord(input: Record<string, unknown> | undefined, key: string) {
  const value = input?.[key];
  return isRecord(value) ? value : undefined;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(title: string, productId: string) {
  const base = slugify(title) || `imported-item-${productId}`;
  return `${base}-${productId}`.slice(0, 96);
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const cleaned = normalized.replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return undefined;
  }

  if (cleaned.includes(",") && cleaned.includes(".")) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const grouped = cleaned.replace(decimalSeparator === "," ? /\./g : /,/g, "");
    const canonical = grouped.replace(decimalSeparator, ".");
    const parsed = Number(canonical);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (cleaned.includes(",") && !cleaned.includes(".")) {
    const decimalLike = /,\d{1,2}$/.test(cleaned);
    const canonical = decimalLike ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
    const parsed = Number(canonical);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toInteger(value: unknown) {
  const parsed = toNumber(value);
  return parsed == null ? undefined : Math.trunc(parsed);
}

function toText(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map((item) => toText(item)).filter((item): item is string => Boolean(item));
    return parts.length > 0 ? parts.join(" · ") : undefined;
  }
  if (typeof value === "object") {
    const parts = Object.values(value as Record<string, unknown>)
      .map((item) => toText(item))
      .filter((item): item is string => Boolean(item));
    return parts.length > 0 ? [...new Set(parts)].join(" · ") : undefined;
  }
  return undefined;
}

function dedupeStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function safeJsonParse<T = unknown>(input: string) {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function sanitizePublicText(input: string | undefined) {
  if (!input) {
    return undefined;
  }

  let cleaned = input;
  for (const pattern of MARKETPLACE_TERM_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  cleaned = cleaned
    .replace(/\(\s*\)/g, " ")
    .replace(/\[\s*\]/g, " ")
    .replace(/\{\s*\}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([(\[{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/^[\s,.;:!?|·•/_-]+/, "")
    .replace(/[\s,.;:!?|·•/_-]+$/, "")
    .trim();

  return cleaned || undefined;
}

function normalizeTagToken(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanPublicTag(input: string | undefined) {
  const sanitized = sanitizePublicText(input)?.replace(/\n+/g, " ").trim();
  if (!sanitized) {
    return undefined;
  }

  const normalized = normalizeTagToken(sanitized);
  if (normalized && PUBLIC_TAG_BLOCKLIST.has(normalized)) {
    return undefined;
  }

  return sanitized;
}

function sanitizePublicTags(values: Array<string | undefined | null>) {
  return dedupeStrings(values.map((value) => cleanPublicTag(value ?? undefined)));
}

function collectImageUrls(input: unknown): string[] {
  const found: string[] = [];

  const visit = (value: unknown) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (looksLikeUrl(trimmed)) {
        found.push(trimmed);
      }
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (/url|image|src/i.test(key)) {
        visit(nested);
      } else if (typeof nested === "object") {
        visit(nested);
      }
    }
  };

  visit(input);
  return dedupeStrings(found).slice(0, MAX_IMAGE_COUNT);
}

function extractTextSnippets(input: unknown, limit = 4) {
  const seen = new Set<string>();
  const snippets: string[] = [];

  const push = (value: string) => {
    const normalized = sanitizePublicText(value)?.replace(/\s+/g, " ").trim();
    if (!normalized || normalized.length < 4 || looksLikeUrl(normalized) || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    snippets.push(normalized);
  };

  const visit = (value: unknown) => {
    if (snippets.length >= limit) {
      return;
    }

    if (typeof value === "string") {
      push(value);
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
        if (snippets.length >= limit) {
          break;
        }
      }
      return;
    }

    const record = value as Record<string, unknown>;
    for (const key of ["text", "content", "description", "value", "title", "subtitle", "property_value_name"]) {
      if (typeof record[key] === "string") {
        push(String(record[key]));
      }
    }

    for (const [key, nested] of Object.entries(record)) {
      if (/url|image|avatar|logo|icon/i.test(key)) {
        continue;
      }
      if (typeof nested === "object") {
        visit(nested);
        if (snippets.length >= limit) {
          break;
        }
      }
    }
  };

  if (typeof input === "string") {
    const parsed = safeJsonParse(input);
    visit(parsed ?? input);
  } else {
    visit(input);
  }

  return snippets;
}

function sanitizeFileSegment(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function inferExtension(url: string, contentType?: string | null) {
  if (contentType) {
    if (contentType.includes("image/jpeg")) return "jpg";
    if (contentType.includes("image/png")) return "png";
    if (contentType.includes("image/webp")) return "webp";
    if (contentType.includes("image/gif")) return "gif";
    if (contentType.includes("image/avif")) return "avif";
  }

  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace(/^\./, "").toLowerCase();
    if (ext) return ext;
  } catch {
    // ignore
  }

  return "jpg";
}

async function localizeTikTokImages(productId: string, imageUrls: string[]) {
  const normalizedProductId =
    sanitizeFileSegment(productId) || createHash("sha1").update(productId).digest("hex").slice(0, 12);
  const targetDir = path.join(getImportStorageRoot(), "tiktok", normalizedProductId);
  await fs.mkdir(targetDir, { recursive: true });

  const localized: string[] = [];

  for (const [index, imageUrl] of imageUrls.entries()) {
    try {
      const response = await fetch(imageUrl, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        throw new Error(`图片下载失败: HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const extension = inferExtension(imageUrl, contentType);
      const fileName = `${String(index + 1).padStart(2, "0")}.${extension}`;
      const absoluteFilePath = path.join(targetDir, fileName);
      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(absoluteFilePath, Buffer.from(arrayBuffer));
      localized.push(buildImportMediaUrl(`tiktok/${normalizedProductId}/${fileName}`));
    } catch {
      localized.push(imageUrl);
    }
  }

  return localized;
}

function humanizeSpecLabel(label: string) {
  return label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (token) => token.toUpperCase());
}

function labelZh(label: string) {
  return TIKTOK_SPEC_LABEL_ZH_MAP[label] ?? label;
}

function shouldSkipSpec(label: string, value: string) {
  if (!label || !value || value.length > 180) {
    return true;
  }

  if (looksLikeUrl(value)) {
    return true;
  }

  return false;
}

function getPageComponents(page: Record<string, unknown>) {
  const pageConfig = getNestedRecord(page, "page_config");
  const components = pageConfig?.components_map;
  return Array.isArray(components) ? components.filter(isRecord) : [];
}

function findComponentData(page: Record<string, unknown>, predicate: (component: Record<string, unknown>) => boolean) {
  for (const component of getPageComponents(page)) {
    if (!predicate(component)) {
      continue;
    }

    const componentData = component.component_data;
    if (isRecord(componentData)) {
      return componentData;
    }
  }

  return undefined;
}

function describePageComponents(page: Record<string, unknown>) {
  return getPageComponents(page)
    .map((component) => {
      const type = toText(component.component_type) ?? "unknown-type";
      const name = toText(component.component_name) ?? "unknown-name";
      const componentData = isRecord(component.component_data) ? component.component_data : undefined;
      const hasProducts = Array.isArray(componentData?.products);
      return `${type}:${name}${hasProducts ? "[products]" : ""}`;
    })
    .join(", ");
}

function extractSearchProductsComponent(page: Record<string, unknown>) {
  const components = getPageComponents(page);

  const preferred = components.find((component) => {
    const componentData = isRecord(component.component_data) ? component.component_data : undefined;
    return component.component_name === "feed_list_search_word" && Array.isArray(componentData?.products);
  });

  if (preferred && isRecord(preferred.component_data)) {
    return preferred.component_data;
  }

  const fallback = components.find((component) => {
    const componentData = isRecord(component.component_data) ? component.component_data : undefined;
    if (!Array.isArray(componentData?.products)) {
      return false;
    }

    return componentData.products.some((item) => isRecord(item) && typeof item.product_id === "string");
  });

  if (fallback && isRecord(fallback.component_data)) {
    return fallback.component_data;
  }

  return undefined;
}

function extractModernRouterPage(html: string) {
  const match = html.match(/<script type="application\/json" id="__MODERN_ROUTER_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) {
    throw new Error("TikTok 页面中缺少 __MODERN_ROUTER_DATA__，无法提取结构化数据。");
  }

  const parsed = JSON.parse(match[1]) as { loaderData?: Record<string, unknown> };
  const loaderData = parsed.loaderData;
  if (!isRecord(loaderData)) {
    throw new Error("TikTok 页面缺少 loaderData 数据。");
  }

  const pageEntry = Object.entries(loaderData).find(([key, value]) => key !== "layout" && isRecord(value));
  if (!pageEntry || !isRecord(pageEntry[1])) {
    throw new Error("TikTok 页面中未找到有效的路由页面数据。");
  }

  return pageEntry[1];
}

function parseTikTokSearchPage(html: string): TikTokSearchPageData {
  const page = extractModernRouterPage(html);
  const componentData = extractSearchProductsComponent(page);

  if (!componentData) {
    const componentsSummary = describePageComponents(page);
    throw new Error(
      `TikTok 搜索页未找到可用的商品列表组件。当前页面组件：${componentsSummary || "无可识别组件"}`,
    );
  }

  const products = Array.isArray(componentData.products)
    ? componentData.products.filter(isRecord).map((item) => item as TikTokSearchProduct)
    : [];

  return {
    products,
    routeInfo: getNestedRecord(page, "route_info"),
  };
}

function parseTikTokProductPage(html: string): TikTokProductPageData {
  const page = extractModernRouterPage(html);
  const componentData = findComponentData(
    page,
    (component) => component.component_name === "product_info" || component.component_type === "product_info",
  );

  if (!componentData) {
    throw new Error("TikTok 商品页未返回 product_info 组件。");
  }

  const productInfo = getNestedRecord(componentData, "product_info");
  if (!productInfo) {
    throw new Error("TikTok 商品页缺少商品详情数据。");
  }

  return {
    productInfo: productInfo as TikTokProductInfoModel,
    shopInfo: getNestedRecord(componentData, "shop_info"),
    reviewsInfo: getNestedRecord(componentData, "reviews_info") as TikTokProductPageData["reviewsInfo"],
    hotReviews: Array.isArray(componentData.hot_reviews)
      ? componentData.hot_reviews.filter(isRecord).map((item) => item as TikTokReviewInfo)
      : [],
    categoryInfo: getNestedRecord(componentData, "category_info"),
    routeInfo: getNestedRecord(page, "route_info"),
  };
}

function compactTikTokProductPageData(input: TikTokProductPageData): TikTokProductPageData {
  const productModel = input.productInfo.product_model;

  return {
    productInfo: {
      product_model: productModel
        ? {
            product_id: productModel.product_id,
            seller_id: productModel.seller_id,
            sold_count: productModel.sold_count,
            name: productModel.name,
            images: productModel.images,
            sale_properties: productModel.sale_properties,
            product_properties: productModel.product_properties,
            skus: productModel.skus,
            videos: productModel.videos,
            biz_type: productModel.biz_type,
          }
        : undefined,
      logistic_model: input.productInfo.logistic_model,
      promotion_model: input.productInfo.promotion_model,
      review_model: input.productInfo.review_model,
      seller_model: input.productInfo.seller_model,
      safety_model: input.productInfo.safety_model,
      availability_model: input.productInfo.availability_model,
      base_resp: input.productInfo.base_resp,
    },
    shopInfo: input.shopInfo,
    reviewsInfo: input.reviewsInfo
      ? {
          total_reviews: input.reviewsInfo.total_reviews,
          product_reviews: (input.reviewsInfo.product_reviews ?? []).slice(0, 5),
          review_ratings: input.reviewsInfo.review_ratings,
          base_resp: input.reviewsInfo.base_resp,
        }
      : undefined,
    hotReviews: (input.hotReviews ?? []).slice(0, 5),
    categoryInfo: input.categoryInfo,
    routeInfo: input.routeInfo,
  };
}

function extractActivePrice(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  const promotionModel = productPage.productInfo.promotion_model;
  const promotionProductPrice = getNestedRecord(promotionModel, "promotion_product_price");
  const minPrice = getNestedRecord(promotionProductPrice, "min_price");
  const searchPrice = searchProduct.product_price_info;

  return {
    active:
      toNumber(minPrice?.single_product_price_decimal) ??
      toNumber(minPrice?.sale_price_decimal) ??
      toNumber(searchPrice?.single_product_price_decimal) ??
      toNumber(searchPrice?.sale_price_decimal),
    compareAt: toNumber(minPrice?.origin_price_decimal) ?? toNumber(searchPrice?.origin_price_decimal),
    currency:
      toText(minPrice?.currency_name) ??
      toText(searchPrice?.currency_name) ??
      toText(minPrice?.currency_symbol) ??
      toText(searchPrice?.currency_symbol) ??
      "USD",
  };
}

function getSearchSkuPrice(searchProduct: TikTokSearchProduct, skuId?: string) {
  if (!skuId) {
    return undefined;
  }

  const match = (searchProduct.sku_info ?? []).find((item) => item.SkuId === skuId);
  return toNumber(match?.PriceInfo?.single_product_price_decimal) ?? toNumber(match?.PriceInfo?.sale_price_decimal);
}

function extractSkuPrice(productPage: TikTokProductPageData, searchProduct: TikTokSearchProduct, skuId?: string) {
  const promotionModel = productPage.productInfo.promotion_model;
  const promotionProductPrice = getNestedRecord(promotionModel, "promotion_product_price");
  const skusPrice = getNestedRecord(promotionProductPrice, "skus_price");
  const matched = skuId ? getNestedRecord(skusPrice, skuId) : undefined;

  return (
    toNumber(matched?.single_product_price_decimal) ??
    toNumber(matched?.sale_price_decimal) ??
    getSearchSkuPrice(searchProduct, skuId)
  );
}

function extractReviewCount(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return (
    toInteger(productPage.productInfo.review_model?.product_review_count) ??
    toInteger(productPage.reviewsInfo?.total_reviews) ??
    toInteger(searchProduct.rate_info?.review_count)
  );
}

function extractRating(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return toNumber(productPage.productInfo.review_model?.product_overall_score) ?? toNumber(searchProduct.rate_info?.score);
}

function extractSoldCount(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return (
    toInteger(productPage.productInfo.product_model?.sold_count) ??
    toInteger(searchProduct.sold_info?.sold_count)
  );
}

function isOfficialShop(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  const labelTexts = dedupeStrings([
    toText(getNestedRecord(searchProduct.seller_info, "shop_identity_label")?.identity_label_text),
    toText(getNestedRecord(productPage.shopInfo, "shop_identity_label")?.identity_label_text),
  ]);

  return labelTexts.some((label) => /official/i.test(label));
}

function extractBusinessInfo(productPage: TikTokProductPageData) {
  const complianceInfo = getNestedRecord(productPage.productInfo.safety_model, "business_compliance_info");
  return {
    name: sanitizePublicText(toText(complianceInfo?.business_name)),
    address: sanitizePublicText(toText(complianceInfo?.business_address)),
  };
}

function extractDeliveryInfo(productPage: TikTokProductPageData): DeliveryInfo {
  const pkgOfService = getNestedRecord(productPage.productInfo.logistic_model, "pkg_of_service");
  if (!pkgOfService) {
    return {};
  }

  const first = Object.values(pkgOfService).find(isRecord);
  if (!first) {
    return {};
  }

  return {
    minDays: toInteger(first.delivery_min_bd_days ?? first.delivery_min_days),
    maxDays: toInteger(first.delivery_max_bd_days ?? first.delivery_max_days),
    shippingFee: toNumber(first.shipping_fee),
    currency: toText(first.currency) ?? "USD",
  };
}

function buildLeadTimeEn(delivery: DeliveryInfo) {
  if (delivery.minDays != null && delivery.maxDays != null) {
    return `Estimated delivery in ${delivery.minDays}-${delivery.maxDays} business days.`;
  }

  if (delivery.minDays != null) {
    return `Estimated delivery in about ${delivery.minDays} business days.`;
  }

  return "Lead time depends on the available shipping options and destination address.";
}

function buildLeadTimeZh(delivery: DeliveryInfo) {
  if (delivery.minDays != null && delivery.maxDays != null) {
    return `预计 ${delivery.minDays}-${delivery.maxDays} 个工作日送达。`;
  }

  if (delivery.minDays != null) {
    return `预计约 ${delivery.minDays} 个工作日送达。`;
  }

  return "交期会随可用物流方案和收货地区动态变化。";
}

function buildShippingNoteEn(input: {
  delivery: DeliveryInfo;
  shopName?: string;
  businessName?: string;
}) {
  const parts = dedupeStrings([
    input.delivery.shippingFee != null ? `Shipping fee from ${input.delivery.currency ?? "USD"} ${input.delivery.shippingFee.toFixed(2)}` : undefined,
    sanitizePublicText(input.shopName) ? `Seller: ${sanitizePublicText(input.shopName)}` : undefined,
    sanitizePublicText(input.businessName) ? `Business: ${sanitizePublicText(input.businessName)}` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" · ") : "Shipping availability depends on seller logistics and destination.";
}

function buildShippingNoteZh(input: {
  delivery: DeliveryInfo;
  shopName?: string;
  businessName?: string;
}) {
  const parts = dedupeStrings([
    input.delivery.shippingFee != null ? `运费约 ${input.delivery.currency ?? "USD"} ${input.delivery.shippingFee.toFixed(2)}` : undefined,
    sanitizePublicText(input.shopName) ? `店铺：${sanitizePublicText(input.shopName)}` : undefined,
    sanitizePublicText(input.businessName) ? `主体：${sanitizePublicText(input.businessName)}` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" · ") : "物流与发货时效会随卖家履约能力和收货地区变化。";
}

function extractPropertyPairs(properties: TikTokProperty[] | undefined) {
  const result: Array<{ label: string; value: string }> = [];

  for (const property of properties ?? []) {
    const label = sanitizePublicText(humanizeSpecLabel(toText(property.property_name) ?? "")) ?? "";
    const hidden = property.property_label?.hide_c_side_property === true;
    const legalOnly = property.property_label?.legal_property === true;
    const value = dedupeStrings((property.property_values ?? []).map((item) => sanitizePublicText(toText(item.property_value_name)))).join(" / ");

    if (!label || !value || hidden || legalOnly || shouldSkipSpec(label, value)) {
      continue;
    }

    result.push({ label, value });
  }

  return result;
}

function buildSpecs(input: {
  productPage: TikTokProductPageData;
  searchProduct: TikTokSearchProduct;
  shopName?: string;
  shopRating?: number;
  soldCount?: number;
  reviewCount?: number;
  officialShop: boolean;
  delivery: DeliveryInfo;
  businessName?: string;
  businessAddress?: string;
}) {
  const baseSpecs = [
    ...(input.shopName ? [{ label: "Shop", value: input.shopName }] : []),
    ...(input.shopRating != null ? [{ label: "Shop Rating", value: input.shopRating.toFixed(1) }] : []),
    ...(input.officialShop ? [{ label: "Official Shop", value: "Yes" }] : []),
    ...(input.soldCount != null ? [{ label: "Sold", value: String(input.soldCount) }] : []),
    ...(input.reviewCount != null ? [{ label: "Reviews", value: String(input.reviewCount) }] : []),
    ...(input.delivery.minDays != null || input.delivery.maxDays != null
      ? [
          {
            label: "Delivery",
            value:
              input.delivery.minDays != null && input.delivery.maxDays != null
                ? `${input.delivery.minDays}-${input.delivery.maxDays} business days`
                : `${input.delivery.minDays ?? input.delivery.maxDays} business days`,
          },
        ]
      : []),
    ...(input.delivery.shippingFee != null
      ? [{ label: "Shipping Fee", value: `${input.delivery.currency ?? "USD"} ${input.delivery.shippingFee.toFixed(2)}` }]
      : []),
    ...(input.businessName ? [{ label: "Business Name", value: input.businessName }] : []),
    ...(input.businessAddress ? [{ label: "Business Address", value: input.businessAddress }] : []),
    ...(toText(input.searchProduct.seller_info?.seller_id) ? [{ label: "Seller ID", value: String(input.searchProduct.seller_info?.seller_id) }] : []),
  ];

  const saleProperties = extractPropertyPairs(input.productPage.productInfo.product_model?.sale_properties);
  const productProperties = extractPropertyPairs(input.productPage.productInfo.product_model?.product_properties);

  const seen = new Set<string>();
  const specs: AdminProductPayload["specs"] = [];

  for (const item of [...baseSpecs, ...saleProperties, ...productProperties]) {
    const label = sanitizePublicText(item.label)?.trim() ?? "";
    const value = sanitizePublicText(item.value)?.trim() ?? "";
    if (shouldSkipSpec(label, value)) {
      continue;
    }

    const key = `${label}::${value}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    specs.push({
      labelEn: label,
      labelZh: labelZh(label),
      valueEn: value,
      valueZh: value,
    });
  }

  return specs.slice(0, 24);
}

function extractCanonicalUrl(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return toText(searchProduct.seo_url?.canonical_url) ?? toText(productPage.routeInfo?.canonical_url);
}

function extractShopName(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return sanitizePublicText(
    toText(searchProduct.seller_info?.shop_name) ??
    toText(productPage.shopInfo?.shop_name) ??
    toText(productPage.productInfo.seller_model?.shop_name),
  );
}

function extractShopRating(searchProduct: TikTokSearchProduct, productPage: TikTokProductPageData) {
  return toNumber(searchProduct.seller_info?.shop_rating) ?? toNumber(productPage.shopInfo?.shop_rating);
}

function extractBrand(searchProduct: TikTokSearchProduct) {
  return sanitizePublicText(toText(searchProduct.brand_info?.brand_name));
}

function cleanImportedTitle(input: string) {
  return sanitizePublicText(input)?.replace(/\s+/g, " ").trim() ?? "";
}

function cleanTikTokReviews(input: TikTokReviewInfo[] | undefined) {
  return (input ?? [])
    .map(
      (review): CleanedReviewItem => ({
        id: toText(review.review_id),
        author: sanitizePublicText(toText(review.reviewer_name)) ?? "Customer",
        content: sanitizePublicText(toText(review.review_text)) ?? "",
        rating: toNumber(review.review_rating),
        sku: sanitizePublicText(toText(review.sku_specification)),
        country: sanitizePublicText(toText(review.review_country)),
      }),
    )
    .filter((review) => Boolean(review.content));
}

function formatCompactCount(value?: number) {
  if (value == null) {
    return undefined;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  }
  return String(value);
}

function buildSubtitleEn(input: {
  shopName?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  officialShop: boolean;
}) {
  const parts = dedupeStrings([
    input.brand,
    input.shopName,
    input.officialShop ? "Official Shop" : undefined,
    input.rating ? `${input.rating.toFixed(1)}★` : undefined,
    input.reviewCount ? `${formatCompactCount(input.reviewCount)} reviews` : undefined,
    input.soldCount ? `${formatCompactCount(input.soldCount)} sold` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" • ") : undefined;
}

function buildSubtitleZh(input: {
  shopName?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  officialShop: boolean;
}) {
  const parts = dedupeStrings([
    input.brand,
    input.shopName,
    input.officialShop ? "官方店铺" : undefined,
    input.rating ? `评分 ${input.rating.toFixed(1)}` : undefined,
    input.reviewCount ? `${formatCompactCount(input.reviewCount)} 条评论` : undefined,
    input.soldCount ? `${formatCompactCount(input.soldCount)} 已售` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function buildDescriptionEn(input: {
  shopName?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  properties: Array<{ label: string; value: string }>;
  reviews: CleanedReviewItem[];
  productModel?: TikTokProductModel;
}) {
  const sections: string[] = [];

  const overview = dedupeStrings([
    input.shopName ? `Sold by ${input.shopName}.` : undefined,
    input.rating != null ? `Average rating ${input.rating.toFixed(1)}/5.` : undefined,
    input.reviewCount != null ? `${input.reviewCount} reviews recorded.` : undefined,
    input.soldCount != null ? `${input.soldCount} units sold in the latest listing snapshot.` : undefined,
  ]).join(" ");
  if (overview) {
    sections.push(overview);
  }

  const keyProperties = input.properties.slice(0, 6);
  if (keyProperties.length > 0) {
    sections.push(`Key product details:\n${keyProperties.map((item) => `• ${item.label}: ${item.value}`).join("\n")}`);
  }

  const snippets = extractTextSnippets(input.productModel, 3);
  if (snippets.length > 0) {
    sections.push(snippets.join("\n\n"));
  }

  const reviewHighlights = input.reviews.slice(0, 2).map((review) => `• ${review.content}`);
  if (reviewHighlights.length > 0) {
    sections.push(`Review highlights:\n${reviewHighlights.join("\n")}`);
  }

  return sections.join("\n\n").trim();
}

function buildDescriptionZh(input: {
  shopName?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  properties: Array<{ label: string; value: string }>;
  reviews: CleanedReviewItem[];
  productModel?: TikTokProductModel;
}) {
  const sections: string[] = [];

  const overview = dedupeStrings([
    input.shopName ? `店铺：${input.shopName}` : undefined,
    input.rating != null ? `平均评分 ${input.rating.toFixed(1)}/5` : undefined,
    input.reviewCount != null ? `累计评论 ${input.reviewCount}` : undefined,
    input.soldCount != null ? `当前列表已售 ${input.soldCount}` : undefined,
  ]).join(" · ");
  if (overview) {
    sections.push(overview);
  }

  const keyProperties = input.properties.slice(0, 6);
  if (keyProperties.length > 0) {
    sections.push(`核心规格：\n${keyProperties.map((item) => `• ${item.label}: ${item.value}`).join("\n")}`);
  }

  const snippets = extractTextSnippets(input.productModel, 3);
  if (snippets.length > 0) {
    sections.push(snippets.join("\n\n"));
  }

  const reviewHighlights = input.reviews.slice(0, 2).map((review) => `• ${review.content}`);
  if (reviewHighlights.length > 0) {
    sections.push(`买家评论摘录：\n${reviewHighlights.join("\n")}`);
  }

  return sections.join("\n\n").trim() || "建议补充更完整的中文卖点后再正式发布。";
}

function buildStoryEn(input: {
  query: string;
  shopName?: string;
  officialShop: boolean;
  soldCount?: number;
}) {
  const query = sanitizePublicText(input.query);
  return dedupeStrings([
    query ? `Shortlisted from the latest “${query}” marketplace results for the current catalog.` : "Shortlisted from the latest marketplace results for the current catalog.",
    input.shopName ? `Current seller: ${input.shopName}.` : undefined,
    input.officialShop ? "The seller is tagged as an official store." : undefined,
    input.soldCount != null ? `The latest listing snapshot shows about ${input.soldCount} units sold.` : undefined,
  ]).join(" ");
}

function buildStoryZh(input: {
  query: string;
  shopName?: string;
  officialShop: boolean;
  soldCount?: number;
}) {
  const query = sanitizePublicText(input.query);
  return dedupeStrings([
    query ? `该商品收录自最新一批“${query}”选品结果。` : "该商品收录自最新一批选品结果。",
    input.shopName ? `当前店铺：${input.shopName}。` : undefined,
    input.officialShop ? "该店铺带有官方店铺标识。" : undefined,
    input.soldCount != null ? `最新列表快照显示销量约为 ${input.soldCount}。` : undefined,
  ]).join(" ");
}

function buildVariantLabel(sku: TikTokSku) {
  const propertyLabel = dedupeStrings(
    (sku.property_pairs ?? []).map((pair) => {
      const key = sanitizePublicText(toText(pair.sku_property_name));
      const value = sanitizePublicText(toText(pair.sku_property_value_name));
      if (key && value) {
        return `${key}: ${value}`;
      }
      return value ?? key;
    }),
  ).join(" / ");

  return sanitizePublicText(propertyLabel)?.replace(/\s+/g, " ").trim() || "Default";
}

function buildVariants(input: {
  searchProduct: TikTokSearchProduct;
  productPage: TikTokProductPageData;
  defaultPrice?: number;
}) {
  const skus = input.productPage.productInfo.product_model?.skus ?? [];
  if (skus.length === 0) {
    return [
      {
        labelEn: "Default",
        labelZh: "默认规格",
        price: input.defaultPrice,
        inventory: undefined,
      },
    ];
  }

  return skus.slice(0, 12).map((sku) => {
    const label = buildVariantLabel(sku);
    return {
      labelEn: label,
      labelZh: label,
      price: extractSkuPrice(input.productPage, input.searchProduct, sku.sku_id) ?? input.defaultPrice,
      inventory: toInteger(sku.sku_quantity?.available_quantity),
    };
  });
}

function computeImportScore(input: {
  rank: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  officialShop: boolean;
  hasLocalizedImages: boolean;
  hasPrice: boolean;
}) {
  let score = Math.max(0, 40 - input.rank);
  if (input.rating) {
    score += input.rating * 12;
  }
  if (input.reviewCount) {
    score += Math.min(25, Math.log10(input.reviewCount + 1) * 10);
  }
  if (input.soldCount) {
    score += Math.min(25, Math.log10(input.soldCount + 1) * 8);
  }
  if (input.officialShop) {
    score += 8;
  }
  if (input.hasLocalizedImages) {
    score += 5;
  }
  if (input.hasPrice) {
    score += 8;
  }
  return Number(score.toFixed(2));
}

function isLocalizedImportImageUrl(url: string) {
  return (
    url.startsWith("/api/media/imports/marketplace/") ||
    url.startsWith("/imports/marketplace/") ||
    url.startsWith("/api/media/imports/tiktok/") ||
    url.startsWith("/imports/tiktok/")
  );
}

function evaluateAgainstFilters(input: {
  config: TikTokImportRequest;
  price?: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  officialShop: boolean;
}) {
  const reasons: string[] = [];

  if (input.config.onlyOfficialShop && !input.officialShop) {
    reasons.push("未通过官方店铺过滤");
  }
  if (input.config.minPrice != null && input.price != null && input.price < input.config.minPrice) {
    reasons.push(`价格 ${input.price} 低于最低阈值 ${input.config.minPrice}`);
  }
  if (input.config.maxPrice != null && input.price != null && input.price > input.config.maxPrice) {
    reasons.push(`价格 ${input.price} 高于最高阈值 ${input.config.maxPrice}`);
  }
  if (input.config.minRating != null && input.rating != null && input.rating < input.config.minRating) {
    reasons.push(`评分 ${input.rating} 低于阈值 ${input.config.minRating}`);
  }
  if (input.config.minReviews != null && input.reviewCount != null && input.reviewCount < input.config.minReviews) {
    reasons.push(`评论数 ${input.reviewCount} 低于阈值 ${input.config.minReviews}`);
  }
  if (input.config.minSold != null && input.soldCount != null && input.soldCount < input.config.minSold) {
    reasons.push(`销量 ${input.soldCount} 低于阈值 ${input.config.minSold}`);
  }

  return {
    approved: reasons.length === 0,
    reasons,
  } satisfies ImportEvaluation;
}

function buildSourcePayload(input: {
  config: TikTokImportRequest;
  candidate: TikTokSearchProduct;
  productPage: TikTokProductPageData;
  productId: string;
  position: number;
  price?: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  shopName?: string;
  shopRating?: number;
  officialShop: boolean;
  businessName?: string;
  businessAddress?: string;
  imageUrls: string[];
  reviews: CleanedReviewItem[];
}) {
  const customTags = sanitizePublicTags((input.config.customTagText ?? "").split(","));

  return {
    source: "tiktok-import",
    sku: `IMP-${input.productId}`,
    reviewSummary:
      input.rating != null && input.reviewCount != null
        ? {
            rating: input.rating,
            count: input.reviewCount,
          }
        : undefined,
    reviews: input.reviews,
    importConfig: {
      query: input.config.query,
      country: input.config.country,
      targetCount: input.config.targetCount,
      candidatePoolSize: input.config.candidatePoolSize,
      minPrice: input.config.minPrice,
      maxPrice: input.config.maxPrice,
      minRating: input.config.minRating,
      minReviews: input.config.minReviews,
      minSold: input.config.minSold,
      onlyOfficialShop: input.config.onlyOfficialShop,
      downloadImages: input.config.downloadImages,
      featuredTopN: input.config.featuredTopN,
      customTags,
    },
    upstream: {
      provider: "oxylabs-tiktok-shop",
      productId: input.productId,
      query: input.config.query,
      country: input.config.country,
      canonicalUrl: extractCanonicalUrl(input.candidate, input.productPage),
      sellerId: toText(input.candidate.seller_info?.seller_id) ?? toText(input.productPage.shopInfo?.seller_id),
      sellerName: input.shopName,
      rank: input.position,
      officialShop: input.officialShop,
    },
    sellerSnapshot: {
      shopName: input.shopName,
      shopRating: input.shopRating,
      officialShop: input.officialShop,
      businessName: input.businessName,
      businessAddress: input.businessAddress,
      shopLink: toText(input.candidate.seller_info?.shop_link) ?? toText(input.productPage.shopInfo?.shop_link),
    },
    pricingSnapshot: {
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      soldCount: input.soldCount,
    },
    images: input.imageUrls,
    updatedAt: new Date().toISOString(),
  } satisfies SourcePayloadRecord;
}

async function buildNormalizedTikTokImportItem(input: {
  config: TikTokImportRequest;
  candidate: TikTokSearchProduct;
  productPage: TikTokProductPageData;
  position: number;
  rawPayload?: SourcePayloadRecord;
}): Promise<NormalizedImportItem | null> {
  const productId = toText(input.candidate.product_id) ?? toText(input.productPage.productInfo.product_model?.product_id);
  if (!productId) {
    return null;
  }

  const productModel = input.productPage.productInfo.product_model;
  const rawTitle = toText(productModel?.name) ?? toText(input.candidate.title) ?? `Imported item ${productId}`;
  const title = cleanImportedTitle(rawTitle) || `Imported item ${productId}`;
  const brand = extractBrand(input.candidate);
  const shopName = extractShopName(input.candidate, input.productPage);
  const shopRating = extractShopRating(input.candidate, input.productPage);
  const rating = extractRating(input.candidate, input.productPage);
  const reviewCount = extractReviewCount(input.candidate, input.productPage);
  const soldCount = extractSoldCount(input.candidate, input.productPage);
  const officialShop = isOfficialShop(input.candidate, input.productPage);
  const { active, compareAt } = extractActivePrice(input.candidate, input.productPage);
  const delivery = extractDeliveryInfo(input.productPage);
  const business = extractBusinessInfo(input.productPage);
  const reviews = cleanTikTokReviews([
    ...(input.productPage.reviewsInfo?.product_reviews ?? []),
    ...(input.productPage.hotReviews ?? []),
  ]);
  const propertyPairs = [
    ...extractPropertyPairs(productModel?.sale_properties),
    ...extractPropertyPairs(productModel?.product_properties),
  ];

  const evaluation = evaluateAgainstFilters({
    config: input.config,
    price: active,
    rating,
    reviewCount,
    soldCount,
    officialShop,
  });

  const remoteImages = dedupeStrings([
    ...collectImageUrls(productModel?.images),
    ...collectImageUrls(input.candidate.image),
  ]).slice(0, MAX_IMAGE_COUNT);
  const imageUrls = input.config.downloadImages ? await localizeTikTokImages(productId, remoteImages) : remoteImages;
  const coverImage = imageUrls[0] ?? remoteImages[0];
  const galleryImages = imageUrls.slice(1).map((url, index) => ({
    url,
    altEn: `${title} image ${index + 2}`,
    altZh: `${title} 图片 ${index + 2}`,
  }));

  const specs = buildSpecs({
    productPage: input.productPage,
    searchProduct: input.candidate,
    shopName,
    shopRating,
    soldCount,
    reviewCount,
    officialShop,
    delivery,
    businessName: business.name,
    businessAddress: business.address,
  });

  const payload = adminProductPayloadSchema.parse({
    slug: uniqueSlug(title, productId),
    categoryId: input.config.localCategoryId,
    status: input.config.autoPublish ? "PUBLISHED" : "DRAFT",
    nameEn: title,
    nameZh: title,
    subtitleEn: buildSubtitleEn({
      shopName,
      brand,
      rating,
      reviewCount,
      soldCount,
      officialShop,
    }),
    subtitleZh: buildSubtitleZh({
      shopName,
      brand,
      rating,
      reviewCount,
      soldCount,
      officialShop,
    }),
    descriptionEn: buildDescriptionEn({
      shopName,
      rating,
      reviewCount,
      soldCount,
      properties: propertyPairs,
      reviews,
      productModel,
    }),
    descriptionZh: buildDescriptionZh({
      shopName,
      rating,
      reviewCount,
      soldCount,
      properties: propertyPairs,
      reviews,
      productModel,
    }),
    storyEn: buildStoryEn({
      query: input.config.query,
      shopName,
      officialShop,
      soldCount,
    }),
    storyZh: buildStoryZh({
      query: input.config.query,
      shopName,
      officialShop,
      soldCount,
    }),
    leadTimeEn: buildLeadTimeEn(delivery),
    leadTimeZh: buildLeadTimeZh(delivery),
    shippingNoteEn: buildShippingNoteEn({
      delivery,
      shopName,
      businessName: business.name,
    }),
    shippingNoteZh: buildShippingNoteZh({
      delivery,
      shopName,
      businessName: business.name,
    }),
    imageUrl: coverImage,
    galleryImages,
    price: active ?? 0,
    compareAtPrice: compareAt && active && compareAt > active ? compareAt : undefined,
    featured: input.position <= input.config.featuredTopN,
    isNew: true,
    tags: sanitizePublicTags([
      input.config.query,
      officialShop ? "official-shop" : undefined,
      brand,
      shopName,
      ...(input.config.customTagText ?? "").split(","),
    ]),
    variants: buildVariants({
      searchProduct: input.candidate,
      productPage: input.productPage,
      defaultPrice: active,
    }),
    specs,
    sourcePayload: buildSourcePayload({
      config: input.config,
      candidate: input.candidate,
      productPage: input.productPage,
      productId,
      position: input.position,
      price: active,
      compareAtPrice: compareAt,
      rating,
      reviewCount,
      soldCount,
      shopName,
      shopRating,
      officialShop,
      businessName: business.name,
      businessAddress: business.address,
      imageUrls,
      reviews,
    }),
  });

  const score = computeImportScore({
    rank: input.position,
    rating,
    reviewCount,
    soldCount,
    officialShop,
    hasLocalizedImages: imageUrls.some((url) => isLocalizedImportImageUrl(url)),
    hasPrice: typeof active === "number" && active > 0,
  });

  return {
    productId,
    payload,
    score,
    evaluation: {
      approved: evaluation.approved && typeof active === "number" && active > 0 && Boolean(coverImage),
      reasons: [
        ...evaluation.reasons,
        ...(typeof active === "number" && active > 0 ? [] : ["缺少有效价格"]),
        ...(coverImage ? [] : ["缺少有效主图"]),
      ],
    },
    rawPayload:
      input.rawPayload ??
      ({
        source: "tiktok-import",
        searchProduct: input.candidate,
        productPage: input.productPage,
      } satisfies SourcePayloadRecord),
  };
}

async function normalizeCandidate(input: {
  config: TikTokImportRequest;
  candidate: TikTokSearchProduct;
  position: number;
}): Promise<NormalizedImportItem | null> {
  const productId = toText(input.candidate.product_id);
  if (!productId) {
    return null;
  }

  const detailResponse = await fetchTikTokShopProductHtml({ productId });
  const parsedPage = compactTikTokProductPageData(parseTikTokProductPage(detailResponse.first.content));

  return buildNormalizedTikTokImportItem({
    config: input.config,
    candidate: input.candidate,
    productPage: parsedPage,
    position: input.position,
    rawPayload: {
      source: "tiktok-import",
      searchProduct: input.candidate,
      productPage: parsedPage,
    },
  });
}

export async function renormalizeStoredTikTokImportItem(input: {
  rawPayload: Prisma.JsonValue;
  normalizedData: Prisma.JsonValue;
}) {
  const payload = adminProductPayloadSchema.parse(input.normalizedData);
  const rawRecord = input.rawPayload as Record<string, unknown> | null;

  if (!rawRecord || rawRecord.source !== "tiktok-import") {
    return null;
  }

  const searchProduct = rawRecord.searchProduct as TikTokSearchProduct | undefined;
  const productPage = rawRecord.productPage as TikTokProductPageData | undefined;
  if (!searchProduct || !productPage) {
    return null;
  }

  const sourcePayload =
    payload.sourcePayload && typeof payload.sourcePayload === "object" && !Array.isArray(payload.sourcePayload)
      ? (payload.sourcePayload as Record<string, unknown>)
      : {};
  const importConfig =
    sourcePayload.importConfig && typeof sourcePayload.importConfig === "object" && !Array.isArray(sourcePayload.importConfig)
      ? (sourcePayload.importConfig as Record<string, unknown>)
      : {};
  const upstream =
    sourcePayload.upstream && typeof sourcePayload.upstream === "object" && !Array.isArray(sourcePayload.upstream)
      ? (sourcePayload.upstream as Record<string, unknown>)
      : {};
  const customTags = Array.isArray(importConfig.customTags)
    ? importConfig.customTags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const config = tiktokImportRequestSchema.parse({
    country: typeof importConfig.country === "string" ? importConfig.country : "com",
    query: typeof importConfig.query === "string" ? importConfig.query : typeof upstream.query === "string" ? upstream.query : "legacy",
    localCategoryId: payload.categoryId,
    targetCount: 1,
    candidatePoolSize: 1,
    minPrice: typeof importConfig.minPrice === "number" ? importConfig.minPrice : undefined,
    maxPrice: typeof importConfig.maxPrice === "number" ? importConfig.maxPrice : undefined,
    minRating: typeof importConfig.minRating === "number" ? importConfig.minRating : undefined,
    minReviews: typeof importConfig.minReviews === "number" ? importConfig.minReviews : undefined,
    minSold: typeof importConfig.minSold === "number" ? importConfig.minSold : undefined,
    onlyOfficialShop: importConfig.onlyOfficialShop === true,
    autoPublish: true,
    downloadImages: importConfig.downloadImages !== false,
    featuredTopN: typeof importConfig.featuredTopN === "number" ? importConfig.featuredTopN : 3,
    customTagText: customTags.join(","),
  });

  const position = typeof upstream.rank === "number" ? upstream.rank : 1;

  return buildNormalizedTikTokImportItem({
    config,
    candidate: searchProduct,
    productPage,
    position,
    rawPayload: rawRecord as SourcePayloadRecord,
  });
}

async function collectSearchCandidates(config: TikTokImportRequest, options: TikTokImportOptions = {}) {
  const response = await fetchTikTokShopSearchHtml({
    query: config.query,
    country: config.country,
  });

  const parsed = parseTikTokSearchPage(response.first.content);
  const candidates = parsed.products.slice(0, config.candidatePoolSize);

  await emitProgress(options.onProgress, {
    phase: "fetching_search",
    percent: 18,
    current: Math.min(candidates.length, config.candidatePoolSize),
    total: config.candidatePoolSize,
    candidateCount: candidates.length,
    detail: `Fetched TikTok Shop search results for “${config.query}”.`,
  });

  return candidates;
}

function buildBatchName(config: TikTokImportRequest) {
  return config.jobName?.trim() || `tiktok-shop-${config.country}-${slugify(config.query)}-${new Date().toISOString()}`;
}

function buildReviewNotes(normalized: NormalizedImportItem) {
  const reasons = normalized.evaluation.reasons;
  const statusText = normalized.evaluation.approved ? "APPROVED" : "REJECTED";
  return `${statusText} · score=${normalized.score}${reasons.length > 0 ? ` · ${reasons.join("；")}` : ""}`;
}

export async function importTikTokShopBatch(rawInput: unknown, options: TikTokImportOptions = {}): Promise<TikTokImportExecutionResult> {
  const config = tiktokImportRequestSchema.parse(rawInput);
  const batchName = buildBatchName(config);

  await emitProgress(options.onProgress, {
    phase: "initializing",
    percent: 2,
    detail: "Validated TikTok Shop import configuration and preparing task.",
  });

  const candidates = await collectSearchCandidates(config, options);

  if (candidates.length === 0) {
    throw new Error("未抓到 TikTok Shop 搜索结果，请检查关键词、站点参数或 Oxylabs 凭证。");
  }

  await emitProgress(options.onProgress, {
    phase: "processing_candidates",
    percent: 20,
    current: 0,
    total: candidates.length,
    approvedCount: 0,
    rejectedCount: 0,
    candidateCount: candidates.length,
    detail: `Collected ${candidates.length} TikTok Shop candidates. Starting detail enrichment.`,
  });

  const records: Array<{
    sourceId: string;
    status: ImportItemStatus;
    rawPayload: Prisma.InputJsonValue;
    normalizedData?: Prisma.InputJsonValue;
    reviewNotes: string;
  }> = [];

  let approvedCount = 0;
  let processedCount = 0;

  for (const [index, candidate] of candidates.entries()) {
    const productId = toText(candidate.product_id);
    if (!productId) {
      continue;
    }

    if (approvedCount >= config.targetCount) {
      break;
    }

    try {
      const normalized = await normalizeCandidate({
        config,
        candidate,
        position: index + 1,
      });
      if (!normalized) {
        continue;
      }

      const approved = normalized.evaluation.approved && approvedCount < config.targetCount;
      records.push({
        sourceId: productId,
        status: approved ? ImportItemStatus.APPROVED : ImportItemStatus.REJECTED,
        rawPayload: JSON.parse(JSON.stringify(normalized.rawPayload)) as Prisma.InputJsonValue,
        normalizedData: JSON.parse(JSON.stringify(normalized.payload)) as Prisma.InputJsonValue,
        reviewNotes: buildReviewNotes(normalized),
      });

      if (approved) {
        approvedCount += 1;
      }
    } catch (error) {
      records.push({
        sourceId: productId,
        status: ImportItemStatus.REJECTED,
        rawPayload: JSON.parse(
          JSON.stringify({
            source: "tiktok-import",
            searchProduct: candidate,
            error: error instanceof Error ? error.message : "unknown error",
          }),
        ) as Prisma.InputJsonValue,
        reviewNotes: `REJECTED · ${error instanceof Error ? error.message : "unknown error"}`,
      });
    } finally {
      processedCount += 1;
      await emitProgress(options.onProgress, {
        phase: "processing_candidates",
        percent: 20 + (processedCount / candidates.length) * 65,
        current: processedCount,
        total: candidates.length,
        approvedCount,
        rejectedCount: records.length - approvedCount,
        candidateCount: candidates.length,
        currentProductId: productId,
        currentTitle: toText(candidate.title),
        detail: `Processed TikTok candidate ${processedCount}/${candidates.length}.`,
      });
    }
  }

  if (records.length === 0) {
    throw new Error("抓取完成但没有生成任何可导入记录，请检查筛选条件是否过严。");
  }

  await emitProgress(options.onProgress, {
    phase: "saving_batch",
    percent: 90,
    current: records.length,
    total: records.length,
    approvedCount,
    rejectedCount: records.length - approvedCount,
    candidateCount: candidates.length,
    detail: "Saving TikTok import batch into database.",
  });

  const batch = await prisma.importBatch.create({
    data: {
      name: batchName,
      source: `tiktok-shop-search:${config.country}:${config.query}`,
      status: config.autoPublish ? "READY_TO_PUBLISH" : "IMPORTED",
      totalItems: records.length,
      items: {
        create: records,
      },
    },
    select: {
      id: true,
      name: true,
      source: true,
    },
  });

  await emitProgress(options.onProgress, {
    phase: config.autoPublish ? "publishing_batch" : "saving_batch",
    percent: config.autoPublish ? 95 : 97,
    batchId: batch.id,
    current: records.length,
    total: records.length,
    approvedCount,
    rejectedCount: records.length - approvedCount,
    candidateCount: candidates.length,
    detail: config.autoPublish ? "Batch saved, starting auto publish." : "Batch saved successfully.",
  });

  let publishedCount = 0;
  if (config.autoPublish && approvedCount > 0) {
    await emitProgress(options.onProgress, {
      phase: "publishing_batch",
      percent: 97,
      batchId: batch.id,
      approvedCount,
      rejectedCount: records.length - approvedCount,
      candidateCount: candidates.length,
      detail: "Publishing imported TikTok items into catalog.",
    });
    const publishResult = await publishImportBatch(batch.id);
    publishedCount = publishResult.publishedCount;
  }

  const result = {
    batchId: batch.id,
    batchName: batch.name,
    source: batch.source ?? "tiktok-shop-search",
    totalItems: records.length,
    approvedCount,
    rejectedCount: records.length - approvedCount,
    publishedCount,
    autoPublish: config.autoPublish,
  };

  await emitProgress(options.onProgress, {
    phase: "completed",
    percent: 100,
    batchId: result.batchId,
    current: result.totalItems,
    total: result.totalItems,
    approvedCount: result.approvedCount,
    rejectedCount: result.rejectedCount,
    candidateCount: candidates.length,
    publishedCount: result.publishedCount,
    detail: "TikTok import task completed.",
  });

  return result;
}

export async function runScheduledTikTokImports(rawInput: unknown) {
  const parsed = tiktokImportCronRequestSchema.parse(rawInput);
  const results: TikTokImportExecutionResult[] = [];

  for (const job of parsed.jobs) {
    results.push(await importTikTokShopBatch(job));
  }

  return { results };
}
