import { getDictionary, isLocale } from "@/lib/i18n";
import { CartClient } from "@/components/cart/cart-client";
import { Container } from "@/components/ui/container";
import { StorefrontPageHero } from "@/components/storefront/page-hero";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      <StorefrontPageHero
        eyebrow="Cart"
        title={dictionary.cart.title}
        description={dictionary.cart.description}
        side={
          <div className="space-y-3 text-[#6b6470]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">Bag note</p>
            <p className="text-sm leading-7">
              {locale === "zh"
                ? "购物车页也会延续首页这种柔和礼品店风格，让用户从浏览到下单都保持同一种体验。"
                : "The cart keeps the same soft boutique presentation so the journey from discovery to checkout still feels visually consistent."}
            </p>
          </div>
        }
      />
      <Container>
        <CartClient locale={locale} dictionary={dictionary} />
      </Container>
    </div>
  );
}
