import { AdminShell } from "@/components/admin/admin-shell";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
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
      <AdminProductsList products={products} locale={locale} dictionary={dictionary} />
    </AdminShell>
  );
}
