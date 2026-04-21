import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminDashboardStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const stats = await getAdminDashboardStats();

  return (
    <AdminShell
      title={dictionary.dashboard.title}
      description={dictionary.dashboard.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">{dictionary.dashboard.categories}</p>
          <p className="mt-3 text-3xl font-semibold">{stats.categoryCount}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">{dictionary.dashboard.publishedProducts}</p>
          <p className="mt-3 text-3xl font-semibold">{stats.productCount}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">{dictionary.dashboard.featuredProducts}</p>
          <p className="mt-3 text-3xl font-semibold">{stats.featuredCount}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">{dictionary.dashboard.orders}</p>
          <p className="mt-3 text-3xl font-semibold">{stats.orderCount}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.dashboard.backendState}</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75">
            {dictionary.dashboard.backendStateItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.dashboard.nextFocus}</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75">
            {dictionary.dashboard.nextFocusItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
