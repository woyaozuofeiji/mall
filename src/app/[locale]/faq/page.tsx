import { getDictionary, isLocale } from '@/lib/i18n';
import { Container } from '@/components/ui/container';
import { StorefrontPageHero, StorefrontPanel } from '@/components/storefront/page-hero';

const faqs = {
  en: [
    {
      question: 'Which payment methods are available?',
      answer:
        'Orders can be completed with credit card or PayPal. Once payment is recorded, the order immediately moves into confirmation and fulfillment.',
    },
    {
      question: 'How are products selected?',
      answer:
        'The catalog is kept intentionally curated through sourcing review, product cleanup and selective publishing, so the storefront stays premium instead of crowded.',
    },
    {
      question: 'How are orders fulfilled?',
      answer:
        'After payment, the order enters confirmation and preparation. Carrier and tracking details appear on the tracking page once the shipment is dispatched.',
    },
    {
      question: 'Why keep the assortment focused?',
      answer:
        'A tighter assortment supports stronger storytelling, cleaner merchandising and a more premium gifting experience than an oversized catalog.',
    },
  ],
  zh: [
    {
      question: '支持哪些支付方式？',
      answer: '当前订单支持信用卡与 PayPal 付款，支付成功后系统会立即更新订单状态。',
    },
    {
      question: '商品是怎么选出来的？',
      answer: '商品库会经过选品、整理和发布审核，保持精品化陈列，而不是一次性堆满大量 SKU。',
    },
    {
      question: '订单是怎么履约的？',
      answer: '订单付款后会进入确认与备货流程，发货后可在订单查询页查看承运商与运单号。',
    },
    {
      question: '为什么商品数量保持精选？',
      answer: '更聚焦的商品结构有助于建立送礼氛围、页面节奏和品牌质感，整体体验通常比铺货更好。',
    },
  ],
} as const;

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow='FAQ'
        title={dictionary.content.faqTitle}
        description={dictionary.content.faqDescription}
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>Service notes</p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? 'FAQ 页面也保持和首页一致的柔和礼品店氛围，让帮助信息像品牌服务的一部分。'
                : 'The FAQ page keeps the same soft boutique tone as the homepage, so practical information still feels like part of the brand experience.'}
            </p>
          </div>
        }
      />

      <Container className='grid gap-4'>
        {faqs[locale].map((faq, index) => (
          <StorefrontPanel key={faq.question} className='p-6 sm:p-7'>
            <div className='flex items-start gap-4'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff3f6] text-[12px] font-semibold uppercase tracking-[0.2em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]'>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className='text-[1.35rem] font-semibold leading-7 text-[#2f2b32] sm:text-[1.7rem]'>{faq.question}</h2>
                <p className='mt-3 text-sm leading-8 text-[#6d6670]'>{faq.answer}</p>
              </div>
            </div>
          </StorefrontPanel>
        ))}
      </Container>
    </div>
  );
}
