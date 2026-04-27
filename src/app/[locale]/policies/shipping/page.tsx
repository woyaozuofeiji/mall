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

  const sections =
    locale === "zh"
      ? [
          {
            title: "订单处理时间",
            body: "现货商品通常会在付款确认后的 1-3 个工作日内完成质检、包装和出库；节日高峰、预售款或定制款会在商品页单独标注更长的处理周期。",
            bullets: ["周末与法定节假日不计入处理时效。", "同一订单包含预售或延迟备货商品时，会以最晚可出库商品为准统一安排发货。"],
          },
          {
            title: "配送范围与参考时效",
            body: "目前支持美国、加拿大、英国、欧盟主要国家、澳大利亚、新西兰以及部分亚洲地区下单，实际可配送范围以下单页地址校验结果为准。",
            bullets: [
              "美国本土标准配送：下单后约 4-8 个工作日送达。",
              "加拿大、英国、欧盟主要国家：下单后约 6-12 个工作日送达。",
              "澳大利亚、新西兰及部分亚洲地区：下单后约 7-14 个工作日送达。",
            ],
          },
          {
            title: "运费与免邮规则",
            body: "系统会在结账页根据收货国家、商品体积和订单金额自动计算运费。活动期间若有免邮门槛或地区性优惠，会在首页横幅、商品页或结账页同步说明。",
            bullets: ["单件轻小商品通常可合单配送。", "超大件、易碎或特殊包装商品可能需要单独计算附加运费。"],
          },
          {
            title: "物流追踪与异常情况",
            body: "订单发出后，你会收到包含承运商与运单号的确认信息，也可以前往订单追踪页查询最新状态。若物流 5 个工作日以上未更新，请联系客户支持协助核查。",
            bullets: ["大促、海关查验、极端天气和当地派送压力都可能影响签收时效。", "如果包裹被退回或派送失败，我们会先与你确认重新派送或退款方案。"],
          },
          {
            title: "税费、关税与国际订单说明",
            body: "国际订单可能会因目的地海关政策产生进口税、关税或清关服务费；除结账页已明确收取的项目外，相关费用通常由收件人承担。",
            bullets: ["请确保收货姓名、电话和地址信息完整准确，以减少清关和派送异常。", "若目的地国家有特殊限制，客服会在发货前主动联系确认。"],
          },
        ]
      : [
          {
            title: "Order processing time",
            body: "In-stock orders are usually quality-checked, packed and dispatched within 1-3 business days after payment is confirmed. Pre-order, made-to-order or holiday-volume items may require longer handling times and will be labeled on the product page.",
            bullets: [
              "Weekends and public holidays are not counted as business days.",
              "If one order contains both ready-to-ship and delayed items, shipment will be arranged around the longest handling item unless otherwise stated.",
            ],
          },
          {
            title: "Supported regions and delivery windows",
            body: "We currently ship to the United States, Canada, the United Kingdom, major EU destinations, Australia, New Zealand and selected Asian markets. Final availability is confirmed at checkout based on the delivery address.",
            bullets: [
              "United States standard shipping: usually 4-8 business days after dispatch.",
              "Canada, the UK and major EU destinations: usually 6-12 business days after dispatch.",
              "Australia, New Zealand and selected Asian destinations: usually 7-14 business days after dispatch.",
            ],
          },
          {
            title: "Shipping fees and free-shipping offers",
            body: "Shipping costs are calculated at checkout based on destination, parcel size and order value. Any free-shipping thresholds or regional campaigns will be stated on the homepage banner, product page or checkout when active.",
            bullets: [
              "Small and lightweight items are usually eligible for combined shipping.",
              "Oversized, fragile or specialty-packaged items may carry an additional fulfillment surcharge.",
            ],
          },
          {
            title: "Tracking updates and delivery delays",
            body: "Once your order ships, a carrier and tracking number will be shared with you and can also be reviewed from the order tracking page. If a shipment shows no movement for more than 5 business days, please contact support so we can investigate.",
            bullets: [
              "Sales peaks, customs review, extreme weather and local carrier pressure can all extend delivery windows.",
              "If a parcel is returned to sender or delivery fails, we will contact you before arranging reshipment or refund handling.",
            ],
          },
          {
            title: "Taxes, duties and international orders",
            body: "International shipments may be subject to import duties, VAT, customs handling fees or other destination-specific charges. Unless these fees are collected at checkout, they are generally the responsibility of the recipient.",
            bullets: [
              "Please make sure the recipient name, phone number and address are accurate to reduce customs or final-mile exceptions.",
              "If your destination has special restrictions, support may contact you before dispatch for confirmation.",
            ],
          },
        ];

  return (
    <PolicyTemplate
      locale={locale}
      title={locale === 'zh' ? '配送政策' : 'Shipping Policy'}
      intro={
        locale === 'zh'
          ? '这里会明确说明处理时间、配送范围、运费、物流追踪、税费与国际订单事项，帮助你在下单前建立清晰预期。'
          : 'This page covers processing time, delivery regions, shipping fees, tracking updates, taxes and key international-order expectations before purchase.'
      }
      points={[]}
      sections={sections}
    />
  );
}
