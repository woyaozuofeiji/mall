import Link from "next/link";
import { adminHref, getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Admin</p>
        <h1 className="mt-4 font-serif text-5xl">{dictionary.login.title}</h1>
        <p className="mt-4 text-sm leading-7 text-white/70">{dictionary.login.description}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href={adminHref("/admin/login", "en")}
            className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm ${locale === "en" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"}`}
          >
            {dictionary.common.english}
          </Link>
          <Link
            href={adminHref("/admin/login", "zh")}
            className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm ${locale === "zh" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"}`}
          >
            {dictionary.common.chinese}
          </Link>
        </div>
        <Link
          href={adminHref("/admin", locale)}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
        >
          {dictionary.login.enterPreview}
        </Link>
      </div>
    </div>
  );
}
