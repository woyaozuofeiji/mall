import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveImportAssetFile } from "@/lib/import-media";

export const dynamic = "force-dynamic";

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return CONTENT_TYPE_MAP[extension] ?? "application/octet-stream";
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: routePath } = await params;
  const filePath = await resolveImportAssetFile(routePath ?? []);

  if (!filePath) {
    return new Response("Not Found", { status: 404 });
  }

  const data = await fs.readFile(filePath);
  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
