import { Layers3, PackageCheck, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap = [Sparkles, Layers3, PackageCheck] as const;

export function FeatureGrid({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          eyebrow: "为什么选择我们",
          title: "从挑选到收货，每一步都更清楚。",
          description:
            "我们把商品风格、服务说明和下单流程放在同一套清晰体验里，让你可以安心挑选礼物，也能随时确认订单进度。",
          metrics: [
            { label: "选品方式", value: "少而精" },
            { label: "下单流程", value: "浏览 → 支付" },
            { label: "订单服务", value: "可查询" },
          ],
          features: [
            {
              step: "01",
              title: "有筛选的商品组合",
              description:
                "毛绒、饰品和桌面礼物都围绕送礼、自用和陈列场景整理，减少无目的浏览。",
            },
            {
              step: "02",
              title: "清楚的商品与服务信息",
              description:
                "商品详情、发货说明、常见问题和售后政策都可以在下单前查看，减少沟通成本。",
            },
            {
              step: "03",
              title: "顺畅的支付与订单查询",
              description:
                "确认收货信息后继续付款，付款完成即可通过订单查询页跟进处理与物流状态。",
            },
          ],
        }
      : {
          eyebrow: "Why shop with us",
          title: "Clear choices, clear checkout, clear order updates.",
          description:
            "Our collections, service notes, and checkout flow are arranged so you can choose a thoughtful gift and review every important detail before payment.",
          metrics: [
            { label: "Curation", value: "Focused edit" },
            { label: "Checkout path", value: "Browse → pay" },
            { label: "Order support", value: "Trackable" },
          ],
          features: [
            {
              step: "01",
              title: "A focused product edit",
              description:
                "Plush toys, jewelry, and desk gifts are organized around gifting, keeping, and display-friendly occasions.",
            },
            {
              step: "02",
              title: "Product and service details up front",
              description:
                "Product details, shipping notes, FAQs, and return policies are easy to review before you place an order.",
            },
            {
              step: "03",
              title: "Smooth payment and order tracking",
              description:
                "After confirming your address, continue to payment and use order tracking to follow processing and delivery updates.",
            },
          ],
        };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="flex h-full flex-col justify-between rounded-[2.45rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(184,137,73,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] p-7 text-white sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4af78]">{content.eyebrow}</p>
          <h3 className="mt-5 max-w-xl font-serif text-[2.45rem] leading-[1.02] tracking-[-0.03em] sm:text-[3rem]">
            {content.title}
          </h3>
          <p className="mt-5 max-w-xl text-sm leading-8 text-[rgba(255,255,255,0.7)] sm:text-[15px]">{content.description}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {content.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">{metric.label}</p>
              <p className="mt-3 font-serif text-[1.45rem] leading-none">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {content.features.map((feature, index) => {
          const Icon = iconMap[index] ?? Sparkles;

          return (
            <div
              key={feature.title}
              className={cn(
                "relative overflow-hidden rounded-[2rem] border border-white/10 p-6 text-white shadow-[0_30px_80px_-54px_rgba(0,0,0,0.65)]",
                index === 1
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_100%)]"
                  : "bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)]",
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,137,73,0.14),transparent_32%)]" />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[#f0d8b6] backdrop-blur-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d4af78]">{feature.step}</p>
                <h4 className="mt-4 font-serif text-[1.9rem] leading-[1.02] tracking-[-0.03em]">{feature.title}</h4>
                <p className="mt-4 text-sm leading-8 text-[rgba(255,255,255,0.72)]">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
