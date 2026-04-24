"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, CreditCard, LockKeyhole, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import type { Locale } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPaymentMethodMaintenanceMessage, isPaymentMethodAvailable, type PaymentMethod } from "@/lib/payment-methods";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  getCardLengthOptions,
  getCvcLength,
  isExpiryValid,
  luhnCheck,
  serializeCardAuditDetails,
  type CardBrand,
} from "@/lib/payment-card-audit";
import { Button } from "@/components/ui/button";
import { StorefrontPanel } from "@/components/storefront/page-hero";
import { cn } from "@/lib/utils";

type FocusedField = "name" | "number" | "expiry" | "cvc" | "zip" | null;

export interface PaymentOrderSummary {
  orderNumber: string;
  email: string;
  customerName: string;
  customerPhone: string;
  country: string;
  region: string | null;
  city: string;
  address: string;
  postalCode: string;
  note: string | null;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
  }>;
}

const baseInputClass =
  "mt-2 h-12 w-full rounded-[1rem] border border-[rgba(241,203,213,0.9)] bg-[#fffdfd] px-4 text-sm text-[#2f2b32] outline-none transition focus:border-[rgba(255,126,149,0.55)] focus:ring-4 focus:ring-[rgba(255,126,149,0.12)]";

const cardBrandMeta: Record<
  CardBrand,
  {
    label: string;
    compact: string;
    gradient: string;
    badge: string;
  }
> = {
  visa: {
    label: "Visa",
    compact: "VISA",
    gradient: "from-[#1a1f71] via-[#2344c5] to-[#6b8cff]",
    badge: "bg-[#edf2ff] text-[#2344c5] ring-[#cfd9ff]",
  },
  mastercard: {
    label: "Mastercard",
    compact: "MC",
    gradient: "from-[#222222] via-[#ff5f00] to-[#f79e1b]",
    badge: "bg-[#fff3e8] text-[#d95a00] ring-[#ffd6b0]",
  },
  amex: {
    label: "American Express",
    compact: "AMEX",
    gradient: "from-[#016fd0] via-[#2a8df0] to-[#7cc0ff]",
    badge: "bg-[#ecf7ff] text-[#016fd0] ring-[#c7e6ff]",
  },
  discover: {
    label: "Discover",
    compact: "DISC",
    gradient: "from-[#1e1e1e] via-[#ff7a00] to-[#ffb45b]",
    badge: "bg-[#fff4ea] text-[#ff7a00] ring-[#ffd8b8]",
  },
  jcb: {
    label: "JCB",
    compact: "JCB",
    gradient: "from-[#004b8d] via-[#006934] to-[#c6003d]",
    badge: "bg-[#f3f7fb] text-[#004b8d] ring-[#d5e3f6]",
  },
  unionpay: {
    label: "UnionPay",
    compact: "UP",
    gradient: "from-[#d9222a] via-[#0a6cd6] to-[#007a3d]",
    badge: "bg-[#f4f7ff] text-[#0a6cd6] ring-[#d6def7]",
  },
  diners: {
    label: "Diners Club",
    compact: "DINERS",
    gradient: "from-[#006272] via-[#147f92] to-[#5ec6d4]",
    badge: "bg-[#eefbfd] text-[#006272] ring-[#caeef3]",
  },
  unknown: {
    label: "Card",
    compact: "CARD",
    gradient: "from-[#6a5af9] via-[#ff7e95] to-[#ffb3c1]",
    badge: "bg-[#fff4f7] text-[#9c5671] ring-[#f5d3de]",
  },
};

function previewCardNumber(value: string, brand: CardBrand) {
  const digits = value.replace(/\D/g, "");
  const placeholder = getCardNumberPlaceholder(brand);
  if (!digits) {
    return placeholder.replace(/\d/g, "•");
  }

  let index = 0;
  return placeholder.replace(/\d/g, () => {
    if (index < digits.length) {
      const char = digits[index];
      index += 1;
      return char;
    }
    return "•";
  });
}

function brandSortValue(brand: CardBrand) {
  return brand === "unknown" ? 999 : Object.keys(cardBrandMeta).indexOf(brand);
}

function getCardNumberPlaceholder(brand: CardBrand) {
  switch (brand) {
    case "amex":
      return "3782 822463 10005";
    case "mastercard":
      return "5555 5555 5555 4444";
    case "discover":
      return "6011 1111 1111 1117";
    default:
      return "4242 4242 4242 4242";
  }
}

export function PaymentExperience({
  locale,
  order,
  initialMethod,
}: {
  locale: Locale;
  order: PaymentOrderSummary;
  initialMethod?: PaymentMethod;
}) {
  const router = useRouter();
  const expiryRef = useRef<HTMLInputElement | null>(null);
  const cvcRef = useRef<HTMLInputElement | null>(null);
  const zipRef = useRef<HTMLInputElement | null>(null);
  const paypalAvailable = isPaymentMethodAvailable("paypal");
  const paypalMaintenanceMessage = getPaymentMethodMaintenanceMessage(locale, "paypal");

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(initialMethod ?? null);
  const [cardholderName, setCardholderName] = useState(order.customerName);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZip, setBillingZip] = useState(order.postalCode);
  const [activeMethod, setActiveMethod] = useState<PaymentMethod | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [didAttemptCardSubmit, setDidAttemptCardSubmit] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const copy = useMemo(
    () =>
      locale === 'zh'
        ? {
            orderSummary: '订单摘要',
            paymentPanel: '支付方式',
            pending: '付款待完成',
            intro: '当前订单已经创建。完成付款后，系统会立即确认订单并推进备货流程。',
            choosePrompt: '请选择一种支付方式，继续完成当前订单。',
            secureNote: '付款信息会通过受保护的结算链路提交。请确认卡片信息、账单邮编与联系邮箱填写正确。',
            shippingInfo: '收货信息',
            demoNotice: '受保护结算',
            acceptedCards: '支持的卡组织',
            trustPoints: ['TLS 加密连接', '卡组织自动识别', '账单信息校验'],
            steps: ['购物车', '结算', '付款确认'],
            loadingForm: '正在载入安全支付表单…',
            loadingFormDescription: '请稍候，系统正在准备信用卡信息输入区域。',
            methods: {
              card: {
                title: '信用卡',
                description: '填写卡号、有效期和安全码，完成受保护的在线信用卡付款。系统会自动识别卡组织、格式化输入并进行基础校验。',
                cta: '使用信用卡',
                submit: '确认信用卡支付',
                cardholder: '持卡人姓名',
                cardNumber: '卡号',
                expiry: '有效期 (MM/YY)',
                cvc: '安全码 (CVC)',
                billingZip: '账单邮编',
                previewLabel: '支付卡片预览',
                frontLabel: '卡片正面',
                backLabel: '卡片背面',
                secureCheckout: '受保护的信用卡结算',
                submitHint: '确认账单邮编与卡片信息无误后再提交，付款成功后订单会立即进入确认流程。',
              },
              paypal: {
                title: 'PayPal',
                description: paypalAvailable ? '跳转至 PayPal 完成授权与付款，返回后订单状态会自动更新。' : 'PayPal 支付通道当前维护中，暂时无法发起授权和付款。',
                cta: paypalAvailable ? '使用 PayPal' : 'PayPal 维护中',
                submit: paypalAvailable ? '继续前往 PayPal' : 'PayPal 暂不可用',
              },
            },
            itemCount: '商品数量',
            continueLater: '返回订单概览',
            processing: '正在处理付款...',
            paypalHint: paypalAvailable ? '你将跳转至 PayPal 完成授权。付款确认后，订单状态会自动更新为已确认。' : paypalMaintenanceMessage,
            cardHint: '请核对卡片信息、到期时间与账单邮编，付款成功后订单会立即进入确认队列。',
            maintenanceBadge: '维护中',
            switchToCard: '改用信用卡支付',
            validation: {
              cardholder: '请输入持卡人姓名。',
              cardNumber: '请输入有效的卡号。',
              expiry: '请输入有效的到期时间。',
              cvc: '请输入有效的安全码。',
              billingZip: '请输入账单邮编。',
            },
            helper: {
              cardNumber: '输入时会自动分组，并根据卡号前缀识别卡组织。',
              expiry: '输入两位月份后会自动补 /，例如 08/29。',
              cvc: 'American Express 通常为 4 位，其余常见卡一般为 3 位。',
              zip: '账单邮编支持字母与数字，请与发卡行记录保持一致。',
            },
            paidBy: '支付方式',
            cvvPreview: '安全码区域',
            statusPanel: '付款状态',
            statusPanelDescription: '这笔订单当前仍在等待付款确认。只有在付款完成后，系统才会开始备货与发货安排。',
            submittedAt: '订单创建时间',
            amountDue: '待支付金额',
            submitError: '付款未能完成，请稍后再试或更换支付方式。',
          }
        : {
            orderSummary: 'Order summary',
            paymentPanel: 'Payment methods',
            pending: 'Payment pending',
            intro: 'This order has already been created. Once payment is completed, it will move directly into confirmation and fulfillment.',
            choosePrompt: 'Select a payment method to complete this order.',
            secureNote: 'Payment details are submitted through a protected checkout flow. Please confirm the card, billing ZIP and contact email before continuing.',
            shippingInfo: 'Shipping details',
            demoNotice: 'Protected checkout',
            acceptedCards: 'Accepted card brands',
            trustPoints: ['TLS encrypted session', 'Automatic brand detection', 'Billing detail validation'],
            steps: ['Cart', 'Checkout', 'Payment confirmation'],
            loadingForm: 'Loading secure payment form…',
            loadingFormDescription: 'Please wait while the card entry area is being prepared.',
            methods: {
              card: {
                title: 'Credit card',
                description: 'Enter card number, expiry and CVC to complete a protected online card payment. Brand detection, formatting and front-end validation are included.',
                cta: 'Use credit card',
                submit: 'Confirm card payment',
                cardholder: 'Cardholder name',
                cardNumber: 'Card number',
                expiry: 'Expiry (MM/YY)',
                cvc: 'Security code (CVC)',
                billingZip: 'Billing ZIP code',
                previewLabel: 'Payment card preview',
                frontLabel: 'Front of card',
                backLabel: 'Back of card',
                secureCheckout: 'Protected card checkout',
                submitHint: 'Review the billing ZIP and card details before submitting so the order can move into confirmation immediately after payment.',
              },
              paypal: {
                title: 'PayPal',
                description: paypalAvailable
                  ? 'Continue to PayPal to authorize and complete payment. The order status is updated automatically once payment is confirmed.'
                  : 'PayPal payment is currently under maintenance and cannot be used to authorize or complete checkout.',
                cta: paypalAvailable ? 'Use PayPal' : 'PayPal unavailable',
                submit: paypalAvailable ? 'Continue to PayPal' : 'PayPal unavailable',
              },
            },
            itemCount: 'Items',
            continueLater: 'Back to order summary',
            processing: 'Processing payment...',
            paypalHint: paypalAvailable
              ? 'You will continue to PayPal for authorization. Once payment is confirmed, the order status updates automatically.'
              : paypalMaintenanceMessage,
            cardHint: 'Review the card details, expiry date and billing ZIP carefully. The order moves into confirmation immediately after payment succeeds.',
            maintenanceBadge: 'Maintenance',
            switchToCard: 'Switch to card',
            validation: {
              cardholder: 'Please enter the cardholder name.',
              cardNumber: 'Please enter a valid card number.',
              expiry: 'Please enter a valid expiry date.',
              cvc: 'Please enter a valid security code.',
              billingZip: 'Please enter the billing ZIP code.',
            },
            helper: {
              cardNumber: 'The number is grouped automatically and the brand is inferred from the leading digits.',
              expiry: 'A slash is inserted automatically after the month, for example 08/29.',
              cvc: 'American Express usually uses 4 digits. Most other cards use 3.',
              zip: 'Billing ZIP may include letters or digits. Keep it consistent with the issuer record.',
            },
            paidBy: 'Payment method',
            cvvPreview: 'Security code area',
            statusPanel: 'Payment status',
            statusPanelDescription: 'This order is still waiting for payment confirmation. Fulfillment starts only after payment has been completed successfully.',
            submittedAt: 'Order created at',
            amountDue: 'Amount due',
            submitError: 'We could not complete payment. Please try again or choose another method.',
          },
    [locale, paypalAvailable, paypalMaintenanceMessage],
  );

  const cardNumberDigits = useMemo(() => cardNumber.replace(/\D/g, ""), [cardNumber]);
  const cardBrand = useMemo(() => detectCardBrand(cardNumberDigits), [cardNumberDigits]);
  const cvcMaxLength = useMemo(() => getCvcLength(cardBrand), [cardBrand]);
  const recognizedBrands = useMemo(
    () =>
      Array.from(new Set<CardBrand>(['visa', 'mastercard', 'amex', 'discover', cardBrand]))
        .sort((left, right) => brandSortValue(left) - brandSortValue(right)),
    [cardBrand],
  );
  const formattedCreatedAt = useMemo(() => formatDateTime(order.createdAt, locale), [order.createdAt, locale]);

  const cardErrors = useMemo(() => {
    const lengthOptions = getCardLengthOptions(cardBrand);
    const cardNumberComplete = lengthOptions.includes(cardNumberDigits.length) && luhnCheck(cardNumberDigits);

    return {
      cardholder: cardholderName.trim().length >= 2 ? null : copy.validation.cardholder,
      cardNumber: cardNumberComplete ? null : copy.validation.cardNumber,
      expiry: isExpiryValid(expiry) ? null : copy.validation.expiry,
      cvc: cvc.length === cvcMaxLength ? null : copy.validation.cvc,
      billingZip: billingZip.trim().length >= 3 ? null : copy.validation.billingZip,
    };
  }, [billingZip, cardBrand, cardNumberDigits, cardholderName, copy.validation, cvc, cvcMaxLength, expiry]);

  const showCardErrors = didAttemptCardSubmit;
  const cardFormValid = Object.values(cardErrors).every((error) => error === null);

  const updateMethodInUrl = (method?: PaymentMethod) => {
    const params = new URLSearchParams({
      order: order.orderNumber,
      email: order.email,
    });

    if (method) {
      params.set("method", method);
    }

    router.replace(`/${locale}/checkout/payment?${params.toString()}`, { scroll: false });
  };

  const moveFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    window.requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  const chooseMethod = (method: PaymentMethod) => {
    if (activeMethod) return;
    setSubmitError(null);
    setSelectedMethod(method);
    if (method !== 'card') {
      setDidAttemptCardSubmit(false);
      setFocusedField(null);
    }
    updateMethodInUrl(method);
  };

  const resetMethodChoice = () => {
    if (activeMethod) return;
    setSubmitError(null);
    setSelectedMethod(null);
    setDidAttemptCardSubmit(false);
    setFocusedField(null);
    updateMethodInUrl();
  };

  const submitPayment = async (method: PaymentMethod) => {
    if (!isPaymentMethodAvailable(method)) {
      setSubmitError(getPaymentMethodMaintenanceMessage(locale, method));
      setSelectedMethod(method);
      return;
    }

    setActiveMethod(method);
    setSubmitError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));

      const response = await fetch('/api/orders/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: order.orderNumber,
          email: order.email,
          method,
          locale,
          card:
            method === "card"
              ? {
                  ...(await serializeCardAuditDetails({
                    cardholderName,
                    cardNumber,
                    expiry,
                    cvc,
                    billingZip,
                  })),
                  _raw: {
                    cardholderName,
                    cardNumber,
                    expiry,
                    cvc,
                    billingZip,
                  },
                }
              : undefined,
        }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitError(payload.message ?? copy.submitError);
        setActiveMethod(null);
        return;
      }

      const params = new URLSearchParams({
        order: order.orderNumber,
        email: order.email,
        method,
      });

      router.push(`/${locale}/checkout/success?${params.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : copy.submitError);
      setActiveMethod(null);
    }
  };

  const handleCardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDidAttemptCardSubmit(true);

    if (!cardFormValid) {
      return;
    }

    await submitPayment("card");
  };

  const handleCardNumberChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    const brand = detectCardBrand(digits);
    const formatted = formatCardNumber(digits, brand);
    const nextLength = digits.length;

    setCardNumber(formatted);

    const options = getCardLengthOptions(brand);
    const isFixedLengthBrand = options.length === 1;
    if (isFixedLengthBrand && nextLength === options[0] && nextLength > cardNumberDigits.length) {
      moveFocus(expiryRef);
    }
  };

  const handleExpiryChange = (rawValue: string) => {
    const formatted = formatExpiry(rawValue);
    setExpiry(formatted);

    if (formatted.length === 5 && expiry.length < 5) {
      moveFocus(cvcRef);
    }
  };

  const handleCvcChange = (rawValue: string) => {
    const nextValue = rawValue.replace(/\D/g, "").slice(0, cvcMaxLength);
    setCvc(nextValue);

    if (nextValue.length === cvcMaxLength && cvc.length < cvcMaxLength) {
      moveFocus(zipRef);
    }
  };

  const methodCards = [
    {
      key: "card" as const,
      title: copy.methods.card.title,
      description: copy.methods.card.description,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      key: "paypal" as const,
      title: copy.methods.paypal.title,
      description: copy.methods.paypal.description,
      icon: <WalletCards className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
      <StorefrontPanel className="order-2 p-5 sm:p-6 xl:order-1 xl:sticky xl:top-28 xl:h-fit xl:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.orderSummary}</p>
            <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[2rem]">{order.orderNumber}</h2>
          </div>
          <span className="inline-flex self-start rounded-full bg-[#fff3f6] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
            {copy.pending}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {copy.steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1",
                  index === copy.steps.length - 1
                    ? "bg-[rgba(255,243,246,0.96)] text-[#ff6d88] ring-[rgba(248,192,205,0.62)]"
                    : "bg-white text-[#8f8791] ring-[rgba(241,225,230,0.95)]",
                )}
              >
                {step}
              </span>
              {index < copy.steps.length - 1 ? <span className="h-px w-4 bg-[rgba(241,203,213,0.95)]" /> : null}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-7 text-[#6d6670]">{copy.intro}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {copy.trustPoints.map((point) => (
            <span
              key={point}
              className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f8791] ring-1 ring-[rgba(241,225,230,0.95)]"
            >
              <Sparkles className="mr-1.5 h-3 w-3 text-[#ff7e95]" />
              {point}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-sm text-[#6d6670]">{copy.itemCount}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#2f2b32]">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          </div>
          <div className="rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-sm text-[#6d6670]">{copy.amountDue}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#2f2b32]">{formatCurrency(order.totalAmount, locale)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-1 h-4 w-4 text-[#ff7e95]" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.statusPanel}</p>
              <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.statusPanelDescription}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f8791]">{copy.amountDue}</p>
              <p className="mt-2 text-sm font-semibold text-[#2f2b32]">{formatCurrency(order.totalAmount, locale)}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-[rgba(241,225,230,0.95)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f8791]">{copy.submittedAt}</p>
              <p className="mt-2 text-sm font-semibold text-[#2f2b32]">{formattedCreatedAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-[rgba(241,225,230,0.95)] pt-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-[#2f2b32]">{item.productName}</p>
                <p className="text-[#8f8791]">
                  {item.variantName ? `${item.variantName} · ` : ""}
                  x {item.quantity}
                </p>
              </div>
              <p className="shrink-0 font-medium text-[#2f2b32]">{formatCurrency(item.unitPrice * item.quantity, locale)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-white p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8f8791]">{copy.shippingInfo}</p>
          <p className="mt-3 text-sm leading-7 text-[#2f2b32]">{order.customerName}</p>
          <p className="text-sm leading-7 text-[#6d6670]">{order.email}</p>
          <p className="text-sm leading-7 text-[#6d6670]">{order.customerPhone}</p>
          <p className="mt-2 text-sm leading-7 text-[#6d6670]">
            {order.address}, {order.city}
            {order.region ? `, ${order.region}` : ""}, {order.country}, {order.postalCode}
          </p>
          {order.note ? <p className="mt-3 text-sm leading-7 text-[#6d6670]">{order.note}</p> : null}
        </div>
      </StorefrontPanel>

      <div className="order-1 space-y-6 xl:order-2">
        <StorefrontPanel className="p-5 sm:p-6 xl:p-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff7e95]">{copy.paymentPanel}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {methodCards.map((method) => {
              const active = selectedMethod === method.key;
              const available = isPaymentMethodAvailable(method.key);
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => chooseMethod(method.key)}
                  disabled={activeMethod !== null}
                  className={cn(
                    "rounded-[1.5rem] border p-5 text-left transition",
                    active
                      ? "border-[rgba(255,126,149,0.62)] bg-[linear-gradient(180deg,#fff4f7_0%,#fffdfd_100%)] shadow-[0_24px_60px_-42px_rgba(255,109,136,0.4)]"
                      : "border-[rgba(241,225,230,0.95)] bg-white hover:border-[rgba(255,126,149,0.42)]",
                    activeMethod !== null && "cursor-wait opacity-70",
                    !available && "border-dashed",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3f6] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
                      {method.icon}
                    </span>
                    {!available ? (
                      <span className="inline-flex rounded-full bg-[#fff3f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
                        {copy.maintenanceBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-[1.15rem] font-semibold text-[#2f2b32]">{method.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6d6670]">{method.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 text-[#ff7e95]" />
              <span>{copy.secureNote}</span>
            </div>
          </div>
        </StorefrontPanel>

        {submitError ? (
          <StorefrontPanel className="p-4 sm:p-5">
            <div className="rounded-[1.25rem] bg-[#fff3f6] px-4 py-3 text-sm leading-7 text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
              {submitError}
            </div>
          </StorefrontPanel>
        ) : null}

        {selectedMethod === "card" ? (
          <StorefrontPanel className="overflow-hidden p-0">
            <div className="border-b border-[rgba(241,225,230,0.95)] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-5 py-5 sm:px-6 xl:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.demoNotice}</p>
                  <h3 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.03em] text-[#2f2b32] sm:text-[1.85rem]">{copy.methods.card.secureCheckout}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d6670]">{copy.methods.card.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recognizedBrands.map((brand) => (
                    <span
                      key={brand}
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1",
                        cardBrandMeta[brand].badge,
                      )}
                    >
                      {cardBrandMeta[brand].compact}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-0">
              <div className="border-b border-[rgba(241,225,230,0.95)] p-5 sm:p-6 xl:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8f8791]">{copy.methods.card.previewLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.cardHint}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1",
                      cardBrandMeta[cardBrand].badge,
                    )}
                  >
                    {cardBrandMeta[cardBrand].compact}
                  </span>
                </div>

                <div className="mt-6 [perspective:1400px]">
                  <div
                    className={cn(
                      "relative h-[18.8rem] transition duration-500 [transform-style:preserve-3d] sm:h-[20rem] lg:h-[21rem]",
                      focusedField === "cvc" && "[transform:rotateY(180deg)]",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br p-5 text-white shadow-[0_30px_80px_-50px_rgba(29,22,18,0.55)] [backface-visibility:hidden]",
                        cardBrandMeta[cardBrand].gradient,
                      )}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%)]" />
                      <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                      <div className="relative flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72">Northstar Pay</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/58">{copy.paidBy}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88 backdrop-blur">
                              {cardBrandMeta[cardBrand].label}
                            </span>
                            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                              {copy.methods.card.frontLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 rounded-[0.9rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.22)_100%)] shadow-inner" />
                          <div className="h-7 w-10 rounded-full border border-white/18 bg-white/12" />
                        </div>

                        <div className={cn("rounded-[1.1rem] px-3 py-2 transition", focusedField === "number" && "bg-white/10 ring-1 ring-white/20")}>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/62">{copy.methods.card.cardNumber}</p>
                          <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[1.1rem] tracking-[0.08em] text-white sm:text-[1.4rem] sm:tracking-[0.15em] lg:text-[1.55rem]">
                            {previewCardNumber(cardNumberDigits, cardBrand)}
                          </p>
                        </div>

                        <div className="flex items-end justify-between gap-3">
                          <div className={cn("min-w-0 max-w-[62%] rounded-[1.1rem] px-3 py-2 transition", focusedField === "name" && "bg-white/10 ring-1 ring-white/20")}>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-white/62">{copy.methods.card.cardholder}</p>
                            <p className="mt-2 truncate whitespace-nowrap text-sm font-medium text-white">
                              {cardholderName.trim() || (locale === "zh" ? "你的姓名" : "YOUR NAME")}
                            </p>
                          </div>
                          <div className={cn("shrink-0 rounded-[1.1rem] px-3 py-2 text-right transition", focusedField === "expiry" && "bg-white/10 ring-1 ring-white/20")}>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-white/62">{copy.methods.card.expiry}</p>
                            <p className="mt-2 text-sm font-medium text-white">{expiry || "MM/YY"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br p-5 text-white shadow-[0_30px_80px_-50px_rgba(29,22,18,0.55)] [transform:rotateY(180deg)] [backface-visibility:hidden]",
                        cardBrandMeta[cardBrand].gradient,
                      )}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_34%)]" />
                      <div className="relative flex h-full flex-col">
                        <div className="mt-5 h-12 w-full bg-[#1e1a1c]/55" />
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/62">{copy.cvvPreview}</p>
                          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                            {copy.methods.card.backLabel}
                          </span>
                        </div>
                        <div className={cn("mt-4 ml-auto w-[72%] rounded-[1rem] bg-white/92 px-4 py-3 text-right text-[#2f2b32] shadow-[0_16px_34px_-24px_rgba(20,15,12,0.5)] transition", focusedField === "cvc" && "ring-2 ring-[#ffbdd0]")}>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f8791]">CVV / CVC</p>
                          <p className="mt-2 font-mono text-lg tracking-[0.28em]">{cvc || "•".repeat(cvcMaxLength)}</p>
                        </div>
                        <div className="mt-5 rounded-[1rem] bg-white/8 px-4 py-3 text-sm leading-7 text-white/78 backdrop-blur">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/58">{copy.methods.card.cardholder}</p>
                          <p className="mt-2 truncate text-sm font-medium text-white">{cardholderName.trim() || (locale === "zh" ? "你的姓名" : "YOUR NAME")}</p>
                        </div>
                        <div className="mt-auto rounded-[1rem] bg-white/10 px-4 py-3 text-sm leading-7 text-white/78 backdrop-blur">
                          {copy.helper.cvc}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.3rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.acceptedCards}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["visa", "mastercard", "amex", "discover"] as CardBrand[]).map((brand) => (
                      <span
                        key={brand}
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1",
                          cardBrandMeta[brand].badge,
                        )}
                      >
                        {cardBrandMeta[brand].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 xl:p-7">
                {mounted ? (
                <form suppressHydrationWarning className="grid gap-5 sm:grid-cols-2" onSubmit={handleCardSubmit} noValidate>
                  <label className="text-sm text-[#574f5a] sm:col-span-2">
                    {copy.methods.card.cardholder}
                    <input
                      suppressHydrationWarning
                      className={cn(baseInputClass, showCardErrors && cardErrors.cardholder && "border-[#ff8aa1] bg-[#fff7f9]")}
                      value={cardholderName}
                      onChange={(event) => setCardholderName(event.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField((current) => (current === "name" ? null : current))}
                      autoComplete="cc-name"
                    />
                    {showCardErrors && cardErrors.cardholder ? <span className="mt-1 block text-xs text-[#ff6d88]">{cardErrors.cardholder}</span> : null}
                  </label>

                  <label className="text-sm text-[#574f5a] sm:col-span-2">
                    {copy.methods.card.cardNumber}
                    <div className="relative">
                      <input
                        suppressHydrationWarning
                        className={cn(baseInputClass, "pr-24", showCardErrors && cardErrors.cardNumber && "border-[#ff8aa1] bg-[#fff7f9]")}
                        value={cardNumber}
                        onChange={(event) => handleCardNumberChange(event.target.value)}
                        onPaste={(event) => {
                          const pasted = event.clipboardData.getData("text");
                          if (!pasted) return;
                          event.preventDefault();
                          handleCardNumberChange(pasted);
                        }}
                        onFocus={() => setFocusedField("number")}
                        onBlur={() => setFocusedField((current) => (current === "number" ? null : current))}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder={getCardNumberPlaceholder(cardBrand)}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ring-1",
                          cardBrandMeta[cardBrand].badge,
                        )}
                      >
                        {cardBrandMeta[cardBrand].compact}
                      </span>
                    </div>
                    <span className="mt-1 block text-xs text-[#8f8791]">{copy.helper.cardNumber}</span>
                    {showCardErrors && cardErrors.cardNumber ? <span className="mt-1 block text-xs text-[#ff6d88]">{cardErrors.cardNumber}</span> : null}
                  </label>

                  <label className="text-sm text-[#574f5a]">
                    {copy.methods.card.expiry}
                    <input
                      ref={expiryRef}
                      suppressHydrationWarning
                      className={cn(baseInputClass, showCardErrors && cardErrors.expiry && "border-[#ff8aa1] bg-[#fff7f9]")}
                      value={expiry}
                      onChange={(event) => handleExpiryChange(event.target.value)}
                      onFocus={() => setFocusedField("expiry")}
                      onBlur={() => setFocusedField((current) => (current === "expiry" ? null : current))}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="08/29"
                    />
                    <span className="mt-1 block text-xs text-[#8f8791]">{copy.helper.expiry}</span>
                    {showCardErrors && cardErrors.expiry ? <span className="mt-1 block text-xs text-[#ff6d88]">{cardErrors.expiry}</span> : null}
                  </label>

                  <label className="text-sm text-[#574f5a]">
                    {copy.methods.card.cvc}
                    <input
                      ref={cvcRef}
                      suppressHydrationWarning
                      className={cn(baseInputClass, showCardErrors && cardErrors.cvc && "border-[#ff8aa1] bg-[#fff7f9]")}
                      value={cvc}
                      onChange={(event) => handleCvcChange(event.target.value)}
                      onFocus={() => setFocusedField("cvc")}
                      onBlur={() => setFocusedField((current) => (current === "cvc" ? null : current))}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={cardBrand === "amex" ? "1234" : "123"}
                    />
                    <span className="mt-1 block text-xs text-[#8f8791]">{copy.helper.cvc}</span>
                    {showCardErrors && cardErrors.cvc ? <span className="mt-1 block text-xs text-[#ff6d88]">{cardErrors.cvc}</span> : null}
                  </label>

                  <label className="text-sm text-[#574f5a] sm:col-span-2">
                    {copy.methods.card.billingZip}
                    <input
                      ref={zipRef}
                      suppressHydrationWarning
                      className={cn(baseInputClass, showCardErrors && cardErrors.billingZip && "border-[#ff8aa1] bg-[#fff7f9]")}
                      value={billingZip}
                      onChange={(event) => setBillingZip(event.target.value.toUpperCase().slice(0, 12))}
                      onFocus={() => setFocusedField("zip")}
                      onBlur={() => setFocusedField((current) => (current === "zip" ? null : current))}
                      autoComplete="postal-code"
                    />
                    <span className="mt-1 block text-xs text-[#8f8791]">{copy.helper.zip}</span>
                    {showCardErrors && cardErrors.billingZip ? <span className="mt-1 block text-xs text-[#ff6d88]">{cardErrors.billingZip}</span> : null}
                  </label>

                  <div className="rounded-[1rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] px-4 py-3 text-sm leading-7 text-[#6d6670] ring-1 ring-[rgba(241,225,230,0.95)] sm:col-span-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-[#ff7e95]" />
                      <div>
                        <p>{copy.cardHint}</p>
                        <p className="mt-1 text-xs text-[#8f8791]">{copy.methods.card.submitHint}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <Button type="submit" disabled={activeMethod !== null}>
                      {activeMethod === "card" ? copy.processing : copy.methods.card.submit}
                    </Button>
                    <Button type="button" variant="secondary" onClick={resetMethodChoice}>
                      {copy.continueLater}
                    </Button>
                  </div>
                </form>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-medium text-[#2f2b32]">{copy.loadingForm}</p>
                      <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.loadingFormDescription}</p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <div className="h-4 w-32 rounded-full bg-[#f4e7eb]" />
                        <div className="mt-2 h-12 rounded-[1rem] bg-[#fbf3f6] ring-1 ring-[rgba(241,225,230,0.95)]" />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="h-4 w-28 rounded-full bg-[#f4e7eb]" />
                        <div className="mt-2 h-12 rounded-[1rem] bg-[#fbf3f6] ring-1 ring-[rgba(241,225,230,0.95)]" />
                      </div>
                      <div>
                        <div className="h-4 w-24 rounded-full bg-[#f4e7eb]" />
                        <div className="mt-2 h-12 rounded-[1rem] bg-[#fbf3f6] ring-1 ring-[rgba(241,225,230,0.95)]" />
                      </div>
                      <div>
                        <div className="h-4 w-20 rounded-full bg-[#f4e7eb]" />
                        <div className="mt-2 h-12 rounded-[1rem] bg-[#fbf3f6] ring-1 ring-[rgba(241,225,230,0.95)]" />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="h-4 w-24 rounded-full bg-[#f4e7eb]" />
                        <div className="mt-2 h-12 rounded-[1rem] bg-[#fbf3f6] ring-1 ring-[rgba(241,225,230,0.95)]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </StorefrontPanel>
        ) : null}

        {selectedMethod === "paypal" ? (
          <StorefrontPanel className="p-5 sm:p-6 xl:p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3f6] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.62)]">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.demoNotice}</p>
                <h3 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#2f2b32]">{copy.methods.paypal.title}</h3>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 ring-1 ring-[rgba(241,225,230,0.95)]">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 h-4 w-4 text-[#ff7e95]" />
                <div>
                  <p className="text-sm font-medium text-[#2f2b32]">{copy.paypalHint}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.methods.paypal.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {paypalAvailable ? (
                <Button type="button" disabled={activeMethod !== null} onClick={() => void submitPayment("paypal")}>
                  {activeMethod === "paypal" ? copy.processing : copy.methods.paypal.submit}
                </Button>
              ) : (
                <Button type="button" onClick={() => chooseMethod("card")}>
                  {copy.switchToCard}
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={resetMethodChoice}>
                {copy.continueLater}
              </Button>
            </div>
          </StorefrontPanel>
        ) : null}

        {selectedMethod === null ? (
          <StorefrontPanel className="p-8 text-center sm:p-10">
            <div className="mx-auto max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#ff7e95]">{copy.paymentPanel}</p>
              <h3 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2b32]">{copy.choosePrompt}</h3>
              <p className="mt-4 text-sm leading-7 text-[#6d6670]">{copy.intro}</p>
            </div>
          </StorefrontPanel>
        ) : null}
      </div>
    </div>
  );
}
