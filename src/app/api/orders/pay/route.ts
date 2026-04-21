import { NextResponse } from 'next/server';
import { z } from 'zod';
import { completeOrderPayment } from '@/lib/orders';
import { getOrderStatusMeta } from '@/lib/order-status';

const paymentSchema = z.object({
  order: z.string().trim().min(1),
  email: z.string().email(),
  method: z.enum(['card', 'paypal']),
  locale: z.enum(['en', 'zh']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = paymentSchema.parse(body);
    const locale = payload.locale === 'zh' ? 'zh' : 'en';
    const result = await completeOrderPayment(payload.order, payload.email, payload.method);

    if (!result.success) {
      if (result.reason === 'not_found') {
        return NextResponse.json(
          {
            message: locale === 'zh' ? '没有找到可继续付款的订单记录。' : 'We could not find a payable order for this lookup.',
          },
          { status: 404 },
        );
      }

      const statusMeta = getOrderStatusMeta(result.status ?? 'new', locale);
      return NextResponse.json(
        {
          message:
            locale === 'zh'
              ? `这笔订单当前状态为“${statusMeta.label}”，无需重复付款。`
              : `This order is already marked as “${statusMeta.label}” and does not need another payment.`,
          status: result.status,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Invalid payment payload.',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Payment confirmation failed.',
      },
      { status: 500 },
    );
  }
}
