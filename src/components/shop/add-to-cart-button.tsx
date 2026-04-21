"use client";

import { useMemo, useState } from "react";
import type { Locale, Product } from "@/lib/types";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  product,
  locale,
  cta,
  added,
}: {
  product: Product;
  locale: Locale;
  cta: string;
  added: string;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [done, setDone] = useState(false);
  const { addItem } = useCart();

  const activeVariant = useMemo(
    () => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const copy =
    locale === "zh"
      ? {
          heading: "快速购买",
          images: "图片",
          variants: "规格",
          variantSelection: "规格选择",
          quantity: "数量",
          decreaseQuantity: "减少数量",
          increaseQuantity: "增加数量",
          instant: "保持和首页一致的轻柔礼品店购买节奏",
        }
      : {
          heading: "Quick buy",
          images: "Images",
          variants: "Variants",
          variantSelection: "Variant selection",
          quantity: "Quantity",
          decreaseQuantity: "Decrease quantity",
          increaseQuantity: "Increase quantity",
          instant: "Keep the same soft boutique buying rhythm as the homepage",
        };

  const addSelectedQuantity = () => {
    for (let i = 0; i < quantity; i += 1) {
      addItem(product, variantId);
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1200);
  };

  return (
    <div className="space-y-4 rounded-[1.8rem] bg-white/94 p-4 shadow-[0_22px_58px_-44px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.heading}</p>
          <p className="mt-1 text-xs leading-5 text-[#8f8791]">{copy.instant}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3f6] px-4 py-2 text-xs font-medium text-[#6d6670] ring-1 ring-[rgba(248,192,205,0.62)]">
          <span>{product.images.length} {copy.images}</span>
          <span className="text-[#d7b8c1]">•</span>
          <span>{product.variants.length} {copy.variants}</span>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.variantSelection}</p>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setVariantId(variant.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm transition ${
                activeVariant?.id === variant.id
                  ? "border-transparent bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] text-white shadow-[0_18px_36px_-24px_rgba(255,109,136,0.72)]"
                  : "border-[rgba(241,203,213,0.9)] bg-white text-[#625b66] hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]"
              }`}
            >
              {variant.label[locale]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{copy.quantity}</p>
          <div className="mt-2.5 inline-flex items-center rounded-full border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-2 py-2 shadow-[0_14px_28px_-22px_rgba(214,187,198,0.6)]">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#625b66] transition hover:bg-[#fff3f6]"
              aria-label={copy.decreaseQuantity}
            >
              -
            </button>
            <span className="min-w-[2.5rem] text-center text-base font-semibold text-[#2f2b32]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(20, value + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#625b66] transition hover:bg-[#fff3f6]"
              aria-label={copy.increaseQuantity}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <Button className="w-full" onClick={addSelectedQuantity}>
            {done ? added : cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
