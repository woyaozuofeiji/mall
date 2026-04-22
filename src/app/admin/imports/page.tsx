import { AdminShell } from "@/components/admin/admin-shell";
import { AmazonImportForm } from "@/components/admin/amazon-import-form";
import { ImportActions } from "@/components/admin/import-actions";
import { ImportBatchActions } from "@/components/admin/import-batch-actions";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminProductFormMeta } from "@/lib/admin";
import { getAdminImportBatches } from "@/lib/imports";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const admin = await requireAdminPage({ locale, nextPath: "/admin/imports" });
  const [batches, productFormMeta] = await Promise.all([getAdminImportBatches(), getAdminProductFormMeta()]);
  const latestBatch = batches[0];
  const republishLabel = locale === "zh" ? "重复发布" : "Republish";
  const deleteSourceLabel = locale === "zh" ? "删除数据源" : "Delete source";
  const republishSuccess = locale === "zh" ? "批次已重新发布到商品库。" : "Batch republished successfully.";
  const deleteSourceSuccess = locale === "zh" ? "导入批次与源数据已删除。" : "Import batch source data deleted.";
  const deleteSourceConfirm =
    locale === "zh"
      ? "确认删除这个导入批次吗？这会删除批次及其原始导入数据，但不会删除已经发布到商品库的商品。"
      : "Delete this import batch? This removes the batch and raw import data, but keeps already-published products.";

  return (
    <AdminShell
      title={dictionary.imports.title}
      description={dictionary.imports.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/imports"
      admin={admin}
    >
      <div className="grid gap-6">
        <AmazonImportForm locale={locale} categories={productFormMeta.categories} />

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm leading-7 text-white/70">{dictionary.imports.sampleHint}</p>
          <ImportActions
            batchId={latestBatch?.id}
            importLabel={dictionary.common.importSample}
            publishLabel={dictionary.common.publishBatch}
            successImport={dictionary.imports.importSuccess}
            successPublish={dictionary.imports.publishSuccess}
            failMessage={dictionary.imports.actionFailed}
            loadingLabel={dictionary.common.loading}
          />
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
          <h2 className="font-serif text-3xl">{dictionary.imports.noBatches}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.imports.noBatchesDescription}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {batches.map((batch) => (
            <div key={batch.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl">{batch.name}</h2>
                  <p className="mt-2 text-sm text-white/60">
                    {batch.totalItems} {dictionary.imports.sourceItems} · {dictionary.common.createdAt}: {new Date(batch.createdAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC
                  </p>
                  <p className="mt-1 text-xs text-white/45">Source: {batch.source}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/10 px-3 py-1">{dictionary.imports.batchStatus}: {batch.status}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">{dictionary.imports.approvedItems}: {batch.approvedCount}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">{dictionary.imports.publishedItems}: {batch.publishedCount}</span>
                </div>
              </div>

              {batch.previewTitles.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/75">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Catalog snapshot</p>
                  <ul className="mt-3 space-y-2">
                    {batch.previewTitles.map((title) => (
                      <li key={title}>• {title}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <ImportBatchActions
                locale={locale}
                batchId={batch.id}
                categories={productFormMeta.categories}
                categoryLabel={dictionary.imports.publishTargetCategory}
                keepOriginalCategoryLabel={dictionary.imports.keepOriginalCategory}
                publishLabel={batch.publishedCount > 0 ? republishLabel : dictionary.common.publishBatch}
                deleteLabel={deleteSourceLabel}
                successPublish={batch.publishedCount > 0 ? republishSuccess : dictionary.imports.publishSuccess}
                successDelete={deleteSourceSuccess}
                failMessage={dictionary.imports.actionFailed}
                loadingLabel={dictionary.common.loading}
                deleteConfirm={deleteSourceConfirm}
              />
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
