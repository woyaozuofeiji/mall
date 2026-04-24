import "server-only";

const OXYLABS_REALTIME_URL = process.env.OXYLABS_REALTIME_URL ?? "https://realtime.oxylabs.io/v1/queries";

type OxylabsContextItem = {
  key: string;
  value: string | number | boolean | Array<string | number | boolean>;
};

export interface OxylabsRealtimeResult<TContent> {
  content: TContent;
  created_at?: string;
  updated_at?: string;
  page?: number;
  url?: string;
  job_id?: string;
  status_code?: number;
  parse_status_code?: number;
}

interface OxylabsRealtimeResponse<TContent> {
  results?: Array<OxylabsRealtimeResult<TContent>>;
  error?: string;
  message?: string;
}

interface OxylabsRealtimeRequest {
  source: string;
  query?: string;
  product_id?: string;
  domain?: string;
  country?: string;
  geo_location?: string;
  locale?: string;
  start_page?: number;
  pages?: number;
  parse?: boolean;
  render?: "html" | "png" | "jpeg";
  context?: OxylabsContextItem[];
}

interface OxylabsRequestOptions {
  timeoutMs?: number;
}

export interface AmazonBestsellersItem {
  pos?: number;
  url?: string;
  asin?: string;
  price?: number | string;
  title?: string;
  rating?: number | string;
  currency?: string;
  is_prime?: boolean;
  price_str?: string;
  price_upper?: number | string;
  results_ratings_count?: number | string;
  [key: string]: unknown;
}

export interface AmazonBestsellersContent {
  query?: string;
  results?: AmazonBestsellersItem[];
  [key: string]: unknown;
}

export interface AmazonPricingOffer {
  price?: number | string;
  seller?: string;
  currency?: string;
  delivery?: string;
  condition?: string;
  seller_id?: string;
  seller_link?: string;
  rating_count?: number | string;
  price_shipping?: number | string;
  delivery_options?: unknown[];
  [key: string]: unknown;
}

export interface AmazonPricingContent {
  asin?: string;
  pricing?: AmazonPricingOffer[];
  [key: string]: unknown;
}

export interface AmazonProductContent {
  asin?: string;
  title?: string;
  product_name?: string;
  brand?: string;
  description?: string;
  bullet_points?: string[] | string;
  category?: unknown;
  variation?: unknown;
  rating?: number | string;
  price?: number | string;
  price_upper?: number | string;
  price_initial?: number | string;
  price_shipping?: number | string;
  price_buybox?: number | string;
  is_prime_eligible?: boolean;
  stock?: string;
  reviews_count?: number | string;
  answered_questions_count?: number | string;
  pricing_count?: number | string;
  pricing_url?: string;
  featured_merchant?: unknown;
  sales_rank?: unknown;
  images?: unknown;
  product_overview?: unknown;
  has_videos?: boolean;
  delivery?: unknown;
  rating_stars_distribution?: unknown;
  product_details?: unknown;
  product_dimensions?: unknown;
  coupon?: string;
  sales_volume?: string;
  price_strikethrough?: number | string;
  max_quantity?: number | string;
  url?: string;
  [key: string]: unknown;
}

function getOxylabsCredentials() {
  const username = process.env.OXYLABS_USERNAME?.trim();
  const password = process.env.OXYLABS_PASSWORD?.trim();

  if (!username || !password) {
    throw new Error("缺少 Oxylabs 凭证，请在 .env 中设置 OXYLABS_USERNAME 和 OXYLABS_PASSWORD。");
  }

  return { username, password };
}

async function oxylabsRequest<TContent>(payload: OxylabsRealtimeRequest, options: OxylabsRequestOptions = {}) {
  const { username, password } = getOxylabsCredentials();
  const authorization = Buffer.from(`${username}:${password}`).toString("base64");
  const timeoutMs = options.timeoutMs ?? 60_000;

  let response: Response;
  try {
    response = await fetch(OXYLABS_REALTIME_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || /aborted due to timeout/i.test(error.message))) {
      throw new Error(`Oxylabs 请求超时（${Math.round(timeoutMs / 1000)} 秒）`);
    }
    throw error;
  }

  const rawText = await response.text();
  const data = rawText ? (JSON.parse(rawText) as OxylabsRealtimeResponse<TContent>) : {};

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? `Oxylabs 请求失败，HTTP ${response.status}`);
  }

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error("Oxylabs 未返回可用结果。");
  }

  const first = data.results[0];
  if ((first.status_code ?? 200) >= 400) {
    throw new Error(`Oxylabs 返回状态异常：${first.status_code}`);
  }
  if (first.parse_status_code && first.parse_status_code >= 400) {
    throw new Error(`Oxylabs 解析失败：${first.parse_status_code}`);
  }

  return {
    response: data,
    first,
  };
}

export async function fetchAmazonBestsellersPage(input: {
  browseNodeId: string;
  domain?: string;
  geoLocation?: string;
  locale?: string;
  startPage?: number;
}) {
  return oxylabsRequest<AmazonBestsellersContent>({
    source: "amazon_bestsellers",
    query: input.browseNodeId,
    domain: input.domain,
    geo_location: input.geoLocation,
    locale: input.locale,
    start_page: input.startPage,
    parse: true,
  });
}

export async function fetchAmazonProduct(input: {
  asin: string;
  domain?: string;
  geoLocation?: string;
  locale?: string;
  autoselectVariant?: boolean;
}) {
  return oxylabsRequest<AmazonProductContent>({
    source: "amazon_product",
    query: input.asin,
    domain: input.domain,
    geo_location: input.geoLocation,
    locale: input.locale,
    parse: true,
    context: input.autoselectVariant
      ? [
          {
            key: "autoselect_variant",
            value: true,
          },
        ]
      : undefined,
  });
}

export async function fetchAmazonPricing(input: {
  asin: string;
  domain?: string;
  geoLocation?: string;
  locale?: string;
}) {
  return oxylabsRequest<AmazonPricingContent>({
    source: "amazon_pricing",
    query: input.asin,
    domain: input.domain,
    geo_location: input.geoLocation,
    locale: input.locale,
    parse: true,
  });
}

export async function fetchTikTokShopSearchHtml(input: {
  query: string;
  country?: string;
}) {
  return oxylabsRequest<string>(
    {
      source: "tiktok_shop_search",
      query: input.query,
      country: input.country,
      render: "html",
    },
    {
      timeoutMs: 120_000,
    },
  );
}

export async function fetchTikTokShopProductHtml(input: {
  productId: string;
}) {
  return oxylabsRequest<string>(
    {
      source: "tiktok_shop_product",
      product_id: input.productId,
    },
    {
      timeoutMs: 90_000,
    },
  );
}
