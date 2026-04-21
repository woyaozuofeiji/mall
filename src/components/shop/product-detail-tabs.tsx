"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { t } from "@/lib/i18n";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function ProductDetailTabs({ product, locale }: { product: Product; locale: Locale }) {
  const tabs = useMemo<TabItem[]>(() => {
    const mockReviews =
      locale === "zh"
        ? [
            { name: "Lina", rating: 5, date: "2026-04-14", text: "现在这个详情页风格和首页一致了，浏览体验会更完整、更像礼品精品店。" },
            { name: "Mason", rating: 5, date: "2026-04-09", text: "图集、购买区和说明区的衔接更自然，不会像以前那样突然跳风格。" },
            { name: "Evelyn", rating: 4, date: "2026-03-28", text: "整体已经很接近轻柔、甜美的礼品电商详情页体验。" },
          ]
        : [
            { name: "Lina", rating: 5, date: "2026-04-14", text: "The PDP now feels visually aligned with the homepage, which makes the full browsing flow feel more complete." },
            { name: "Mason", rating: 5, date: "2026-04-09", text: "The gallery, buying panel and description area now transition much more naturally without a sudden style shift." },
            { name: "Evelyn", rating: 4, date: "2026-03-28", text: "Overall this feels much closer to a soft, gift-led product page experience." },
          ];

    return [
      {
        id: "description",
        label: locale === "zh" ? "商品描述" : "Description",
        content: (
          <div className="space-y-5 text-sm leading-8 text-[#6d6670]">
            <p>{t(locale, product.description)}</p>
            <p>{t(locale, product.story)}</p>
            <div className="grid gap-4 rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)] sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === "zh" ? "视觉表达" : "Visual presentation"}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{locale === "zh" ? "通过主图、细节图和场景图建立商品信任感。" : "Build confidence through the hero image, detail shots and softer lifestyle framing."}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === "zh" ? "购买路径" : "Buying path"}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{locale === "zh" ? "让用户先完成判断，再顺势进入规格和购买。" : "Keep the decision flow gentle: understand first, then choose variants and purchase."}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === 'zh' ? '服务信息' : 'Service layer'}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">{locale === 'zh' ? '评论、支付、物流与售后信息都会在这一套详情结构里保持清晰呈现。' : 'Reviews, payment, logistics and after-sales information all stay clearly organized within this product page structure.'}</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "details",
        label: locale === "zh" ? "详情参数" : "Details",
        content: (
          <div className="grid gap-4">
            {product.specs.map((spec) => (
              <div key={spec.label.en} className="flex flex-col gap-2 border-b border-[rgba(241,225,230,0.95)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-10">
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8f8791]">{t(locale, spec.label)}</span>
                <span className="text-sm leading-7 text-[#2f2b32]">{t(locale, spec.value)}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "shipping",
        label: locale === "zh" ? "发货与售后" : "Shipping",
        content: (
          <div className="space-y-5 text-sm leading-8 text-[#6d6670]">
            <p>
              <span className="font-semibold text-[#2f2b32]">{locale === "zh" ? "发货周期：" : "Lead time: "}</span>
              {t(locale, product.leadTime)}
            </p>
            <p>
              <span className="font-semibold text-[#2f2b32]">{locale === "zh" ? "配送说明：" : "Shipping note: "}</span>
              {t(locale, product.shippingNote)}
            </p>
            <div className="grid gap-4 rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)] sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === "zh" ? "交付预期" : "Delivery expectation"}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">
                  {locale === 'zh' ? '发货说明会与当前订单状态同步，物流更新和税费提示可在这一层清晰承接。' : 'Shipping guidance stays aligned with the active order flow, and logistics or tax updates can be surfaced cleanly in this layer.'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === "zh" ? "售后规则" : "After-sales policy"}</p>
                <p className="mt-3 text-sm leading-7 text-[#6d6670]">
                  {locale === "zh" ? "这里可以继续补充退换说明、客服响应时间和包装保障。" : "This area can continue to grow with return notes, support timing and packaging promises."}
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "reviews",
        label: locale === "zh" ? "评价" : "Reviews",
        content: (
          <div className="space-y-5">
            <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 text-sm leading-8 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
              {product.reviewSummary
                ? locale === "zh"
                  ? `当前评分 ${product.reviewSummary.rating.toFixed(1)} / 5，共 ${product.reviewSummary.count} 条评价。下方展示的是最新客户反馈。`
                  : `Current rating ${product.reviewSummary.rating.toFixed(1)} / 5 based on ${product.reviewSummary.count} reviews. The cards below show recent customer feedback.`
                : locale === 'zh'
                  ? '客户评价正在持续更新，最新反馈会展示在这里。'
                  : 'Customer reviews are being collected and the latest feedback will appear here.'}
            </div>
            <div className="grid gap-4">
              {mockReviews.map((review, index) => (
                <div key={`${review.name}-${index}`} className="rounded-[1.6rem] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#2f2b32]">{review.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#8f8791]">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#ffbe3b]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? "fill-[#ffbe3b]" : ""}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-8 text-[#6d6670]">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ];
  }, [locale, product]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "description");
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="rounded-[1.9rem] bg-white/94 p-5 shadow-[0_22px_58px_-44px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)] sm:rounded-[2.2rem] sm:p-8">
      <div className="-mx-1 flex gap-2 overflow-x-auto border-b border-[rgba(241,225,230,0.95)] px-1 pb-4 sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0 sm:pb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              currentTab?.id === tab.id
                ? "bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] text-white shadow-[0_18px_36px_-24px_rgba(255,109,136,0.72)]"
                : "border border-[rgba(241,203,213,0.9)] bg-white text-[#6d6670] hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-5 sm:pt-7">{currentTab?.content}</div>
    </div>
  );
}
