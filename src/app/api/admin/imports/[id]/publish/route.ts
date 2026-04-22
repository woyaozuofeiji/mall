import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { publishImportBatch } from "@/lib/imports";
import { importBatchPublishRequestSchema } from "@/lib/validation/imports";

async function readJsonBody(request: Request) {
  const raw = await request.text();
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as unknown;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await readJsonBody(request);
    const payload = importBatchPublishRequestSchema.parse(body);
    const result = await publishImportBatch(id, payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues.map((issue) => issue.message).join("; ") || "发布参数不合法" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "发布批次失败" },
      { status: 500 },
    );
  }
}
