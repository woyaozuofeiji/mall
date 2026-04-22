"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";

type AmazonImportProgressPhase =
  | "initializing"
  | "fetching_bestsellers"
  | "processing_candidates"
  | "saving_batch"
  | "publishing_batch"
  | "completed";

interface AmazonImportProgressEvent {
  phase: AmazonImportProgressPhase;
  percent: number;
  current?: number;
  total?: number;
  approvedCount?: number;
  rejectedCount?: number;
  candidateCount?: number;
  batchId?: string;
  publishedCount?: number;
  currentAsin?: string;
  currentTitle?: string;
  detail?: string;
}

interface AmazonImportResult {
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

interface AmazonImportFormState {
  jobName: string;
  domain: string;
  browseNodeId: string;
  localCategoryId: string;
  geoLocation: string;
  targetCount: string;
  candidatePoolSize: string;
  maxPages: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  minReviews: string;
  featuredTopN: string;
  customTagText: string;
  onlyPrime: boolean;
  includePricing: boolean;
  downloadImages: boolean;
  autoPublish: boolean;
}

const defaultState = (categoryId?: string): AmazonImportFormState => ({
  jobName: "",
  domain: "com",
  browseNodeId: "",
  localCategoryId: categoryId ?? "",
  geoLocation: "90210",
  targetCount: "10",
  candidatePoolSize: "24",
  maxPages: "2",
  minPrice: "",
  maxPrice: "",
  minRating: "4.2",
  minReviews: "300",
  featuredTopN: "3",
  customTagText: "amazon,bestseller",
  onlyPrime: false,
  includePricing: true,
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
    return locale === "zh"
      ? `${minutes} 分 ${seconds} 秒`
      : `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return locale === "zh"
    ? `${hours} 小时 ${remainingMinutes} 分`
    : `${hours}h ${remainingMinutes}m`;
}

function getEta(locale: Locale, startedAt: number | null, progress: AmazonImportProgressEvent | null) {
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

async function parseSseResponse(response: Response, handlers: {
  onProgress: (event: AmazonImportProgressEvent) => void;
}): Promise<AmazonImportResult | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("浏览器不支持流式读取响应。");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: AmazonImportResult | null = null;

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

    const payload = JSON.parse(dataLines.join("\n")) as AmazonImportProgressEvent | AmazonImportResult | { message?: string };
    if (eventType === "progress") {
      handlers.onProgress(payload as AmazonImportProgressEvent);
      return;
    }

    if (eventType === "result") {
      finalResult = payload as AmazonImportResult;
      return;
    }

    if (eventType === "error") {
      throw new Error((payload as { message?: string }).message ?? "采集任务执行失败");
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

export function AmazonImportForm({ locale, categories }: { locale: Locale; categories: CategoryOption[] }) {
  const router = useRouter();
  const initialCategoryId = categories[0]?.id;
  const [form, setForm] = useState<AmazonImportFormState>(() => defaultState(initialCategoryId));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<AmazonImportProgressEvent | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const copy = useMemo(() => {
    return locale === "zh"
      ? {
          title: "Amazon 爆品采集器",
          description: "按 Amazon Best Sellers 类目榜单抓取候选商品，支持评分/评论/价格筛选、图片本地化、自动发布与定时任务接口。",
          note: "提示：Amazon 类目榜单接口需要填写 browse node ID，而不是类目中文名。",
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
            domain: "Amazon 站点",
            browseNodeId: "类目 Node ID",
            localCategoryId: "本地分类",
            geoLocation: "邮编 / Deliver to",
            targetCount: "目标商品数",
            candidatePoolSize: "候选池",
            maxPages: "最多抓取榜页",
            minPrice: "最低价格",
            maxPrice: "最高价格",
            minRating: "最低评分",
            minReviews: "最低评论数",
            featuredTopN: "前 N 名标记热销",
            customTagText: "附加标签",
            onlyPrime: "仅 Prime",
            includePricing: "抓取报价列表",
            downloadImages: "下载图片到本地导入媒体目录",
            autoPublish: "导入后自动发布",
          },
          placeholders: {
            jobName: "例如：首饰榜单 Top10",
            browseNodeId: "例如：389823011",
            customTagText: "jewelry,launch-apr",
          },
          result: (input: { approvedCount: number; publishedCount: number; batchId: string }) =>
            `已生成批次 ${input.batchId}，通过 ${input.approvedCount} 条${input.publishedCount > 0 ? `，已发布 ${input.publishedCount} 条` : ""}`,
          progressText: (event: AmazonImportProgressEvent) => {
            switch (event.phase) {
              case "initializing":
                return "正在校验配置并初始化采集任务...";
              case "fetching_bestsellers":
                return `正在抓取榜单页 ${event.current ?? 0}/${event.total ?? 0}，已发现 ${event.candidateCount ?? 0} 个候选商品`;
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
          title: "Amazon Bestseller Importer",
          description: "Pull Amazon Best Sellers by category, filter by rating/reviews/price, localize images, auto-publish, and reuse the same payload for scheduled jobs.",
          note: "Tip: use the Amazon browse node ID here, not the category display name.",
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
            domain: "Amazon domain",
            browseNodeId: "Browse node ID",
            localCategoryId: "Local category",
            geoLocation: "ZIP / Deliver to",
            targetCount: "Target items",
            candidatePoolSize: "Candidate pool",
            maxPages: "Max pages",
            minPrice: "Min price",
            maxPrice: "Max price",
            minRating: "Min rating",
            minReviews: "Min reviews",
            featuredTopN: "Mark top N as featured",
            customTagText: "Extra tags",
            onlyPrime: "Prime only",
            includePricing: "Fetch offer listings",
            downloadImages: "Download images into local import media storage",
            autoPublish: "Auto-publish after import",
          },
          placeholders: {
            jobName: "e.g. Jewelry Top 10",
            browseNodeId: "e.g. 389823011",
            customTagText: "jewelry,launch-apr",
          },
          result: (input: { approvedCount: number; publishedCount: number; batchId: string }) =>
            `Batch ${input.batchId} created with ${input.approvedCount} approved items${input.publishedCount > 0 ? ` and ${input.publishedCount} published` : ""}`,
          progressText: (event: AmazonImportProgressEvent) => {
            switch (event.phase) {
              case "initializing":
                return "Validating input and preparing the import task...";
              case "fetching_bestsellers":
                return `Fetching bestseller page ${event.current ?? 0}/${event.total ?? 0}; found ${event.candidateCount ?? 0} candidates so far`;
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

  const update = <K extends keyof AmazonImportFormState>(key: K, value: AmazonImportFormState[K]) => {
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
      const response = await fetch("/api/admin/imports/amazon", {
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
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message ?? "Request failed");
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
                <p className="mt-1 leading-6">{progress.detail ?? (locale === "zh" ? "等待下一步任务反馈..." : "Waiting for the next task update...")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/45">{copy.currentItem}</span>
                <p className="mt-1 leading-6 line-clamp-2">{progress.currentTitle ?? progress.currentAsin ?? (locale === "zh" ? "当前阶段没有具体商品" : "No specific item in the current phase")}</p>
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
            <span>{copy.fields.domain}</span>
            <input
              value={form.domain}
              onChange={(event) => update("domain", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.browseNodeId}</span>
            <input
              required
              value={form.browseNodeId}
              onChange={(event) => update("browseNodeId", event.target.value)}
              placeholder={copy.placeholders.browseNodeId}
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
            <span>{copy.fields.geoLocation}</span>
            <input
              value={form.geoLocation}
              onChange={(event) => update("geoLocation", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.targetCount}</span>
            <input
              type="number"
              min={1}
              max={50}
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
              max={200}
              value={form.candidatePoolSize}
              onChange={(event) => update("candidatePoolSize", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            <span>{copy.fields.maxPages}</span>
            <input
              type="number"
              min={1}
              max={5}
              value={form.maxPages}
              onChange={(event) => update("maxPages", event.target.value)}
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

          <label className="grid gap-2 text-sm text-white/80 lg:col-span-2">
            <span>{copy.fields.customTagText}</span>
            <input
              value={form.customTagText}
              onChange={(event) => update("customTagText", event.target.value)}
              placeholder={copy.placeholders.customTagText}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-white outline-none transition focus:border-white/30"
            />
          </label>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/80 lg:col-span-2 md:grid-cols-2 xl:grid-cols-4">
            {([
              ["onlyPrime", copy.fields.onlyPrime],
              ["includePricing", copy.fields.includePricing],
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
