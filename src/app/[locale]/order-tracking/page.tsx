import type { Metadata } from "next";
import { findOrderByLookup } from '@/lib/orders';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary, isLocale } from '@/lib/i18n';
import { getOrderStatusMeta, getOrderTimeline } from '@/lib/order-status';
import { getPaymentMethodMaintenanceMessage } from '@/lib/payment-methods';
import { buildPageMetadata } from "@/lib/seo";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { StorefrontPageHero, StorefrontPanel } from '@/components/storefront/page-hero';

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
    path: "/order-tracking",
    title: locale === "zh" ? "订单追踪" : "Order Tracking",
    description:
      locale === "zh"
        ? "使用订单号与下单邮箱查看付款、履约与物流状态。"
        : "Check payment, fulfillment and shipping status with your order number and purchase email.",
    noIndex: true,
  });
}

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { order, email } = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const orderNumber = order?.trim() ?? '';
  const emailValue = email?.trim() ?? '';
  const hasLookup = Boolean(orderNumber && emailValue);
  const result = hasLookup ? await findOrderByLookup(orderNumber, emailValue) : null;
  const statusMeta = result ? getOrderStatusMeta(result.status, locale) : null;
  const timeline = result ? getOrderTimeline(result.status, locale) : [];
  const paypalMaintenanceMessage = getPaymentMethodMaintenanceMessage(locale, 'paypal');

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow={locale === 'zh' ? 'Order status' : 'Order status'}
        title={dictionary.tracking.title}
        description={dictionary.tracking.description}
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === 'zh' ? '服务中心' : 'Service center'}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '通过订单号与下单邮箱，可以在这里查看付款状态、履约进度与物流更新。'
                : 'Use your order number and purchase email to review payment, fulfillment and shipment updates in one place.'}
            </p>
          </div>
        }
      />

      <Container className='grid gap-6 lg:grid-cols-[0.8fr_1.2fr]'>
        <StorefrontPanel className='p-6 sm:p-7'>
          <h2 className='text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>{dictionary.tracking.title}</h2>
          <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{dictionary.tracking.description}</p>
          <form className='mt-6 space-y-4'>
            <label className='block text-sm text-[#574f5a]'>
              {dictionary.tracking.orderNumber}
              <input
                name='order'
                defaultValue={order}
                className='mt-2 h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]'
              />
            </label>
            <label className='block text-sm text-[#574f5a]'>
              {dictionary.tracking.email}
              <input
                name='email'
                defaultValue={email}
                className='mt-2 h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm outline-none transition focus:border-[rgba(255,126,149,0.55)]'
              />
            </label>
            <Button type='submit' className='mt-2 w-full'>
              {dictionary.common.track}
            </Button>
          </form>

          <div className='mt-6 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]'>
            {locale === 'zh'
              ? '提交后会显示最新订单状态、付款进度与可用的物流信息。'
              : 'The latest order status, payment state and available tracking details will appear here after lookup.'}
          </div>
        </StorefrontPanel>

        <StorefrontPanel className='p-6 sm:p-7'>
          {result && statusMeta ? (
            <div className='space-y-6'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <p className='text-[12px] uppercase tracking-[0.24em] text-[#8f8791]'>{dictionary.tracking.orderNumber}</p>
                  <h3 className='mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>{result.orderNumber}</h3>
                </div>
                <span className={cn('inline-flex self-start rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ring-1', statusMeta.badgeClassName)}>
                  {statusMeta.label}
                </span>
              </div>

              <div className={cn('rounded-[1.5rem] p-5 ring-1', statusMeta.panelClassName)}>
                <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f8791]'>
                  {locale === 'zh' ? '状态摘要' : 'Status summary'}
                </p>
                <h4 className='mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>{statusMeta.title}</h4>
                <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{statusMeta.description}</p>
              </div>

              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '下单时间' : 'Order placed'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{formatDateTime(result.createdAt, locale)}</p>
                </div>
                <div className='rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '付款状态' : 'Payment status'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{statusMeta.paymentLabel}</p>
                </div>
                <div className='rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{locale === 'zh' ? '订单金额' : 'Order total'}</p>
                  <p className='mt-2 text-sm font-semibold text-[#2f2b32]'>{formatCurrency(result.totalAmount, locale)}</p>
                </div>
              </div>

              {result.status !== 'cancelled' ? (
                <div className='grid gap-3 sm:grid-cols-4'>
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
              ) : null}

              <div className='rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-sm font-medium text-[#4d4650]'>{locale === 'zh' ? '收货信息' : 'Shipping details'}</p>
                <p className='mt-3 text-sm leading-7 text-[#2f2b32]'>{result.customerName}</p>
                <p className='text-sm leading-7 text-[#6d6670]'>{result.email}</p>
                <p className='text-sm leading-7 text-[#6d6670]'>{result.customerPhone}</p>
                <p className='mt-2 text-sm leading-7 text-[#6d6670]'>
                  {result.address}, {result.city}
                  {result.region ? `, ${result.region}` : ''}, {result.country}, {result.postalCode}
                </p>
                {result.note ? <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{result.note}</p> : null}
              </div>

              <div className='rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                <p className='text-sm font-medium text-[#4d4650]'>{locale === 'zh' ? '订单商品' : 'Items'}</p>
                <div className='mt-4 space-y-3'>
                  {result.items.map((item) => (
                    <div key={item.id} className='flex items-center justify-between gap-4 text-sm text-[#6d6670]'>
                      <div>
                        <p className='font-medium text-[#2f2b32]'>{item.productName}</p>
                        {item.variantName ? <p>{item.variantName}</p> : null}
                      </div>
                      <p>
                        x {item.quantity} · {formatCurrency(item.unitPrice, locale)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {result.trackingNumber ? (
                <div className='rounded-[1.4rem] bg-[#eef5ff] p-4 text-sm text-[#1f5da8] ring-1 ring-[rgba(131,167,255,0.28)]'>
                  {dictionary.tracking.trackingNumber}: {result.trackingNumber}
                  {result.carrier ? ` (${result.carrier})` : ''}
                </div>
              ) : null}

              {result.status === 'awaiting_payment' ? (
                <div className='rounded-[1.5rem] bg-[#fff5f7] p-5 ring-1 ring-[rgba(248,192,205,0.62)]'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff6d88]'>
                    {locale === 'zh' ? '待完成付款' : 'Payment outstanding'}
                  </p>
                  <p className='mt-3 text-sm leading-7 text-[#6d6670]'>
                    {locale === 'zh'
                      ? '完成付款后，订单会立即进入确认与备货流程。你也可以直接从这里继续付款，当前建议优先使用信用卡。'
                      : 'Once payment is completed, the order will move into confirmation and fulfillment. You can continue payment directly from here, and card payment is currently recommended.'}
                  </p>
                  <div className='mt-5 flex flex-wrap gap-3'>
                    <Button href={`/${locale}/checkout/payment?order=${encodeURIComponent(result.orderNumber)}&email=${encodeURIComponent(result.email)}`}>
                      {locale === 'zh' ? '继续支付' : 'Continue payment'}
                    </Button>
                    <Button
                      href={`/${locale}/checkout/payment?order=${encodeURIComponent(result.orderNumber)}&email=${encodeURIComponent(result.email)}&method=paypal`}
                      variant='secondary'
                    >
                      {locale === 'zh' ? 'PayPal 维护提示' : 'PayPal maintenance'}
                    </Button>
                  </div>
                  <p className='mt-4 text-sm leading-7 text-[#ff6d88]'>{paypalMaintenanceMessage}</p>
                </div>
              ) : (
                <div className='rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
                    {locale === 'zh' ? '后续进度' : 'What happens next'}
                  </p>
                  <p className='mt-3 text-sm leading-7 text-[#6d6670]'>
                    {result.status === 'shipped'
                      ? locale === 'zh'
                        ? '包裹已经发出。你可以使用上方物流单号持续查看运输进度。'
                        : 'The parcel has shipped. Use the tracking number above to follow delivery progress.'
                      : result.status === 'cancelled'
                        ? locale === 'zh'
                          ? '这笔订单当前已关闭。如需帮助，请联系客户支持。'
                          : 'This order is currently closed. Please contact support if you need help.'
                        : locale === 'zh'
                          ? '订单已进入履约阶段。发货后，物流公司与运单号会显示在这里。'
                          : 'The order is now in fulfillment. Carrier and tracking details will appear here after dispatch.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='flex min-h-80 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-8 text-center ring-1 ring-[rgba(241,225,230,0.95)]'>
              <div>
                <p className='text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>
                  {hasLookup ? dictionary.tracking.noResult : locale === 'zh' ? '输入订单信息' : 'Enter your order details'}
                </p>
                <p className='mx-auto mt-4 max-w-md text-sm leading-7 text-[#6d6670]'>
                  {hasLookup
                    ? locale === 'zh'
                      ? '没有找到匹配的订单，请确认订单号与邮箱是否和下单信息一致。'
                      : 'No matching order was found. Please verify the order number and email used at checkout.'
                    : locale === 'zh'
                      ? '输入订单号与下单邮箱后，即可查看当前付款状态、履约进度和物流更新。'
                      : 'Enter your order number and purchase email to check payment, fulfillment and shipping updates.'}
                </p>
              </div>
            </div>
          )}
        </StorefrontPanel>
      </Container>
    </div>
  );
}
