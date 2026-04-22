import { AdminShell } from "@/components/admin/admin-shell";
import { ImportActions } from "@/components/admin/import-actions";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";
import { getAdminImportBatches } from "@/lib/imports";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);
  const admin = await requireAdminPage({ locale, nextPath: "/admin/imports" });
  const batches = await getAdminImportBatches();
  const latestBatch = batches[0];

  return (
    <AdminShell
      title={dictionary.imports.title}
      description={dictionary.imports.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/imports"
      admin={admin}
    >
      <div className="mb-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
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

      {batches.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
          <h2 className="font-serif text-3xl">{dictionary.imports.noBatches}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.imports.noBatchesDescription}</p>
        </div>
      ) : (
        <div className="grid gap-4">
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
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
