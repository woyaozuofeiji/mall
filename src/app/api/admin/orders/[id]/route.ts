import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { deleteAdminOrder, updateAdminOrder } from "@/lib/orders";
import { adminOrderUpdatePayloadSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const payload = adminOrderUpdatePayloadSchema.parse(body);
    const result = await updateAdminOrder(id, payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "订单更新参数不合法", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "更新订单失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await deleteAdminOrder(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "删除订单失败" },
      { status: 500 },
    );
  }
}
