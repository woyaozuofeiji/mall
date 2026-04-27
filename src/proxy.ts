import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth-config";
import {
  INTERNAL_ADMIN_BASE,
  PUBLIC_ADMIN_BASE,
  getAdminLoginPath,
  isInternalAdminPath,
  isPublicAdminPath,
  toInternalAdminPath,
  toPublicAdminPath,
} from "@/lib/admin-path";

const LOCALES = ["en", "zh"];

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function withSecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function hasLocalePrefix(pathname: string) {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // --- Locale redirect ---
  if (!hasLocalePrefix(pathname) && !pathname.startsWith("/api/") && !isPublicAdminPath(pathname) && !isInternalAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (isInternalAdminPath(pathname) && PUBLIC_ADMIN_BASE !== INTERNAL_ADMIN_BASE) {
    const redirectUrl = new URL(`${toPublicAdminPath(pathname)}${search}`, request.url);
    return withSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  if (isPublicAdminPath(pathname)) {
    const internalPath = toInternalAdminPath(pathname);
    const isLoginRoute = internalPath === "/admin/login";
    const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

    if (!isLoginRoute && !hasSessionCookie) {
      const localeParam = request.nextUrl.searchParams.get("locale");
      const locale = localeParam === "zh" ? "zh" : "en";
      const nextTarget = `${toPublicAdminPath(pathname)}${search}`;
      return withSecurityHeaders(NextResponse.redirect(new URL(getAdminLoginPath(locale, nextTarget), request.url)));
    }

    return withSecurityHeaders(NextResponse.rewrite(new URL(`${internalPath}${search}`, request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
