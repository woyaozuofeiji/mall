import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary, resolveAdminLocale } from "@/lib/admin-i18n";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const { locale: localeValue } = await searchParams;
  const locale = resolveAdminLocale(localeValue);
  const dictionary = getAdminDictionary(locale);

  return (
    <AdminShell
      title={dictionary.settings.title}
      description={dictionary.settings.description}
      locale={locale}
      dictionary={dictionary}
      currentPath="/admin/settings"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.settings.storeIdentity}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.settings.storeIdentityDescription}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <h2 className="font-serif text-3xl">{dictionary.settings.commerceSettings}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{dictionary.settings.commerceSettingsDescription}</p>
        </div>
      </div>
    </AdminShell>
  );
}
