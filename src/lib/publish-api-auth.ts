import { timingSafeEqual } from "node:crypto";

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return request.headers.get("x-api-token")?.trim() ?? "";
}

export function authenticatePublishApiRequest(request: Request) {
  const configuredToken = process.env.PRODUCT_PUBLISH_API_TOKEN?.trim();
  if (!configuredToken) {
    return {
      ok: false as const,
      status: 503,
      message: "服务端未配置 PRODUCT_PUBLISH_API_TOKEN",
    };
  }

  const requestToken = readBearerToken(request);
  if (!requestToken) {
    return {
      ok: false as const,
      status: 401,
      message: "缺少 Bearer Token",
    };
  }

  const expectedBuffer = Buffer.from(configuredToken);
  const providedBuffer = Buffer.from(requestToken);
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return {
      ok: false as const,
      status: 401,
      message: "API Token 无效",
    };
  }

  return {
    ok: true as const,
  };
}
