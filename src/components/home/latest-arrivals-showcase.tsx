import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3 } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";

export function LatestArrivalsShowcase({ latest, locale }: { latest: Product[]; locale: Locale }) {
  const lead = latest[0];
  const rest = latest.slice(1, 3);

  const copy =
    locale === "zh"
      ? {
          empty: "目前还没有新品数据，可以先把最近发布的商品标记为 isNew。",
          badge: "新品首发",
          title: "把新品区做成“值得点进来”的活动窗口。",
          description:
            "新品不需要只是再摆一排卡片，它更适合承担活动页入口、礼品专题预告和社媒流量承接的角色。",
          leadTime: "发货说明",
          price: "当前售价",
          primaryCta: "查看新品详情",
          secondaryCta: "进入全部商品",
        }
      : {
          empty: "No new arrivals are published yet. Mark a few products with isNew to activate this showcase.",
          badge: "New arrival focus",
          title: "Make new arrivals feel like a campaign window, not just another row of cards.",
          description:
            "The new-arrivals block should help with launches, gifting edits and paid-traffic landing moments, which is why it now has a stronger editorial lead item.",
          leadTime: "Shipping note",
          price: "Current price",
          primaryCta: "View new arrival",
          secondaryCta: "Browse full shop",
        };

  if (!lead) {
    return (
      <div className="rounded-[2.2rem] border border-[rgba(59,47,37,0.08)] bg-white/76 p-8 text-sm leading-8 text-[#6d6258] shadow-[0_30px_80px_-56px_rgba(29,22,18,0.48)]">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-[2.5rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.8)] shadow-[0_36px_100px_-60px_rgba(24,18,14,0.56)]">
        <div className="grid h-full lg:grid-cols-[1.04fr_0.96fr]">
          <Link
            href={`/${locale}/shop/${lead.slug}`}
            className="group relative min-h-[24rem] overflow-hidden bg-[linear-gradient(180deg,#fbf8f3_0%,#e8eff6_100%)]"
          >
            <Image
              src={lead.image}
              alt={t(locale, lead.name)}
              fill
              sizes="(min-width: 1280px) 34vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <Badge>{copy.badge}</Badge>
              <Badge className="border-transparent bg-[#171717] text-white shadow-[0_12px_30px_-22px_rgba(18,18,18,0.7)]">
                {locale === "zh" ? "最新" : "Latest"}
              </Badge>
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/12 bg-[#171411]/68 p-5 text-white backdrop-blur-xl">
              <div className="flex items-end justify-between gap-4">
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
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9e7741]">{copy.badge}</p>
              <h3 className="mt-4 font-serif text-[2.35rem] leading-[0.98] tracking-[-0.035em] text-[#171411]">{copy.title}</h3>
              <p className="mt-4 text-sm leading-8 text-[#6d6258]">{copy.description}</p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.6rem] border border-[rgba(59,47,37,0.08)] bg-white/82 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6731]">
                    <Clock3 className="h-4 w-4" /> {copy.leadTime}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#171411]">{t(locale, lead.shippingNote)}</p>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(59,47,37,0.08)] bg-white/82 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6731]">{copy.price}</p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className="font-serif text-[1.9rem] leading-none text-[#171411]">{formatCurrency(lead.price, locale)}</p>
                    {lead.compareAtPrice ? <p className="text-sm text-[#a09386] line-through">{formatCurrency(lead.compareAtPrice, locale)}</p> : null}
                  </div>
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

      <div className="grid gap-6">
        {rest.map((product, index) => (
          <ProductCard key={product.id} product={product} locale={locale} priority={index === 0} />
        ))}
        {rest.length === 0 ? (
          <div className="rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-white/76 p-6 text-sm leading-8 text-[#6d6258] shadow-[0_26px_74px_-54px_rgba(24,18,14,0.46)]">
            {locale === "zh"
              ? "当后台补充更多新品后，这里会自动形成“一个主推 + 两个辅助卡片”的新版结构。"
              : "As more new products are published, this area will automatically form a lead-and-support editorial layout."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
