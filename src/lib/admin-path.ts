import type { Locale } from "@/lib/types";

export const INTERNAL_ADMIN_BASE = "/admin";

function normalizeAdminBase(input?: string) {
  const fallback = "/console";
  const raw = (input ?? fallback).trim();
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withLeadingSlash.replace(/\/+$/, "");

  if (!normalized || normalized === "/") {
    return fallback;
  }

  if (normalized === INTERNAL_ADMIN_BASE) {
    return INTERNAL_ADMIN_BASE;
  }

  return normalized;
}

export const PUBLIC_ADMIN_BASE = normalizeAdminBase(process.env.NEXT_PUBLIC_ADMIN_PATH ?? process.env.ADMIN_PATH);

export function toPublicAdminPath(path = INTERNAL_ADMIN_BASE) {
  if (PUBLIC_ADMIN_BASE === INTERNAL_ADMIN_BASE) {
    return path;
  }

  if (path === INTERNAL_ADMIN_BASE) {
    return PUBLIC_ADMIN_BASE;
  }

  if (path.startsWith(`${INTERNAL_ADMIN_BASE}/`)) {
    return `${PUBLIC_ADMIN_BASE}${path.slice(INTERNAL_ADMIN_BASE.length)}`;
  }

  return path;
}

export function toInternalAdminPath(path = PUBLIC_ADMIN_BASE) {
  if (PUBLIC_ADMIN_BASE === INTERNAL_ADMIN_BASE) {
    return path;
  }

  if (path === PUBLIC_ADMIN_BASE) {
    return INTERNAL_ADMIN_BASE;
  }

  if (path.startsWith(`${PUBLIC_ADMIN_BASE}/`)) {
    return `${INTERNAL_ADMIN_BASE}${path.slice(PUBLIC_ADMIN_BASE.length)}`;
  }

  return path;
}

export function isPublicAdminPath(pathname: string) {
  return pathname === PUBLIC_ADMIN_BASE || pathname.startsWith(`${PUBLIC_ADMIN_BASE}/`);
}

export function isInternalAdminPath(pathname: string) {
  return pathname === INTERNAL_ADMIN_BASE || pathname.startsWith(`${INTERNAL_ADMIN_BASE}/`);
}

export function getAdminLoginPath(locale: Locale = "en", nextPath?: string) {
  const search = new URLSearchParams({ locale });
  if (nextPath) {
    search.set("next", nextPath);
  }
  return `${toPublicAdminPath("/admin/login")}?${search.toString()}`;
}

export function getAdminDashboardPath(locale: Locale = "en") {
  return `${toPublicAdminPath("/admin")}?locale=${locale}`;
}

export function sanitizeAdminNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return null;
  }

  if (!nextPath.startsWith("/")) {
    return null;
  }

  const [pathname] = nextPath.split("?");
  if (!pathname) {
    return null;
  }

  if (!isPublicAdminPath(pathname) && !isInternalAdminPath(pathname)) {
    return null;
  }

  if (isInternalAdminPath(pathname)) {
    return `${toPublicAdminPath(pathname)}${nextPath.slice(pathname.length)}`;
  }

  return nextPath;
}
