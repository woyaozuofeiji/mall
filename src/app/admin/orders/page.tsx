import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, adminHref, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const admin = await requireAdminPage({ locale, nextPath: "/admin/orders" });
  const orders = await getAdminOrders();

  return (
    <AdminShell
      title={dictionary.orders.title}
      description={dictionary.orders.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/orders"
      admin={admin}
    >
      <div className="mb-6 text-sm text-white/60">
        {dictionary.common.total} {orders.length} {dictionary.orders.countLabel}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <Link key={order.id} href={adminHref(`/admin/orders/${order.id}`, locale)} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{order.status}</p>
            <h2 className="mt-3 font-serif text-3xl">{order.orderNumber}</h2>
            <p className="mt-2 text-sm text-white/70">{order.customerName}</p>
            <p className="mt-1 text-xs text-white/45">{order.email}</p>
            <div className="mt-5 flex items-center justify-between text-sm text-white/70">
              <span>{order.itemCount} {dictionary.orders.items}</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            {order.trackingNumber ? (
              <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {order.carrier ?? dictionary.orders.carrier}: {order.trackingNumber}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
