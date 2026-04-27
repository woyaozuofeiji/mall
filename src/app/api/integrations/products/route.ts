import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminProductFormMeta, resolveAdminCategory, upsertAdminProduct } from "@/lib/admin";
import { authenticatePublishApiRequest } from "@/lib/publish-api-auth";
import { externalProductPublishPayloadSchema } from "@/lib/validation/admin";

function unauthorizedResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

function formatValidationError(error: ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
}

export async function GET(request: Request) {
  const auth = authenticatePublishApiRequest(request);
  if (!auth.ok) {
    return unauthorizedResponse(auth.status, auth.message);
  }

  const meta = await getAdminProductFormMeta();
  return NextResponse.json(meta, { status: 200 });
}

export async function POST(request: Request) {
  const auth = authenticatePublishApiRequest(request);
  if (!auth.ok) {
    return unauthorizedResponse(auth.status, auth.message);
  }

  try {
    const body = await request.json();
    const parsed = externalProductPublishPayloadSchema.parse(body);
    const category = await resolveAdminCategory({
      categoryId: parsed.categoryId,
      categorySlug: parsed.categorySlug,
    });

    const result = await upsertAdminProduct({
      ...parsed,
      categoryId: category.id,
    });

    return NextResponse.json(
      {
        id: result.id,
        mode: result.mode,
        category: {
          id: category.id,
          slug: category.slug,
          nameEn: category.nameEn,
          nameZh: category.nameZh,
        },
      },
      { status: result.mode === "created" ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "商品参数不合法",
          detail: formatValidationError(error),
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "发布商品失败" },
      { status: 500 },
    );
  }
}
