import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { archiveOrDeleteAdminProduct, updateAdminProduct } from "@/lib/admin";
import { adminProductPayloadSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload = adminProductPayloadSchema.parse(body);
    const product = await updateAdminProduct(id, payload);
    return NextResponse.json({ id: product.id }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "商品参数不合法", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "更新商品失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await archiveOrDeleteAdminProduct(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "删除商品失败" },
      { status: 500 },
    );
  }
}
