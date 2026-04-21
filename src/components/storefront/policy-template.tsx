import { Container } from "@/components/ui/container";
import { StorefrontPageHero, StorefrontPanel, StorefrontInfoPill } from "@/components/storefront/page-hero";
import type { Locale } from "@/lib/types";

export function PolicyTemplate({
  locale,
  title,
  intro,
  points,
}: {
  locale: Locale;
  title: string;
  intro: string;
  points: string[];
}) {
  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Policy"
        title={title}
        description={intro}
        side={
          <div className="space-y-3 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">Store standard</p>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? "政策页也会统一成首页这套粉白礼品店风格，让说明内容看起来更完整、更可信。"
                : "Policy pages also follow the homepage’s soft boutique styling so practical expectations still feel polished and consistent."}
            </p>
          </div>
        }
      />

      <Container className="max-w-5xl">
        <StorefrontPanel className="p-7 sm:p-9">
          <div className="space-y-5 text-sm leading-8 text-[#6d6670]">
            {points.map((point, index) => (
              <div key={point} className="rounded-[1.45rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
                <StorefrontInfoPill>{String(index + 1).padStart(2, "0")}</StorefrontInfoPill>
                <p className="mt-4">{point}</p>
              </div>
            ))}
          </div>
        </StorefrontPanel>
      </Container>
    </div>
  );
}
