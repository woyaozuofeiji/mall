import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);

  return (
    <AdminShell
      title={dictionary.content.title}
      description={dictionary.content.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/content"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.content.homepageBlocks}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.content.homepageDescription}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.content.policyPages}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.content.policyDescription}</p>
        </div>
      </div>
    </AdminShell>
  );
}
