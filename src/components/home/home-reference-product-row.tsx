import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Star } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Container } from "@/components/ui/container";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[#ffbe3b]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-3.5 w-3.5 fill-current stroke-current" />
      ))}
      <span className="ml-1 text-[12px] font-medium text-[#7a7480]">({rating.toFixed(1)})</span>
    </div>
  );
}

function ProductCard({ product, locale, badge }: { product: Product; locale: Locale; badge: string }) {
  const rating = product.reviewSummary?.rating ?? 4.8;
  const reviews = product.reviewSummary?.count ?? Math.max(42, product.images.length * 18);

  return (
    <Link href={`/${locale}/shop/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-[1.2rem] bg-white shadow-[0_18px_46px_-34px_rgba(201,176,187,0.62)] ring-1 ring-[rgba(241,225,230,0.9)] transition hover:-translate-y-1 hover:shadow-[0_26px_54px_-30px_rgba(201,176,187,0.78)]">
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7f8_0%,#fffdfd_100%)]">
          <Image
            src={product.image}
            alt={t(locale, product.name)}
            width={900}
            height={900}
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 100vw"
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_10px_24px_-18px_rgba(255,109,136,0.9)]">
            {badge}
          </div>
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-[#6f6771] shadow-[0_12px_24px_-18px_rgba(64,51,59,0.35)]">
            <Heart className="h-4 w-4" />
          </div>
        </div>
        <div className="px-3 pb-4 pt-3 sm:px-4">
          <h3 className="line-clamp-2 text-[1.05rem] font-medium leading-6 text-[#37323a]">{t(locale, product.name)}</h3>
          <div className="mt-2 flex items-center gap-2">
            <ReviewStars rating={rating} />
            <span className="text-[12px] text-[#8e8691]">{reviews}</span>
          </div>
          <p className="mt-2 text-[1.05rem] font-semibold text-[#29252d]">{formatCurrency(product.price, locale)}</p>
        </div>
      </div>
    </Link>
  );
}

export function HomeReferenceProductRow({
  locale,
  title,
  viewAllLabel,
  viewAllHref,
  products,
  badge,
}: {
  locale: Locale;
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  products: Product[];
  badge: string;
}) {
  return (
    <section className="py-5 sm:py-6">
      <Container>
        <div className="relative">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2.2rem]">{title}</h2>
            <Link href={viewAllHref} className="inline-flex items-center gap-2 text-[15px] font-medium text-[#2f2b32] transition hover:text-[#ff6d88]">
              {viewAllLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} badge={badge} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
