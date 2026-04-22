import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { archiveOrDeleteAdminProducts } from "@/lib/admin";
import { adminBulkDeletePayloadSchema } from "@/lib/validation/admin";

export async function POST(request: Request) {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = adminBulkDeletePayloadSchema.parse(body);
    const result = await archiveOrDeleteAdminProducts(payload.ids);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "批量删除商品参数不合法", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "批量删除商品失败" },
      { status: 500 },
    );
  }
}
