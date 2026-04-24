"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";

type TikTokImportProgressPhase =
  | "initializing"
  | "fetching_search"
  | "processing_candidates"
  | "saving_batch"
  | "publishing_batch"
  | "completed";

interface TikTokImportProgressEvent {
  phase: TikTokImportProgressPhase;
  percent: number;
  current?: number;
  total?: number;
  approvedCount?: number;
  rejectedCount?: number;
  candidateCount?: number;
  batchId?: string;
  publishedCount?: number;
  currentProductId?: string;
  currentTitle?: string;
  detail?: string;
}

interface TikTokImportResult {
  message?: string;
  batchId?: string;
  approvedCount?: number;
  publishedCount?: number;
}

interface CategoryOption {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
}

interface TikTokImportFormState {
  jobName: string;
  country: string;
  query: string;
  localCategoryId: string;
  targetCount: string;
  candidatePoolSize: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  minReviews: string;
  minSold: string;
  featuredTopN: string;
  customTagText: string;
  onlyOfficialShop: boolean;
  downloadImages: boolean;
  autoPublish: boolean;
}

const defaultState = (categoryId?: string): TikTokImportFormState => ({
  jobName: "",
  country: "com",
  query: "",
  localCategoryId: categoryId ?? "",
  targetCount: "10",
  candidatePoolSize: "20",
  minPrice: "",
  maxPrice: "",
  minRating: "4.5",
  minReviews: "100",
  minSold: "500",
  featuredTopN: "3",
  customTagText: "",
  onlyOfficialShop: false,
  downloadImages: true,
  autoPublish: false,
});

function formatDuration(locale: Locale, milliseconds: number) {
  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
  if (totalSeconds < 60) {
    return locale === "zh" ? `${totalSeconds} 秒` : `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return locale === "zh" ? `${minutes} 分 ${seconds} 秒` : `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return locale === "zh" ? `${hours} 小时 ${remainingMinutes} 分` : `${hours}h ${remainingMinutes}m`;
}

function getEta(locale: Locale, startedAt: number | null, progress: TikTokImportProgressEvent | null) {
  if (!startedAt || !progress || progress.percent <= 3 || progress.percent >= 100) {
    return null;
  }

  const elapsed = Date.now() - startedAt;
  const remaining = (elapsed * (100 - progress.percent)) / progress.percent;
  return formatDuration(locale, remaining);
}

function getElapsed(locale: Locale, startedAt: number | null) {
  if (!startedAt) return null;
  return formatDuration(locale, Date.now() - startedAt);
}

async function parseSseResponse(
  response: Response,
  handlers: {
    onProgress: (event: TikTokImportProgressEvent) => void;
  },
): Promise<TikTokImportResult | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("浏览器不支持流式读取响应。");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: TikTokImportResult | null = null;

  const dispatchChunk = (chunk: string) => {
    let eventType = "message";
    const dataLines: string[] = [];

    for (const line of chunk.split("\n")) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    const rawPayload = dataLines.join("\n").trim();
    if (!rawPayload) {
      if (eventType === "error") {
        throw new Error("采集响应被中断，请重试一次或缩小候选池。");
      }
      return;
    }

    let payload: TikTokImportProgressEvent | TikTokImportResult | { message?: string };
    try {
      payload = JSON.parse(rawPayload) as TikTokImportProgressEvent | TikTokImportResult | { message?: string };
    } catch {
      throw new Error(`采集响应解析失败：${rawPayload.slice(0, 160)}`);
    }

    if (eventType === "progress") {
      handlers.onProgress(payload as TikTokImportProgressEvent);
      return;
    }

    if (eventType === "result") {
      finalResult = payload as TikTokImportResult;
      return;
    }

    if (eventType === "error") {
      throw new Error((payload as { message?: string }).message ?? "TikTok 采集任务执行失败");
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");

    let boundaryIndex = buffer.indexOf("\n\n");
    while (boundaryIndex >= 0) {
      const chunk = buffer.slice(0, boundaryIndex).trim();
      buffer = buffer.slice(boundaryIndex + 2);
      if (chunk) {
        dispatchChunk(chunk);
      }
      boundaryIndex = buffer.indexOf("\n\n");
    }

    if (done) {
      if (buffer.trim()) {
        dispatchChunk(buffer.trim());
      }
      break;
    }
  }

  return finalResult;
}

async function readErrorMessage(response: Response, fallback: string) {
  const raw = await response.text();
  const normalized = raw.trim();
  if (!normalized) {
    return `${fallback}（HTTP ${response.status}）`;
  }

  try {
    const parsed = JSON.parse(normalized) as { message?: string };
    return parsed.message ?? normalized;
  } catch {
    return normalized;
  }
}

export function TikTokImportForm({ locale, categories }: { locale: Locale; categories: CategoryOption[] }) {
  const router = useRouter();
  const initialCategoryId = categories[0]?.id;
  const [form, setForm] = useState<TikTokImportFormState>(() => defaultState(initialCategoryId));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TikTokImportProgressEvent | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const copy = useMemo(() => {
    return locale === "zh"
      ? {
          title: "TikTok Shop 采集器",
          description:
            "按关键词抓取 TikTok Shop 搜索结果，逐条补齐商品详情，支持评分/评论/销量/价格过滤、图片本地化与导入后自动发布。",
          note: "说明：当前接入的是 TikTok Shop 商品搜索与商品详情，不是短视频 feed、达人主页或评论流。",
          submit: "开始采集",
          submitting: "采集中...",
          reset: "重置表单",
          progressTitle: "采集进度",
          elapsed: "已耗时",
          eta: "预计剩余",
          currentItem: "当前商品",
          detail: "任务说明",
          fields: {
            jobName: "任务名称",
            country: "TikTok Shop 站点",
            query: "搜索关键词",
            localCategoryId: "本地分类",
            targetCount: "目标商品数",
            candidatePoolSize: "候选池",
            minPrice: "最低价格",
            maxPrice: "最高价格",
            minRating: "最低评分",
            minReviews: "最低评论数",
            minSold: "最低销量",
            featuredTopN: "前 N 名标记热销",
            customTagText: "附加标签",
            onlyOfficialShop: "仅官方店铺",
            downloadImages: "下载图片到本地导入媒体目录",
            autoPublish: "导入后自动发布",
          },
          placeholders: {
            jobName: "例如：耳饰搜索 Top10",
            query: "例如：earrings",
            customTagText: "rings,bridal,apr-launch",
          },
          result: (input: { approvedCount: number; publishedCount: number; batchId: string }) =>
            `已生成批次 ${input.batchId}，通过 ${input.approvedCount} 条${input.publishedCount > 0 ? `，已发布 ${input.publishedCount} 条` : ""}`,
          progressText: (event: TikTokImportProgressEvent) => {
            switch (event.phase) {
              case "initializing":
                return "正在校验配置并初始化 TikTok Shop 采集任务...";
              case "fetching_search":
                return `正在抓取搜索结果，已发现 ${event.candidateCount ?? 0} 个候选商品`;
              case "processing_candidates":
                return `正在处理候选商品 ${event.current ?? 0}/${event.total ?? 0}，已通过 ${event.approvedCount ?? 0} 条，已过滤 ${event.rejectedCount ?? 0} 条`;
              case "saving_batch":
                return `正在写入导入批次${event.batchId ? `：${event.batchId}` : ""}`;
              case "publishing_batch":
                return `正在发布商品到商品库${event.batchId ? `：${event.batchId}` : ""}`;
              case "completed":
                return `采集完成${event.batchId ? `，批次：${event.batchId}` : ""}`;
              default:
                return "任务执行中...";
            }
          },
        }
      : {
          title: "TikTok Shop Importer",
          description:
            "Pull TikTok Shop products by keyword, enrich each listing with product-page details, then filter by rating/reviews/sales/price, localize images, and optionally auto-publish.",
          note: "This integration currently targets TikTok Shop search + product detail pages, not creator feeds, video comments, or profile scraping.",
          submit: "Start import",
          submitting: "Importing...",
          reset: "Reset",
          progressTitle: "Import progress",
          elapsed: "Elapsed",
          eta: "ETA",
          currentItem: "Current item",
          detail: "Task detail",
          fields: {
            jobName: "Job name",
            country: "TikTok Shop country",
            query: "Search keyword",
            localCategoryId: "Local category",
            targetCount: "Target items",
            candidatePoolSize: "Candidate pool",
            minPrice: "Min price",
            maxPrice: "Max price",
            minRating: "Min rating",
            minReviews: "Min reviews",
            minSold: "Min sold",
            featuredTopN: "Mark top N as featured",
            customTagText: "Extra tags",
            onlyOfficialShop: "Official shops only",
            downloadImages: "Download images into local import media storage",
            autoPublish: "Auto-publish after import",
          },
          placeholders: {
            jobName: "e.g. Earrings top 10",
            query: "e.g. earrings",
            customTagText: "rings,bridal,apr-launch",
          },
          result: (input: { approvedCount: number; publishedCount: number; batchId: string }) =>
            `Batch ${input.batchId} created with ${input.approvedCount} approved items${input.publishedCount > 0 ? ` and ${input.publishedCount} published` : ""}`,
          progressText: (event: TikTokImportProgressEvent) => {
            switch (event.phase) {
              case "initializing":
                return "Validating input and preparing the TikTok Shop task...";
              case "fetching_search":
                return `Fetching search results; found ${event.candidateCount ?? 0} candidates so far`;
              case "processing_candidates":
                return `Processing candidate ${event.current ?? 0}/${event.total ?? 0}; approved ${event.approvedCount ?? 0}, rejected ${event.rejectedCount ?? 0}`;
              case "saving_batch":
                return `Saving import batch${event.batchId ? `: ${event.batchId}` : ""}`;
              case "publishing_batch":
                return `Publishing products into the live catalog${event.batchId ? `: ${event.batchId}` : ""}`;
              case "completed":
                return `Import completed${event.batchId ? `: ${event.batchId}` : ""}`;
              default:
                return "Task is running...";
            }
          },
        };
  }, [locale]);

  const update = <K extends keyof TikTokImportFormState>(key: K, value: TikTokImportFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const progressLabel = progress ? copy.progressText(progress) : null;
  const elapsedText = getElapsed(locale, startedAt);
  const etaText = getEta(locale, startedAt, progress);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setStartedAt(Date.now());
    setProgress({ phase: "initializing", percent: 1 });

    try {
      const response = await fetch("/api/admin/imports/tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          ...form,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, locale === "zh" ? "TikTok 导入请求失败" : "TikTok import request failed"));
      }

      const finalResult = await parseSseResponse(response, {
        onProgress: (eventPayload) => {
          setProgress(eventPayload);
        },
      });

      if (!finalResult) {
        throw new Error(locale === "zh" ? "采集任务未返回最终结果。" : "Import finished without a final result.");
      }

      setMessage(
        copy.result({
          batchId: finalResult.batchId ?? "-",
          approvedCount: finalResult.approvedCount ?? 0,
          publishedCount: finalResult.publishedCount ?? 0,
        }),
      );
      setProgress((current) =>
        current
          ? {
              ...current,
              phase: "completed",
              percent: 100,
              batchId: finalResult?.batchId ?? current.batchId,
              publishedCount: finalResult?.publishedCount ?? current.publishedCount,
            }
          : null,
      );
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed");
      setProgress(null);
      setStartedAt(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-serif text-3xl">{copy.title}</h2>
          <p className="mt-2 text-sm leading-7 text-white/70">{copy.description}</p>
          <p className="mt-2 text-xs leading-6 text-amber-200/90">{copy.note}</p>
        </div>

        {progress ? (
          <div className="rounded-[1.5rem] border border-emerald-300/15 bg-slate-950/35 p-4 text-white/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">{copy.progressTitle}</p>
                <p className="mt-2 text-sm font-medium text-white">{progressLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-white">{progress.percent}%</p>
                {elapsedText ? <p className="text-xs text-white/50">{copy.elapsed}: {elapsedText}</p> : null}
                {etaText ? <p className="text-xs text-white/50">{copy.eta}: {etaText}</p> : null}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#34d399_0%,#60a5fa_100%)] transition-[width] duration-300"
                style={{ width: `${Math.max(4, progress.percent)}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 text-xs text-white/60 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/45">{copy.detail}</span>
                <p className="mt-1 leading-6">
                  {progress.detail ??
                    (locale === "zh" ? "等待下一步任务反馈..." : "Waiting for the next task update...")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/45">{copy.currentItem}</span>
                <p className="mt-1 line-clamp-2 leading-6">
                  {progress.currentTitle ??
                    progress.currentProductId ??
                    (locale === "zh" ? "当前阶段没有具体商品" : "No specific item in the current phase")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/45">{locale === "zh" ? "统计" : "Stats"}</span>
                <p className="mt-1 leading-6">
                  {locale === "zh"
                    ? `候选 ${progress.candidateCount ?? 0} · 通过 ${progress.approvedCount ?? 0} · 过滤 ${progress.rejectedCount ?? 0}`
                    : `Candidates ${progress.candidateCount ?? 0} · Approved ${progress.approvedCount ?? 0} · Rejected ${progress.rejectedCount ?? 0}`}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form className="grid gap-4 lg:grid-cols-2" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.jobName}</span>
            <input
              value={form.jobName}
              onChange={(event) => update("jobName", event.target.value)}
              placeholder={copy.placeholders.jobName}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.country}</span>
            <input
              value={form.country}
              onChange={(event) => update("country", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.query}</span>
            <input
              required
              value={form.query}
              onChange={(event) => update("query", event.target.value)}
              placeholder={copy.placeholders.query}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.localCategoryId}</span>
            <select
              value={form.localCategoryId}
              onChange={(event) => update("localCategoryId", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-slate-950 text-white">
                  {locale === "zh" ? category.nameZh : category.nameEn}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.targetCount}</span>
            <input
              type="number"
              min={1}
              max={30}
              value={form.targetCount}
              onChange={(event) => update("targetCount", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.candidatePoolSize}</span>
            <input
              type="number"
              min={1}
              max={30}
              value={form.candidatePoolSize}
              onChange={(event) => update("candidatePoolSize", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.featuredTopN}</span>
            <input
              type="number"
              min={0}
              max={20}
              value={form.featuredTopN}
              onChange={(event) => update("featuredTopN", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.minPrice}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.minPrice}
              onChange={(event) => update("minPrice", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.maxPrice}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.maxPrice}
              onChange={(event) => update("maxPrice", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.minRating}</span>
            <input
              type="number"
              min={0}
              max={5}
              step="0.1"
              value={form.minRating}
              onChange={(event) => update("minRating", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.minReviews}</span>
            <input
              type="number"
              min={0}
              value={form.minReviews}
              onChange={(event) => update("minReviews", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.minSold}</span>
            <input
              type="number"
              min={0}
              value={form.minSold}
              onChange={(event) => update("minSold", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80 lg:col-span-2">
            <span>{copy.fields.customTagText}</span>
            <input
              value={form.customTagText}
              onChange={(event) => update("customTagText", event.target.value)}
              placeholder={copy.placeholders.customTagText}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/80 lg:col-span-2 md:grid-cols-2 xl:grid-cols-3">
            {([
              ["onlyOfficialShop", copy.fields.onlyOfficialShop],
              ["downloadImages", copy.fields.downloadImages],
              ["autoPublish", copy.fields.autoPublish],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => update(key, event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950 text-white"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {loading ? copy.submitting : copy.submit}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setForm(defaultState(initialCategoryId));
                setError(null);
                setMessage(null);
                setProgress(null);
                setStartedAt(null);
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {copy.reset}
            </button>
            {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
            {error ? <span className="text-sm text-rose-300">{error}</span> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
