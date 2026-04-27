import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const DEFAULT_OG_IMAGE = "/index.png";

function normalizePath(path = "") {
  if (!path || path === "/") {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function truncateDescription(input: string, maxLength = 160) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getLocalePath(locale: Locale, path = "") {
  return `/${locale}${normalizePath(path)}`;
}

export function getOgImagePath(locale: Locale, path = "") {
  const normalizedPath = normalizePath(path);
  return normalizedPath ? `/api/og/${locale}${normalizedPath}` : `/api/og/${locale}`;
}

export function getLanguageAlternates(path = "") {
  const normalizedPath = normalizePath(path);

  return {
    en: absoluteUrl(`/en${normalizedPath}`),
    "zh-CN": absoluteUrl(`/zh${normalizedPath}`),
    "x-default": absoluteUrl(`/en${normalizedPath}`),
  };
}

export function getAbsoluteImageUrls(images?: Array<string | undefined | null>) {
  const resolved = (images ?? [])
    .filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    .map((image) => absoluteUrl(image));

  return resolved.length > 0 ? resolved : [absoluteUrl(DEFAULT_OG_IMAGE)];
}

export function buildPageMetadata(input: {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  primaryImagePath?: string;
  noIndex?: boolean;
  noIndexFollow?: boolean;
  keywords?: string[];
  images?: Array<string | undefined | null>;
  type?: "website" | "article";
}) {
  const canonical = absoluteUrl(getLocalePath(input.locale, input.path));
  const description = truncateDescription(input.description);
  const imageCandidates = [
    ...(input.primaryImagePath ? [input.primaryImagePath] : []),
    ...(input.images ?? []),
  ];
  const images = Array.from(new Set(getAbsoluteImageUrls(imageCandidates)));

  return {
    title: input.title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical,
      languages: getLanguageAlternates(input.path),
    },
    robots: input.noIndex || input.noIndexFollow
      ? {
          index: false,
          follow: Boolean(input.noIndexFollow),
          googleBot: {
            index: false,
            follow: Boolean(input.noIndexFollow),
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: input.type ?? "website",
      locale: input.locale === "zh" ? "zh_CN" : "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: input.title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images,
    },
  } satisfies Metadata;
}

export function serializeJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
