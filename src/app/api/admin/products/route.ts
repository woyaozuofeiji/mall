import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createAdminProduct } from "@/lib/admin";
import { adminProductPayloadSchema } from "@/lib/validation/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = adminProductPayloadSchema.parse(body);
    const product = await createAdminProduct(payload);
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "商品参数不合法", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "创建商品失败" },
      { status: 500 },
    );
  }
}
