import Link from "next/link";
import { ArrowUpRight, Gem, Gift, Sparkles, type LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Container } from "@/components/ui/container";

type CategoryCard = {
  title: string;
  description: string;
  href: string;
  tags: string[];
  icon: LucideIcon;
  iconClassName: string;
  surfaceClassName: string;
};

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    viewAllLabel: string;
    cardCta: string;
    cards: CategoryCard[];
  }
> = {
  en: {
    eyebrow: "Browse collections",
    title: "Find the right gift by mood and moment",
    description:
      "Start with soft plush, refined jewelry, or thoughtful desk gifts, then move quickly into the collection that best matches the person you have in mind.",
    viewAllLabel: "Shop all",
    cardCta: "Open collection",
    cards: [
      {
        title: "Plush Toys",
        description: "Soft companions, cozy shelf pieces, and easy gift picks for birthdays, care packages, and everyday comfort.",
        href: "/shop/category/plush",
        tags: ["Soft gifts", "Cute display", "Easy pick"],
        icon: Sparkles,
        iconClassName: "bg-[#fff2f6] text-[#d46a89] ring-[#f7ccda]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(255,247,250,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#efc0cf]",
      },
      {
        title: "Jewelry",
        description: "Necklaces, earrings, rings, and bracelets selected for daily wear, small celebrations, and polished gifting.",
        href: "/shop/category/jewelry",
        tags: ["Necklaces", "Earrings", "Bracelets"],
        icon: Gem,
        iconClassName: "bg-[#fff8ef] text-[#c88a2f] ring-[#f2dec1]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(255,251,243,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#efd9b4]",
      },
      {
        title: "Desk Gifts",
        description: "Small decor, charming keepsakes, and gift-ready extras for desks, shelves, and thoughtful add-ons.",
        href: "/shop/category/gifts",
        tags: ["Desk accents", "Gift-ready", "Small extras"],
        icon: Gift,
        iconClassName: "bg-[#f5f5ff] text-[#6676d8] ring-[#d9dfff]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(246,247,255,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#ccd4ff]",
      },
    ],
  },
  zh: {
    eyebrow: "精选分类",
    title: "按心意找到合适的礼物",
    description: "从柔软毛绒、精致饰品到桌面小礼物，三个清晰方向帮助你更快找到适合送礼或自留的选择。",
    viewAllLabel: "查看全部",
    cardCta: "进入分类",
    cards: [
      {
        title: "毛绒玩具",
        description: "柔软陪伴、可爱陈列和轻松送礼都适合，从床头摆件到生日惊喜都能快速挑选。",
        href: "/shop/category/plush",
        tags: ["柔软礼物", "可爱陈列", "轻松入手"],
        icon: Sparkles,
        iconClassName: "bg-[#fff2f6] text-[#d46a89] ring-[#f7ccda]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(255,247,250,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#efc0cf]",
      },
      {
        title: "饰品首饰",
        description: "项链、耳环、戒指与手链集中呈现，适合挑选日常佩戴和精致小礼物。",
        href: "/shop/category/jewelry",
        tags: ["项链", "耳环", "手链"],
        icon: Gem,
        iconClassName: "bg-[#fff8ef] text-[#c88a2f] ring-[#f2dec1]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(255,251,243,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#efd9b4]",
      },
      {
        title: "桌面礼物",
        description: "桌面小物、包装友好的轻礼品和加购好物集中展示，适合生日、感谢和节日心意。",
        href: "/shop/category/gifts",
        tags: ["桌面点缀", "送礼友好", "小件好物"],
        icon: Gift,
        iconClassName: "bg-[#f5f5ff] text-[#6676d8] ring-[#d9dfff]",
        surfaceClassName:
          "bg-[linear-gradient(180deg,rgba(246,247,255,0.98)_0%,rgba(255,255,255,0.96)_100%)] hover:border-[#ccd4ff]",
      },
    ],
  },
};

export function HomeReferenceCategories({ locale }: { locale: Locale }) {
  const section = copy[locale];

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[rgba(241,224,229,0.95)] bg-[linear-gradient(180deg,#fffafb_0%,#ffffff_100%)] px-5 py-6 shadow-[0_30px_80px_-60px_rgba(210,167,181,0.5)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 border-b border-[rgba(233,219,225,0.9)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c48397]">{section.eyebrow}</p>
              <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-[#332d31] sm:text-[2.3rem]">
                {section.title}
              </h2>
              <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#6f6770] sm:text-[15px]">{section.description}</p>
            </div>

            <Link
              href={`/${locale}/shop`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#ead8de] bg-white px-5 text-sm font-medium text-[#3b353a] transition hover:border-[#e0bcc8] hover:bg-[#fff7f9]"
            >
              {section.viewAllLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {section.cards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={`/${locale}${card.href}`}
                  className={`group rounded-[1.6rem] border border-[rgba(235,223,228,0.95)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_-44px_rgba(189,150,162,0.7)] sm:p-6 ${card.surfaceClassName}`}
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${card.iconClassName}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#2f2a2e]">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6d6670]">{card.description}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[rgba(223,210,216,0.95)] bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-[#615960]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#3f3a3f] transition group-hover:translate-x-0.5">
                    {section.cardCta}
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
