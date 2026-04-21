import type { Locale } from "@/lib/types";
import { Container } from "@/components/ui/container";

export function HomeSignatureStrip({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          eyebrow: "品牌签名",
          intro: "更像精品官网的首页，通常会先给人一种明确的陈列语气。",
          items: [
            {
              label: "Seasonal edit",
              value: "按季节与主题组织陈列，而不是按数量堆积。",
            },
            {
              label: "Boutique rhythm",
              value: "用留白、细线和主次关系建立更安静的高级感。",
            },
            {
              label: "Gift-led curation",
              value: "让选品、包装与服务说明统一成一个品牌故事。",
            },
          ],
        }
      : {
          eyebrow: "Atelier signature",
          intro: "Boutique brand homepages usually establish a recognizable merchandising tone before they show everything else.",
          items: [
            {
              label: "Seasonal edit",
              value: "Organize the assortment by mood and occasion, not by raw volume.",
            },
            {
              label: "Boutique rhythm",
              value: "Use whitespace, fine dividers and stronger hierarchy to feel quieter and more premium.",
            },
            {
              label: "Gift-led curation",
              value: "Align products, packaging promise and service copy into one brand story.",
            },
          ],
        };

  return (
    <section className="relative pb-10 sm:pb-14">
      <Container>
        <div className="rounded-[2.3rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(246,238,227,0.72)_100%)] px-6 py-6 shadow-[0_28px_80px_-58px_rgba(29,22,18,0.42)] backdrop-blur-xl sm:px-8 sm:py-7">
          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr] xl:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#9e7741]">{content.eyebrow}</p>
              <p className="mt-4 max-w-md font-serif text-[1.8rem] leading-[1.06] tracking-[-0.03em] text-[#171411] sm:text-[2.2rem]">
                {content.intro}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {content.items.map((item, index) => (
                <div
                  key={item.label}
                  className="relative rounded-[1.7rem] border border-[rgba(59,47,37,0.08)] bg-white/70 p-5 shadow-[0_22px_50px_-42px_rgba(29,22,18,0.38)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,137,73,0.55),transparent)]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6731]">
                    {String(index + 1).padStart(2, "0")} · {item.label}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#61574f]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
