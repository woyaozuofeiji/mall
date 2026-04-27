import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const FIRST_IP_PROMOTION_CAMPAIGN = "first-ip-10min-one-tenth-v1";
export const PROMOTION_OFFER_WINDOW_MS = 10 * 60 * 1000;
export const PROMOTION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
export const PROMOTION_DISCOUNT_RATE = 0.1;

export interface PromotionWindowPayload {
  eligible: boolean;
  active: boolean;
  justStarted: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  cooldownExpiresAt: string | null;
  claimed: boolean;
  used: boolean;
}

export interface OrderPromotionDiscount {
  campaign: string;
  label: "one_tenth_card";
  rate: number;
  originalSubtotal: number;
  discountedTotal: number;
  discountAmount: number;
  claimedAt: string;
}

function addMs(date: Date, ms: number) {
  return new Date(date.getTime() + ms);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function stripPort(value: string) {
  if (value.startsWith("[") && value.includes("]")) {
    return value.slice(1, value.indexOf("]"));
  }

  const colonCount = (value.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    return value.split(":")[0] || value;
  }

  return value;
}

export function getClientIpFromHeaders(headers: Pick<Headers, "get">) {
  const candidate =
    firstHeaderValue(headers.get("cf-connecting-ip")) ??
    firstHeaderValue(headers.get("x-real-ip")) ??
    firstHeaderValue(headers.get("x-forwarded-for")) ??
    firstHeaderValue(headers.get("x-client-ip")) ??
    firstHeaderValue(headers.get("forwarded")?.match(/for="?([^;,"]+)/i)?.[1] ?? null);

  if (!candidate) {
    return "unknown";
  }

  return stripPort(candidate).trim() || "unknown";
}

function metadataObject(metadata: Prisma.JsonValue | null | undefined) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Prisma.JsonObject)
    : ({} as Prisma.JsonObject);
}

function numberFromMetadata(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function getOrderPromotionDiscount(metadata: Prisma.JsonValue | null | undefined): OrderPromotionDiscount | null {
  const promotionDiscount = metadataObject(metadata).promotionDiscount;
  if (!promotionDiscount || typeof promotionDiscount !== "object" || Array.isArray(promotionDiscount)) {
    return null;
  }

  const record = promotionDiscount as Prisma.JsonObject;
  if (record.campaign !== FIRST_IP_PROMOTION_CAMPAIGN || record.label !== "one_tenth_card") {
    return null;
  }

  const rate = numberFromMetadata(record.rate);
  const originalSubtotal = numberFromMetadata(record.originalSubtotal);
  const discountedTotal = numberFromMetadata(record.discountedTotal);
  const discountAmount = numberFromMetadata(record.discountAmount);
  const claimedAt = typeof record.claimedAt === "string" ? record.claimedAt : null;

  if (rate === null || originalSubtotal === null || discountedTotal === null || discountAmount === null || !claimedAt) {
    return null;
  }

  return {
    campaign: FIRST_IP_PROMOTION_CAMPAIGN,
    label: "one_tenth_card",
    rate,
    originalSubtotal,
    discountedTotal,
    discountAmount,
    claimedAt,
  };
}

function serializeWindow(
  activity: {
    firstSeenAt: Date;
    offerExpiresAt: Date;
    cooldownExpiresAt: Date;
    claimedAt: Date | null;
    usedAt: Date | null;
  },
  now: Date,
  justStarted: boolean,
): PromotionWindowPayload {
  const used = Boolean(activity.usedAt);
  const active = !used && activity.offerExpiresAt.getTime() > now.getTime();

  return {
    eligible: active,
    active,
    justStarted,
    startsAt: activity.firstSeenAt.toISOString(),
    expiresAt: activity.offerExpiresAt.toISOString(),
    cooldownExpiresAt: activity.cooldownExpiresAt.toISOString(),
    claimed: Boolean(activity.claimedAt),
    used,
  };
}

export async function openPromotionWindowForIp(ipAddress: string): Promise<PromotionWindowPayload> {
  const now = new Date();
  const offerExpiresAt = addMs(now, PROMOTION_OFFER_WINDOW_MS);
  const cooldownExpiresAt = addMs(now, PROMOTION_COOLDOWN_MS);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.ipPromotionActivity.findUnique({
      where: { ipAddress },
    });

    if (!existing) {
      const created = await tx.ipPromotionActivity.create({
        data: {
          ipAddress,
          firstSeenAt: now,
          offerExpiresAt,
          cooldownExpiresAt,
        },
      });

      return serializeWindow(created, now, true);
    }

    if (existing.cooldownExpiresAt.getTime() <= now.getTime()) {
      const refreshed = await tx.ipPromotionActivity.update({
        where: { id: existing.id },
        data: {
          firstSeenAt: now,
          offerExpiresAt,
          cooldownExpiresAt,
          claimedAt: null,
          usedAt: null,
          orderNumber: null,
        },
      });

      return serializeWindow(refreshed, now, true);
    }

    return serializeWindow(existing, now, false);
  });
}

export async function claimPromotionDiscountForOrder(input: {
  ipAddress: string;
  orderNumber: string;
  email: string;
}): Promise<OrderPromotionDiscount | null> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const activity = await tx.ipPromotionActivity.findUnique({
      where: { ipAddress: input.ipAddress },
    });

    if (
      !activity ||
      activity.usedAt ||
      activity.offerExpiresAt.getTime() <= now.getTime() ||
      activity.cooldownExpiresAt.getTime() <= now.getTime()
    ) {
      return null;
    }

    if (activity.claimedAt && activity.orderNumber !== input.orderNumber) {
      return null;
    }

    const order = await tx.order.findFirst({
      where: {
        orderNumber: input.orderNumber,
        email: {
          equals: input.email,
          mode: "insensitive",
        },
        status: "AWAITING_PAYMENT",
      },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        metadata: true,
      },
    });

    if (!order) {
      return null;
    }

    const existingDiscount = getOrderPromotionDiscount(order.metadata);
    if (existingDiscount) {
      if (!activity.claimedAt) {
        await tx.ipPromotionActivity.update({
          where: { id: activity.id },
          data: {
            claimedAt: now,
            orderNumber: order.orderNumber,
          },
        });
      }

      return existingDiscount;
    }

    const originalSubtotal = roundMoney(Number(order.subtotal));
    const discountedTotal = roundMoney(originalSubtotal * PROMOTION_DISCOUNT_RATE);
    const discountAmount = roundMoney(originalSubtotal - discountedTotal);
    const claimedAt = now.toISOString();
    const promotionDiscount: OrderPromotionDiscount = {
      campaign: FIRST_IP_PROMOTION_CAMPAIGN,
      label: "one_tenth_card",
      rate: PROMOTION_DISCOUNT_RATE,
      originalSubtotal,
      discountedTotal,
      discountAmount,
      claimedAt,
    };

    await tx.order.update({
      where: { id: order.id },
      data: {
        totalAmount: discountedTotal,
        metadata: {
          ...metadataObject(order.metadata),
          promotionDiscount,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.ipPromotionActivity.update({
      where: { id: activity.id },
      data: {
        claimedAt: now,
        orderNumber: order.orderNumber,
      },
    });

    return promotionDiscount;
  });
}

export async function markPromotionUsedForPaidOrder(input: {
  ipAddress: string;
  orderNumber: string;
}) {
  const now = new Date();

  const activity = await prisma.ipPromotionActivity.findFirst({
    where: {
      ipAddress: input.ipAddress,
      orderNumber: input.orderNumber,
    },
    select: {
      id: true,
      offerExpiresAt: true,
      usedAt: true,
    },
  });

  if (!activity || activity.usedAt || activity.offerExpiresAt.getTime() <= now.getTime()) {
    return false;
  }

  await prisma.ipPromotionActivity.update({
    where: { id: activity.id },
    data: { usedAt: now },
  });

  return true;
}

export async function getPromotionActivityStats() {
  const now = new Date();
  const [total, active, claimed, used] = await Promise.all([
    prisma.ipPromotionActivity.count(),
    prisma.ipPromotionActivity.count({
      where: {
        offerExpiresAt: {
          gt: now,
        },
        usedAt: null,
      },
    }),
    prisma.ipPromotionActivity.count({
      where: {
        claimedAt: {
          not: null,
        },
      },
    }),
    prisma.ipPromotionActivity.count({
      where: {
        usedAt: {
          not: null,
        },
      },
    }),
  ]);

  return {
    total,
    active,
    claimed,
    used,
  };
}

export async function resetAllPromotionIpValidity() {
  const result = await prisma.ipPromotionActivity.deleteMany();

  return {
    resetCount: result.count,
  };
}
