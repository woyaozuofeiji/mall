import type { Metadata } from "next";
import Link from 'next/link';
import { findOrderByLookup } from '@/lib/orders';
import { formatDateTime } from '@/lib/format';
import { getDictionary, isLocale } from '@/lib/i18n';
import { getOrderStatusMeta } from '@/lib/order-status';
import type { PaymentMethod } from '@/lib/payment-methods';
import { buildPageMetadata } from "@/lib/seo";
import { PaymentExperience } from '@/components/checkout/payment-experience';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { StorefrontPanel, StorefrontPageHero } from '@/components/storefront/page-hero';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  return buildPageMetadata({
    locale,
    path: "/checkout/payment",
    title: locale === "zh" ? "完成付款" : "Complete Payment",
    description:
      locale === "zh"
        ? "为当前订单完成付款并进入确认流程。"
        : "Complete payment for your current order and move it into confirmation.",
    noIndex: true,
  });
}

export default async function CheckoutPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string; method?: string }>;
}) {
  const { locale } = await params;
  const { order, email, method } = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const orderNumber = order?.trim() ?? '';
  const emailValue = email?.trim() ?? '';
  const initialMethod = method === 'card' || method === 'paypal' ? (method as PaymentMethod) : undefined;
  const hasLookup = Boolean(orderNumber && emailValue);
  const result = hasLookup ? await findOrderByLookup(orderNumber, emailValue) : null;
  const statusMeta = result ? getOrderStatusMeta(result.status, locale) : null;

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow={locale === 'zh' ? 'Checkout' : 'Checkout'}
        title={
          result?.status === 'awaiting_payment'
            ? locale === 'zh'
              ? '完成安全付款'
              : 'Complete secure payment'
            : result && statusMeta
              ? statusMeta.title
              : locale === 'zh'
                ? '无法加载付款信息'
                : 'Unable to load payment details'
        }
        description={
          result?.status === 'awaiting_payment'
            ? locale === 'zh'
              ? '请完成当前订单付款。付款确认后，订单会立即进入确认与备货流程。'
              : 'Complete payment for this order. Once funds are confirmed, the order will move directly into confirmation and fulfillment.'
            : result && statusMeta
              ? statusMeta.description
              : hasLookup
                ? locale === 'zh'
                  ? '我们没有找到可继续付款的订单，请确认订单号与邮箱是否正确。'
                  : 'We could not find a payable order for this lookup. Please verify the order number and email.'
                : locale === 'zh'
                  ? '请先从结算页创建订单，或从订单查询页重新进入付款流程。'
                  : 'Create an order from checkout first, or reopen payment from the tracking page.'
        }
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === 'zh' ? '受保护结算' : 'Protected checkout'}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '付款页会根据订单当前状态自动切换：待付款订单可继续结算，已付款订单则直接展示最新处理进度。'
                : 'This page adapts to the order state automatically: payable orders can continue checkout here, while paid orders show the latest processing status instead.'}
            </p>
          </div>
        }
      />

      <Container>
        {result && result.status === 'awaiting_payment' ? (
          <PaymentExperience locale={locale} order={result} initialMethod={initialMethod} />
        ) : result && statusMeta ? (
          <StorefrontPanel className='p-8 text-center sm:p-10'>
            <div className='mx-auto max-w-3xl'>
              <div className='flex flex-wrap items-center justify-center gap-3'>
                <span className={cn('inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ring-1', statusMeta.badgeClassName)}>
                  {statusMeta.label}
                </span>
              </div>
              <h2 className='mt-6 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.4rem]'>{statusMeta.title}</h2>
              <p className='mt-4 text-sm leading-7 text-[#6d6670]'>{statusMeta.description}</p>

              <div className='mt-8 grid gap-4 sm:grid-cols-3'>
                <div className='rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '订单号' : 'Order number'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{result.orderNumber}</p>
                </div>
                <div className='rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '付款状态' : 'Payment status'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{statusMeta.paymentLabel}</p>
                </div>
                <div className='rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '创建时间' : 'Created at'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{formatDateTime(result.createdAt, locale)}</p>
                </div>
              </div>

              <div className='mt-8 flex flex-wrap justify-center gap-4'>
                <Button href={`/${locale}/order-tracking?order=${encodeURIComponent(result.orderNumber)}&email=${encodeURIComponent(result.email)}`}>
                  {dictionary.common.track}
                </Button>
                <Button href={`/${locale}/shop`} variant='secondary'>
                  {dictionary.common.continueShopping}
                </Button>
              </div>
            </div>
          </StorefrontPanel>
        ) : (
          <StorefrontPanel className='p-8 text-center sm:p-10'>
            <div className='mx-auto max-w-2xl'>
              <div className='inline-flex rounded-full bg-[#fff3f6] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]'>
                {locale === 'zh' ? '无法继续付款' : 'Unable to continue payment'}
              </div>
              <h2 className='mt-6 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.4rem]'>
                {hasLookup
                  ? locale === 'zh'
                    ? '没有找到待支付订单'
                    : 'No payable order was found'
                  : locale === 'zh'
                    ? '缺少订单信息'
                    : 'Missing order details'}
              </h2>
              <p className='mt-4 text-sm leading-7 text-[#6d6670]'>
                {hasLookup
                  ? locale === 'zh'
                    ? '请确认订单号与邮箱是否正确，或者回到订单查询页查看这笔订单的最新状态。'
                    : 'Please verify the order number and email, or return to order tracking to review the latest status.'
                  : locale === 'zh'
                    ? '需要先从结算页创建订单，或者通过订单查询页重新进入这笔订单。'
                    : 'Create an order from checkout first, or reopen the order from the tracking page.'}
              </p>

              <div className='mt-8 flex flex-wrap justify-center gap-4'>
                <Button href={`/${locale}/checkout`}>{dictionary.cart.checkout}</Button>
                <Button href={`/${locale}/order-tracking`} variant='secondary'>
                  {dictionary.common.track}
                </Button>
              </div>

              <Link href={`/${locale}/shop`} className='mt-5 inline-block text-sm text-[#7c7480] transition hover:text-[#ff6d88]'>
                {locale === 'zh' ? '返回商品列表' : 'Back to shop'}
              </Link>
            </div>
          </StorefrontPanel>
        )}
      </Container>
    </div>
  );
}
