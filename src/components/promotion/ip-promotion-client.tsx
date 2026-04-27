"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Timer, X } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PromotionWindowPayload {
  eligible: boolean;
  active: boolean;
  justStarted: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  cooldownExpiresAt: string | null;
  claimed: boolean;
  used: boolean;
}

function formatRemaining(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function IpPromotionClient({ locale }: { locale: Locale }) {
  const [promotion, setPromotion] = useState<PromotionWindowPayload | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const copy = useMemo(
    () =>
      locale === "zh"
        ? {
            badge: "限时活动",
            title: "10 分钟内完成下单，有机会获得免单",
            description: "活动资格已为你开启。请在倒计时结束前完成结算与付款，付款页会自动揭晓本次幸运权益。",
            cta: "我知道了",
            timerLabel: "限时权益倒计时",
            timerDescription: "完成付款后揭晓幸运权益",
            claimed: "幸运权益已锁定，请尽快完成付款",
          }
        : {
            badge: "Limited event",
            title: "Complete checkout within 10 minutes for a chance at a free order",
            description: "Your event window has started. Finish checkout and payment before the timer ends to reveal the lucky benefit on the payment page.",
            cta: "Got it",
            timerLabel: "Event countdown",
            timerDescription: "Reveal the lucky benefit after payment",
            claimed: "Lucky benefit locked. Complete payment soon",
          },
    [locale],
  );

  useEffect(() => {
    let cancelled = false;

    async function initializePromotion() {
      try {
        const response = await fetch("/api/promotion/window", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as PromotionWindowPayload;
        if (cancelled) {
          return;
        }

        setPromotion(payload);
        setModalOpen(payload.justStarted && payload.active);
      } catch {
        // The storefront should remain usable even if the campaign endpoint is unavailable.
      }
    }

    void initializePromotion();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!promotion?.active || !promotion.expiresAt) {
      return;
    }

    const expiresAt = new Date(promotion.expiresAt).getTime();
    const updateRemaining = () => {
      const nextRemaining = Math.max(0, expiresAt - Date.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) {
        setPromotion((current) => (current ? { ...current, active: false, eligible: false } : current));
        setModalOpen(false);
      }
    };

    const initialTimeout = window.setTimeout(updateRemaining, 0);
    const interval = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
    };
  }, [promotion?.active, promotion?.expiresAt]);

  const showCountdown = Boolean(promotion?.active && promotion.expiresAt && remainingMs > 0);

  return (
    <>
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2b32]/42 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[1.6rem] bg-white shadow-[0_34px_90px_-42px_rgba(47,43,50,0.5)] ring-1 ring-[rgba(241,225,230,0.95)]">
            <button
              type="button"
              aria-label={locale === "zh" ? "关闭活动弹窗" : "Close campaign modal"}
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8f8791] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-[linear-gradient(135deg,#fff4f7_0%,#fffdfd_54%,#f3fbff_100%)] px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
                <Gift className="mr-1.5 h-3.5 w-3.5" />
                {copy.badge}
              </span>
              <h2 className="mt-5 max-w-[24rem] text-[2rem] font-semibold leading-tight text-[#2f2b32] sm:text-[2.35rem]">
                {copy.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#6d6670]">{copy.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f8791]">{copy.timerLabel}</p>
                  <p className="mt-1 font-mono text-[2rem] font-semibold tracking-normal text-[#ff6d88]">
                    {formatRemaining(remainingMs)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#2f2b32] px-6 text-sm font-semibold text-white transition hover:bg-[#413a44]"
                >
                  {copy.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCountdown ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 sm:bottom-5">
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-full border border-[rgba(248,192,205,0.62)] bg-white/94 px-4 py-3 shadow-[0_22px_70px_-46px_rgba(47,43,50,0.5)] backdrop-blur",
              promotion?.claimed && "border-[rgba(109,198,167,0.5)]",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff3f6] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
                <Timer className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2f2b32]">
                  {promotion?.claimed ? copy.claimed : copy.timerLabel}
                </p>
                <p className="truncate text-xs text-[#8f8791]">{copy.timerDescription}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#2f2b32] px-3 py-1.5 font-mono text-sm font-semibold tracking-normal text-white">
              {formatRemaining(remainingMs)}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
