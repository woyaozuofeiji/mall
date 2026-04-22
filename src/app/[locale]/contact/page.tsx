import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, PackageSearch } from 'lucide-react';
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildPageMetadata } from "@/lib/seo";
import { Container } from '@/components/ui/container';
import { StorefrontPageHero, StorefrontPanel } from '@/components/storefront/page-hero';

const contactCards = {
  en: [
    {
      title: 'Customer support',
      detail: 'care@northstaratelier.com',
      description: 'Use this channel for order updates, shipping questions and product follow-up.',
      icon: Mail,
    },
    {
      title: 'Response time',
      detail: 'Within 1 business day',
      description: 'Support replies to order, shipping and return requests within one business day in most cases.',
      icon: Clock3,
    },
    {
      title: 'Supplier coordination',
      detail: 'operations@northstaratelier.com',
      description: 'Use this contact for vendor review, stock coordination and fulfillment follow-up.',
      icon: PackageSearch,
    },
  ],
  zh: [
    {
      title: '客户支持',
      detail: 'care@northstaratelier.com',
      description: '订单进度、配送问题和商品售后，都可以通过这个入口处理。',
      icon: Mail,
    },
    {
      title: '回复时效',
      detail: '1 个工作日内',
      description: '订单、配送和退换相关咨询通常会在 1 个工作日内得到回复。',
      icon: Clock3,
    },
    {
      title: '供应链协同',
      detail: 'operations@northstaratelier.com',
      description: '供应商对接、库存协同和履约确认可统一通过该入口处理。',
      icon: PackageSearch,
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
    path: "/contact",
    title: locale === "zh" ? "联系我们与客户支持" : "Contact & Customer Support",
    description:
      locale === "zh"
        ? "联系客户支持与供应链协同入口，处理订单、配送、退换与商品咨询。"
        : "Reach customer care and operations contacts for order, shipping, return and product questions.",
    keywords:
      locale === "zh"
        ? ["联系我们", "客户支持", "订单咨询", "配送问题"]
        : ["contact", "customer support", "shipping questions", "order support"],
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow='Contact'
        title={dictionary.content.contactTitle}
        description={dictionary.content.contactDescription}
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === "zh" ? "联系渠道" : "Contact channels"}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '如果需要咨询订单、配送、退换、商品细节或供应链协同，可以从这里快速找到对应联系入口。'
                : 'Use these contact routes for order questions, shipping follow-up, return handling, product inquiries or supplier coordination.'}
            </p>
          </div>
        }
      />
      <Container className='grid gap-3 grid-cols-2 lg:hidden'>
        <Link className='rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/order-tracking`}>
          <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
            {locale === 'zh' ? '查订单' : 'Track order'}
          </p>
          <p className='mt-2'>{locale === 'zh' ? '付款后继续查看发货和物流状态。' : 'Review payment, shipping and tracking updates.'}</p>
        </Link>
        <Link className='rounded-[1.25rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/faq`}>
          <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
            {locale === 'zh' ? '看帮助' : 'FAQ'}
          </p>
          <p className='mt-2'>{locale === 'zh' ? '先查看支付、配送与退换常见问题。' : 'Start with payment, shipping and return answers.'}</p>
        </Link>
      </Container>
      <Container className='grid gap-6 lg:grid-cols-3'>
        {contactCards[locale].map((card) => {
          const Icon = card.icon;
          return (
            <StorefrontPanel key={card.title} className='p-6 sm:p-7'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3f6] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]'>
                <Icon className='h-5 w-5' />
              </div>
              <h2 className='mt-5 text-[1.6rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>{card.title}</h2>
              <p className='mt-3 text-sm font-medium text-[#4d4650]'>{card.detail}</p>
              <p className='mt-3 text-sm leading-8 text-[#6d6670]'>{card.description}</p>
            </StorefrontPanel>
          );
        })}
      </Container>

      <Container className='grid gap-6 lg:grid-cols-[1.15fr_0.85fr]'>
        <StorefrontPanel className='p-6 sm:p-7'>
          <p className='text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
            {locale === 'zh' ? '联系建议' : 'Before you contact us'}
          </p>
          <div className='mt-4 space-y-4 text-sm leading-8 text-[#6d6670]'>
            <p>
              {locale === 'zh'
                ? '为了更快处理你的请求，请在邮件中附上订单号、下单邮箱、问题描述以及必要的商品或包裹照片。'
                : 'For faster help, include your order number, checkout email, a short issue summary and any helpful product or parcel photos in your first message.'}
            </p>
            <p>
              {locale === 'zh'
                ? '客服工作时间为周一至周五 09:00-18:00（UTC）。非工作时间提交的咨询会在下一个工作日继续处理。'
                : 'Support hours are Monday to Friday, 09:00-18:00 UTC. Requests sent outside these hours will be answered on the next business day.'}
            </p>
            <p>
              {locale === 'zh'
                ? '如需查询物流状态、退货条件或付款说明，也可以先查看常见问题、订单追踪页和政策页面。'
                : 'For shipment status, return eligibility or payment guidance, you can also review the FAQ, order-tracking page and policy pages first.'}
            </p>
          </div>
        </StorefrontPanel>

        <StorefrontPanel className='p-6 sm:p-7'>
          <p className='text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]'>
            {locale === 'zh' ? '常用入口' : 'Quick links'}
          </p>
          <div className='mt-4 space-y-3 text-sm leading-8 text-[#6d6670]'>
            <a className='block rounded-[1.25rem] bg-[#fff8fa] px-4 py-3 text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href='mailto:care@northstaratelier.com'>
              {locale === 'zh' ? '发送邮件到 care@northstaratelier.com' : 'Email care@northstaratelier.com'}
            </a>
            <Link className='block rounded-[1.25rem] bg-[#fff8fa] px-4 py-3 text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/order-tracking`}>
              {locale === 'zh' ? '查看订单追踪页面' : 'Open the order tracking page'}
            </Link>
            <Link className='block rounded-[1.25rem] bg-[#fff8fa] px-4 py-3 text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]' href={`/${locale}/faq`}>
              {locale === 'zh' ? '查看常见问题' : 'Read the FAQ'}
            </Link>
          </div>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
