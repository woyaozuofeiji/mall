import type { Metadata } from "next";
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildPageMetadata } from "@/lib/seo";
import { PolicyTemplate } from '@/components/storefront/policy-template';

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
    path: "/policies/terms",
    title: locale === "zh" ? "服务条款" : "Terms of Service",
    description:
      locale === "zh"
        ? "阅读订单成立、支付、履约、取消申请与售后责任相关服务条款。"
        : "Read the terms covering order acceptance, payment, fulfillment, cancellations and after-sales responsibilities.",
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  getDictionary(locale);

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === 'zh' ? '服务条款' : 'Terms of Service'}
      intro={
        locale === 'zh'
          ? '服务条款页应该把订单成立条件、沟通方式和履约约定说清楚。'
          : 'The terms page should clearly frame order acceptance, communication expectations and fulfillment commitments.'
      }
      points={
        locale === 'zh'
          ? [
              '明确说明订单在付款成功后成立，系统状态会按已确认、处理中、已发货等节点推进。',
              '补充供应商发货时间波动、客服联系方式，以及异常订单、地址修改或取消请求的处理原则。',
              '说明支付争议、退款审核和售后责任边界，确保交易说明与实际服务流程一致。',
            ]
          : [
              'Clarify that the order is accepted after successful payment and that statuses move through confirmation, processing and shipment milestones.',
              'Add expectations around supplier lead-time variability, support communication and how address changes, cancellation requests or exceptional orders are handled.',
              'Document payment disputes, refund review timing and after-sales responsibilities so the written terms match the real service flow.',
            ]
      }
    />
  );
}
