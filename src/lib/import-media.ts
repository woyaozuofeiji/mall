import path from "node:path";
import { promises as fs } from "node:fs";

const IMPORT_MEDIA_API_PREFIX = "/api/media/imports";
const LEGACY_IMPORT_MEDIA_PREFIX = "/imports/";
const IMPORT_MEDIA_PUBLIC_ALIASES = [
  {
    storagePrefix: "tiktok/",
    publicPrefix: "marketplace/",
  },
] as const;

export function getImportStorageRoot() {
  return path.join(process.cwd(), "storage", "imports");
}

export function getLegacyImportPublicRoot() {
  return path.join(process.cwd(), "public", "imports");
}

export function sanitizeImportPathSegments(segments: string[]) {
  return segments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !segment.includes("..") && !segment.includes("/"));
}

function toPublicImportPath(relativePath: string) {
  for (const alias of IMPORT_MEDIA_PUBLIC_ALIASES) {
    if (relativePath.startsWith(alias.storagePrefix)) {
      return `${alias.publicPrefix}${relativePath.slice(alias.storagePrefix.length)}`;
    }
  }

  return relativePath;
}

function toStorageImportPath(relativePath: string) {
  for (const alias of IMPORT_MEDIA_PUBLIC_ALIASES) {
    if (relativePath.startsWith(alias.publicPrefix)) {
      return `${alias.storagePrefix}${relativePath.slice(alias.publicPrefix.length)}`;
    }
  }

  return relativePath;
}

export function buildImportMediaUrl(relativePath: string) {
  const normalized = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
  return `${IMPORT_MEDIA_API_PREFIX}/${toPublicImportPath(normalized)}`;
}

export function parseImportMediaRelativePath(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const normalizedUrl = url.trim();
  if (!normalizedUrl) {
    return null;
  }

  if (normalizedUrl.startsWith(`${IMPORT_MEDIA_API_PREFIX}/`)) {
    return toStorageImportPath(
      sanitizeImportPathSegments(normalizedUrl.slice(IMPORT_MEDIA_API_PREFIX.length + 1).split("/")).join("/"),
    );
  }

  if (normalizedUrl.startsWith(LEGACY_IMPORT_MEDIA_PREFIX)) {
    return toStorageImportPath(
      sanitizeImportPathSegments(normalizedUrl.slice(LEGACY_IMPORT_MEDIA_PREFIX.length).split("/")).join("/"),
    );
  }

  return null;
}

export function getImportMediaDirectoryFromUrl(url: string | null | undefined) {
  const relativePath = parseImportMediaRelativePath(url);
  if (!relativePath) {
    return null;
  }

  const segments = sanitizeImportPathSegments(relativePath.split("/"));
  if (segments.length < 2) {
    return null;
  }

  return segments.slice(0, -1).join("/");
}

export function rewriteImportAssetUrl(url: string) {
  if (!url.startsWith(LEGACY_IMPORT_MEDIA_PREFIX)) {
    return url;
  }

  return buildImportMediaUrl(url.slice(LEGACY_IMPORT_MEDIA_PREFIX.length));
}

export async function resolveImportAssetFile(segments: string[]) {
  const safeSegments = sanitizeImportPathSegments(toStorageImportPath(segments.join("/")).split("/"));
  if (safeSegments.length === 0) {
    return null;
  }

  const candidatePaths = [
    path.join(getImportStorageRoot(), ...safeSegments),
    path.join(getLegacyImportPublicRoot(), ...safeSegments),
  ];

  for (const filePath of candidatePaths) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        return filePath;
      }
    } catch {
      // continue
    }
  }

  return null;
}
