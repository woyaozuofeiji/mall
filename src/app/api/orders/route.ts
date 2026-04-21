import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createOrderFromCheckout } from "@/lib/orders";
import { checkoutPayloadSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = checkoutPayloadSchema.parse(body);
    const order = await createOrderFromCheckout(payload);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "提交参数不合法",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "创建订单失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
