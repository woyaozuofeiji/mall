import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { CartClient } from "@/components/cart/cart-client";
import { Container } from "@/components/ui/container";
import { StorefrontPageHero } from "@/components/storefront/page-hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  return buildPageMetadata({
    locale,
    path: "/cart",
    title: locale === "zh" ? "购物车" : "Shopping Cart",
    description: locale === "zh" ? "查看购物车中的商品并继续结算。" : "Review the items in your cart and continue to checkout.",
    noIndex: true,
  });
}

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
                ? "请在这里确认商品、数量与小计，准备好后即可继续填写收货信息并完成付款。"
                : "Review your items, quantities and subtotal here, then continue to shipping details and payment when ready."}
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
