import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function FaqPreview({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          faqs: [
            {
              question: "为什么首页里要放这么多“解释型”内容？",
              answer:
                "因为高客单、礼品感和跨境信任感，不是靠 SKU 数量建立的，而是靠你怎么介绍选品、发货、包装和服务边界。",
            },
            {
              question: "无支付 MVP 会不会看起来不完整？",
              answer:
                "不会。只要页面视觉、商品结构和订单提交流程足够顺，用户会理解这是一个先验证需求、后补支付能力的阶段性版本。",
            },
            {
              question: "首页升级后，后续最适合补什么？",
              answer:
                "优先补品牌图、节日专题页、社媒落地页和支付方式。这些能力会和新版首页的调性自然衔接。",
            },
          ],
          care: {
            eyebrow: "体验补充",
            title: "把 FAQ 做得更像品牌服务说明，而不是冷冰冰的帮助中心。",
            description:
              "你可以继续把发货时效、礼盒包装、售后边界和客服响应标准逐步写进 FAQ，信任感会提升得很明显。",
            cta: "查看联系页面",
          },
        }
      : {
          faqs: [
            {
              question: "Why dedicate homepage space to explanation-driven content?",
              answer:
                "Because in cross-border gifting, trust rarely comes from catalog size alone. It comes from how clearly you frame curation, packaging, shipping and support expectations.",
            },
            {
              question: "Does a no-payment MVP make the store feel unfinished?",
              answer:
                "Not if the visual system, product storytelling and order request flow feel intentional. Users can understand a phased launch when the experience still feels polished.",
            },
            {
              question: "What is the best next layer after this homepage upgrade?",
              answer:
                "Brand-led imagery, seasonal landing pages, paid-social entry pages and payment integrations will all build naturally on top of this new front page structure.",
            },
          ],
          care: {
            eyebrow: "Experience note",
            title: "Write FAQ like premium service guidance, not like a cold support archive.",
            description:
              "Continue enriching shipping timing, packaging promise, support boundaries and post-order communication standards here, and the whole store will feel more trustworthy.",
            cta: "Visit contact page",
          },
        };

  return (
    <div className="grid gap-4">
      {content.faqs.map((faq, index) => (
        <div
          key={faq.question}
          className="rounded-[1.9rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.76)] p-6 shadow-[0_28px_72px_-50px_rgba(29,22,18,0.5)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(184,137,73,0.12)] text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6731]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <h3 className="font-serif text-[1.7rem] leading-[1.02] tracking-[-0.02em] text-[#171411]">{faq.question}</h3>
              <p className="mt-4 text-sm leading-8 text-[#6d6258]">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(246,238,227,0.82)_100%)] p-6 shadow-[0_30px_80px_-56px_rgba(29,22,18,0.48)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e7741]">{content.care.eyebrow}</p>
        <h3 className="mt-4 font-serif text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#171411]">{content.care.title}</h3>
        <p className="mt-4 text-sm leading-8 text-[#6d6258]">{content.care.description}</p>
        <div className="mt-6">
          <Button href={`/${locale}/contact`} variant="secondary">
            {content.care.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
