import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/product-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminProductById, getAdminProductFormMeta } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const [{ id }, { locale: localeValue }] = await Promise.all([params, searchParams]);
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const [product, meta] = await Promise.all([getAdminProductById(id), getAdminProductFormMeta()]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title={`${dictionary.products.editPrefix} · ${product.nameEn}`}
      description={dictionary.products.editDescription}
      locale={locale}
      dictionary={dictionary}
      currentPath={`/admin/products/${id}`}
    >
      <AdminProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          slug: product.slug,
          categoryId: product.categoryId,
          status: product.status,
          nameEn: product.nameEn,
          nameZh: product.nameZh,
          subtitleEn: product.subtitleEn,
          subtitleZh: product.subtitleZh,
          descriptionEn: product.descriptionEn,
          descriptionZh: product.descriptionZh,
          storyEn: product.storyEn,
          storyZh: product.storyZh,
          leadTimeEn: product.leadTimeEn,
          leadTimeZh: product.leadTimeZh,
          shippingNoteEn: product.shippingNoteEn,
          shippingNoteZh: product.shippingNoteZh,
          imageUrl: product.imageUrl,
          galleryImagesText: product.galleryImagesText,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? "",
          featured: product.featured,
          isNew: product.isNew,
          tagsText: product.tagsText,
          variantsText: product.variantsText,
          specsText: product.specsText,
        }}
        categories={meta.categories}
        statusOptions={meta.statusOptions}
        orderItemCount={product.orderItemCount}
        locale={locale}
        dictionary={dictionary}
      />
    </AdminShell>
  );
}
