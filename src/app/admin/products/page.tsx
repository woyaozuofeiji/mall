import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, adminHref, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const admin = await requireAdminPage({ locale, nextPath: "/admin/products" });
  const products = await getAdminProducts();

  return (
    <AdminShell
      title={dictionary.products.title}
      description={dictionary.products.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/products"
      admin={admin}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/60">
          {dictionary.common.total} {products.length} {dictionary.products.countLabel}
        </p>
        <Link
          href={adminHref("/admin/products/new", locale)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
        >
          {dictionary.products.newProduct}
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-5 py-4 font-medium">{dictionary.products.product}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.category}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.price}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.variants}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-white/5">
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-white/5">
                <td className="px-5 py-4">
                  <Link href={adminHref(`/admin/products/${product.id}`, locale)} className="block">
                    <p className="font-medium text-white hover:underline">{product.nameEn}</p>
                    <p className="mt-1 text-xs text-white/50">/{product.slug}</p>
                  </Link>
                </td>
                <td className="px-5 py-4">{product.category}</td>
                <td className="px-5 py-4">${product.price.toFixed(2)}</td>
                <td className="px-5 py-4">{product.variantCount}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">{product.featured ? "featured" : product.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
