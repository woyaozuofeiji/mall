"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";
import type { Locale, SiteDictionary } from "@/lib/types";
import { useCart } from "@/components/providers/cart-provider";
import { checkoutCustomerSchema } from "@/lib/validation/checkout";
import type { PaymentMethod } from "@/lib/payment-methods";
import { Button } from "@/components/ui/button";
import { StorefrontPanel } from "@/components/storefront/page-hero";
import { formatCurrency } from "@/lib/format";
import { PaymentMethodModal } from "@/components/checkout/payment-method-modal";

const schema = checkoutCustomerSchema.extend({
  agreed: z.boolean().refine((value) => value),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const hasItems = items.length > 0;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<{ orderNumber: string; email: string } | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      region: "",
      city: "",
      address: "",
      postalCode: "",
      note: "",
      agreed: false,
    },
  });
  const { field: agreedField } = useController({
    name: "agreed",
    control,
  });

  const routeToPaymentPage = (orderNumber: string, email: string, method?: PaymentMethod) => {
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
    "mt-2 h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-base text-[#2f2b32] outline-none transition focus:border-[rgba(255,126,149,0.55)] sm:text-sm";
  const agreementErrorText =
    locale === "zh" ? "请确认结算信息后再继续付款。" : "Please confirm your checkout details before continuing.";
  const renderAgreementCheckbox = (id: string) => (
    <label className="flex items-start gap-3" htmlFor={id}>
      <input
        id={id}
        className="mt-1"
        type="checkbox"
        name={agreedField.name}
        checked={Boolean(agreedField.value)}
        aria-invalid={errors.agreed ? "true" : "false"}
        onBlur={agreedField.onBlur}
        onChange={(event) => agreedField.onChange(event.target.checked)}
      />
      <span>{dictionary.checkout.terms}</span>
    </label>
  );

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="space-y-6">
        <StorefrontPanel className="p-5 lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">
                {locale === "zh" ? "移动端结算摘要" : "Mobile checkout summary"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#2f2b32]">
                {locale === "zh" ? `${items.length} 件商品，当前小计 ${formatCurrency(subtotal, locale)}` : `${items.length} items, subtotal ${formatCurrency(subtotal, locale)}`}
              </p>
            </div>
            <Button href={`/${locale}/cart`} variant="secondary" className="w-full sm:w-auto">
              {locale === "zh" ? "返回购物车" : "Back to cart"}
            </Button>
          </div>
          <details className="mt-4 rounded-[1.2rem] bg-[#fff8fa] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <summary className="cursor-pointer list-none text-sm font-medium text-[#2f2b32]">
              {locale === "zh" ? "展开查看商品明细" : "Expand order items"}
            </summary>
            <div className="mt-4 space-y-3 border-t border-[rgba(241,225,230,0.95)] pt-4">
              {hasItems ? (
                items.map((item) => (
                  <div key={`mobile-${item.id}`} className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-[#2f2b32]">{item.name[locale]}</p>
                      <p className="text-[#8f8791]">x {item.quantity}</p>
                    </div>
                    <p className="text-[#2f2b32]">{formatCurrency(item.price * item.quantity, locale)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[#6d6670]">
                  {locale === "zh" ? "购物车为空，请先返回商品页添加商品。" : "Your cart is empty. Add a product before continuing."}
                </p>
              )}
            </div>
          </details>
        </StorefrontPanel>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-[1.3rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "步骤 1" : "Step 1"}</p>
            <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "填写联系信息" : "Add contact details"}</p>
          </div>
          <div className="rounded-[1.3rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "步骤 2" : "Step 2"}</p>
            <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "确认配送地址" : "Confirm delivery address"}</p>
          </div>
          <div className="rounded-[1.3rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#ff7e95]">{locale === "zh" ? "步骤 3" : "Step 3"}</p>
            <p className="mt-2 text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "跳转付款方式" : "Continue to payment"}</p>
          </div>
        </div>

        <StorefrontPanel className="p-6 sm:p-7">
          <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.checkout.customerInfo}</h2>
          <p className="mt-3 text-sm leading-7 text-[#6d6670]">
            {locale === "zh"
              ? "我们会使用这些信息发送订单确认、支付进度和发货通知。"
              : "We use these details for order confirmation, payment updates and shipment notifications."}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {locale === 'zh' ? '收件人姓名' : 'Full name'}
              <input className={inputClass} autoComplete="name" autoCapitalize="words" enterKeyHint="next" {...register("fullName")} />
              {errors.fullName ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入收件人姓名。' : 'Please enter your name.'}</span> : null}
            </label>
            <label className="text-sm text-[#574f5a]">
              {dictionary.tracking.email}
              <input className={inputClass} type="email" autoComplete="email" inputMode="email" enterKeyHint="next" {...register("email")} />
              {errors.email ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入有效的邮箱地址。' : 'Please enter a valid email.'}</span> : null}
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '联系电话' : 'Phone'}
              <input className={inputClass} autoComplete="tel" inputMode="tel" enterKeyHint="next" {...register("phone")} />
              {errors.phone ? <span className='mt-1 block text-xs text-[#ff6d88]'>{locale === 'zh' ? '请输入有效的联系电话。' : 'Please enter a valid phone number.'}</span> : null}
            </label>
          </div>
        </StorefrontPanel>

        <StorefrontPanel className="p-6 sm:p-7">
          <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{dictionary.checkout.shippingAddress}</h2>
          <p className="mt-3 text-sm leading-7 text-[#6d6670]">
            {locale === "zh"
              ? "请尽量填写完整准确的地址、电话和邮编信息，以减少派送异常和清关延迟。"
              : "Please keep the address, phone number and postal code complete and accurate to reduce delivery exceptions or customs delays."}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '国家 / 地区' : 'Country / Region'}
              <input className={inputClass} autoComplete="country-name" enterKeyHint="next" {...register("country")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '州 / 省' : 'State / Province'}
              <input className={inputClass} autoComplete="address-level1" enterKeyHint="next" {...register("region")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '城市' : 'City'}
              <input className={inputClass} autoComplete="address-level2" enterKeyHint="next" {...register("city")} />
            </label>
            <label className="text-sm text-[#574f5a]">
              {locale === 'zh' ? '邮编' : 'Postal code'}
              <input className={inputClass} autoComplete="postal-code" inputMode="numeric" enterKeyHint="next" {...register("postalCode")} />
            </label>
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {locale === 'zh' ? '详细地址' : 'Address'}
              <input className={inputClass} autoComplete="street-address" enterKeyHint="next" {...register("address")} />
            </label>
            <label className="text-sm text-[#574f5a] sm:col-span-2">
              {dictionary.checkout.note}
              <textarea className={`${inputClass} min-h-28 resize-y py-3`} enterKeyHint="done" {...register("note")} />
            </label>
          </div>
        </StorefrontPanel>

        <StorefrontPanel className="p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">
            {locale === "zh" ? "下单前提示" : "Before placing the order"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "现货通常 1-3 个工作日处理" : "Most in-stock items process in 1-3 business days"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "支付后可继续查询订单和物流状态" : "You can keep tracking order and shipping status after payment"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-sm leading-7 text-[#2f2b32]">{locale === "zh" ? "大多数标准商品支持 30 天内申请退货" : "Most standard items support return requests within 30 days"}</p>
            </div>
          </div>
        </StorefrontPanel>

        <StorefrontPanel className="p-6 sm:p-7 lg:hidden">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{locale === "zh" ? "确认并继续付款" : "Confirm and continue to payment"}</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-[#6d6670]">
            <span>{dictionary.cart.subtotal}</span>
            <span className="text-lg font-semibold text-[#2f2b32]">{formatCurrency(subtotal, locale)}</span>
          </div>
          <div className="mt-4 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
            {renderAgreementCheckbox("checkout-agreed-mobile")}
            {errors.agreed ? <span className='mt-2 block text-xs text-[#ff6d88]'>{agreementErrorText}</span> : null}
          </div>
          {submitError ? <p className="mt-4 rounded-[1rem] bg-[#fff3f6] px-4 py-3 text-sm text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">{submitError}</p> : null}
          <Button type="submit" className="mt-6 w-full" disabled={!hasItems || isSubmitting}>
            {isSubmitting ? (locale === 'zh' ? '创建订单中...' : 'Creating order...') : dictionary.checkout.submitOrder}
          </Button>
          <p className="mt-4 text-xs leading-6 text-[#8f8791]">
            {locale === 'zh'
              ? '提交后系统会创建待付款订单，并立即引导你使用信用卡完成支付。PayPal 通道当前维护中。'
              : 'Submitting creates a payment-pending order and immediately guides you into card checkout. PayPal is currently under maintenance.'}
          </p>
        </StorefrontPanel>
      </div>

      <StorefrontPanel className="hidden p-6 lg:sticky lg:top-28 lg:block lg:h-fit sm:p-7">
        <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{locale === "zh" ? "订单摘要" : "Order summary"}</h2>
        <p className="mt-3 text-sm leading-7 text-[#6d6670]">{dictionary.checkout.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-[#fff3f6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.55)]">
            {locale === "zh" ? `${items.length} 件商品` : `${items.length} items`}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#fff3f6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.55)]">
            {locale === "zh" ? "安全支付" : "Secure payment"}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#fff3f6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.55)]">
            {locale === "zh" ? "支持物流追踪" : "Tracking supported"}
          </span>
        </div>
        <div className="mt-6 space-y-3 border-t border-[rgba(241,225,230,0.95)] pt-6">
          {hasItems ? (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-[#2f2b32]">{item.name[locale]}</p>
                  <p className="text-[#8f8791]">x {item.quantity}</p>
                </div>
                <p className="text-[#2f2b32]">{formatCurrency(item.price * item.quantity, locale)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] bg-[#fff8fa] px-4 py-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
              <p>{locale === "zh" ? "购物车当前为空，请先返回商品页添加想要购买的商品。" : "Your cart is currently empty. Add a product first before continuing to checkout."}</p>
              <Button href={`/${locale}/shop`} variant="secondary" className="mt-4 w-full">
                {locale === "zh" ? "返回选购" : "Back to shop"}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[rgba(241,225,230,0.95)] pt-5 text-sm text-[#6d6670]">
          <span>{dictionary.cart.subtotal}</span>
          <span className="text-lg font-semibold text-[#2f2b32]">{formatCurrency(subtotal, locale)}</span>
        </div>
        <div className="mt-6 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
          {renderAgreementCheckbox("checkout-agreed-desktop")}
          {errors.agreed ? <span className='mt-2 block text-xs text-[#ff6d88]'>{agreementErrorText}</span> : null}
        </div>
        {submitError ? <p className="mt-4 rounded-[1rem] bg-[#fff3f6] px-4 py-3 text-sm text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">{submitError}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={items.length === 0 || isSubmitting}>
          {isSubmitting ? (locale === 'zh' ? '创建订单中...' : 'Creating order...') : dictionary.checkout.submitOrder}
        </Button>
        <p className="mt-4 text-xs leading-6 text-[#8f8791]">
          {locale === 'zh'
            ? '提交后系统会创建待付款订单，并立即引导你使用信用卡完成支付。PayPal 通道当前维护中。'
            : 'Submitting creates a payment-pending order and immediately guides you into card checkout. PayPal is currently under maintenance.'}
        </p>
        <div className="mt-4 rounded-[1.2rem] bg-[#fff8fa] px-4 py-3 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
          {locale === "zh"
            ? "如果你在移动端填写信息，建议先确认地址和邮箱正确，再进入支付页，避免来回切换造成信息错误。"
            : "If you are checking out on mobile, review the address and email carefully before continuing to payment so you do not need to re-enter details later."}
        </div>
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
