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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  if (isInternalAdminPath(pathname) && PUBLIC_ADMIN_BASE !== INTERNAL_ADMIN_BASE) {
    const redirectUrl = new URL(`${toPublicAdminPath(pathname)}${search}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicAdminPath(pathname)) {
    const internalPath = toInternalAdminPath(pathname);
    const isLoginRoute = internalPath === "/admin/login";
    const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

    if (!isLoginRoute && !hasSessionCookie) {
      const localeParam = request.nextUrl.searchParams.get("locale");
      const locale = localeParam === "zh" ? "zh" : "en";
      const nextTarget = `${toPublicAdminPath(pathname)}${search}`;
      return NextResponse.redirect(new URL(getAdminLoginPath(locale, nextTarget), request.url));
    }

    return NextResponse.rewrite(new URL(`${internalPath}${search}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

