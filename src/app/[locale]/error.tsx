"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const isZh = locale === "zh";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div
        className="mx-auto max-w-md rounded-2xl p-10"
        style={{
          background: "linear-gradient(135deg, #fff8fa 0%, #fff0f4 100%)",
          boxShadow: "0 4px 24px rgba(255, 126, 149, 0.10)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "rgba(255, 126, 149, 0.12)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff7e95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold" style={{ color: "#2f2b32" }}>
          {isZh ? "出了点问题" : "Something went wrong"}
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#6d6670" }}>
          {isZh ? "我们遇到了意外错误，请稍后再试。" : "We encountered an unexpected error. Please try again."}
        </p>
        <button
          onClick={reset}
          className="mb-3 w-full cursor-pointer rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff7e95, #ff6d88)" }}
        >
          {isZh ? "重试" : "Try again"}
        </button>
        <Link
          href={`/${locale}`}
          className="inline-block text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: "#ff7e95" }}
        >
          {isZh ? "返回首页" : "Back to home"}
        </Link>
      </div>
    </div>
  );
}
