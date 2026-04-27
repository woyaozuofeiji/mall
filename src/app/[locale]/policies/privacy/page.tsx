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
    path: "/policies/privacy",
    title: locale === "zh" ? "隐私政策" : "Privacy Policy",
    description:
      locale === "zh"
        ? "了解站点如何收集、使用和管理客户资料，用于下单、客服沟通与物流履约。"
        : "Learn how customer data is collected, used and managed for checkout, support and order fulfillment.",
  });
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  getDictionary(locale);

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === 'zh' ? '隐私政策' : 'Privacy Policy'}
      intro={
        locale === 'zh'
          ? '我们重视你的个人信息保护，并会以清晰方式说明资料收集、使用和管理方式。'
          : 'We value your personal information and explain how data is collected, used and managed in clear terms.'
      }
      points={
        locale === 'zh'
          ? [
              '说明会收集哪些客户信息，以及这些信息会如何用于订单处理、支付核验、客服沟通和物流履约。',
              '明确数据保存时长、访问权限、第三方服务商参与范围，以及你如何申请修改、删除或导出自己的资料。',
              '提供营销订阅、站点分析和通知触达的退出方式，确保你可以清楚管理自己的偏好。',
            ]
          : [
              'Explain what customer information is collected and how it is used for order handling, payment verification, support and logistics fulfillment.',
              'Clarify retention expectations, access controls, third-party processor involvement and how customers can request updates, deletion or export of their data.',
              'Add opt-out guidance for marketing subscriptions, analytics and notification channels so customers can manage their preferences clearly.',
            ]
      }
    />
  );
}
