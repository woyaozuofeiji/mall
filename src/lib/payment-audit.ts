import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { OrderLookupResult } from "@/lib/orders";
import type { PaymentMethod } from "@/lib/payment-methods";
import type { SerializedCardAuditDetails } from "@/lib/payment-card-audit";

const DEFAULT_PAYMENT_AUDIT_LOG_PATH = join(process.cwd(), "storage", "audit", "payment-events.ndjson");
const PAYMENT_AUDIT_LOG_PATH = process.env.PAYMENT_AUDIT_LOG_PATH || DEFAULT_PAYMENT_AUDIT_LOG_PATH;

interface PaymentAuditPayload {
  order: string | null;
  email: string | null;
  method: PaymentMethod | null;
  locale?: "en" | "zh";
}

interface PaymentAuditResult {
  ok: boolean;
  statusCode: number;
  reason?: string | null;
  message?: string | null;
  beforeStatus?: string | null;
  afterStatus?: string | null;
}

interface AppendPaymentAuditEntryInput {
  request: Request;
  payload: PaymentAuditPayload;
  orderSnapshot: OrderLookupResult | null;
  cardAudit?: SerializedCardAuditDetails | null;
  result: PaymentAuditResult;
}

function normalizeHeaderValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getForwardedForChain(headerValue: string | null) {
  return (headerValue ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getForwardedHeaderChain(headerValue: string | null) {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((segment) => {
      const match = segment.match(/for=(?:"?\[?)([^;\]" ]+)/i);
      return match?.[1]?.replace(/^"+|"+$/g, "") ?? null;
    })
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim())
    .filter(Boolean);
}

function getClientIp(headers: Headers) {
  const forwardedForChain = getForwardedForChain(headers.get("x-forwarded-for"));
  const forwardedHeaderChain = getForwardedHeaderChain(headers.get("forwarded"));
  const xRealIp = normalizeHeaderValue(headers.get("x-real-ip"));
  const cfConnectingIp = normalizeHeaderValue(headers.get("cf-connecting-ip"));

  return cfConnectingIp ?? xRealIp ?? forwardedForChain[0] ?? forwardedHeaderChain[0] ?? null;
}

function buildOrderAuditSnapshot(orderSnapshot: OrderLookupResult | null) {
  if (!orderSnapshot) {
    return null;
  }

  return {
    orderNumber: orderSnapshot.orderNumber,
    status: orderSnapshot.status,
    email: orderSnapshot.email,
    createdAt: orderSnapshot.createdAt,
    subtotal: orderSnapshot.subtotal,
    totalAmount: orderSnapshot.totalAmount,
    note: orderSnapshot.note,
    trackingNumber: orderSnapshot.trackingNumber,
    carrier: orderSnapshot.carrier,
    customer: {
      fullName: orderSnapshot.customerName,
      email: orderSnapshot.email,
      phone: orderSnapshot.customerPhone,
    },
    shippingAddress: {
      country: orderSnapshot.country,
      region: orderSnapshot.region,
      city: orderSnapshot.city,
      address: orderSnapshot.address,
      postalCode: orderSnapshot.postalCode,
    },
    items: orderSnapshot.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
  };
}

async function appendPaymentAuditEntry({
  request,
  payload,
  orderSnapshot,
  cardAudit,
  result,
}: AppendPaymentAuditEntryInput) {
  const headers = request.headers;
  const entry = {
    schemaVersion: 1,
    eventId: crypto.randomUUID(),
    eventType: "payment_attempt",
    occurredAt: new Date().toISOString(),
    request: {
      method: request.method,
      url: request.url,
      locale: payload.locale ?? null,
      headers: {
        host: normalizeHeaderValue(headers.get("host")),
        origin: normalizeHeaderValue(headers.get("origin")),
        referer: normalizeHeaderValue(headers.get("referer")),
        userAgent: normalizeHeaderValue(headers.get("user-agent")),
        accept: normalizeHeaderValue(headers.get("accept")),
        acceptLanguage: normalizeHeaderValue(headers.get("accept-language")),
        xForwardedFor: normalizeHeaderValue(headers.get("x-forwarded-for")),
        xRealIp: normalizeHeaderValue(headers.get("x-real-ip")),
        forwarded: normalizeHeaderValue(headers.get("forwarded")),
        cfConnectingIp: normalizeHeaderValue(headers.get("cf-connecting-ip")),
      },
      network: {
        clientIp: getClientIp(headers),
        forwardedForChain: getForwardedForChain(headers.get("x-forwarded-for")),
        forwardedHeaderChain: getForwardedHeaderChain(headers.get("forwarded")),
      },
    },
    lookup: {
      orderNumber: payload.order,
      email: payload.email,
      method: payload.method,
    },
    order: buildOrderAuditSnapshot(orderSnapshot),
    card: cardAudit
      ? {
          cardholderName: cardAudit.cardholderName,
          brand: cardAudit.brand,
          last4: cardAudit.last4,
          bin: cardAudit.bin,
          maskedNumber: cardAudit.maskedNumber,
          fingerprintSha256: cardAudit.fingerprintSha256,
          panLength: cardAudit.panLength,
          expiry: cardAudit.expiry,
          billingZip: cardAudit.billingZip,
          cvc: "[REDACTED]",
          cvcLength: cardAudit.cvcLength,
          luhnValid: cardAudit.luhnValid,
        }
      : null,
    result: {
      ok: result.ok,
      statusCode: result.statusCode,
      reason: result.reason ?? null,
      message: result.message ?? null,
      beforeStatus: result.beforeStatus ?? orderSnapshot?.status ?? null,
      afterStatus: result.afterStatus ?? null,
    },
  };

  await mkdir(dirname(PAYMENT_AUDIT_LOG_PATH), { recursive: true });
  await appendFile(PAYMENT_AUDIT_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");

  return entry;
}

export async function safeAppendPaymentAuditEntry(input: AppendPaymentAuditEntryInput) {
  try {
    return await appendPaymentAuditEntry(input);
  } catch (error) {
    console.error("[payment-audit] Failed to append payment audit entry.", error);
    return null;
  }
}

export function getPaymentAuditLogPath() {
  return PAYMENT_AUDIT_LOG_PATH;
}
