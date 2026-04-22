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

  const sections =
    locale === "zh"
      ? [
          {
            title: "退货申请时限",
            body: "除页面已明确标注为定制、贴身饰品或不可退商品外，大部分商品支持在签收后 30 天内提交退货申请。请先联系客户支持并提供订单号，待审核通过后再寄回。",
            bullets: ["到货破损、错发、重大质量问题请尽量在签收后 72 小时内联系，以便优先处理。", "未经确认直接退回的包裹可能无法正常入库和退款。"],
          },
          {
            title: "可退与不可退情形",
            body: "商品需保持未使用、未清洗、无明显磨损，并保留原包装、配件及赠品。若商品存在卫生限制、个性化定制或明确标注为最终销售，通常不支持无理由退货。",
            bullets: ["耳饰、贴身饰品、定制礼盒和清仓特价商品通常不支持非质量问题退货。", "因颜色显示差异、轻微手工痕迹或个人偏好造成的主观不满，可能不构成质量问题。"],
          },
          {
            title: "退款与换货处理",
            body: "退回商品经仓库签收并完成检查后，我们通常会在 5-10 个工作日内原路退款。若你更希望换货，可在库存允许的前提下安排一次同价换货或补差价换购。",
            bullets: ["原支付渠道的到账时间会受银行、PayPal 或发卡机构处理周期影响。", "原始运费、关税和清关费用通常不在普通退货退款范围内，除非属于错发或质量问题。"],
          },
          {
            title: "破损、错发与包裹异常",
            body: "如果收到的商品有破损、缺件、错发或明显运输损坏，请在签收后尽快提交清晰照片、外箱照片和订单信息。客服确认后会优先安排补发、换货或退款。",
            bullets: ["请尽量保留商品外包装和物流标签，直到问题处理完成。", "若包裹因地址错误、拒收或无人签收被退回，我们会先与你确认重新发货或扣除相关费用后的退款方案。"],
          },
          {
            title: "退货运费责任",
            body: "普通非质量问题退货的寄回运费通常由买家承担；若属于商品破损、错发或经确认的质量问题，店铺会根据情况承担合理的补寄或退货成本。",
            bullets: ["建议使用可追踪的寄回方式，并保留寄件凭证。", "退款完成前若物流遗失且无法提供有效追踪，售后处理可能会受到影响。"],
          },
        ]
      : [
          {
            title: "Return request window",
            body: "Unless an item is clearly marked as personalized, intimate jewelry or final sale, most products may be returned within 30 days after delivery. Please contact support with your order number first so we can approve the request before the parcel is sent back.",
            bullets: [
              "Damage, incorrect items or major quality issues should be reported within 72 hours of delivery whenever possible.",
              "Unapproved returns sent back without confirmation may not be accepted into our returns workflow.",
            ],
          },
          {
            title: "Eligible and non-returnable cases",
            body: "Returned items must be unused, unwashed and free from visible wear, with the original packaging, accessories and any included gifts intact. Hygiene-sensitive products, personalized items and clearly marked final-sale products are generally not eligible for change-of-mind returns.",
            bullets: [
              "Earrings, intimate accessories, customized gift sets and clearance items are usually non-returnable unless there is a verified issue.",
              "Minor handmade variation, slight color differences across screens or preference-based dissatisfaction may not qualify as product defects.",
            ],
          },
          {
            title: "Refunds and exchanges",
            body: "Once the returned parcel is received and inspected, refunds are usually issued to the original payment method within 5-10 business days. If you prefer an exchange, we can arrange a replacement of equal value or a price-adjusted swap when stock is available.",
            bullets: [
              "Posting time depends on your bank, PayPal or card issuer.",
              "Original shipping fees, duties and customs charges are generally non-refundable unless the return is caused by damage, mis-shipment or a confirmed defect.",
            ],
          },
          {
            title: "Damaged, incorrect or delivery-exception orders",
            body: "If your order arrives damaged, incomplete, incorrect or visibly affected by transit issues, please send clear photos of the item, packaging and label together with your order details. After review, we will prioritize a replacement, reshipment or refund solution.",
            bullets: [
              "Please keep the external packaging and shipping label until the claim is resolved.",
              "If a parcel is returned because of an incorrect address, refusal or failed delivery, we will confirm whether to reship or issue a refund minus the related handling costs.",
            ],
          },
          {
            title: "Return shipping responsibility",
            body: "For standard non-defective returns, return shipping costs are usually paid by the customer. If the issue is verified as damage, mis-shipment or a quality defect, the store will cover reasonable replacement or return-related costs as appropriate.",
            bullets: [
              "We recommend using a trackable return service and keeping your postage receipt.",
              "If a return parcel is lost in transit and no valid tracking can be provided, refund handling may be delayed or declined.",
            ],
          },
        ];

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === "zh" ? "退换与退款政策" : "Return & Refund Policy"}
      intro={
        locale === "zh"
          ? "这里会说明退货时限、适用条件、破损/错发处理、退款节奏与退货运费责任，让下单前的售后预期更加明确。"
          : "This page explains return windows, eligibility, damaged-item handling, refund timing and return-shipping responsibility before purchase."
      }
      points={[]}
      sections={sections}
    />
  );
}
