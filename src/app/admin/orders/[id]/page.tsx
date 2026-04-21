import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrderUpdateForm } from "@/components/admin/order-update-form";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const [{ id }, { locale: localeValue }] = await Promise.all([params, searchParams]);
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <AdminShell
      title={`${dictionary.orders.title} · ${order.orderNumber}`}
      description={dictionary.orders.detailDescription}
      locale={locale}
      dictionary={dictionary}
      currentPath={`/admin/orders/${id}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">{dictionary.products.status}</p>
                <h2 className="mt-3 font-serif text-4xl">{order.status}</h2>
                <p className="mt-2 text-sm text-white/60">
                  {dictionary.orders.createdAtPrefix} {new Date(order.createdAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">{dictionary.orders.total}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(order.totalAmount, "en")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-3xl">{dictionary.orders.customer}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm text-white/75">
              <div>
                <p className="text-white/45">{locale === "zh" ? "姓名" : "Name"}</p>
                <p className="mt-2 text-white">{order.customer.fullName}</p>
              </div>
              <div>
                <p className="text-white/45">Email</p>
                <p className="mt-2 text-white">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-white/45">{locale === "zh" ? "电话" : "Phone"}</p>
                <p className="mt-2 text-white">{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-white/45">{locale === "zh" ? "地区" : "Region"}</p>
                <p className="mt-2 text-white">{order.customer.region || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-white/45">{locale === "zh" ? "地址" : "Address"}</p>
                <p className="mt-2 text-white">{order.customer.address}, {order.customer.city}, {order.customer.country} {order.customer.postalCode}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-3xl">{dictionary.orders.items}</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{item.productName}</p>
                    {item.variantName ? <p className="mt-1 text-white/50">{item.variantName}</p> : null}
                  </div>
                  <div className="text-right text-white/75">
                    <p>x {item.quantity}</p>
                    <p className="mt-1 text-white">{formatCurrency(item.lineTotal, "en")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <OrderUpdateForm
          orderId={order.id}
          initialValues={{
            status: order.status,
            note: order.note,
            carrier: order.carrier,
            trackingNumber: order.trackingNumber,
          }}
          locale={locale}
          dictionary={dictionary}
        />
      </div>
    </AdminShell>
  );
}
