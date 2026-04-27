import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function BrandManifesto({
  locale,
  featuredProduct,
  secondaryProduct,
}: {
  locale: Locale;
  featuredProduct?: Product;
  secondaryProduct?: Product;
}) {
  const content =
    locale === "zh"
      ? {
          eyebrow: "品牌主张",
          title: "礼物不需要夸张，但需要让人感到被认真挑选。",
          description:
            "Northstar Atelier 挑选柔软毛绒、精致饰品和桌面小物，把商品细节、包装说明和服务信息放在清楚的位置，让你更容易判断哪一件适合当下的心意。",
          quote: "真正贴心的小礼物，不是更贵，而是更合适。",
          quoteNote: "让选择先变轻松，再让心意被看见。",
          cta: "浏览全部系列",
          metrics: [
            { label: "送礼场景", value: "生日 / 感谢 / 节日" },
            { label: "挑选方式", value: "少而精" },
            { label: "服务信息", value: "下单前可确认" },
          ],
          standardsTitle: "Atelier standards",
          standards: ["商品细节清楚呈现", "包装与配送说明可查", "适合送礼场景的精选陈列"],
          productLabel: "主视觉商品",
          productNote: "从本期精选开始，快速了解店铺的礼物风格。",
          supportingLabel: "辅助画面",
          supportingTitle: "用不同场景帮助你判断适不适合送出。",
          supportingText: "从材质、尺寸、包装和使用场景出发，给每一件小物更清楚的参考。",
          imageFallbackTitle: "Editorial study",
          supportingFallback: "Series composition",
        }
      : {
          eyebrow: "Brand manifesto",
          title: "A thoughtful gift does not need to be loud. It needs to feel carefully chosen.",
          description:
            "Northstar Atelier curates soft plush toys, refined jewelry and desk gifts with clear product details, packaging notes and service information so each choice is easier to judge.",
          quote: "A good small gift is not about being bigger. It is about fitting the moment.",
          quoteNote: "Make the choice feel simple, then let the gesture feel personal.",
          cta: "Browse the full collection",
          metrics: [
            { label: "Gift moments", value: "Birthdays / thanks" },
            { label: "Selection style", value: "Focused edit" },
            { label: "Service details", value: "Clear before checkout" },
          ],
          standardsTitle: "Atelier standards",
          standards: ["Clear product details", "Packaging and shipping notes", "Gift-ready collection edits"],
          productLabel: "Hero merchandise",
          productNote: "Start with the current edit to understand the shop’s gifting style.",
          supportingLabel: "Supporting frame",
          supportingTitle: "Use real occasions to decide whether a piece is right.",
          supportingText: "Material, size, packaging and use case notes make each small item easier to evaluate.",
          imageFallbackTitle: "Editorial study",
          supportingFallback: "Series composition",
        };

  return (
    <section className="relative py-10 sm:py-14">
      <Container className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-stretch">
        <div className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-[#171411] p-7 text-white shadow-[0_48px_130px_-74px_rgba(18,14,11,0.82)] sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,137,73,0.22),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(255,255,255,0.08),transparent_18%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e1c08e] backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" /> {content.eyebrow}
              </div>
              <h2 className="mt-6 max-w-xl font-serif text-[2.7rem] leading-[0.98] tracking-[-0.04em] sm:text-[3.4rem]">
                {content.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-[rgba(255,255,255,0.72)] sm:text-[15px]">{content.description}</p>
              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                <p className="font-serif text-[1.85rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.2rem]">“{content.quote}”</p>
                <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[rgba(255,255,255,0.54)]">{content.quoteNote}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {content.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.56)]">{metric.label}</p>
                    <p className="mt-3 font-serif text-[1.35rem] leading-none">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <Button href={`/${locale}/shop`} variant="secondary" className="border-white/14 bg-white/10 text-white hover:bg-white/14">
                  {content.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <div className="relative overflow-hidden rounded-[2.7rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(180deg,#f8f2ea_0%,#ffffff_100%)] shadow-[0_42px_110px_-64px_rgba(24,18,14,0.54)]">
            <div className="absolute left-5 top-5 z-10 rounded-full border border-white/12 bg-[#171411]/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white backdrop-blur-xl">
              {content.productLabel}
            </div>
            <div className="relative min-h-[21rem] sm:min-h-[26rem] lg:min-h-[34rem]">
              <Image
                src={featuredProduct?.image ?? "/products/jewelry-lifestyle.svg"}
                alt={featuredProduct ? t(locale, featuredProduct.name) : content.imageFallbackTitle}
                fill
                sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,14,12,0.02)_0%,rgba(17,14,12,0.52)_100%)]" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.9rem] border border-white/12 bg-[#171411]/68 p-5 text-white backdrop-blur-xl sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(255,255,255,0.58)]">{content.productLabel}</p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-[2rem] leading-[0.98] tracking-[-0.03em] sm:text-[2.35rem]">
                      {featuredProduct ? t(locale, featuredProduct.name) : content.imageFallbackTitle}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-[rgba(255,255,255,0.74)]">{content.productNote}</p>
                  </div>
                  {featuredProduct ? (
                    <div className="rounded-full border border-white/12 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                      {formatCurrency(featuredProduct.price, locale)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2.2rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(246,238,227,0.76)_100%)] p-6 shadow-[0_30px_90px_-62px_rgba(24,18,14,0.48)]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9e7741]">{content.standardsTitle}</p>
              <div className="mt-5 space-y-3">
                {content.standards.map((item, index) => (
                  <div key={item} className="rounded-[1.35rem] border border-[rgba(59,47,37,0.08)] bg-white/78 px-4 py-3 text-sm text-[#5e534a] shadow-[0_18px_40px_-34px_rgba(29,22,18,0.32)]">
                    <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9e7741]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(180deg,#f6efe6_0%,#ffffff_100%)] shadow-[0_30px_90px_-62px_rgba(24,18,14,0.48)]">
              <div className="absolute left-5 top-5 z-10 rounded-full border border-white/14 bg-[#171411]/58 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-xl">
                {content.supportingLabel}
              </div>
              <div className="relative min-h-[16rem] sm:min-h-[18rem]">
                <Image
                  src={secondaryProduct?.image ?? "/products/plush-lifestyle.svg"}
                  alt={secondaryProduct ? t(locale, secondaryProduct.name) : content.supportingFallback}
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 768px) 36vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,14,12,0.06)_0%,rgba(17,14,12,0.56)_100%)]" />
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/12 bg-[#171411]/68 p-5 text-white backdrop-blur-xl">
                <h3 className="font-serif text-[1.7rem] leading-[1.02] tracking-[-0.03em]">{content.supportingTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.74)]">{content.supportingText}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
