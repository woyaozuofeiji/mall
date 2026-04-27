import Link from "next/link";
import { getGuideSummaries } from "@/lib/guide-content";
import type { Locale } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { StorefrontInfoPill, StorefrontPanel } from "@/components/storefront/page-hero";

export function HomeReferenceGuides({ locale }: { locale: Locale }) {
  const guides = getGuideSummaries(locale).slice(0, 3);

  return (
    <section className="py-6 sm:py-8">
      <Container className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
            {locale === "zh" ? "Guides" : "Guides"}
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32] sm:text-[2.5rem]">
            {locale === "zh" ? "选购指南与送礼内容" : "Buying guides and gifting content"}
          </h2>
          <p className="mt-4 text-sm leading-8 text-[#6d6670]">
            {locale === "zh"
              ? "这些指南围绕送礼场景、材质选择、包装与配送准备，帮助你在下单前更清楚地判断哪件商品更合适。"
              : "These guides cover gifting moments, material choices, packaging, and delivery planning so you can choose with more confidence before checkout."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {guides.map((guide) => (
            <StorefrontPanel key={guide.slug} className="flex h-full flex-col p-6">
              <div className="flex flex-wrap gap-2">
                <StorefrontInfoPill>{guide.category}</StorefrontInfoPill>
                <StorefrontInfoPill className="bg-white">
                  {locale === "zh" ? `${guide.readingMinutes} 分钟阅读` : `${guide.readingMinutes} min read`}
                </StorefrontInfoPill>
              </div>
              <h3 className="mt-5 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{guide.title}</h3>
              <p className="mt-4 text-sm leading-8 text-[#6d6670]">{guide.description}</p>
              <Link
                href={`/${locale}/guides/${guide.slug}`}
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#ff6d88] transition hover:translate-x-0.5"
              >
                {locale === "zh" ? "阅读指南" : "Read guide"}
              </Link>
            </StorefrontPanel>
          ))}
        </div>

        <Link
          href={`/${locale}/guides`}
          className="inline-flex items-center rounded-full border border-[rgba(248,192,205,0.72)] bg-white px-5 py-3 text-sm font-semibold text-[#3a353d] shadow-[0_18px_40px_-28px_rgba(214,187,198,0.7)] transition hover:-translate-y-0.5 hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
        >
          {locale === "zh" ? "查看全部指南" : "View all guides"}
        </Link>
      </Container>
    </section>
  );
}
