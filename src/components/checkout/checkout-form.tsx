"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Locale, SiteDictionary } from "@/lib/types";
import { useCart } from "@/components/providers/cart-provider";
import { checkoutCustomerSchema } from "@/lib/validation/checkout";
import { Button } from "@/components/ui/button";
import { StorefrontPanel } from "@/components/storefront/page-hero";
import { formatCurrency } from "@/lib/format";
import { PaymentMethodModal } from "@/components/checkout/payment-method-modal";

const schema = checkoutCustomerSchema.extend({
  agreed: z.literal(true),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<{ orderNumber: string; email: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const routeToPaymentPage = (orderNumber: string, email: string, method?: "card" | "paypal") => {
    const params = new URLSearchParams({
      order: orderNumber,
      email,
    });

    if (method) {
      params.set("method", method);
    }

    router.push(`/${locale}/checkout/payment?${params.toString()}`);
  };

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      setSubmitError(locale === "zh" ? "购物车为空，无法提交订单。" : "Your cart is empty.");
      return;
    }

    setSubmitError(null);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale,
        customer: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          country: values.country,
          region: values.region,
          city: values.city,
          address: values.address,
          postalCode: values.postalCode,
          note: values.note,
        },
        items: items.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
          variantId: item.variantId,
        })),
      }),
    });

    const payload = (await response.json()) as { orderNumber?: string; email?: string; message?: string };

    if (!response.ok || !payload.orderNumber) {
      setSubmitError(payload.message ?? (locale === 'zh' ? '提交订单失败，请稍后重试。' : 'Failed to submit order.'));
      return;
    }

    clearCart();
    setPaymentChoice({
      orderNumber: payload.orderNumber,
      email: payload.email ?? values.email,
    });
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm text-[#2f2b32] outline-none transition focus:border-[rgba(255,126,149,0.55)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="space-y-6">
        <StorefrontPanel className="p-6 sm:p-7">
          <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.checkout.customerInfo}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {locale === 'zh' ? '收件人姓名' : 'Full name'}
              <input className={inputClass} {...register("fullName")} />
              {errors.fullName ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入收件人姓名。' : 'Please enter your name.'}</span> : null}
            </label>
            <label className="text-sm text-[#574f5a]">
              {dictionary.tracking.email}
              <input className={inputClass} type="email" {...register("email")} />
              {errors.email ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入有效的邮箱地址。' : 'Please enter a valid email.'}</span> : null}
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '联系电话' : 'Phone'}
              <input className={inputClass} {...register("phone")} />
              {errors.phone ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入有效的联系电话。' : 'Please enter a valid phone number.'}</span> : null}
            </label>
          </div>
        </StorefrontPanel>

        <StorefrontPanel className="p-6 sm:p-7">
          <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.checkout.shippingAddress}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '国家 / 地区' : 'Country / Region'}
              <input className={inputClass} {...register("country")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '州 / 省' : 'State / Province'}
              <input className={inputClass} {...register("region")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '城市' : 'City'}
              <input className={inputClass} {...register("city")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '邮编' : 'Postal code'}
              <input className={inputClass} {...register("postalCode")} />
            </label>
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {locale === 'zh' ? '详细地址' : 'Address'}
              <input className={inputClass} {...register("address")} />
            </label>
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {dictionary.checkout.note}
              <textarea className={`${inputClass} min-h-28 resize-y py-3`} {...register("note")} />
            </label>
          </div>
        </StorefrontPanel>
      </div>

      <StorefrontPanel className="p-6 lg:sticky lg:top-28 lg:h-fit sm:p-7">
        <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{locale === "zh" ? "订单摘要" : "Order summary"}</h2>
        <p className="mt-3 text-sm leading-7 text-[#6d6670]">{dictionary.checkout.description}</p>
        <div className="mt-6 space-y-3 border-t border-[rgba(241,225,230,0.95)] pt-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-[#2f2b32]">{item.name[locale]}</p>
                <p className="text-[#8f8791]">x {item.quantity}</p>
              </div>
              <p className="text-[#2f2b32]">{formatCurrency(item.price * item.quantity, locale)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[rgba(241,225,230,0.95)] pt-5 text-sm text-[#6d6670]">
          <span>{dictionary.cart.subtotal}</span>
          <span className="text-lg font-semibold text-[#2f2b32]">{formatCurrency(subtotal, locale)}</span>
        </div>
        <div className="mt-6 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
          <label className="flex items-start gap-3">
            <input className="mt-1" type="checkbox" {...register("agreed")} />
            <span>{dictionary.checkout.terms}</span>
          </label>
          {errors.agreed ? <span className='mt-2 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请确认结算信息。' : 'Please confirm the terms.'}</span> : null}
        </div>
        {submitError ? <p className="mt-4 rounded-[1rem] bg-[#fff3f6] px-4 py-3 text-sm text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">{submitError}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={items.length === 0 || isSubmitting}>
          {isSubmitting ? (locale === 'zh' ? '创建订单中...' : 'Creating order...') : dictionary.checkout.submitOrder}
        </Button>
        <p className="mt-4 text-xs leading-6 text-[#8f8791]">
          {locale === 'zh'
            ? '提交后系统会创建待付款订单，并立即引导你选择信用卡或 PayPal 完成支付。'
            : 'Submitting creates a payment-pending order and immediately guides you into card or PayPal checkout.'}
        </p>
      </StorefrontPanel>

      {paymentChoice ? (
        <PaymentMethodModal
          locale={locale}
          orderNumber={paymentChoice.orderNumber}
          email={paymentChoice.email}
          onChoose={(method) => routeToPaymentPage(paymentChoice.orderNumber, paymentChoice.email, method)}
          onChooseLater={() => routeToPaymentPage(paymentChoice.orderNumber, paymentChoice.email)}
        />
      ) : null}
    </form>
  );
}
