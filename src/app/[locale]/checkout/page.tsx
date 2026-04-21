import type { Metadata } from "next";
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildPageMetadata } from "@/lib/seo";
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Container } from '@/components/ui/container';
import { StorefrontPageHero } from '@/components/storefront/page-hero';

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
    path: "/checkout",
    title: locale === "zh" ? "安全结算" : "Secure Checkout",
    description:
      locale === "zh"
        ? "确认收货与联系信息并继续完成付款。"
        : "Confirm shipping and contact details before completing payment.",
    noIndex: true,
  });
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);

  return (
    <div className='space-y-10 pb-16 sm:space-y-12 sm:pb-20'>
      <StorefrontPageHero
        eyebrow='Checkout'
        title={dictionary.checkout.title}
        description={dictionary.checkout.description}
        side={
          <div className='space-y-3 text-[#6b6470]'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]'>
              {locale === 'zh' ? '安全结算' : 'Secure checkout'}
            </p>
            <p className='text-sm leading-7'>
              {locale === 'zh'
                ? '先确认收货与联系信息，再继续选择付款方式并完成订单支付。'
                : 'Confirm shipping and contact details first, then continue to payment selection and completion.'}
            </p>
          </div>
        }
      />
      <Container>
        <CheckoutForm locale={locale} dictionary={dictionary} />
      </Container>
    </div>
  );
}
