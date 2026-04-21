import Link from "next/link";
import { LayoutDashboard, Package, FileDown, ClipboardList, Files, Settings } from "lucide-react";
import type { Locale } from "@/lib/types";
import { adminHref, type AdminDictionary } from "@/lib/admin-i18n";

export function AdminShell({
  title,
  description,
  children,
  locale,
  dictionary,
  currentPath,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  locale: Locale;
  dictionary: AdminDictionary;
  currentPath: string;
}) {
  const items = [
    { href: "/admin", label: dictionary.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/products", label: dictionary.nav.products, icon: Package },
    { href: "/admin/orders", label: dictionary.nav.orders, icon: ClipboardList },
    { href: "/admin/imports", label: dictionary.nav.imports, icon: FileDown },
    { href: "/admin/content", label: dictionary.nav.content, icon: Files },
    { href: "/admin/settings", label: dictionary.nav.settings, icon: Settings },
  ];

  const otherLocale: Locale = locale === "zh" ? "en" : "zh";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <Link href={adminHref("/admin", locale)} className="block rounded-2xl bg-white/10 px-4 py-4">
            <p className="font-serif text-2xl">Northstar Admin</p>
            <p className="mt-2 text-sm text-white/70">{dictionary.shell.brandSubline}</p>
          </Link>

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{dictionary.common.localeLabel}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={adminHref(currentPath, "en")}
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm transition ${
                  locale === "en" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {dictionary.common.english}
              </Link>
              <Link
                href={adminHref(currentPath, "zh")}
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm transition ${
                  locale === "zh" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {dictionary.common.chinese}
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/40">
              {locale === "zh" ? `点击可切换为 ${otherLocale === "en" ? "英文" : "中文"} 配置视图` : `Switch to ${otherLocale === "zh" ? "Chinese" : "English"} configuration view`}
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={adminHref(item.href, locale)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="font-serif text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
