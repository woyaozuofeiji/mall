import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { PolicyTemplate } from "@/components/storefront/policy-template";

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
    path: "/policies/returns",
    title: locale === "zh" ? "退换与退款政策" : "Return & Refund Policy",
    description:
      locale === "zh"
        ? "查看退货、换货、退款资格条件、反馈时效与售后处理说明。"
        : "Review eligibility, response timing and refund handling for returns, replacements and after-sales support.",
  });
}

export default async function ReturnsPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  getDictionary(locale);

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === "zh" ? "退换与退款政策" : "Return & Refund Policy"}
      intro={
        locale === "zh"
          ? "礼品与饰品类商品尤其需要把退换规则讲清楚，这会直接影响用户下单时的信任感。"
          : "Gift and accessory products especially benefit from a clear return policy, since it directly shapes purchase confidence."
      }
      points={
        locale === "zh"
          ? [
              "说明哪些情况支持退换，例如到货破损、错发、重大质量问题，以及对应的处理时间窗口。",
              "如果你采用代发模式，也要提前说明哪些商品不支持无理由退换，以及售后沟通应该走什么流程。",
              "建议同步补充照片凭证要求、客服回复时效和退款处理节奏。",
            ]
          : [
              "Clarify which cases qualify for returns or replacements, such as damage, incorrect items or significant quality issues, along with the applicable time window.",
              "If the store uses dropshipping, make it clear which products are non-returnable and how after-sales support should be handled.",
              "It also helps to state photo evidence requirements, support response timing and refund handling expectations.",
            ]
      }
    />
  );
}
