"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getProductFacts, getProductGiftMoments } from "@/lib/product-merchandising";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function ProductDetailTabs({ product, locale }: { product: Product; locale: Locale }) {
  const tabs = useMemo<TabItem[]>(() => {
    const realReviews = product.reviews ?? [];
    const facts = getProductFacts(product, locale);
    const giftMoments = getProductGiftMoments(product, locale);

    return [
      {
        id: "description",
        label: locale === "zh" ? "商品描述" : "Description",
        content: (
          <div className="space-y-5 text-sm leading-8 text-[#6d6670]">
            <p>{t(locale, product.description)}</p>
            <p>{t(locale, product.story)}</p>
            {facts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.key} className="rounded-[1.35rem] bg-white p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{fact.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{fact.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
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
            <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#ff7e95]">{locale === "zh" ? "适合这些送礼场景" : "Works well for these gift moments"}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {giftMoments.map((item) => (
                  <li key={item} className="rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-7 text-[#2f2b32] ring-1 ring-[rgba(241,225,230,0.95)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "details",
        label: locale === "zh" ? "详情参数" : "Details",
        content: (
          <div className="space-y-5">
            {facts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={`detail-${fact.key}`} className="rounded-[1.2rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{fact.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{fact.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid gap-4">
              {product.specs.map((spec) => (
                <div key={spec.label.en} className="flex flex-col gap-2 border-b border-[rgba(241,225,230,0.95)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-10">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8f8791]">{t(locale, spec.label)}</span>
                  <span className="text-sm leading-7 text-[#2f2b32]">{t(locale, spec.value)}</span>
                </div>
              ))}
            </div>
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "客服回复" : "Support reply"}</p>
                <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "通常 1 个工作日内" : "Usually within 1 business day"}</p>
              </div>
              <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "退货时限" : "Return window"}</p>
                <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "签收后 30 天内申请" : "Request within 30 days of delivery"}</p>
              </div>
              <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "追踪方式" : "Tracking"}</p>
                <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "发货后可用订单号查询" : "Track after dispatch with order number"}</p>
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
            {realReviews.length > 0 ? (
              <div className="grid gap-4">
                {realReviews.map((review, index) => (
                  <div key={review.id ?? `${review.author}-${index}`} className="rounded-[1.6rem] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#2f2b32]">{review.author}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#8f8791]">
                          {review.date ? <span>{review.date}</span> : null}
                          {review.verified ? <span>{locale === "zh" ? "已验证购买" : "Verified purchase"}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#ffbe3b]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? "fill-[#ffbe3b]" : ""}`} />
                        ))}
                      </div>
                    </div>
                    {review.title ? <p className="mt-4 font-medium text-[#2f2b32]">{t(locale, review.title)}</p> : null}
                    <p className="mt-3 text-sm leading-8 text-[#6d6670]">{t(locale, review.content)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.6rem] bg-white p-5 text-sm leading-8 text-[#6d6670] shadow-[0_20px_50px_-38px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)]">
                {locale === "zh"
                  ? "当前这件商品还没有可展示的抓取评论，后续重新采集或补充评论后会显示在这里。"
                  : "No imported review cards are available for this product yet. Re-import or refresh marketplace reviews to populate this section."}
              </div>
            )}
          </div>
        ),
      },
    ];
  }, [locale, product]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "description");
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="overflow-x-hidden rounded-[1.9rem] bg-white/94 p-5 shadow-[0_22px_58px_-44px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)] sm:rounded-[2.2rem] sm:p-8">
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
