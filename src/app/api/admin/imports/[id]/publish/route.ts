import { NextResponse } from "next/server";
import { publishImportBatch } from "@/lib/imports";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await publishImportBatch(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "发布批次失败" },
      { status: 500 },
    );
  }
}
