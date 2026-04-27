import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StorefrontPageHero, StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";
import type { Locale } from "@/lib/types";

type PolicySection = {
  title: string;
  body: string;
  bullets?: string[];
};

export function PolicyTemplate({
  locale,
  title,
  intro,
  points,
  sections,
}: {
  locale: Locale;
  title: string;
  intro: string;
  points: string[];
  sections?: PolicySection[];
}) {
  const normalizedSections: PolicySection[] =
    sections && sections.length > 0
      ? sections
      : points.map((point) => ({
          title: locale === "zh" ? "政策说明" : "Policy note",
          body: point,
        }));

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Policy"
        title={title}
        description={intro}
        side={
          <div className="space-y-3 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">
              {locale === "zh" ? "规则摘要" : "Policy summary"}
            </p>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? "这些政策说明订单处理、发货、售后和数据使用规则，方便你在购买前确认服务细节。"
                : "These policy pages explain order handling, shipping, after-sales support and data usage so you can review service details before purchasing."}
            </p>
          </div>
        }
      />

      <Container className="max-w-5xl">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link
            href={`/${locale}/order-tracking`}
            className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
              {locale === "zh" ? "订单查询" : "Track order"}
            </p>
            <p className="mt-2">{locale === "zh" ? "查看付款、发货与物流状态" : "Review payment, fulfillment and shipping updates"}</p>
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
              {locale === "zh" ? "联系客服" : "Contact support"}
            </p>
            <p className="mt-2">{locale === "zh" ? "需要人工协助时可直接发邮件" : "Reach support directly when you need manual help"}</p>
          </Link>
          <Link
            href={`/${locale}/faq`}
            className="col-span-2 rounded-[1.35rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88] sm:col-span-1"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
              {locale === "zh" ? "购物帮助" : "FAQ"}
            </p>
            <p className="mt-2">{locale === "zh" ? "继续查看支付、配送和售后常见问题" : "Read related payment, shipping and after-sales answers"}</p>
          </Link>
        </div>

        <StorefrontPanel className="p-7 sm:p-9">
          <div className="space-y-5 text-sm leading-8 text-[#6d6670]">
            {normalizedSections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="rounded-[1.45rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
                <StorefrontInfoPill>{String(index + 1).padStart(2, "0")}</StorefrontInfoPill>
                <h2 className="mt-4 text-[1.1rem] font-semibold text-[#2f2b32]">{section.title}</h2>
                <p className="mt-3">{section.body}</p>
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff8aa1]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
