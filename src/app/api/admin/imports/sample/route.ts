import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { importDummyjsonSampleBatch } from "@/lib/imports";

export async function POST() {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

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
