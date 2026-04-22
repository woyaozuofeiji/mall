"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateAdminCredentials, createAdminSession, deleteAdminSession, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAdminDashboardPath, getAdminLoginPath, sanitizeAdminNextPath } from "@/lib/admin-path";
import { resolveAdminLocale } from "@/lib/admin-i18n";

export type AdminLoginActionState =
  | {
      message?: string;
      fieldErrors?: {
        email?: string[];
        password?: string[];
      };
    }
  | undefined;

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(6).trim(),
  locale: z.string().optional(),
  next: z.string().optional(),
});

export async function loginAdminAction(_state: AdminLoginActionState, formData: FormData): Promise<AdminLoginActionState> {
  const locale = resolveAdminLocale(String(formData.get("locale") ?? "en"));
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      message: locale === "zh" ? "请检查邮箱和密码格式。" : "Please check the email and password format.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const admin = await authenticateAdminCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    return {
      message: locale === "zh" ? "邮箱或密码不正确。" : "Invalid email or password.",
    };
  }

  await createAdminSession(admin);
  const nextPath = sanitizeAdminNextPath(parsed.data.next);
  redirect(nextPath ?? getAdminDashboardPath(locale));
}

export async function logoutAdminAction(formData: FormData) {
  const locale = resolveAdminLocale(String(formData.get("locale") ?? "en"));
  await deleteAdminSession();
  redirect(getAdminLoginPath(locale));
}

export async function redirectIfAdminAuthenticated(localeValue?: string, nextPath?: string | null) {
  const locale = resolveAdminLocale(localeValue);
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    redirect(sanitizeAdminNextPath(nextPath) ?? getAdminDashboardPath(locale));
  }
}

