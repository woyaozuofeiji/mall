import { AdminProductForm, type AdminProductFormValues } from "@/components/admin/product-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminProductFormMeta } from "@/lib/admin";

export const dynamic = "force-dynamic";

const defaultValues: AdminProductFormValues = {
  slug: "",
  categoryId: "",
  status: "DRAFT",
  nameEn: "",
  nameZh: "",
  subtitleEn: "",
  subtitleZh: "",
  descriptionEn: "",
  descriptionZh: "",
  storyEn: "",
  storyZh: "",
  leadTimeEn: "",
  leadTimeZh: "",
  shippingNoteEn: "",
  shippingNoteZh: "",
  imageUrl: "",
  galleryImagesText: "",
  price: "0",
  compareAtPrice: "",
  featured: false,
  isNew: false,
  tagsText: "",
  variantsText: "",
  specsText: "",
};

export default async function AdminNewProductPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const meta = await getAdminProductFormMeta();

  return (
    <AdminShell
      title={dictionary.products.createTitle}
      description={dictionary.products.createDescription}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/products/new"
    >
      <AdminProductForm
        mode="create"
        initialValues={{ ...defaultValues, categoryId: meta.categories[0]?.id ?? "" }}
        categories={meta.categories}
        statusOptions={meta.statusOptions}
        locale={locale}
        dictionary={dictionary}
      />
    </AdminShell>
  );
}
