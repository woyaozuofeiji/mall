import { AdminShell } from "@/components/admin/admin-shell";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
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
      <AdminOrdersList orders={orders} locale={locale} dictionary={dictionary} />
    </AdminShell>
  );
}
