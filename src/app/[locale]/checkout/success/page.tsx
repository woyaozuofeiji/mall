import Link from 'next/link';
import { findOrderByLookup } from '@/lib/orders';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary, isLocale } from '@/lib/i18n';
import { getOrderStatusMeta, getOrderTimeline } from '@/lib/order-status';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { StorefrontPanel, StorefrontPageHero } from '@/components/storefront/page-hero';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
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
  const hasLookup = Boolean(orderNumber && emailValue);
  const result = hasLookup ? await findOrderByLookup(orderNumber, emailValue) : null;
  const statusMeta = getOrderStatusMeta(result?.status ?? 'confirmed', locale);
  const timeline = getOrderTimeline(result?.status ?? 'confirmed', locale);
  const methodLabel =
    method === 'card'
      ? locale === 'zh'
        ? '信用卡'
        : 'Credit card'
      : method === 'paypal'
        ? 'PayPal'
        : locale === 'zh'
          ? '线上支付'
          : 'Online payment';
  const trackingHref = hasLookup
    ? `/${locale}/order-tracking?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(emailValue)}`
    : `/${locale}/order-tracking`;

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow={locale === 'zh' ? 'Payment confirmed' : 'Payment confirmed'}
        title={locale === 'zh' ? '付款已完成，订单正在确认' : 'Payment completed and order is being confirmed'}
        description={
          locale === 'zh'
            ? '系统已经记录本次付款，订单会继续进入确认、备货与发货流程。'
            : 'The payment has been recorded and the order will continue into confirmation, fulfillment and shipment handling.'
        }
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === 'zh' ? '订单回执' : 'Order receipt'}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '你可以在这里核对订单号、付款方式与当前状态，并继续前往订单查询查看后续进度。'
                : 'Review the order number, payment method and current status here, then continue to order tracking for future updates.'}
            </p>
          </div>
        }
      />

      <Container className='max-w-5xl'>
        <StorefrontPanel className='p-8 sm:p-10'>
          <div className='mx-auto max-w-4xl'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <div className={cn('inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ring-1', statusMeta.badgeClassName)}>
                  {statusMeta.label}
                </div>
                <h2 className='mt-6 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.6rem]'>{statusMeta.title}</h2>
                <p className='mt-4 max-w-2xl text-sm leading-7 text-[#6d6670]'>{statusMeta.description}</p>
              </div>
            </div>

            <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '订单号' : 'Order number'}</p>
                <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{orderNumber || '--'}</p>
              </div>
              <div className='rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '付款方式' : 'Payment method'}</p>
                <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{methodLabel}</p>
              </div>
              <div className='rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '创建时间' : 'Created at'}</p>
                <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{result ? formatDateTime(result.createdAt, locale) : '--'}</p>
              </div>
              <div className='rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '订单金额' : 'Order total'}</p>
                <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>
                  {result ? formatCurrency(result.totalAmount, locale) : '--'}
                </p>
              </div>
            </div>

            <div className='mt-8 grid gap-3 sm:grid-cols-4'>
              {timeline.map((step) => (
                <div
                  key={step.key}
                  className={cn(
                    'rounded-[1.35rem] border p-4',
                    step.state === 'complete' && 'border-[rgba(151,218,178,0.72)] bg-[#f2fbf5]',
                    step.state === 'current' && 'border-[rgba(255,126,149,0.52)] bg-[#fff7f9]',
                    step.state === 'pending' && 'border-[rgba(241,225,230,0.95)] bg-white',
                  )}
                >
                  <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f8791]'>
                    {step.state === 'complete'
                      ? locale === 'zh'
                        ? '已完成'
                        : 'Complete'
                      : step.state === 'current'
                        ? locale === 'zh'
                          ? '当前阶段'
                          : 'Current'
                        : locale === 'zh'
                          ? '待处理'
                          : 'Pending'}
                  </p>
                  <p className='mt-3 text-sm font-semibold text-[#2f2b32]'>{step.label}</p>
                </div>
              ))}
            </div>

            <div className='mt-8 rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-6 ring-1 ring-[rgba(241,225,230,0.95)]'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
                {locale === 'zh' ? '下一步' : 'Next step'}
              </p>
              <p className='mt-3 text-sm leading-7 text-[#6d6670]'>
                {locale === 'zh'
                  ? '你可以立即前往订单查询页查看状态。发货后，物流公司与运单号会同步显示在订单详情中。'
                  : 'You can open order tracking right away to monitor the latest status. Carrier and tracking details will appear there after shipment.'}
              </p>
              <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{dictionary.checkout.orderLookupHint}</p>
              {emailValue ? <p className='mt-3 text-sm text-[#4d4650]'>Email: {emailValue}</p> : null}
            </div>

            <div className='mt-8 flex flex-wrap justify-center gap-4'>
              <Button href={trackingHref}>
                {dictionary.common.track}
              </Button>
              <Button href={`/${locale}/shop`} variant='secondary'>
                {dictionary.common.continueShopping}
              </Button>
            </div>
            <Link href={`/${locale}`} className='mt-5 inline-block text-sm text-[#7c7480] transition hover:text-[#ff6d88]'>
              {locale === 'zh' ? '返回首页' : 'Back to home'}
            </Link>
          </div>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
