import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { formatCurrency, getDiscountPercent } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, locale, priority = false }: { product: Product; locale: Locale; priority?: boolean }) {
  const rating = product.reviewSummary?.rating ?? 4.8;
  const count = product.reviewSummary?.count ?? Math.max(42, product.images.length * 12);
  const discountPercent = getDiscountPercent(product.price, product.compareAtPrice);

  return (
    <Link
      href={`/${locale}/shop/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_20px_52px_-36px_rgba(214,187,198,0.78)] ring-1 ring-[rgba(241,225,230,0.95)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_-34px_rgba(214,187,198,0.9)]"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7f8_0%,#fffdfd_100%)]">
        <div className="p-3 sm:p-4">
          <div className="relative overflow-hidden rounded-[1.15rem] border border-[rgba(241,225,230,0.95)] bg-white/90">
            <Image
              src={product.image}
              alt={t(locale, product.name)}
              width={900}
              height={900}
              loading={priority ? "eager" : undefined}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
              className="aspect-square w-full object-contain p-3 transition duration-500 group-hover:scale-105 sm:p-4"
            />
          </div>
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured ? <Badge>{locale === "zh" ? "热销" : "Bestseller"}</Badge> : null}
          {product.isNew ? <Badge className="border-transparent bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] text-white shadow-[0_14px_28px_-18px_rgba(255,109,136,0.72)]">{locale === "zh" ? "新品" : "New"}</Badge> : null}
          {discountPercent ? (
            <Badge className="border-transparent bg-[#2f2b32] text-white shadow-[0_14px_28px_-18px_rgba(47,43,50,0.4)]">
              {locale === "zh" ? `省 ${discountPercent}%` : `Save ${discountPercent}%`}
            </Badge>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-[#7a7280] shadow-[0_12px_24px_-18px_rgba(64,51,59,0.35)]">
          <Heart className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-3">
        <div className="space-y-2.5">
          <h3 className="line-clamp-2 text-[1.08rem] font-medium leading-6 text-[#37323a]">{t(locale, product.name)}</h3>
          <div className="flex items-center gap-1 text-[#ffbe3b]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-current stroke-current" />
            ))}
            <span className="ml-1 text-[12px] text-[#827b87]">({count})</span>
          </div>
          <p
            className="text-sm leading-6 text-[#7a7480]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {t(locale, product.subtitle)}
          </p>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[rgba(241,225,230,0.95)] pt-3">
          <div>
            <p className="text-[1.08rem] font-semibold text-[#2f2b32]">{formatCurrency(product.price, locale)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-[#b2a8b1] line-through">
                {locale === "zh" ? "原价 " : "Was "}
                {formatCurrency(product.compareAtPrice, locale)}
              </p>
            ) : null}
          </div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#9d94a0]">{rating.toFixed(1)}</p>
        </div>
      </div>
    </Link>
  );
}
