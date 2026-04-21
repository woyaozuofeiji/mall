import type { Metadata } from "next";
import { Mail, MessageCircleMore, PackageSearch } from 'lucide-react';
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
      title: 'Social / community',
      detail: '@northstaratelier',
      description: 'Ideal for launches, gifting stories and softer brand moments.',
      icon: MessageCircleMore,
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
      title: '社媒 / 社群',
      detail: '@northstaratelier',
      description: '适合承接上新内容、送礼灵感和品牌日常沟通。',
      icon: MessageCircleMore,
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
        ? "联系客户支持、社媒账号与供应链协同入口，处理订单、配送和商品咨询。"
        : "Reach customer care, social channels and supplier coordination contacts for order, shipping and product questions.",
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
                ? '如果需要咨询订单、配送、商品细节或供应链协同，可以从这里快速找到对应联系入口。'
                : 'Use these contact routes for order questions, shipping follow-up, product inquiries or supplier coordination.'}
            </p>
          </div>
        }
      />
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
    </div>
  );
}
