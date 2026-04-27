"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, Product } from "@/lib/types";
import { readCart, writeCart } from "@/lib/store";

interface CartContextValue {
  items: CartLine[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, variantId?: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setItems(readCart());
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCart(items);
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      totalItems,
      subtotal,
      addItem: (product, variantId) => {
        setItems((current) => {
          const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
          const lineId = `${product.id}-${variant?.id ?? "default"}`;
          const existing = current.find((item) => item.id === lineId);
          if (existing) {
            return current.map((item) =>
              item.id === lineId ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [
            ...current,
            {
              id: lineId,
              slug: product.slug,
              name: product.name,
              image: product.image,
              price: product.price,
              quantity: 1,
              variantId: variant?.id,
              variantLabel: variant?.label,
            },
          ];
        });
      },
      updateQuantity: (lineId, quantity) => {
        setItems((current) =>
          current.map((item) => (item.id === lineId ? { ...item, quantity: Math.max(1, quantity) } : item)),
        );
      },
      removeItem: (lineId) => {
        setItems((current) => current.filter((item) => item.id !== lineId));
      },
      clearCart: () => {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
