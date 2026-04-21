'use client';

import { useEffect } from 'react';
import { CreditCard, WalletCards, X } from 'lucide-react';
import type { Locale } from '@/lib/types';
import { Button } from '@/components/ui/button';

type PaymentMethod = 'card' | 'paypal';

export function PaymentMethodModal({
  locale,
  orderNumber,
  email,
  onChoose,
  onChooseLater,
}: {
  locale: Locale;
  orderNumber: string;
  email: string;
  onChoose: (method: PaymentMethod) => void;
  onChooseLater: () => void;
}) {
  const copy =
    locale === 'zh'
      ? {
          eyebrow: '下一步：完成付款',
          title: '订单已创建，请继续完成支付',
          description: '我们已经为这笔订单保留了结算信息。你可以立即选择付款方式，也可以先进入支付页稍后完成。',
          orderNumber: '订单号',
          email: '邮箱',
          chooseLater: '前往支付页',
          methods: [
            {
              key: 'card' as const,
              title: '信用卡',
              description: '进入信用卡结算页，填写卡片信息并完成当前订单付款。',
              cta: '使用信用卡支付',
            },
            {
              key: 'paypal' as const,
              title: 'PayPal',
              description: '进入 PayPal 授权页，完成当前订单的在线付款。',
              cta: '使用 PayPal 支付',
            },
          ],
        }
      : {
          eyebrow: 'Next step: complete payment',
          title: 'Your order is created. Continue to payment.',
          description: 'Checkout details for this order have been saved. Choose a payment method now, or open the payment page and complete it there.',
          orderNumber: 'Order number',
          email: 'Email',
          chooseLater: 'Open payment page',
          methods: [
            {
              key: 'card' as const,
              title: 'Credit card',
              description: 'Open the secure card checkout page and complete payment for this order.',
              cta: 'Pay with card',
            },
            {
              key: 'paypal' as const,
              title: 'PayPal',
              description: 'Continue to PayPal authorization and finish the online payment for this order.',
              cta: 'Pay with PayPal',
            },
          ],
        };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className='fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(48,34,42,0.48)] px-4 py-6' role='dialog' aria-modal='true'>
      <div className='relative w-full max-w-3xl rounded-[2rem] bg-white p-5 shadow-[0_40px_110px_-62px_rgba(29,22,18,0.62)] ring-1 ring-[rgba(241,225,230,0.95)] sm:p-7'>
        <button
          type='button'
          onClick={onChooseLater}
          className='absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(241,225,230,0.95)] bg-[#fff8fa] text-[#8f8791] transition hover:text-[#ff6d88]'
          aria-label={locale === 'zh' ? '关闭支付方式选择' : 'Close payment selection'}
        >
          <X className='h-4 w-4' />
        </button>

        <div className='max-w-2xl'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]'>{copy.eyebrow}</p>
          <h2 className='mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.5rem]'>{copy.title}</h2>
          <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{copy.description}</p>
        </div>

        <div className='mt-6 grid gap-3 rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)] sm:grid-cols-2'>
          <div>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{copy.orderNumber}</p>
            <p className='mt-2 text-base font-semibold text-[#2f2b32]'>{orderNumber}</p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#8f8791]'>{copy.email}</p>
            <p className='mt-2 text-base font-semibold text-[#2f2b32]'>{email}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          {copy.methods.map((method) => {
            const icon = method.key === 'card' ? <CreditCard className='h-5 w-5' /> : <WalletCards className='h-5 w-5' />;

            return (
              <div
                key={method.key}
                className='rounded-[1.6rem] border border-[rgba(241,225,230,0.95)] bg-white p-5 shadow-[0_18px_42px_-30px_rgba(214,187,198,0.68)]'
              >
                <div className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3f6] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]'>
                  {icon}
                </div>
                <h3 className='mt-4 text-[1.35rem] font-semibold text-[#2f2b32]'>{method.title}</h3>
                <p className='mt-3 text-sm leading-7 text-[#6d6670]'>{method.description}</p>
                <Button type='button' className='mt-5 w-full' onClick={() => onChoose(method.key)}>
                  {method.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <div className='mt-5 flex justify-end'>
          <Button type='button' variant='secondary' onClick={onChooseLater}>
            {copy.chooseLater}
          </Button>
        </div>
      </div>
    </div>
  );
}
