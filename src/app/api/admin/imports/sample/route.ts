import { NextResponse } from "next/server";
import { importDummyjsonSampleBatch } from "@/lib/imports";

export async function POST() {
  try {
    const batch = await importDummyjsonSampleBatch();
    return NextResponse.json({ id: batch.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "同步商品源数据失败" },
      { status: 500 },
    );
  }
}
