export const SITE_NAME = "Northstar Atelier";
export const DEFAULT_SITE_URL = "https://mall.67win.cc";

export function getSiteUrl() {
  const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

