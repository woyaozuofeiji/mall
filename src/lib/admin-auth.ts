import { timingSafeEqual } from "node:crypto";
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_DAYS } from "@/lib/admin-auth-config";
import { hashAdminPassword, signAdminSessionData, verifyAdminPassword } from "@/lib/admin-crypto";
import { getAdminLoginPath, sanitizeAdminNextPath } from "@/lib/admin-path";
import type { Locale } from "@/lib/types";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
};

type AdminSessionPayload = {
  adminId: string;
  role: string;
  exp: number;
};

const sessionSecret =
  process.env.ADMIN_SESSION_SECRET ??
  process.env.SESSION_SECRET ??
  "dev-admin-session-secret-change-me";

function isUsableSecret(value?: string | null) {
  return Boolean(value && value.trim() && !value.includes("change-this"));
}

function encodeSessionPayload(payload: AdminSessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSessionPayload(value: string): AdminSessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AdminSessionPayload;
    if (!parsed?.adminId || !parsed?.role || typeof parsed.exp !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signAdminSessionData(encodedPayload, sessionSecret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  const payload = decodeSessionPayload(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function authenticateAdminCredentials(email: string, password: string) {
  const admin = await prisma.admin.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      active: true,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      displayName: true,
      role: true,
    },
  });

  if (!admin) {
    const adminCount = await prisma.admin.count();
    const bootstrapEmail = process.env.ADMIN_EMAIL?.trim();
    const bootstrapPassword = process.env.ADMIN_PASSWORD?.trim();

    if (
      adminCount === 0 &&
      bootstrapEmail &&
      isUsableSecret(bootstrapPassword) &&
      bootstrapEmail.toLowerCase() === email.trim().toLowerCase() &&
      bootstrapPassword === password
    ) {
      const created = await prisma.admin.create({
        data: {
          email: bootstrapEmail,
          passwordHash: hashAdminPassword(bootstrapPassword),
          displayName: "Bootstrap Admin",
          role: "admin",
          active: true,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
        },
      });

      return created satisfies AuthenticatedAdmin;
    }

    return null;
  }

  if (!verifyAdminPassword(password, admin.passwordHash)) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    role: admin.role,
  } satisfies AuthenticatedAdmin;
}

export async function getAdminSetupStatus() {
  const count = await prisma.admin.count();
  return {
    hasAdmins: count > 0,
    hasBootstrapCredentials: Boolean(process.env.ADMIN_EMAIL?.trim() && isUsableSecret(process.env.ADMIN_PASSWORD)),
  };
}

export async function createAdminSession(admin: AuthenticatedAdmin) {
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const payload: AdminSessionPayload = {
    adminId: admin.id,
    role: admin.role,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };
  const encodedPayload = encodeSessionPayload(payload);
  const signature = signAdminSessionData(encodedPayload, sessionSecret);
  const token = `${encodedPayload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      active: true,
    },
  });

  if (!admin || !admin.active) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    role: admin.role,
  } satisfies AuthenticatedAdmin;
}

export async function requireAdminPage(options?: { locale?: Locale; nextPath?: string | null }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect(getAdminLoginPath(options?.locale ?? "en", sanitizeAdminNextPath(options?.nextPath) ?? undefined));
  }
  return admin;
}
