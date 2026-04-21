import { en } from "@/messages/en";
import { zh } from "@/messages/zh";
import type { Locale, LocalizedText, SiteDictionary } from "@/lib/types";
import { locales } from "@/lib/types";

export { locales };
export type { Locale };

const dictionaries: Record<Locale, SiteDictionary> = {
  en,
  zh,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): SiteDictionary {
  return dictionaries[locale];
}

export function t(locale: Locale, value: LocalizedText): string {
  return value[locale];
}
