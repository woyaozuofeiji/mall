import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { importAmazonBestsellersBatch } from "@/lib/amazon-imports";

async function readJsonBody(request: Request) {
  const raw = await request.text();
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as unknown;
}

function formatApiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return "请求体不是合法的 JSON";
  }

  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
  }
  return error instanceof Error ? error.message : "Amazon 爆品导入失败";
}

function statusForError(error: unknown) {
  if (error instanceof SyntaxError || error instanceof ZodError) {
    return 400;
  }

  return 500;
}

function wantsStream(request: Request) {
  return request.headers.get("accept")?.includes("text/event-stream") ?? false;
}

export async function POST(request: Request) {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ message: "未授权访问后台接口" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ message: formatApiError(error) }, { status: statusForError(error) });
  }

  if (!wantsStream(request)) {
    try {
      const result = await importAmazonBestsellersBatch(payload);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: formatApiError(error) }, { status: statusForError(error) });
    }
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  void (async () => {
    try {
      await sendEvent("progress", {
        phase: "initializing",
        percent: 1,
        detail: "Connected to import stream.",
      });

      const result = await importAmazonBestsellersBatch(payload, {
        onProgress: async (progress) => {
          await sendEvent("progress", progress);
        },
      });

      await sendEvent("result", result);
    } catch (error) {
      await sendEvent("error", { message: formatApiError(error) });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
