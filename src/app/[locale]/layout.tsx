import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/components/providers/cart-provider";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <CartProvider>
      <div lang={locale === "zh" ? "zh-CN" : "en"} className="min-h-screen">
        <SiteHeader locale={locale} dictionary={{ brand: dictionary.common.brand, nav: dictionary.nav }} />
        <main>{children}</main>
        <SiteFooter locale={locale} />
      </div>
    </CartProvider>
  );
}
