import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function FaqPreview({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          faqs: [
            {
              question: "第一次购买前，应该先确认哪些信息？",
              answer:
                "建议先查看商品尺寸、材质、发货周期和售后政策。如果是送礼，也可以确认包装说明和预计送达时间。",
            },
            {
              question: "下单后可以在哪里查看进度？",
              answer:
                "付款完成后，你可以使用订单号和下单邮箱进入订单查询页，查看付款状态、处理进度和物流信息。",
            },
            {
              question: "如果是送给别人，怎么挑更稳妥？",
              answer:
                "可以优先选择尺寸清楚、风格不挑人、包装更友好的商品，例如毛绒玩偶、简约饰品或桌面小物。",
            },
          ],
          care: {
            eyebrow: "购物帮助",
            title: "关于配送、包装和售后，你可以先在这里确认。",
            description:
              "常见问题页整理了付款、发货、包装、退换和订单查询说明，适合在下单前快速核对。",
            cta: "查看联系页面",
          },
        }
      : {
          faqs: [
            {
              question: "What should I check before my first order?",
              answer:
                "Review product size, material notes, shipping timing and return policy first. For gifts, also check packaging details and delivery expectations.",
            },
            {
              question: "Where can I follow my order after checkout?",
              answer:
                "After payment, use your order number and checkout email on the tracking page to review payment status, processing updates and shipment details.",
            },
            {
              question: "How do I choose a safer gift for someone else?",
              answer:
                "Start with items that have clear sizing, easy styling and gift-friendly packaging, such as plush toys, simple jewelry or small desk pieces.",
            },
          ],
          care: {
            eyebrow: "Shopping help",
            title: "Review shipping, packaging and support details before checkout.",
            description:
              "The FAQ gathers payment, shipping, packaging, return and tracking guidance so you can confirm the details before placing an order.",
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
