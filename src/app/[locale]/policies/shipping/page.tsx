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
    path: "/policies/shipping",
    title: locale === "zh" ? "配送政策" : "Shipping Policy",
    description:
      locale === "zh"
        ? "查看备货时间、配送地区、运单更新方式以及影响签收时效的常见因素。"
        : "See handling times, supported delivery regions, shipment updates and factors that may affect delivery windows.",
  });
}

export default async function ShippingPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  getDictionary(locale);

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === 'zh' ? '配送政策' : 'Shipping Policy'}
      intro={
        locale === 'zh'
          ? '这里会说明备货时间、配送区域、物流更新方式以及可能影响签收时效的常见因素。'
          : 'This page explains handling time, delivery regions, shipment updates and the common factors that may affect arrival windows.'
      }
      points={
        locale === 'zh'
          ? [
              '说明预计备货时间、发货周期、支持配送的地区，以及不同国家/地区的配送时效区间。',
              '明确物流信息的同步方式，例如发货后可通过订单查询页查看承运商与运单号。',
              '补充关税、异常天气、节假日排仓等可能影响签收时间的说明，帮助用户建立合理预期。',
            ]
          : [
              'Explain estimated handling time, dispatch timing, supported shipping regions and delivery windows by market.',
              'Clarify how tracking information is shared, for example through the order tracking page after dispatch.',
              'Document customs, weather or holiday-related delays that could affect delivery timing so customer expectations remain aligned.',
            ]
      }
    />
  );
}
