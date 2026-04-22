"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";

interface CategoryOption {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
}

export function ImportBatchActions({
  locale,
  batchId,
  categories,
  categoryLabel,
  keepOriginalCategoryLabel,
  publishLabel,
  deleteLabel,
  successPublish,
  successDelete,
  failMessage,
  loadingLabel,
  deleteConfirm,
}: {
  locale: Locale;
  batchId: string;
  categories: CategoryOption[];
  categoryLabel: string;
  keepOriginalCategoryLabel: string;
  publishLabel: string;
  deleteLabel: string;
  successPublish: string;
  successDelete: string;
  failMessage: string;
  loadingLabel: string;
  deleteConfirm: string;
}) {
  const router = useRouter();
  const [targetCategoryId, setTargetCategoryId] = useState("original");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"publish" | "delete" | null>(null);

  async function run(kind: "publish" | "delete") {
    if (kind === "delete" && !window.confirm(deleteConfirm)) {
      return;
    }

    setMessage(null);
    setError(null);
    setLoading(kind);

    const response = await fetch(`/api/admin/imports/${batchId}${kind === "publish" ? "/publish" : ""}`, {
      method: kind === "publish" ? "POST" : "DELETE",
      headers: kind === "publish" ? { "Content-Type": "application/json" } : undefined,
      body:
        kind === "publish"
          ? JSON.stringify(targetCategoryId === "original" ? {} : { categoryId: targetCategoryId })
          : undefined,
    });

    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(result.message ?? failMessage);
      setLoading(null);
      return;
    }

    setMessage(kind === "publish" ? successPublish : successDelete);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[240px] flex-1 flex-col gap-2 text-sm text-white/70">
          <span>{categoryLabel}</span>
          <select
            value={targetCategoryId}
            onChange={(event) => setTargetCategoryId(event.target.value)}
            disabled={loading !== null}
            className="h-10 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:border-white/30 disabled:opacity-50"
          >
            <option value="original" className="bg-slate-950 text-white">
              {keepOriginalCategoryLabel}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-slate-950 text-white">
                {locale === "zh" ? category.nameZh : category.nameEn}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => run("publish")}
            disabled={loading !== null}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading === "publish" ? loadingLabel : publishLabel}
          </button>
          <button
            type="button"
            onClick={() => run("delete")}
            disabled={loading !== null}
            className="inline-flex h-10 items-center justify-center rounded-full border border-rose-400/25 bg-rose-400/10 px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15 disabled:opacity-50"
          >
            {loading === "delete" ? loadingLabel : deleteLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>
    </div>
  );
}
