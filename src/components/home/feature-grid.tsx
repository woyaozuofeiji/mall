import { Layers3, PackageCheck, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap = [Sparkles, Layers3, PackageCheck] as const;

export function FeatureGrid({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          eyebrow: "品牌体验框架",
          title: "首页不只是好看，还要替后续运营留出空间。",
          description:
            "这一块我改成了更像品牌方法论的展示方式：既讲视觉方向，也讲商品结构、转化路径和未来扩展能力，让首页从“漂亮”变成“更可信、更像成熟品牌站”。",
          metrics: [
            { label: "陈列逻辑", value: "少而精" },
            { label: "转化路径", value: "展示 → 下单" },
            { label: "后续扩展", value: "支付 / 邮件 / 会员" },
          ],
          features: [
            {
              step: "01",
              title: "先建立审美门槛",
              description:
                "把视觉、留白、图片比例和文案语气统一起来，首页会更像一个有主张的精品品牌，而不是普通模板商城。",
            },
            {
              step: "02",
              title: "把选品策略显性化",
              description:
                "通过分类入口、主推商品和上新结构，让用户理解你卖的不是“很多商品”，而是“有筛选后的商品”。",
            },
            {
              step: "03",
              title: "给增长预留清晰接口",
              description:
                "现阶段先把品牌感和下单体验做顺，再逐步接入支付、邮件自动化和会员运营，不需要推倒重来。",
            },
          ],
        }
      : {
          eyebrow: "Experience framework",
          title: "The homepage should look elevated, but it should also support future growth decisions.",
          description:
            "This section reframes the value of the storefront: it explains the visual direction, the merchandising logic and the conversion path, which makes the homepage feel more like a mature brand system than a one-off landing page.",
          metrics: [
            { label: "Merchandising", value: "Curated edit" },
            { label: "Conversion path", value: "Browse → request" },
            { label: "Future layers", value: "Payments / CRM / loyalty" },
          ],
          features: [
            {
              step: "01",
              title: "Set a stronger aesthetic threshold",
              description:
                "Consistent spacing, image framing and copy rhythm make the storefront feel intentional and premium instead of template-driven.",
            },
            {
              step: "02",
              title: "Make curation visible",
              description:
                "Category entry points, signature products and new-arrival structures should communicate selection discipline, not catalog volume.",
            },
            {
              step: "03",
              title: "Keep clear room for scale",
              description:
                "Once the brand feel and order flow are right, payment, lifecycle email and membership layers can be added without changing the foundation.",
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
