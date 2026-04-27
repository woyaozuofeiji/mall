import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Locale } from "@/lib/types";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const categoryMeta = {
  plush: {
    image: "/products/aurora-bunny.svg",
    eyebrow: {
      en: "Soft display edit",
      zh: "柔和毛绒陈列",
    },
    footer: {
      en: "Giftable plush and collector-friendly silhouettes",
      zh: "适合送礼也适合做收藏感陈列",
    },
    surface:
      "bg-[radial-gradient(circle_at_top_left,rgba(252,207,232,0.5),transparent_26%),linear-gradient(180deg,rgba(255,249,243,0.98)_0%,rgba(255,255,255,0.88)_100%)]",
  },
  jewelry: {
    image: "/products/starlight-earrings.svg",
    eyebrow: {
      en: "Boutique accessory layer",
      zh: "精品配饰层",
    },
    footer: {
      en: "Small, polished pieces that instantly elevate the assortment",
      zh: "轻巧精致，适合日常佩戴和送礼加购",
    },
    surface:
      "bg-[radial-gradient(circle_at_top_left,rgba(254,230,138,0.48),transparent_24%),linear-gradient(180deg,rgba(255,251,240,0.98)_0%,rgba(255,255,255,0.88)_100%)]",
  },
  gifts: {
    image: "/products/cloud-tray.svg",
    eyebrow: {
      en: "Desktop gifting mood",
      zh: "桌面礼品氛围",
    },
    footer: {
      en: "Useful for seasonal edits, bundles and curated add-on stories",
      zh: "适合节日心意、组合礼物与桌面点缀",
    },
    surface:
      "bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.48),transparent_26%),linear-gradient(180deg,rgba(243,248,255,0.98)_0%,rgba(255,255,255,0.88)_100%)]",
  },
} as const;

export function CategoryGrid({ categories, locale }: { categories: Category[]; locale: Locale }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3 xl:auto-rows-[18rem]">
      {categories.map((category, index) => {
        const meta = categoryMeta[category.slug as keyof typeof categoryMeta];
        const isLead = index === 0;

        return (
          <Link
            key={category.id}
            href={`/${locale}/shop/category/${category.slug}`}
            className={cn(
              "group relative overflow-hidden rounded-[2.45rem] border border-[rgba(59,47,37,0.08)] shadow-[0_36px_96px_-60px_rgba(33,25,20,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_46px_104px_-54px_rgba(33,25,20,0.56)]",
              meta?.surface ?? "bg-white/80",
              isLead ? "xl:col-span-2 xl:row-span-2" : "xl:col-span-1 xl:row-span-1",
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0)_100%)]" />

            <div className={cn("relative flex h-full flex-col p-6 sm:p-7", isLead && "xl:grid xl:grid-cols-[0.78fr_1.22fr] xl:gap-7 xl:p-8")}>
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9e7741]">
                        {meta?.eyebrow[locale] ?? (locale === "zh" ? "精选分类" : "Curated category")}
                      </p>
                      <h3
                        className={cn(
                          "mt-4 font-serif leading-[0.98] tracking-[-0.035em] text-[#171411]",
                          isLead ? "max-w-[18rem] text-[2.7rem] sm:text-[3.2rem]" : "max-w-[14rem] text-[2.1rem] sm:text-[2.35rem]",
                        )}
                      >
                        {t(locale, category.name)}
                      </h3>
                    </div>
                    <div className="rounded-full border border-[rgba(59,47,37,0.08)] bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7e7268] shadow-[0_16px_32px_-24px_rgba(33,25,20,0.4)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <p className={cn("mt-5 max-w-[24rem] text-sm leading-8 text-[#6d6258]", isLead && "max-w-[20rem] text-[15px]")}>
                    {t(locale, category.description)}
                  </p>
                </div>

                <div className={cn("mt-6 flex items-end justify-between gap-4", isLead && "xl:mt-8") }>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b7c6d]">
                      {locale === "zh" ? "系列入口" : "Collection entry"}
                    </p>
                    <p className="mt-3 max-w-[16rem] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6f655c]">
                      {meta?.footer[locale] ?? (locale === "zh" ? "进入分类页查看更多精选商品" : "Enter the collection to view the full edit")}
                    </p>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-white/82 text-[#171411] shadow-[0_16px_34px_-24px_rgba(33,25,20,0.48)] transition group-hover:-translate-y-0.5 group-hover:border-[rgba(184,137,73,0.32)]">
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className={cn("mt-6 overflow-hidden rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-white/76 shadow-[0_28px_70px_-50px_rgba(33,25,20,0.52)]", isLead ? "xl:mt-0 xl:min-h-[30rem]" : "") }>
                <div className={cn("relative overflow-hidden", isLead ? "aspect-[4/3] xl:h-full xl:aspect-auto" : "aspect-[4/3]")}>
                  <Image
                    src={meta?.image ?? "/products/aurora-bunny.svg"}
                    alt={t(locale, category.name)}
                    fill
                    sizes={isLead ? "(min-width: 1280px) 44vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"}
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/12 bg-[#171411]/62 px-4 py-4 text-white backdrop-blur-xl sm:px-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.56)]">
                      {locale === "zh" ? "Merchandising note" : "Merchandising note"}
                    </p>
                    <p className="mt-3 max-w-sm font-serif text-[1.4rem] leading-[1.02] tracking-[-0.03em] sm:text-[1.6rem]">
                      {locale === "zh"
                        ? "让分类本身也承担品牌气质，而不是只负责跳转。"
                        : "Let the category itself carry brand atmosphere instead of functioning as navigation alone."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
