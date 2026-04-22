import "server-only";

import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import type { CheckoutPayload } from "@/lib/validation/checkout";
import type { AdminOrderUpdatePayload } from "@/lib/validation/admin";

export type OrderPaymentMethod = 'card' | 'paypal';

export interface OrderLookupResult {
  orderNumber: string;
  status: Lowercase<OrderStatus>;
  email: string;
  customerName: string;
  customerPhone: string;
  country: string;
  region: string | null;
  city: string;
  address: string;
  postalCode: string;
  note: string | null;
  subtotal: number;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string | null;
  carrier: string | null;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: Lowercase<OrderStatus>;
  customerName: string;
  email: string;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string | null;
  carrier: string | null;
}

export interface AdminOrderDeleteResult {
  selectedCount: number;
  deletedCount: number;
  notFoundCount: number;
}

function normalizeIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function toLowerStatus(status: OrderStatus): Lowercase<OrderStatus> {
  return status.toLowerCase() as Lowercase<OrderStatus>;
}

function localizedProductName(locale: Locale, product: { nameEn: string; nameZh: string }) {
  return locale === "zh" ? product.nameZh || product.nameEn : product.nameEn;
}

function localizedVariantName(locale: Locale, variant?: { labelEn: string; labelZh: string } | null) {
  if (!variant) return null;
  return locale === "zh" ? variant.labelZh || variant.labelEn : variant.labelEn;
}

function decimalToNumber(value?: Prisma.Decimal | null) {
  return value ? Number(value) : 0;
}

export async function createOrderFromCheckout(payload: CheckoutPayload) {
  const slugs = [...new Set(payload.items.map((item) => item.slug))];
  const products = await prisma.product.findMany({
    where: {
      slug: { in: slugs },
      status: "PUBLISHED",
    },
    include: {
      variants: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.slug, product]));

  const items = payload.items.map((item) => {
    const product = productMap.get(item.slug);
    if (!product) {
      throw new Error(`商品不存在或未发布: ${item.slug}`);
    }

    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : null;
    if (item.variantId && !variant) {
      throw new Error(`规格不存在: ${item.variantId}`);
    }

    const unitPrice = decimalToNumber(variant?.price) || decimalToNumber(product.price);

    return {
      productId: product.id,
      variantId: variant?.id,
      productName: localizedProductName(payload.locale, product),
      variantName: localizedVariantName(payload.locale, variant),
      quantity: item.quantity,
      unitPrice,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        fullName: payload.customer.fullName,
        email: payload.customer.email,
        phone: payload.customer.phone,
        country: payload.customer.country,
        region: payload.customer.region,
        city: payload.customer.city,
        address1: payload.customer.address,
        postalCode: payload.customer.postalCode,
      },
    });

    return tx.order.create({
      data: {
        orderNumber,
        status: "AWAITING_PAYMENT",
        email: payload.customer.email,
        note: payload.customer.note,
        currency: "USD",
        subtotal,
        totalAmount: subtotal,
        addressId: address.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      select: {
        orderNumber: true,
        email: true,
      },
    });
  });

  return order;
}

export async function completeOrderPayment(
  orderNumber: string,
  email: string,
  method: OrderPaymentMethod,
): Promise<
  | { success: true; orderNumber: string; email: string; status: 'confirmed'; paymentMethod: OrderPaymentMethod; paidAt: string }
  | { success: false; reason: 'not_found' | 'not_payable'; status?: Lowercase<OrderStatus> }
> {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      status: true,
      metadata: true,
    },
  });

  if (!order) {
    return { success: false, reason: 'not_found' };
  }

  if (order.status !== 'AWAITING_PAYMENT') {
    return { success: false, reason: 'not_payable', status: toLowerStatus(order.status) };
  }

  const existingMetadata =
    order.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)
      ? (order.metadata as Prisma.JsonObject)
      : ({} as Prisma.JsonObject);
  const paidAt = new Date().toISOString();

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'CONFIRMED',
      metadata: {
        ...existingMetadata,
        paymentStatus: 'paid',
        paymentMethod: method,
        paidAt,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    success: true,
    orderNumber: order.orderNumber,
    email: order.email,
    status: 'confirmed',
    paymentMethod: method,
    paidAt,
  };
}

export async function findOrderByLookup(orderNumber: string, email: string): Promise<OrderLookupResult | null> {
  const result = await prisma.order.findFirst({
    where: {
      orderNumber,
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: {
      address: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!result || !result.address) {
    return null;
  }

  return {
    orderNumber: result.orderNumber,
    status: toLowerStatus(result.status),
    email: result.email,
    customerName: result.address.fullName,
    customerPhone: result.address.phone,
    country: result.address.country,
    region: result.address.region,
    city: result.address.city,
    address: result.address.address1,
    postalCode: result.address.postalCode,
    note: result.note,
    subtotal: Number(result.subtotal),
    totalAmount: Number(result.totalAmount ?? result.subtotal),
    createdAt: result.createdAt.toISOString(),
    trackingNumber: result.trackingNumber,
    carrier: result.carrier,
    items: result.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

export async function getAdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      items: true,
    },
  });

  return orders.map<AdminOrderListItem>((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: toLowerStatus(order.status),
    customerName: order.address?.fullName ?? order.email,
    email: order.email,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: Number(order.totalAmount ?? order.subtotal),
    createdAt: order.createdAt.toISOString(),
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
  }));
}

export async function getAdminOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      shipments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order || !order.address) {
    return null;
  }

  const latestShipment = order.shipments[0] ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    email: order.email,
    note: order.note ?? "",
    subtotal: Number(order.subtotal),
    totalAmount: Number(order.totalAmount ?? order.subtotal),
    createdAt: order.createdAt.toISOString(),
    carrier: order.carrier ?? latestShipment?.carrier ?? "",
    trackingNumber: order.trackingNumber ?? latestShipment?.trackingNumber ?? "",
    customer: {
      fullName: order.address.fullName,
      email: order.address.email,
      phone: order.address.phone,
      country: order.address.country,
      region: order.address.region ?? "",
      city: order.address.city,
      address: order.address.address1,
      postalCode: order.address.postalCode,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.unitPrice) * item.quantity,
    })),
  };
}

export async function updateAdminOrder(id: string, payload: AdminOrderUpdatePayload) {
  const existing = await prisma.order.findUnique({
    where: { id },
    include: {
      shipments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!existing) {
    throw new Error("订单不存在");
  }

  const carrier = payload.carrier ?? null;
  const trackingNumber = payload.trackingNumber ?? null;
  const shouldHaveShipment = Boolean(carrier || trackingNumber || payload.status === "SHIPPED");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        status: payload.status,
        note: payload.note ?? null,
        carrier,
        trackingNumber,
      },
    });

    const latestShipment = existing.shipments[0];

    if (!shouldHaveShipment) {
      await tx.shipment.deleteMany({ where: { orderId: id } });
      return;
    }

    const shipmentData = {
      carrier: carrier ?? latestShipment?.carrier ?? "Manual",
      trackingNumber: trackingNumber ?? latestShipment?.trackingNumber ?? `MANUAL-${existing.orderNumber}`,
      statusNote: payload.note ?? null,
      shippedAt:
        payload.status === "SHIPPED"
          ? latestShipment?.shippedAt ?? new Date()
          : latestShipment?.shippedAt ?? null,
    };

    if (latestShipment) {
      await tx.shipment.update({
        where: { id: latestShipment.id },
        data: shipmentData,
      });
    } else {
      await tx.shipment.create({
        data: {
          orderId: id,
          ...shipmentData,
        },
      });
    }
  });

  return { success: true };
}

export async function deleteAdminOrder(id: string) {
  const result = await deleteAdminOrders([id]);
  if (result.deletedCount === 0) {
    throw new Error("订单不存在");
  }
  return { success: true as const };
}

export async function deleteAdminOrders(ids: string[]): Promise<AdminOrderDeleteResult> {
  const normalizedIds = normalizeIds(ids);
  if (normalizedIds.length === 0) {
    throw new Error("请先选择要删除的订单");
  }

  const orders = await prisma.order.findMany({
    where: {
      id: {
        in: normalizedIds,
      },
    },
    select: {
      id: true,
      addressId: true,
    },
  });

  if (orders.length === 0) {
    throw new Error("订单不存在");
  }

  const orderIds = orders.map((order) => order.id);
  const addressIds = [...new Set(orders.map((order) => order.addressId).filter((addressId): addressId is string => Boolean(addressId)))];

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    if (addressIds.length > 0) {
      await tx.address.deleteMany({
        where: {
          id: {
            in: addressIds,
          },
          orders: {
            none: {},
          },
        },
      });
    }
  });

  return {
    selectedCount: normalizedIds.length,
    deletedCount: orderIds.length,
    notFoundCount: normalizedIds.length - orderIds.length,
  };
}
