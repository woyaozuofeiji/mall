import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";
import { Container } from '@/components/ui/container';
import { StorefrontPageHero, StorefrontPanel } from '@/components/storefront/page-hero';

const faqs = {
  en: [
    {
      question: 'Which payment methods are available?',
      answer:
        'Orders can currently be completed with credit card. PayPal is under maintenance for now. Once payment is recorded, the order immediately moves into confirmation and fulfillment.',
    },
    {
      question: 'How long does order processing take?',
      answer:
        'Most in-stock orders are packed and dispatched within 1-3 business days. Pre-order or holiday-volume items may take longer, and any extended handling window will be shown on the product page when relevant.',
    },
    {
      question: 'Which countries do you ship to?',
      answer:
        'The storefront currently supports the United States, Canada, the United Kingdom, major EU destinations, Australia, New Zealand and selected Asian markets. Final availability is confirmed after your delivery address is entered at checkout.',
    },
    {
      question: 'How can I track my shipment?',
      answer:
        'After dispatch, the carrier and tracking number are attached to your order. You can check the latest shipping status from the order tracking page using your order number and checkout email.',
    },
    {
      question: 'Do you accept returns?',
      answer:
        'Most standard items can be requested for return within 30 days after delivery if they remain unused and in their original condition. Earrings, personalized items and clearly marked final-sale products are usually non-returnable unless there is a verified issue.',
    },
    {
      question: 'What should I do if my item arrives damaged or incorrect?',
      answer:
        'Please contact support within 72 hours of delivery and include your order number plus clear photos of the item, packaging and shipping label. After review, we will arrange a replacement, reshipment or refund solution.',
    },
    {
      question: 'How are products selected?',
      answer:
        'The catalog is kept intentionally curated through sourcing review, product cleanup and selective publishing, so the storefront stays premium instead of crowded.',
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
      answer: '当前订单暂时支持信用卡付款，PayPal 通道维护中。支付成功后系统会立即更新订单状态。',
    },
    {
      question: '订单一般多久发出？',
      answer: '大多数现货订单会在付款确认后的 1-3 个工作日内完成包装并发出；如遇预售款或节日高峰，商品页会单独说明更长的处理时间。',
    },
    {
      question: '支持配送到哪些国家或地区？',
      answer: '当前主要支持美国、加拿大、英国、欧盟主要国家、澳大利亚、新西兰以及部分亚洲地区，最终是否可配送以下单页地址校验结果为准。',
    },
    {
      question: '如何查询物流进度？',
      answer: '订单发货后会同步承运商和运单号，你可以使用订单号和下单邮箱在订单查询页查看最新物流状态。',
    },
    {
      question: '支持退货吗？',
      answer: '大多数标准商品在签收后 30 天内可申请退货，但耳饰、个性化定制商品和明确标注为最终销售的商品，除质量问题外通常不支持无理由退货。',
    },
    {
      question: '如果收到破损或错发商品怎么办？',
      answer: '请尽量在签收后 72 小时内联系客户支持，并附上订单号、商品照片、外包装照片和物流标签。客服核实后会安排补发、换货或退款处理。',
    },
    {
      question: '商品是怎么选出来的？',
      answer: '商品库会经过选品、整理和发布审核，保持精品化陈列，而不是一次性堆满大量 SKU。',
    },
    {
      question: '为什么商品数量保持精选？',
      answer: '更聚焦的商品结构有助于建立送礼氛围、页面节奏和品牌质感，整体体验通常比铺货更好。',
    },
  ],
} as const;

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
    path: "/faq",
    title: locale === "zh" ? "常见问题与购物帮助" : "FAQ & Shopping Help",
    description:
      locale === "zh"
        ? "查看支付方式、发货、订单状态与送礼购物相关的常见问题。"
        : "Read answers about payment, shipping, order status and gifting support before you place an order.",
    keywords: locale === "zh" ? ["常见问题", "支付方式", "配送", "订单状态"] : ["FAQ", "payment methods", "shipping", "order status"],
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs[locale].map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <StorefrontPageHero
        eyebrow='FAQ'
        title={dictionary.content.faqTitle}
        description={dictionary.content.faqDescription}
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === "zh" ? "服务说明" : "Service notes"}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '这里集中回答支付方式、发货时效、订单状态和精选商品策略等高频问题，帮助用户在下单前减少疑问。'
                : 'This page answers common questions about payment, delivery timing, order status and the store’s curated assortment so shoppers can buy with fewer uncertainties.'}
            </p>
          </div>
        }
      />

      <Container className='grid gap-4'>
        <StorefrontPanel className='p-5 sm:p-6'>
          <div className='grid gap-3 grid-cols-2 sm:grid-cols-3'>
            <Link className='rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/policies/shipping`}>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>{locale === 'zh' ? '配送政策' : 'Shipping policy'}</p>
              <p className='mt-2'>{locale === 'zh' ? '查看处理时间、配送地区与税费说明。' : 'Review processing time, delivery regions and tax notes.'}</p>
            </Link>
            <Link className='rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/policies/returns`}>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>{locale === 'zh' ? '退换政策' : 'Returns policy'}</p>
              <p className='mt-2'>{locale === 'zh' ? '查看退货时限、退款节奏与售后条件。' : 'See return windows, refund timing and after-sales conditions.'}</p>
            </Link>
            <Link className='col-span-2 rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88] sm:col-span-1' href={`/${locale}/contact`}>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>{locale === 'zh' ? '联系支持' : 'Contact support'}</p>
              <p className='mt-2'>{locale === 'zh' ? '如果需要人工帮助，可直接进入联系页面。' : 'If you still need manual help, continue to the contact page.'}</p>
            </Link>
          </div>
        </StorefrontPanel>

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
