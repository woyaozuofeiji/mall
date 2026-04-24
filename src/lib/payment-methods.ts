import type { Locale } from "@/lib/types";

export type PaymentMethod = "card" | "paypal";

const paymentMethodAvailability: Record<PaymentMethod, boolean> = {
  card: true,
  paypal: false,
};

export function isPaymentMethodAvailable(method: PaymentMethod) {
  return paymentMethodAvailability[method];
}

export function getPaymentMethodMaintenanceMessage(locale: Locale, method: PaymentMethod) {
  if (method === "paypal") {
    return locale === "zh"
      ? "PayPal 支付通道当前维护中，请暂时使用信用卡完成付款。"
      : "PayPal payment is currently under maintenance. Please use credit card payment for now.";
  }

  return locale === "zh"
    ? "当前支付方式暂不可用，请稍后重试。"
    : "This payment method is temporarily unavailable. Please try again later.";
}
