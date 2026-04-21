"use client";

import Image from "next/image";
import type { Locale, SiteDictionary } from "@/lib/types";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StorefrontPanel } from "@/components/storefront/page-hero";

export function CartClient({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const copy =
    locale === "zh"
      ? {
          summary: "订单摘要",
          paymentNote: "提交订单后可继续选择信用卡或 PayPal，并完成付款。",
        }
      : {
          summary: "Summary",
          paymentNote: "After the order is created, continue by choosing card or PayPal to complete payment.",
        };

  if (items.length === 0) {
    return (
      <StorefrontPanel className="p-10 text-center">
        <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.cart.emptyTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6d6670]">{dictionary.cart.emptyDescription}</p>
        <div className="mt-6 flex justify-center">
          <Button href={`/${locale}/shop`} variant="secondary">
            {dictionary.common.continueShopping}
          </Button>
        </div>
      </StorefrontPanel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="order-2 space-y-4 lg:order-1">
        {items.map((item) => (
          <StorefrontPanel key={item.id} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[140px_1fr] sm:p-5">
            <div className="overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,#fff7f8_0%,#fffdfd_100%)] ring-1 ring-[rgba(241,225,230,0.95)]">
              <Image src={item.image} alt={item.name[locale]} width={500} height={500} className="aspect-square w-full object-cover" />
            </div>
            <div className="min-w-0 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[1.2rem] font-semibold leading-7 text-[#2f2b32] sm:text-[1.6rem]">{item.name[locale]}</h3>
                    {item.variantLabel ? <p className="mt-1 text-sm text-[#8f8791]">{item.variantLabel[locale]}</p> : null}
                  </div>
                  <p className="text-sm font-semibold text-[#2f2b32]">{formatCurrency(item.price * item.quantity, locale)}</p>
                </div>
                <p className="text-sm text-[#8f8791]">{formatCurrency(item.price, locale)} / item</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-3 py-2">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-lg text-[#6d6670]">
                    -
                  </button>
                  <span className="min-w-6 text-center text-sm font-medium text-[#2f2b32]">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-lg text-[#6d6670]">
                    +
                  </button>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-[#8f8791] transition hover:text-[#ff6d88]">
                  {dictionary.cart.remove}
                </button>
              </div>
            </div>
          </StorefrontPanel>
        ))}
      </div>

      <StorefrontPanel className="order-1 p-5 lg:order-2 lg:sticky lg:top-28 lg:h-fit sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.summary}</p>
        <div className="mt-5 flex items-center justify-between text-base text-[#6d6670]">
          <span>{dictionary.cart.subtotal}</span>
          <span className="text-[1.7rem] font-semibold text-[#2f2b32]">{formatCurrency(subtotal, locale)}</span>
        </div>
        <div className="mt-6 space-y-3">
          <Button href={`/${locale}/checkout`} className="w-full">
            {dictionary.cart.checkout}
          </Button>
          <Button href={`/${locale}/shop`} variant="secondary" className="w-full">
            {dictionary.common.continueShopping}
          </Button>
        </div>
        <p className="mt-5 text-xs leading-6 text-[#8f8791]">{copy.paymentNote}</p>
      </StorefrontPanel>
    </div>
  );
}
