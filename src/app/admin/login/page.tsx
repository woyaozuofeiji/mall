import Link from "next/link";
import { redirectIfAdminAuthenticated } from "@/app/admin/actions";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSetupStatus } from "@/lib/admin-auth";
import { sanitizeAdminNextPath, toPublicAdminPath } from "@/lib/admin-path";
import { adminHref, getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string; next?: string }>;
}) {
  const { locale: localeValue, next } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const nextPath = sanitizeAdminNextPath(next);
  await redirectIfAdminAuthenticated(localeValue, nextPath);
  const dictionary = getAdminDictionary(locale);
  const setup = await getAdminSetupStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Admin</p>
        <h1 className="mt-4 font-serif text-5xl">{dictionary.login.title}</h1>
        <p className="mt-4 text-sm leading-7 text-white/70">{dictionary.login.description}</p>
        <p className="mt-3 text-xs leading-6 text-white/45">
          {locale === "zh"
            ? `推荐后台入口：${toPublicAdminPath("/admin/login")}`
            : `Recommended admin entry: ${toPublicAdminPath("/admin/login")}`}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`${adminHref("/admin/login", "en")}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`}
            className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm ${locale === "en" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"}`}
          >
            {dictionary.common.english}
          </Link>
          <Link
            href={`${adminHref("/admin/login", "zh")}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`}
            className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm ${locale === "zh" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"}`}
          >
            {dictionary.common.chinese}
          </Link>
        </div>
        {!setup.hasAdmins ? (
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm leading-7 text-amber-50">
            {setup.hasBootstrapCredentials
              ? locale === "zh"
                ? "当前数据库中还没有管理员账号。首次使用 .env 中配置的 ADMIN_EMAIL / ADMIN_PASSWORD 登录时，系统会自动创建管理员。"
                : "No admin account exists yet. On the first login, the system will automatically create an administrator from ADMIN_EMAIL / ADMIN_PASSWORD in your environment."
              : locale === "zh"
                ? "当前还没有管理员账号。请先执行 npm run db:seed，或在环境变量中配置 ADMIN_EMAIL / ADMIN_PASSWORD 后重新部署。"
                : "No admin account exists yet. Run npm run db:seed first, or configure ADMIN_EMAIL / ADMIN_PASSWORD in your environment and redeploy."}
          </div>
        ) : null}
        <AdminLoginForm locale={locale} nextPath={nextPath ?? undefined} />
      </div>
    </div>
  );
}
