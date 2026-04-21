"use client";

import Link from "next/link";
import { ChevronDown, CircleUserRound, Menu, Search, ShoppingCart, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { locales, type Locale } from "@/lib/i18n";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: {
    brand: string;
    nav: {
      home: string;
      shop: string;
      search: string;
      cart: string;
      tracking: string;
      faq: string;
      contact: string;
      admin: string;
    };
  };
}

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const altLocale = locales.find((item) => item !== locale) ?? "en";

  const navItems = useMemo(
    () => [
      { href: `/${locale}`, label: dictionary.nav.home },
      { href: `/${locale}/shop`, label: dictionary.nav.shop },
      { href: `/${locale}/search`, label: dictionary.nav.search },
      { href: `/${locale}/order-tracking`, label: dictionary.nav.tracking },
      { href: `/${locale}/faq`, label: dictionary.nav.faq },
      { href: `/${locale}/contact`, label: dictionary.nav.contact },
    ],
    [dictionary.nav, locale],
  );

  const shippingCopy =
    locale === "zh" ? "订单满 $59 包邮" : "Free Shipping on orders over $59";
  const tagline =
    locale === "zh" ? "给日常增添一点温柔闪光" : "Treasures for Every Day";

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(247,208,219,0.7)] bg-white/92 backdrop-blur-xl">
      <div className="border-b border-[rgba(247,208,219,0.8)] bg-[#fdecef] text-[#5f5860]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
          <div className="hidden min-w-[11rem] md:block" />
          <div className="flex flex-1 items-center justify-center gap-2 text-center text-sm font-medium">
            <Truck className="h-4 w-4" />
            <span>{shippingCopy}</span>
          </div>
          <div className="hidden min-w-[11rem] items-center justify-end gap-5 text-sm md:flex">
            <Link href={`/${altLocale}`} className="transition hover:text-[#ff6d88]">
              {locale === "zh" ? "中文 / EN" : "English / 中文"}
            </Link>
            <button type="button" className="inline-flex items-center gap-1 transition hover:text-[#ff6d88]">
              USD
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="shrink-0 text-[#2f2b32]">
          <p className="font-serif text-[2.6rem] leading-none tracking-[-0.04em] sm:text-[3rem]">{dictionary.brand}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.26em] text-[#8b838d]">{tagline}</p>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[15px] font-medium text-[#413b44] transition hover:text-[#ff6d88]",
                index === 0 && "text-[#ff6d88]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/search`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#332f36] transition hover:bg-[#fff1f4] hover:text-[#ff6d88]"
            aria-label={dictionary.nav.search}
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#332f36] transition hover:bg-[#fff1f4] hover:text-[#ff6d88] sm:flex"
            aria-label={dictionary.nav.contact}
          >
            <CircleUserRound className="h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/cart`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#332f36] transition hover:bg-[#fff1f4] hover:text-[#ff6d88]"
            aria-label={dictionary.nav.cart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-1 rounded-full bg-[#ff7e95] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {totalItems}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#332f36] transition hover:bg-[#fff1f4] hover:text-[#ff6d88] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={cn("border-t border-[rgba(247,208,219,0.7)] bg-white px-4 py-4 lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-[1.1rem] bg-[#fff6f8] px-4 py-3 text-[15px] font-medium text-[#413b44]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`/${altLocale}`}
            onClick={() => setOpen(false)}
            className="rounded-[1.1rem] bg-[#fdecef] px-4 py-3 text-[15px] font-medium text-[#413b44]"
          >
            {locale === "zh" ? "切换到 English" : "切换到中文"}
          </Link>
        </div>
      </div>
    </header>
  );
}
