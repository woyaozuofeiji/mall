"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/types";

interface PromotionActivityStats {
  total: number;
  active: number;
  claimed: number;
  used: number;
}

export function PromotionResetPanel({
  locale,
  stats,
}: {
  locale: Locale;
  stats: PromotionActivityStats;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy =
    locale === "zh"
      ? {
          title: "IP 活动资格",
          description: "重置后会清空所有 IP 的 7 天活动限制，所有访客都可以重新触发首次访问弹窗和 10 分钟倒计时。",
          total: "记录总数",
          active: "倒计时中",
          claimed: "已抽中",
          used: "已使用",
          button: "重置所有 IP 有效期",
          busy: "正在重置...",
          confirm: "确认重置所有 IP 活动有效期吗？这会让所有 IP 立刻重新获得一次活动触发机会。",
          success: (count: number) => `已重置 ${count} 条 IP 活动记录。`,
          fallbackError: "重置失败，请稍后再试。",
        }
      : {
          title: "IP campaign eligibility",
          description: "Resetting clears the 7-day IP campaign limit so every visitor can trigger the first-visit modal and 10-minute countdown again.",
          total: "Total records",
          active: "Active windows",
          claimed: "Claimed",
          used: "Used",
          button: "Reset all IP validity",
          busy: "Resetting...",
          confirm: "Reset all IP campaign validity? Every IP will immediately receive another campaign trigger opportunity.",
          success: (count: number) => `${count} IP campaign records reset.`,
          fallbackError: "Reset failed. Please try again.",
        };

  const values = [
    { label: copy.total, value: stats.total },
    { label: copy.active, value: stats.active },
    { label: copy.claimed, value: stats.claimed },
    { label: copy.used, value: stats.used },
  ];

  const resetAll = async () => {
    if (busy) return;

    const confirmed = window.confirm(copy.confirm);
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/promotions/reset-ip-validity", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      const payload = (await response.json()) as { resetCount?: number; message?: string };

      if (!response.ok) {
        setError(payload.message ?? copy.fallbackError);
        return;
      }

      setMessage(copy.success(payload.resetCount ?? 0));
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : copy.fallbackError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 md:col-span-2">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-serif text-3xl">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{copy.description}</p>
        </div>
        <button
          type="button"
          onClick={() => void resetAll()}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-full border border-rose-300/30 bg-rose-500/18 px-5 text-sm font-medium text-rose-50 transition hover:bg-rose-500/25 disabled:cursor-wait disabled:opacity-60"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {busy ? copy.busy : copy.button}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {values.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm leading-7 text-emerald-50">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm leading-7 text-rose-50">
          {error}
        </div>
      ) : null}
    </div>
  );
}
