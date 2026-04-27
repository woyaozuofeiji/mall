import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, PackageCheck, Sparkles } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, Record<Locale, string>> = {
  plush: {
    en: "Plush & dolls",
    zh: "玩偶与毛绒",
  },
  jewelry: {
    en: "Jewelry & accessories",
    zh: "首饰与配饰",
  },
  gifts: {
    en: "Desk gifts",
    zh: "桌面礼品",
  },
};

export function FeaturedShowcase({ featured, locale }: { featured: Product[]; locale: Locale }) {
  const lead = featured[0];
  const rest = featured.slice(1, 4);

  const copy =
    locale === "zh"
      ? {
          signatureBadge: "编辑精选",
          newLabel: "新品",
          editorPick: "主推商品",
          introLabel: "本期主推",
          empty: "精选推荐正在整理中，稍后会带来更适合送礼和收藏的单品。",
          leadTime: "发货周期",
          variants: "可选规格",
          variantsUnit: "个",
          category: "风格方向",
          primaryCta: "进入商品页",
          secondaryCta: "查看全部商品",
          cardLabel: "精选系列",
          curationPill: "精选理由",
          curationTitle: "每一件推荐，都围绕礼物质感与日常使用挑选。",
          curationDescription:
            "我们优先挑选容易送出心意、适合陈列保存、并且服务信息清晰的商品，让浏览过程更省心。",
          metrics: [
            { label: "送礼场景", value: "生日 / 感谢" },
            { label: "挑选标准", value: "精致耐看" },
            { label: "服务信息", value: "清晰可查" },
          ],
        }
      : {
          signatureBadge: "Editorial pick",
          newLabel: "New",
          editorPick: "Signature merchandise",
          introLabel: "Featured focus",
          empty: "Featured picks are being curated. More gift-ready pieces will appear here soon.",
          leadTime: "Lead time",
          variants: "Variants",
          variantsUnit: "options",
          category: "Merchandising angle",
          primaryCta: "Open product page",
          secondaryCta: "Browse full shop",
          cardLabel: "Featured edit",
          curationPill: "Why these picks",
          curationTitle: "Each featured item is chosen for gifting appeal and everyday use.",
          curationDescription:
            "We prioritize pieces that feel thoughtful, display beautifully, and come with clear service information before checkout.",
          metrics: [
            { label: "Gift moments", value: "Birthday / thanks" },
            { label: "Selection lens", value: "Refined pieces" },
            { label: "Service details", value: "Clear to review" },
          ],
        };

  if (!lead) {
    return (
      <div className="rounded-[2.2rem] border border-[rgba(59,47,37,0.08)] bg-white/76 p-8 text-sm leading-8 text-[#6d6258] shadow-[0_30px_80px_-56px_rgba(29,22,18,0.48)]">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="overflow-hidden rounded-[2.5rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.8)] shadow-[0_36px_100px_-60px_rgba(24,18,14,0.56)]">
        <div className="grid h-full lg:grid-cols-[1.06fr_0.94fr]">
          <Link
            href={`/${locale}/shop/${lead.slug}`}
            className="group relative min-h-[25rem] overflow-hidden bg-[linear-gradient(180deg,#fbf8f3_0%,#efe5d7_100%)]"
          >
            <Image
              src={lead.image}
              alt={t(locale, lead.name)}
              fill
              sizes="(min-width: 1280px) 34vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <Badge>{copy.signatureBadge}</Badge>
              {lead.isNew ? (
                <Badge className="border-transparent bg-[#171717] text-white shadow-[0_12px_30px_-22px_rgba(18,18,18,0.7)]">{copy.newLabel}</Badge>
              ) : null}
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/12 bg-[#171411]/68 p-5 text-white backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/62">{copy.editorPick}</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-serif text-[2rem] leading-[0.98] tracking-[-0.03em]">{t(locale, lead.name)}</h3>
                  <p className="mt-2 text-sm text-white/74">{formatCurrency(lead.price, locale)}</p>
                </div>
                <div className="rounded-full border border-white/12 bg-white/10 p-3 text-white transition group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          <div className="flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,137,73,0.2)] bg-[rgba(184,137,73,0.08)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f6731]">
                <Sparkles className="h-3.5 w-3.5" /> {copy.introLabel}
              </div>
              <div>
                <h3 className="font-serif text-[2.4rem] leading-[0.98] tracking-[-0.035em] text-[#171411]">{t(locale, lead.name)}</h3>
                <p className="mt-4 text-sm leading-8 text-[#6d6258]">{t(locale, lead.story) || t(locale, lead.subtitle)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-[rgba(59,47,37,0.08)] bg-white/82 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6731]">
                    <Clock3 className="h-4 w-4" /> {copy.leadTime}
                  </div>
                  <p className="mt-3 font-serif text-[1.4rem] leading-none text-[#171411]">{t(locale, lead.leadTime)}</p>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(59,47,37,0.08)] bg-white/82 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6731]">
                    <PackageCheck className="h-4 w-4" /> {copy.variants}
                  </div>
                  <p className="mt-3 font-serif text-[1.4rem] leading-none text-[#171411]">
                    {lead.variants.length.toString().padStart(2, "0")} {copy.variantsUnit}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(59,47,37,0.08)] bg-white/82 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6731]">
                    <Sparkles className="h-4 w-4" /> {copy.category}
                  </div>
                  <p className="mt-3 font-serif text-[1.25rem] leading-none text-[#171411]">
                    {categoryLabels[lead.categorySlug]?.[locale] ?? lead.categorySlug}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/${locale}/shop/${lead.slug}`}>
                {copy.primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button href={`/${locale}/shop`} variant="secondary">
                {copy.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {rest.map((product, index) => (
          <Link
            key={product.id}
            href={`/${locale}/shop/${product.slug}`}
            className="group grid gap-4 rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_26px_74px_-54px_rgba(24,18,14,0.46)] transition duration-300 hover:-translate-y-1 sm:grid-cols-[0.72fr_1.28fr] sm:p-5"
          >
            <div className="relative overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#fbf8f3_0%,#f1e8dc_100%)]">
              <Image
                src={product.image}
                alt={t(locale, product.name)}
                width={900}
                height={900}
                sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 100vw"
                className="aspect-[4/4.8] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9e7741]">
                  {copy.cardLabel} {String(index + 2).padStart(2, "0")}
                </p>
                <h4 className="mt-3 font-serif text-[1.75rem] leading-[1.02] tracking-[-0.03em] text-[#171411]">{t(locale, product.name)}</h4>
                <p
                  className="mt-3 text-sm leading-7 text-[#6d6258]"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {t(locale, product.subtitle)}
                </p>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-[rgba(59,47,37,0.06)] pt-4">
                <div>
                  <p className="text-lg font-semibold text-[#171411]">{formatCurrency(product.price, locale)}</p>
                  {product.compareAtPrice ? <p className="text-sm text-[#a09386] line-through">{formatCurrency(product.compareAtPrice, locale)}</p> : null}
                </div>
                <div className="rounded-full border border-[rgba(59,47,37,0.1)] bg-white/82 p-2 text-[#7a6e64] transition group-hover:border-[rgba(184,137,73,0.28)] group-hover:text-[#171411]">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        <div className="rounded-[2rem] border border-white/10 bg-[#171411] p-6 text-white shadow-[0_36px_90px_-58px_rgba(18,14,11,0.72)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af78]">{copy.curationPill}</p>
          <h4 className="mt-4 font-serif text-[2rem] leading-[1.02] tracking-[-0.03em]">{copy.curationTitle}</h4>
          <p className="mt-4 text-sm leading-8 text-[rgba(255,255,255,0.7)]">{copy.curationDescription}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {copy.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.45rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">{metric.label}</p>
                <p className="mt-3 font-serif text-[1.2rem] leading-none">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
