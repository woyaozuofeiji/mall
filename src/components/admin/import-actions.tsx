"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportActions({
  batchId,
  importLabel,
  publishLabel,
  successImport,
  successPublish,
  failMessage,
  loadingLabel,
}: {
  batchId?: string;
  importLabel: string;
  publishLabel: string;
  successImport: string;
  successPublish: string;
  failMessage: string;
  loadingLabel: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"import" | "publish" | null>(null);

  const run = async (kind: "import" | "publish") => {
    setError(null);
    setMessage(null);
    setLoading(kind);

    const response = await fetch(kind === "import" ? "/api/admin/imports/sample" : `/api/admin/imports/${batchId}/publish`, {
      method: "POST",
    });
    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(result.message ?? failMessage);
      setLoading(null);
      return;
    }
    setMessage(kind === "import" ? successImport : successPublish);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => run("import")}
        disabled={loading !== null}
        className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
      >
        {loading === "import" ? loadingLabel : importLabel}
      </button>
      {batchId ? (
        <button
          type="button"
          onClick={() => run("publish")}
          disabled={loading !== null}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {loading === "publish" ? loadingLabel : publishLabel}
        </button>
      ) : null}
      {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </div>
  );
}
