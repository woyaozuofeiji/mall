import "server-only";

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ImportItemStatus, type Prisma } from "@prisma/client";
import { buildImportMediaUrl, getImportStorageRoot } from "@/lib/import-media";
import { prisma } from "@/lib/prisma";
import { publishImportBatch } from "@/lib/imports";
import {
  fetchAmazonBestsellersPage,
  fetchAmazonPricing,
  fetchAmazonProduct,
  type AmazonBestsellersContent,
  type AmazonBestsellersItem,
  type AmazonPricingContent,
  type AmazonProductContent,
} from "@/lib/oxylabs";
import { adminProductPayloadSchema, type AdminProductPayload } from "@/lib/validation/admin";
import { amazonImportCronRequestSchema, amazonImportRequestSchema, type AmazonImportRequest } from "@/lib/validation/imports";

const SPEC_LABEL_ZH_MAP: Record<string, string> = {
  Brand: "品牌",
  Manufacturer: "制造商",
  Material: "材质",
  Color: "颜色",
  Size: "尺寸",
  Style: "款式",
  Theme: "主题",
  Gem: "宝石",
  Clasp: "扣型",
  Chain: "链型",
  Model: "型号",
  "Model Number": "型号",
  ASIN: "ASIN",
  Category: "分类",
  Delivery: "配送",
  Stock: "库存",
  Reviews: "评论数",
  Rating: "评分",
  Rank: "榜单排名",
  Seller: "卖家",
  Offers: "报价数",
  Variant: "规格",
  Prime: "Prime",
  Dimensions: "尺寸",
  "Product Dimensions": "商品尺寸",
  "Country of Origin": "原产地",
  Department: "适用人群",
};

const MAX_IMAGE_COUNT = 8;

type SourcePayloadRecord = Record<string, unknown>;

type ImportEvaluation = {
  approved: boolean;
  reasons: string[];
};

type NormalizedImportItem = {
  asin: string;
  payload: AdminProductPayload;
  score: number;
  evaluation: ImportEvaluation;
  rawPayload: SourcePayloadRecord;
};

export interface AmazonImportExecutionResult {
  batchId: string;
  batchName: string;
  source: string;
  totalItems: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  autoPublish: boolean;
}

export type AmazonImportProgressPhase =
  | "initializing"
  | "fetching_bestsellers"
  | "processing_candidates"
  | "saving_batch"
  | "publishing_batch"
  | "completed";

export interface AmazonImportProgressEvent {
  phase: AmazonImportProgressPhase;
  percent: number;
  current?: number;
  total?: number;
  approvedCount?: number;
  rejectedCount?: number;
  candidateCount?: number;
  batchId?: string;
  publishedCount?: number;
  currentAsin?: string;
  currentTitle?: string;
  detail?: string;
}

interface AmazonImportOptions {
  onProgress?: (event: AmazonImportProgressEvent) => void | Promise<void>;
}

async function emitProgress(callback: AmazonImportOptions["onProgress"], event: AmazonImportProgressEvent) {
  if (!callback) {
    return;
  }

  await callback({
    ...event,
    percent: Math.max(0, Math.min(100, Math.round(event.percent))),
  });
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

function uniqueSlug(title: string, asin: string) {
  const base = slugify(title) || `amazon-item-${asin.toLowerCase()}`;
  return `${base}-${asin.toLowerCase()}`.slice(0, 96);
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

function normalizePrime(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "1", "prime"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
  }
  return undefined;
}

const TITLE_NOISE_PATTERNS = [
  /\b(mothers?\s*day|mother'?s\s*day|birthday|anniversary|christmas|thanksgiving|valentine'?s?\s*day)\b/gi,
  /\b(gifts?\s+for\s+(mom|dad|women|woman|men|man|wife|husband|daughter|son|friend|her|him))\b/gi,
  /\b(trendy|fashion accessories?|must[- ]have|summer must have|vacation essentials?)\b/gi,
  /\b(pack\s+jewelry|stack\s+jewelry|gift\s+ideas?)\b/gi,
];

const DESCRIPTION_NOISE_PATTERNS = [
  /after\s+sales\s+service/i,
  /amazon-compliant/i,
  /please feel free to contact us/i,
  /our commitment to providing/i,
  /we take great pride/i,
  /without breaking the bank/i,
  /best choice you can make/i,
  /everyone deserves/i,
  /thoughtful gift for her/i,
  /premium fashion accessories/i,
];

const SPEC_KEY_BLOCKLIST = new Set([
  "asin",
  "asin_in_url",
  "seller_id",
  "seller_link",
  "seller_url",
  "link",
  "url",
  "date_first_available",
  "best_sellers_rank",
  "parse_status_code",
  "review_count",
  "reviews_count",
  "rating_count",
  "department",
  "page_type",
  "page",
  "currency",
  "price",
  "price_buybox",
  "price_shipping",
  "price_upper",
  "price_per_unit",
]);

type FeaturedMerchantInfo = {
  sellerName?: string;
  shippedFrom?: string;
  isAmazonFulfilled?: boolean;
};

type CleanedReviewItem = {
  id?: string;
  title?: string;
  author: string;
  content: string;
  rating: number;
  date?: string;
  verified?: boolean;
};

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, " ").replace(/\s*([,;:])\s*/g, "$1 ").trim();
}

function trimToLength(input: string, maxLength = 120) {
  if (input.length <= maxLength) {
    return input;
  }

  const sliced = input.slice(0, maxLength);
  const boundary = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf(","), sliced.lastIndexOf("-"));
  return `${sliced.slice(0, boundary > 40 ? boundary : maxLength).trim()}…`;
}

function dedupeWords(input: string) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const token of input.split(/\s+/)) {
    const normalized = token.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized) continue;
    if (normalized.length > 3 && seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(token);
  }

  return result.join(" ");
}

function cleanImportedTitle(title: string, fallbackBrand?: string) {
  let cleaned = normalizeWhitespace(title.replace(/[|/]+/g, " "));
  for (const pattern of TITLE_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  cleaned = dedupeWords(cleaned.replace(/\s+/g, " ").trim());
  if (!cleaned) {
    cleaned = fallbackBrand ? `${fallbackBrand} Amazon import item` : title;
  }

  return trimToLength(cleaned, 110);
}

function sanitizeCopyLine(input: string) {
  return normalizeWhitespace(
    input
      .replace(/^[•\-–—\s]+/, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
}

function isNoiseCopyLine(input: string) {
  const normalized = input.trim();
  if (!normalized) return true;
  if (normalized.length < 8) return true;
  if (/^[,.:;/-]+$/.test(normalized)) return true;
  return DESCRIPTION_NOISE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function splitRichText(input: string) {
  return input
    .replace(/\r/g, "\n")
    .replace(/[\u2022•]+/g, "\n")
    .replace(/(?=【)/g, "\n")
    .split(/\n+/)
    .map((line) => sanitizeCopyLine(line))
    .filter(Boolean);
}

function extractBulletItems(input: unknown) {
  const rawItems = Array.isArray(input)
    ? input.flatMap((item) => splitRichText(toText(item) ?? ""))
    : splitRichText(toText(input) ?? "");

  return dedupeStrings(
    rawItems
      .map((line) => line.replace(/^【([^】]+)】/, "$1: "))
      .filter((line) => !isNoiseCopyLine(line))
      .map((line) => trimToLength(line, 190)),
  ).slice(0, 5);
}

function extractDescriptionParagraphs(input: string | undefined, title: string) {
  if (!input) return [];

  const paragraphs = splitRichText(input)
    .map((line) => line.replace(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "").trim())
    .map((line) => sanitizeCopyLine(line))
    .filter((line) => !isNoiseCopyLine(line))
    .filter((line) => !/^(gold jewelry for women|premium fashion accessories|summer must have)$/i.test(line))
    .map((line) => trimToLength(line, 240));

  return dedupeStrings(paragraphs).slice(0, 2);
}

function extractCategoryPath(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  const ladder = input
    .flatMap((item) => (item && typeof item === "object" && Array.isArray((item as { ladder?: unknown[] }).ladder) ? (item as { ladder: unknown[] }).ladder : []))
    .map((entry) => (entry && typeof entry === "object" ? toText((entry as Record<string, unknown>).name) : undefined))
    .filter((value): value is string => Boolean(value));

  return dedupeStrings(ladder);
}

function extractSelectedVariationLabel(input: unknown) {
  if (!Array.isArray(input)) {
    return undefined;
  }

  const selected = input.find((item) => item && typeof item === "object" && Boolean((item as Record<string, unknown>).selected));
  if (!selected || typeof selected !== "object") {
    return undefined;
  }

  const dimensions = (selected as Record<string, unknown>).dimensions;
  if (!dimensions || typeof dimensions !== "object" || Array.isArray(dimensions)) {
    return undefined;
  }

  const values = Object.values(dimensions)
    .map((value) => toText(value))
    .filter((value): value is string => Boolean(value));

  return dedupeStrings(values).join(" / ") || undefined;
}

function extractDeliveryOptions(input: unknown) {
  if (!input) return [];

  if (Array.isArray(input)) {
    return dedupeStrings(
      input.flatMap((item) => {
        if (!item || typeof item !== "object") {
          return toText(item) ?? [];
        }

        const record = item as Record<string, unknown>;
        const type = toText(record.type);
        const date = record.date && typeof record.date === "object" ? toText((record.date as Record<string, unknown>).by) : undefined;
        const summary = dedupeStrings([
          type && date ? `${type} by ${date}` : undefined,
          type && !date ? type : undefined,
          !type && date ? `Delivery by ${date}` : undefined,
        ]).join(" · ");
        return summary ? [summary] : [];
      }),
    ).slice(0, 2);
  }

  const text = toText(input);
  return text ? [trimToLength(text, 140)] : [];
}

function extractFeaturedMerchantInfo(input: unknown): FeaturedMerchantInfo {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      sellerName: toText(input),
    };
  }

  const record = input as Record<string, unknown>;
  return {
    sellerName: toText(record.name),
    shippedFrom: toText(record.shipped_from),
    isAmazonFulfilled: typeof record.is_amazon_fulfilled === "boolean" ? record.is_amazon_fulfilled : undefined,
  };
}

function cleanReviewDate(value: string) {
  return value
    .replace(/^Reviewed in .*? on /i, "")
    .replace(/^Reviewed in .*? /i, "")
    .trim();
}

function extractCleanReviews(input: unknown): CleanedReviewItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((review) => review && typeof review === "object")
    .map((review) => {
      const record = review as Record<string, unknown>;
      const title = toText(record.title);
      const content = toText(record.content);
      const author = toText(record.author) ?? "Verified customer";
      const timestamp = toText(record.timestamp);
      const rating = toNumber(record.rating) ?? 5;

      return {
        id: toText(record.id),
        title: title ? trimToLength(title, 120) : undefined,
        author,
        content: content ? trimToLength(content, 360) : "",
        rating,
        date: timestamp ? cleanReviewDate(timestamp) : undefined,
        verified: Boolean(record.is_verified),
      } satisfies CleanedReviewItem;
    })
    .filter((review) => review.content && review.content.length >= 12)
    .slice(0, 6);
}

function humanizeSpecLabel(label: string) {
  const cleaned = label
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return label;
  }

  return cleaned
    .split(" ")
    .map((token) => (token.length <= 3 ? token.toUpperCase() : token.charAt(0).toUpperCase() + token.slice(1)))
    .join(" ");
}

function shouldSkipSpec(label: string, value: string) {
  const normalizedLabel = label.toLowerCase().replace(/\s+/g, "_");
  if (SPEC_KEY_BLOCKLIST.has(normalizedLabel)) {
    return true;
  }

  if (!value || value.length > 140) {
    return true;
  }

  if (/^https?:\/\//i.test(value) || value.includes("/gp/")) {
    return true;
  }

  return false;
}

function extractReviewCount(product: AmazonProductContent, candidate: AmazonBestsellersItem) {
  return toInteger(product.reviews_count) ?? toInteger(candidate.results_ratings_count);
}

function extractPrice(product: AmazonProductContent, pricing?: AmazonPricingContent, candidate?: AmazonBestsellersItem) {
  const pricingValues = (pricing?.pricing ?? [])
    .map((offer) => toNumber(offer.price))
    .filter((value): value is number => value != null);

  return {
    active:
      toNumber(product.price_buybox) ??
      toNumber(product.price) ??
      toNumber(candidate?.price) ??
      pricingValues[0],
    compareAt: toNumber(product.price_initial) ?? toNumber(product.price_strikethrough),
    shipping: toNumber(product.price_shipping),
    upper: toNumber(product.price_upper) ?? toNumber(candidate?.price_upper),
    currency: toText((pricing?.pricing ?? [])[0]?.currency) ?? toText(candidate?.currency) ?? "USD",
  };
}

function extractBestSellerRank(product: AmazonProductContent, candidate: AmazonBestsellersItem) {
  return toInteger(candidate.pos) ?? toInteger((product.sales_rank as Record<string, unknown> | undefined)?.rank);
}

function labelZh(label: string) {
  return SPEC_LABEL_ZH_MAP[label] ?? label;
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value);
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

function extractKeyValuePairs(input: unknown, prefix = ""): Array<{ label: string; value: string }> {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.flatMap((item) => extractKeyValuePairs(item, prefix));
  }

  if (typeof input !== "object") {
    const text = toText(input);
    return text ? [{ label: prefix || "Value", value: text }] : [];
  }

  const record = input as Record<string, unknown>;
  const labelCandidate =
    toText(record.label) ??
    toText(record.name) ??
    toText(record.key) ??
    toText(record.title) ??
    toText(record.attribute) ??
    toText(record.dimension);
  const valueCandidate =
    toText(record.value) ??
    toText(record.display_value) ??
    toText(record.text) ??
    toText(record.description) ??
    toText(record.content) ??
    toText(record.answer);

  if (labelCandidate && valueCandidate) {
    return [{ label: labelCandidate, value: valueCandidate }];
  }

  const result: Array<{ label: string; value: string }> = [];
  for (const [key, value] of Object.entries(record)) {
    if (key === "label" || key === "name" || key === "key" || key === "title" || key === "attribute" || key === "value" || key === "text" || key === "description" || key === "content") {
      continue;
    }

    if (value && typeof value === "object") {
      result.push(...extractKeyValuePairs(value, prefix ? `${prefix} ${key}` : key));
      continue;
    }

    const text = toText(value);
    if (!text) continue;
    result.push({
      label: prefix ? `${prefix} ${key}` : key,
      value: text,
    });
  }

  return result;
}

function stringifyJson(input: unknown) {
  return JSON.parse(JSON.stringify(input ?? null)) as Prisma.InputJsonValue;
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

async function localizeAmazonImages(asin: string, imageUrls: string[]) {
  const normalizedAsin = sanitizeFileSegment(asin) || createHash("sha1").update(asin).digest("hex").slice(0, 12);
  const targetDir = path.join(getImportStorageRoot(), "amazon", normalizedAsin);
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
      localized.push(buildImportMediaUrl(`amazon/${normalizedAsin}/${fileName}`));
    } catch {
      localized.push(imageUrl);
    }
  }

  return localized;
}

function buildSubtitleEn(input: {
  brand?: string;
  categoryLeaf?: string;
  variantLabel?: string;
  rank?: number;
  rating?: number;
  reviewCount?: number;
}) {
  const parts = dedupeStrings([
    input.brand,
    input.categoryLeaf,
    input.variantLabel,
    input.rating ? `${input.rating.toFixed(1)}★ rated` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" • ") : "Curated import item";
}

function buildSubtitleZh(input: { categoryLeaf?: string; variantLabel?: string; rank?: number; rating?: number; reviewCount?: number }) {
  const parts = dedupeStrings([
    input.categoryLeaf,
    input.variantLabel,
    input.rating ? `评分 ${input.rating.toFixed(1)}` : undefined,
  ]);

  return parts.length > 0 ? `精选商品 · ${parts.join(" · ")}` : "精选商品";
}

function buildLeadTimeEn(deliveryOptions: string[]) {
  if (deliveryOptions.length > 0) {
    return deliveryOptions[0];
  }

  return "Lead time depends on the current Amazon offer and destination ZIP code.";
}

function buildLeadTimeZh(deliveryOptions: string[]) {
  if (deliveryOptions.length > 0) {
    return `参考配送：${deliveryOptions[0]}`;
  }

  return "交期随当前 Amazon 报价和目标邮编动态变化，请发布前复核。";
}

function buildShippingNoteEn(input: {
  stock?: string;
  deliveryOptions: string[];
  pricingCount?: number;
  merchant?: FeaturedMerchantInfo;
}) {
  const parts = dedupeStrings([
    input.stock ? `Availability: ${input.stock}` : undefined,
    input.deliveryOptions[0],
    input.merchant?.sellerName ? `Verified seller: ${input.merchant.sellerName}` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" · ") : "Shipping and availability vary by active offer and destination.";
}

function buildShippingNoteZh(input: {
  stock?: string;
  deliveryOptions: string[];
  pricingCount?: number;
  merchant?: FeaturedMerchantInfo;
}) {
  const parts = dedupeStrings([
    input.stock ? `库存：${input.stock}` : undefined,
    input.deliveryOptions[0] ? `预计配送：${input.deliveryOptions[0]}` : undefined,
    input.merchant?.sellerName ? `认证卖家：${input.merchant.sellerName}` : undefined,
  ]);

  return parts.length > 0 ? parts.join(" · ") : "配送与库存会随当前报价和收货地区动态变化。";
}

function buildDescriptionEn(product: AmazonProductContent, cleanedTitle: string) {
  const bullets = extractBulletItems(product.bullet_points);
  const paragraphs = extractDescriptionParagraphs(toText(product.description), cleanedTitle);

  const sections: string[] = [];
  if (bullets.length > 0) {
    sections.push(bullets.map((item) => `• ${item}`).join("\n"));
  }
  if (paragraphs.length > 0) {
    sections.push(paragraphs.join("\n\n"));
  }

  return sections.join("\n\n");
}

function buildDescriptionZh(product: AmazonProductContent, cleanedTitle: string) {
  const bullets = extractBulletItems(product.bullet_points);
  const paragraphs = extractDescriptionParagraphs(toText(product.description), cleanedTitle);

  const sections: string[] = [];
  if (bullets.length > 0) {
    sections.push(`核心卖点：\n${bullets.map((item) => `• ${item}`).join("\n")}`);
  }
  if (paragraphs.length > 0) {
    sections.push(`补充说明：\n${paragraphs.join("\n")}`);
  }

  return sections.join("\n\n") || "该商品来自 Amazon 榜单采集，建议补充更完整的中文卖点后再正式投放。";
}

function buildStoryEn(input: { categoryPath: string[]; brand?: string; title: string; bullets: string[] }) {
  const categorySummary = input.categoryPath.slice(-2).join(" > ");
  const leadBullet = input.bullets[0];
  return dedupeStrings([
    input.brand ? `${input.brand} brings a refined take on ${input.title.toLowerCase()}.` : undefined,
    categorySummary ? `Styled within ${categorySummary}.` : undefined,
    leadBullet ? leadBullet : undefined,
  ]).join(" ");
}

function buildStoryZh(input: { categoryPath: string[]; brand?: string; title: string; bullets: string[] }) {
  const categorySummary = input.categoryPath.slice(-2).join(" > ");
  const leadBullet = input.bullets[0];
  return dedupeStrings([
    input.brand ? `${input.brand} 带来这款 ${input.title}。` : undefined,
    categorySummary ? `适合归入 ${categorySummary} 风格陈列。` : undefined,
    leadBullet ? leadBullet : undefined,
  ]).join(" ");
}

function buildSpecs(input: {
  asin: string;
  brand?: string;
  categoryPath: string[];
  rank?: number;
  rating?: number;
  reviewCount?: number;
  stock?: string;
  deliveryOptions: string[];
  merchant?: FeaturedMerchantInfo;
  variantLabel?: string;
  product: AmazonProductContent;
  pricing?: AmazonPricingContent;
}) {
  const baseSpecs = [
    ...(input.brand ? [{ label: "Brand", value: input.brand }] : []),
    ...(input.variantLabel ? [{ label: "Variant", value: input.variantLabel }] : []),
    ...(input.stock ? [{ label: "Availability", value: input.stock }] : []),
  ];

  const parsedSpecs = [
    ...extractKeyValuePairs(input.product.product_overview),
    ...extractKeyValuePairs(input.product.product_details),
    ...extractKeyValuePairs(input.product.product_dimensions),
  ];

  const seen = new Set<string>();
  const specs: AdminProductPayload["specs"] = [];

  for (const item of [...baseSpecs, ...parsedSpecs]) {
    const labelEn = humanizeSpecLabel(item.label.trim());
    const valueEn = item.value.trim();
    if (!labelEn || !valueEn || shouldSkipSpec(labelEn, valueEn)) continue;
    const key = `${labelEn}::${valueEn}`;
    if (seen.has(key)) continue;
    seen.add(key);
    specs.push({
      labelEn,
      labelZh: labelZh(labelEn),
      valueEn,
      valueZh: valueEn,
    });
  }

  return specs.slice(0, 24);
}

function buildDefaultVariant(title: string, price?: number, inventory?: number) {
  return [
    {
      labelEn: title,
      labelZh: `${title} 默认款`,
      price,
      inventory,
    },
  ];
}

function computeImportScore(input: {
  rank?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  hasLocalizedImages: boolean;
  hasPrice: boolean;
  offerCount?: number;
}) {
  let score = 0;
  if (input.rank) {
    score += Math.max(0, 60 - input.rank);
  }
  if (input.rating) {
    score += input.rating * 12;
  }
  if (input.reviewCount) {
    score += Math.min(30, Math.log10(input.reviewCount + 1) * 10);
  }
  if (input.isPrime) {
    score += 8;
  }
  if (input.hasLocalizedImages) {
    score += 5;
  }
  if (input.hasPrice) {
    score += 10;
  }
  if (input.offerCount) {
    score += Math.min(8, input.offerCount);
  }
  return Number(score.toFixed(2));
}

function isLocalizedImportImageUrl(url: string) {
  return url.startsWith("/api/media/imports/amazon/") || url.startsWith("/imports/amazon/");
}

function evaluateAgainstFilters(input: {
  config: AmazonImportRequest;
  price?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
}) {
  const reasons: string[] = [];

  if (input.config.onlyPrime && input.isPrime !== true) {
    reasons.push("未通过 Prime 过滤");
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

  return {
    approved: reasons.length === 0,
    reasons,
  } satisfies ImportEvaluation;
}

function buildSourcePayload(input: {
  asin: string;
  config: AmazonImportRequest;
  candidate: AmazonBestsellersItem;
  product: AmazonProductContent;
  pricing?: AmazonPricingContent;
  rank?: number;
  rating?: number;
  reviewCount?: number;
  availabilityStatus?: string;
  activePrice?: number;
  compareAtPrice?: number;
  featuredMerchant?: string;
  imageUrls: string[];
  reviews: CleanedReviewItem[];
}) {
  const customTags = dedupeStrings((input.config.customTagText ?? "").split(","));

  return {
    source: "amazon-import",
    sku: `AMZ-${input.asin}`,
    availabilityStatus: input.availabilityStatus,
    reviewSummary: input.rating && input.reviewCount
      ? {
          rating: input.rating,
          count: input.reviewCount,
        }
      : undefined,
    reviews: input.reviews,
    importConfig: {
      domain: input.config.domain,
      browseNodeId: input.config.browseNodeId,
      geoLocation: input.config.geoLocation,
      locale: input.config.locale,
      targetCount: input.config.targetCount,
      minPrice: input.config.minPrice,
      maxPrice: input.config.maxPrice,
      minRating: input.config.minRating,
      minReviews: input.config.minReviews,
      onlyPrime: input.config.onlyPrime,
      includePricing: input.config.includePricing,
      downloadImages: input.config.downloadImages,
      featuredTopN: input.config.featuredTopN,
      customTags,
    },
    upstream: {
      provider: "oxylabs-amazon",
      asin: input.asin,
      domain: input.config.domain,
      browseNodeId: input.config.browseNodeId,
      url: toText(input.product.url) ?? toText(input.candidate.url),
      rank: input.rank,
      featuredMerchant: input.featuredMerchant,
    },
    pricingSnapshot: {
      price: input.activePrice,
      compareAtPrice: input.compareAtPrice,
      offers: input.pricing?.pricing?.length ?? 0,
    },
    images: input.imageUrls,
    raw: {
      candidate: input.candidate,
      product: input.product,
      pricing: input.pricing,
    },
    updatedAt: new Date().toISOString(),
  } satisfies SourcePayloadRecord;
}

async function buildNormalizedAmazonImportItem(input: {
  config: AmazonImportRequest;
  candidate: AmazonBestsellersItem;
  product: AmazonProductContent;
  pricing?: AmazonPricingContent;
  rawPayload?: SourcePayloadRecord;
}): Promise<NormalizedImportItem | null> {
  const asin = toText(input.candidate.asin);
  if (!asin) {
    return null;
  }

  const product = input.product;
  const pricing = input.pricing;

  const rawTitle =
    toText(product.product_name) ??
    toText(product.title) ??
    toText(input.candidate.title) ??
    `Amazon item ${asin}`;
  const title = cleanImportedTitle(rawTitle, toText(product.brand));
  const cleanedBullets = extractBulletItems(product.bullet_points);
  const cleanedReviews = extractCleanReviews((product as Record<string, unknown>).reviews);
  const categoryPath = extractCategoryPath(product.category);
  const categoryLeaf = categoryPath.at(-1);
  const variantLabel = extractSelectedVariationLabel(product.variation);
  const rank = extractBestSellerRank(product, input.candidate);
  const rating = toNumber(product.rating) ?? toNumber(input.candidate.rating);
  const reviewCount = extractReviewCount(product, input.candidate);
  const isPrime = normalizePrime(product.is_prime_eligible) ?? normalizePrime(input.candidate.is_prime);
  const merchant = extractFeaturedMerchantInfo(product.featured_merchant);
  const deliveryOptions = extractDeliveryOptions(product.delivery);
  const stockText = toText(product.stock);
  const { active, compareAt } = extractPrice(product, pricing, input.candidate);
  const pricingCount = toInteger(product.pricing_count) ?? pricing?.pricing?.length;

  const evaluation = evaluateAgainstFilters({
    config: input.config,
    price: active,
    rating,
    reviewCount,
    isPrime,
  });

  const remoteImages = collectImageUrls(product.images);
  const imageUrls = input.config.downloadImages ? await localizeAmazonImages(asin, remoteImages) : remoteImages;
  const coverImage = imageUrls[0] ?? remoteImages[0];
  const galleryImages = imageUrls.slice(1).map((url, index) => ({
    url,
    altEn: `${title} image ${index + 2}`,
    altZh: `${title} 图片 ${index + 2}`,
  }));

  const specs = buildSpecs({
    asin,
    brand: toText(product.brand),
    categoryPath,
    rank,
    rating,
    reviewCount,
    stock: stockText,
    deliveryOptions,
    merchant,
    variantLabel,
    product,
    pricing,
  });

  const payload = adminProductPayloadSchema.parse({
    slug: uniqueSlug(title, asin),
    categoryId: input.config.localCategoryId,
    status: input.config.autoPublish ? "PUBLISHED" : "DRAFT",
    nameEn: title,
    nameZh: title,
    subtitleEn: buildSubtitleEn({
      brand: toText(product.brand),
      categoryLeaf,
      variantLabel,
      rank,
      rating,
      reviewCount,
    }),
    subtitleZh: buildSubtitleZh({ categoryLeaf, variantLabel, rank, rating, reviewCount }),
    descriptionEn: buildDescriptionEn(product, title),
    descriptionZh: buildDescriptionZh(product, title),
    storyEn: buildStoryEn({ categoryPath, brand: toText(product.brand), title, bullets: cleanedBullets }),
    storyZh: buildStoryZh({ categoryPath, brand: toText(product.brand), title, bullets: cleanedBullets }),
    leadTimeEn: buildLeadTimeEn(deliveryOptions),
    leadTimeZh: buildLeadTimeZh(deliveryOptions),
    shippingNoteEn: buildShippingNoteEn({
      stock: stockText,
      deliveryOptions,
      pricingCount,
      merchant,
    }),
    shippingNoteZh: buildShippingNoteZh({
      stock: stockText,
      deliveryOptions,
      pricingCount,
      merchant,
    }),
    imageUrl: coverImage,
    galleryImages,
    price: active ?? 0,
    compareAtPrice: compareAt && active && compareAt > active ? compareAt : undefined,
    featured: typeof rank === "number" && rank <= input.config.featuredTopN,
    isNew: true,
    tags: dedupeStrings([
      "amazon",
      "oxylabs",
      "bestseller",
      input.config.domain,
      isPrime ? "prime" : undefined,
      toText(product.brand),
      ...categoryPath.slice(-2),
      ...(input.config.customTagText ?? "").split(","),
    ]),
    variants: buildDefaultVariant(variantLabel ?? categoryLeaf ?? title, active, toInteger(product.max_quantity) ?? 20),
    specs,
    sourcePayload: buildSourcePayload({
      asin,
      config: input.config,
      candidate: input.candidate,
      product,
      pricing,
      rank,
      rating,
      reviewCount,
      availabilityStatus: stockText,
      activePrice: active,
      compareAtPrice: compareAt,
      featuredMerchant: merchant.sellerName,
      imageUrls,
      reviews: cleanedReviews,
    }),
  });

  const score = computeImportScore({
    rank,
    rating,
    reviewCount,
    isPrime,
    hasLocalizedImages: imageUrls.some((url) => isLocalizedImportImageUrl(url)),
    hasPrice: typeof active === "number" && active > 0,
    offerCount: pricing?.pricing?.length,
  });

  return {
    asin,
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
        source: "amazon-import",
        candidate: input.candidate,
        product,
        pricing,
      } satisfies SourcePayloadRecord),
  };
}

async function normalizeCandidate(input: {
  config: AmazonImportRequest;
  candidate: AmazonBestsellersItem;
}): Promise<NormalizedImportItem | null> {
  const asin = toText(input.candidate.asin);
  if (!asin) {
    return null;
  }

  const productResponse = await fetchAmazonProduct({
    asin,
    domain: input.config.domain,
    geoLocation: input.config.geoLocation,
    locale: input.config.locale,
    autoselectVariant: true,
  });

  const pricingResponse = input.config.includePricing
    ? await fetchAmazonPricing({
        asin,
        domain: input.config.domain,
        geoLocation: input.config.geoLocation,
        locale: input.config.locale,
      })
    : undefined;

  return buildNormalizedAmazonImportItem({
    config: input.config,
    candidate: input.candidate,
    product: productResponse.first.content,
    pricing: pricingResponse?.first.content,
    rawPayload: {
      source: "amazon-import",
      candidate: input.candidate,
      product: productResponse.first.content,
      pricing: pricingResponse?.first.content,
    },
  });
}

export async function renormalizeStoredAmazonImportItem(input: {
  rawPayload: Prisma.JsonValue;
  normalizedData: Prisma.JsonValue;
}) {
  const payload = adminProductPayloadSchema.parse(input.normalizedData);
  const rawRecord = input.rawPayload as Record<string, unknown> | null;

  if (!rawRecord || rawRecord.source !== "amazon-import") {
    return null;
  }

  const candidate = rawRecord.candidate as AmazonBestsellersItem | undefined;
  const product = rawRecord.product as AmazonProductContent | undefined;
  const pricing = rawRecord.pricing as AmazonPricingContent | undefined;
  if (!candidate || !product) {
    return null;
  }

  const sourcePayload = payload.sourcePayload && typeof payload.sourcePayload === "object" && !Array.isArray(payload.sourcePayload)
    ? (payload.sourcePayload as Record<string, unknown>)
    : {};
  const importConfig = sourcePayload.importConfig && typeof sourcePayload.importConfig === "object" && !Array.isArray(sourcePayload.importConfig)
    ? (sourcePayload.importConfig as Record<string, unknown>)
    : {};
  const customTags = Array.isArray(importConfig.customTags)
    ? importConfig.customTags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const config = amazonImportRequestSchema.parse({
    domain: typeof importConfig.domain === "string" ? importConfig.domain : "com",
    browseNodeId:
      (typeof importConfig.browseNodeId === "string" ? importConfig.browseNodeId : undefined) ??
      (sourcePayload.upstream && typeof sourcePayload.upstream === "object" && !Array.isArray(sourcePayload.upstream) && typeof (sourcePayload.upstream as Record<string, unknown>).browseNodeId === "string"
        ? String((sourcePayload.upstream as Record<string, unknown>).browseNodeId)
        : "legacy"),
    localCategoryId: payload.categoryId,
    geoLocation: typeof importConfig.geoLocation === "string" ? importConfig.geoLocation : undefined,
    locale: typeof importConfig.locale === "string" ? importConfig.locale : undefined,
    targetCount: 1,
    candidatePoolSize: 1,
    maxPages: 1,
    minPrice: typeof importConfig.minPrice === "number" ? importConfig.minPrice : undefined,
    maxPrice: typeof importConfig.maxPrice === "number" ? importConfig.maxPrice : undefined,
    minRating: typeof importConfig.minRating === "number" ? importConfig.minRating : undefined,
    minReviews: typeof importConfig.minReviews === "number" ? importConfig.minReviews : undefined,
    onlyPrime: importConfig.onlyPrime === true,
    autoPublish: true,
    includePricing: importConfig.includePricing !== false && Boolean(pricing),
    downloadImages: importConfig.downloadImages !== false,
    featuredTopN: typeof importConfig.featuredTopN === "number" ? importConfig.featuredTopN : 3,
    customTagText: customTags.join(","),
  });

  return buildNormalizedAmazonImportItem({
    config,
    candidate,
    product,
    pricing,
    rawPayload: rawRecord as SourcePayloadRecord,
  });
}

async function collectBestsellerCandidates(config: AmazonImportRequest, options: AmazonImportOptions = {}) {
  const collected: AmazonBestsellersItem[] = [];
  const seenAsins = new Set<string>();

  for (let page = 1; page <= config.maxPages; page += 1) {
    const response = await fetchAmazonBestsellersPage({
      browseNodeId: config.browseNodeId,
      domain: config.domain,
      geoLocation: config.geoLocation,
      locale: config.locale,
      startPage: page,
    });

    const pageItems = ((response.first.content as AmazonBestsellersContent).results ?? []).filter(Boolean);
    for (const item of pageItems) {
      const asin = toText(item.asin);
      if (!asin || seenAsins.has(asin)) continue;
      seenAsins.add(asin);
      collected.push(item);
      if (collected.length >= config.candidatePoolSize) {
        await emitProgress(options.onProgress, {
          phase: "fetching_bestsellers",
          percent: 20,
          current: page,
          total: config.maxPages,
          candidateCount: collected.length,
          detail: `Candidate pool reached ${collected.length} items.`,
        });
        return collected;
      }
    }

    await emitProgress(options.onProgress, {
      phase: "fetching_bestsellers",
      percent: 5 + (page / config.maxPages) * 15,
      current: page,
      total: config.maxPages,
      candidateCount: collected.length,
      detail: `Fetched bestseller page ${page}/${config.maxPages}.`,
    });
  }

  return collected;
}

function buildBatchName(config: AmazonImportRequest) {
  return config.jobName?.trim() || `amazon-bestsellers-${config.domain}-${config.browseNodeId}-${new Date().toISOString()}`;
}

function buildReviewNotes(normalized: NormalizedImportItem) {
  const reasons = normalized.evaluation.reasons;
  const statusText = normalized.evaluation.approved ? "APPROVED" : "REJECTED";
  return `${statusText} · score=${normalized.score}${reasons.length > 0 ? ` · ${reasons.join("；")}` : ""}`;
}

export async function importAmazonBestsellersBatch(rawInput: unknown, options: AmazonImportOptions = {}): Promise<AmazonImportExecutionResult> {
  const config = amazonImportRequestSchema.parse(rawInput);
  const batchName = buildBatchName(config);
  await emitProgress(options.onProgress, {
    phase: "initializing",
    percent: 2,
    detail: "Validated import configuration and preparing task.",
  });
  const candidates = await collectBestsellerCandidates(config, options);

  if (candidates.length === 0) {
    throw new Error("未抓到 Amazon 畅销榜候选商品，请检查类目 Node ID、站点或 Oxylabs 凭证。");
  }

  await emitProgress(options.onProgress, {
    phase: "processing_candidates",
    percent: 20,
    current: 0,
    total: candidates.length,
    approvedCount: 0,
    rejectedCount: 0,
    candidateCount: candidates.length,
    detail: `Collected ${candidates.length} candidate items. Starting detail enrichment.`,
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

  for (const candidate of candidates) {
    const asin = toText(candidate.asin);
    if (!asin) {
      continue;
    }

    if (approvedCount >= config.targetCount) {
      break;
    }

    try {
      const normalized = await normalizeCandidate({ config, candidate });
      if (!normalized) {
        continue;
      }

      const approved = normalized.evaluation.approved && approvedCount < config.targetCount;
      records.push({
        sourceId: asin,
        status: approved ? ImportItemStatus.APPROVED : ImportItemStatus.REJECTED,
        rawPayload: stringifyJson(normalized.rawPayload),
        normalizedData: stringifyJson(normalized.payload),
        reviewNotes: buildReviewNotes(normalized),
      });

      if (approved) {
        approvedCount += 1;
      }
    } catch (error) {
      records.push({
        sourceId: asin,
        status: ImportItemStatus.REJECTED,
        rawPayload: stringifyJson({
          source: "amazon-import",
          candidate,
          error: error instanceof Error ? error.message : "unknown error",
        }),
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
        currentAsin: asin,
        currentTitle: toText(candidate.title),
        detail: `Processed candidate ${processedCount}/${candidates.length}.`,
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
    detail: "Saving import batch into database.",
  });

  const batch = await prisma.importBatch.create({
    data: {
      name: batchName,
      source: `amazon-bestsellers:${config.domain}:${config.browseNodeId}`,
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
      detail: "Publishing imported items into catalog.",
    });
    const publishResult = await publishImportBatch(batch.id);
    publishedCount = publishResult.publishedCount;
  }

  const result = {
    batchId: batch.id,
    batchName: batch.name,
    source: batch.source ?? "amazon-bestsellers",
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
    detail: "Import task completed.",
  });

  return result;
}

export async function runScheduledAmazonImports(rawInput: unknown) {
  const parsed = amazonImportCronRequestSchema.parse(rawInput);
  const results: AmazonImportExecutionResult[] = [];

  for (const job of parsed.jobs) {
    results.push(await importAmazonBestsellersBatch(job));
  }

  return { results };
}
