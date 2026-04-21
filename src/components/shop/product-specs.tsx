import type { Locale, Product } from "@/lib/types";
import { t } from "@/lib/i18n";

export function ProductSpecs({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <div className="rounded-[2rem] border border-[rgba(59,47,37,0.08)] bg-[rgba(255,255,255,0.82)] p-7 shadow-[0_28px_70px_-48px_rgba(29,22,18,0.52)]">
      <div className="grid gap-4">
        {product.specs.map((spec) => (
          <div
            key={spec.label.en}
            className="flex flex-col gap-2 border-b border-[rgba(59,47,37,0.06)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-10"
          >
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#8f8377]">{t(locale, spec.label)}</span>
            <span className="text-sm leading-7 text-[#171411]">{t(locale, spec.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
