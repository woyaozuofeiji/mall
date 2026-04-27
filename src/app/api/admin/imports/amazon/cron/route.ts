import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { runScheduledAmazonImports } from "@/lib/amazon-imports";

async function readJsonBody(request: Request) {
  const raw = await request.text();
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as unknown;
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

function isAuthorized(request: Request) {
  const configuredSecret = process.env.AMAZON_IMPORT_CRON_SECRET?.trim();
  if (!configuredSecret) {
    throw new Error("缺少 AMAZON_IMPORT_CRON_SECRET，无法启用定时采集接口。");
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const headerSecret = request.headers.get("x-cron-secret")?.trim() ?? "";
  return (bearer && safeCompare(bearer, configuredSecret)) || (headerSecret && safeCompare(headerSecret, configuredSecret));
}

function statusForError(error: unknown) {
  if (error instanceof SyntaxError || error instanceof ZodError) {
    return 400;
  }

  return 500;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: "未授权的计划任务请求" }, { status: 401 });
    }

    const payload = await readJsonBody(request);
    const result = await runScheduledAmazonImports(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Amazon 定时采集失败" },
      { status: statusForError(error) },
    );
  }
}
