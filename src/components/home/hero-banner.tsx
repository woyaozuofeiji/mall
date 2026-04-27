import Image from "next/image";
import { ArrowRight, Clock3, PackageCheck, Sparkles } from "lucide-react";
import type { Locale, Product, SiteDictionary } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

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

export function HeroBanner({
  locale,
  dictionary,
  featuredProduct,
  secondaryProduct,
}: {
  locale: Locale;
  dictionary: SiteDictionary;
  featuredProduct?: Product;
  secondaryProduct?: Product;
}) {
  const promiseItems =
    locale === "zh"
      ? [
          {
            title: "编辑式选品",
            description: "少量精选毛绒、饰品和桌面小物，适合送礼、自留和收藏。",
          },
          {
            title: "清晰购物体验",
            description: "从商品详情、购物车到支付和订单查询，每一步都方便确认。",
          },
          {
            title: "安心服务信息",
            description: "配送、退换、客服和订单进度都可以在下单前后清楚查看。",
          },
        ]
      : [
          {
            title: "Editorial curation",
            description: "A focused edit of plush toys, jewelry and desk gifts for giving, keeping and collecting.",
          },
          {
            title: "Clear shopping flow",
            description: "Product details, cart, payment and order tracking are arranged for easy review.",
          },
          {
            title: "Service details up front",
            description: "Shipping, returns, customer care and order updates are easy to check before and after purchase.",
          },
        ];

  const topMarkers =
    locale === "zh"
      ? ["Northstar Atelier", "Boutique gifting", "Seasonal edit 01"]
      : ["Northstar Atelier", "Boutique gifting", "Seasonal edit 01"];

  const signatureNote =
    locale === "zh"
      ? {
          quote: "一件合适的小礼物，往往来自清楚的场景、细节和心意。",
          note: "从新品到精选，每个版块都围绕真实送礼场景整理。",
        }
      : {
          quote: "A thoughtful small gift starts with a clear moment, useful details and a little care.",
          note: "From new arrivals to featured picks, each section is shaped around real gifting occasions.",
        };

  const heroNote =
    locale === "zh"
      ? {
          eyebrow: "本期精选",
          title: "为送礼、自留和收藏挑选更有心意的好物。",
          description:
            "从柔软毛绒到精致饰品，再到桌面小礼物，每个推荐都围绕真实使用和送礼场景展开。",
          secondaryTitle: "最近上新与精选陈列",
          secondaryDescription: "快速查看近期值得关注的商品，也可以继续进入分类慢慢挑选。",
          productLabel: "主推商品",
          arrivalLabel: "本周上新",
          viewLabel: "查看商品",
          leadTimeLabel: "发货周期",
          categoryLabel: "品类方向",
          noteLabel: "Private edit",
        }
      : {
          eyebrow: "Featured this season",
          title: "Thoughtful pieces for gifting, keeping, and collecting.",
          description:
            "From soft plush to refined jewelry and small desk gifts, each pick is selected around real gifting and everyday-use moments.",
          secondaryTitle: "Recent arrivals and featured picks",
          secondaryDescription:
            "Preview the latest pieces worth noticing, or continue into a collection to browse at your own pace.",
          productLabel: "Signature pick",
          arrivalLabel: "Fresh arrival",
          viewLabel: "View product",
          leadTimeLabel: "Lead time",
          categoryLabel: "Category",
          noteLabel: "Private edit",
        };

  return (
    <section className="relative overflow-hidden border-b border-[rgba(59,47,37,0.08)] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,137,73,0.24),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(28,50,77,0.16),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.34)_100%)]" />
      <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.38)] blur-3xl" />

      <Container className="relative grid items-center gap-14 xl:grid-cols-[1.02fr_0.98fr] xl:gap-16">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d7b69]">
            {topMarkers.map((item, index) => (
              <div key={item} className="inline-flex items-center gap-3">
                {index > 0 ? <span className="h-px w-6 bg-[rgba(184,137,73,0.34)]" /> : null}
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Badge>{dictionary.hero.eyebrow}</Badge>

          <div className="space-y-6">
            <h1 className="max-w-4xl font-serif text-[3.8rem] leading-[0.94] tracking-[-0.045em] text-[#171411] sm:text-[5rem] lg:text-[5.7rem]">
              {dictionary.hero.title}
            </h1>
            <p className="max-w-2xl text-[1.02rem] leading-8 text-[#6a5f55] sm:text-[1.12rem]">
              {dictionary.hero.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button href={`/${locale}/shop`} size="lg">
              {dictionary.hero.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button href={`/${locale}/policies/shipping`} variant="secondary" size="lg">
              {dictionary.hero.secondaryCta}
            </Button>
          </div>

          <div className="rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_24px_68px_-52px_rgba(41,32,24,0.44)] backdrop-blur-xl sm:p-6">
            <p className="font-serif text-[1.7rem] leading-[1.08] tracking-[-0.03em] text-[#171411] sm:text-[2rem]">“{signatureNote.quote}”</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8b7c6d]">{signatureNote.note}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {dictionary.hero.stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.85rem] border border-[rgba(59,47,37,0.08)] bg-white/74 p-5 shadow-[0_30px_80px_-48px_rgba(43,33,23,0.45)] backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9a7341]">{item.label}</p>
                <p className="mt-4 font-serif text-[1.7rem] leading-none text-[#171411]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {promiseItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.8rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_24px_70px_-52px_rgba(41,32,24,0.45)] backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f6731]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6258]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[rgba(184,137,73,0.18)] blur-3xl" />
          <div className="absolute -right-10 bottom-8 h-48 w-48 rounded-full bg-[rgba(39,56,77,0.12)] blur-3xl" />

          <div className="relative overflow-hidden rounded-[3rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(135deg,#171411_0%,#211b18_46%,#efe3d2_100%)] p-4 shadow-[0_50px_130px_-48px_rgba(20,15,12,0.76)] sm:p-5">
            <div className="absolute right-5 top-5 z-10 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/76 backdrop-blur-xl">
              {heroNote.noteLabel}
            </div>
            <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="grid gap-4">
                <div className="rounded-[2.1rem] border border-white/10 bg-white/7 p-6 text-white backdrop-blur-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/76">
                    <Sparkles className="h-3.5 w-3.5" /> {heroNote.eyebrow}
                  </div>
                  <h2 className="mt-5 font-serif text-[2.1rem] leading-[1.02] tracking-[-0.03em]">{heroNote.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-white/72">{heroNote.description}</p>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                        <Clock3 className="h-4 w-4" /> {heroNote.leadTimeLabel}
                      </div>
                      <p className="mt-3 font-serif text-[1.4rem] leading-none">
                        {featuredProduct ? t(locale, featuredProduct.leadTime) : locale === "zh" ? "5-9 个工作日" : "5-9 business days"}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                        <PackageCheck className="h-4 w-4" /> {heroNote.categoryLabel}
                      </div>
                      <p className="mt-3 font-serif text-[1.35rem] leading-none">
                        {featuredProduct
                          ? categoryLabels[featuredProduct.categorySlug]?.[locale] ?? featuredProduct.categorySlug
                          : locale === "zh"
                            ? "精选礼品"
                            : "Curated gifting"}
                      </p>
                    </div>
                  </div>
                </div>

                {secondaryProduct ? (
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-xl">
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10">
                      <Image
                        src={secondaryProduct.image}
                        alt={t(locale, secondaryProduct.name)}
                        fill
                        sizes="(min-width: 1280px) 18vw, (min-width: 640px) 40vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-[#171411]/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/86 backdrop-blur">
                        {heroNote.arrivalLabel}
                      </div>
                    </div>
                    <div className="p-5 text-white">
                      <h3 className="font-serif text-[1.65rem] leading-none">{heroNote.secondaryTitle}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/72">{heroNote.secondaryDescription}</p>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/56">{t(locale, secondaryProduct.name)}</p>
                          <p className="mt-2 text-base font-medium text-white">{formatCurrency(secondaryProduct.price, locale)}</p>
                        </div>
                        <Button href={`/${locale}/shop/${secondaryProduct.slug}`} variant="secondary" className="border-white/14 bg-white/10 text-white hover:bg-white/14">
                          {heroNote.viewLabel}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[rgba(255,255,255,0.14)]">
                {featuredProduct ? (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,9,8,0.08)_0%,rgba(11,9,8,0.54)_100%)]" />
                    <Image
                      src={featuredProduct.image}
                      alt={t(locale, featuredProduct.name)}
                      fill
                      loading="eager"
                      sizes="(min-width: 1280px) 34vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      <Badge className="border-white/14 bg-[#171411]/58 text-white shadow-none">{heroNote.productLabel}</Badge>
                      {featuredProduct.isNew ? (
                        <Badge className="border-transparent bg-white text-[#171411] shadow-none">
                          {locale === "zh" ? "新品" : "New"}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-5 bottom-5 rounded-[1.85rem] border border-white/12 bg-[#171411]/66 p-5 text-white backdrop-blur-xl sm:p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/64">
                        {categoryLabels[featuredProduct.categorySlug]?.[locale] ?? featuredProduct.categorySlug}
                      </p>
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-[2.2rem] leading-[0.98] tracking-[-0.03em]">{t(locale, featuredProduct.name)}</h3>
                          <p className="mt-3 max-w-md text-sm leading-7 text-white/74">{t(locale, featuredProduct.subtitle)}</p>
                        </div>
                        <div className="rounded-full border border-white/12 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                          {formatCurrency(featuredProduct.price, locale)}
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button href={`/${locale}/shop/${featuredProduct.slug}`} variant="secondary" className="border-white/14 bg-white/10 text-white hover:bg-white/14">
                          {heroNote.viewLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="inline-flex items-center rounded-full border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/62">
                          {featuredProduct.variants.length.toString().padStart(2, "0")} {locale === "zh" ? "个规格" : "variants"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[34rem] flex-col justify-end p-8 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{heroNote.productLabel}</p>
                    <h3 className="mt-4 font-serif text-[2.5rem] leading-none">
                      {locale === "zh" ? "先从本期精选开始，找到适合当下心意的选择。" : "Start with this edit and find a piece that fits the moment."}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
