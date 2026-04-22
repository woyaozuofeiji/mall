"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";
import { adminHref, type AdminDictionary } from "@/lib/admin-i18n";

interface OrderUpdateFormValues {
  status: "NEW" | "CONFIRMED" | "AWAITING_PAYMENT" | "PROCESSING" | "SHIPPED" | "CANCELLED";
  note: string;
  carrier: string;
  trackingNumber: string;
}

export function OrderUpdateForm({
  orderId,
  initialValues,
  locale,
  dictionary,
}: {
  orderId: string;
  initialValues: OrderUpdateFormValues;
  locale: Locale;
  dictionary: AdminDictionary;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OrderUpdateFormValues>({
    defaultValues: initialValues,
  });

  const texts = dictionary.orders;
  const deleteTexts =
    locale === "zh"
      ? {
          deleteOrder: "删除订单",
          deleteConfirm: "确认永久删除这笔订单吗？删除后订单项和发货记录会一起移除。",
          deleteSuccess: "订单已删除。",
          deleteFail: "删除订单失败。",
        }
      : {
          deleteOrder: "Delete order",
          deleteConfirm: "Delete this order permanently? Its line items and shipment records will also be removed.",
          deleteSuccess: "Order deleted.",
          deleteFail: "Failed to delete order.",
        };

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(result.message ?? texts.updateFail);
      return;
    }

    setMessage(texts.updateSuccess);
    router.refresh();
  });

  const handleDelete = async () => {
    const confirmed = window.confirm(deleteTexts.deleteConfirm);
    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(result.message ?? deleteTexts.deleteFail);
        return;
      }

      setMessage(deleteTexts.deleteSuccess);
      router.push(adminHref("/admin/orders", locale));
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30";

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="font-serif text-3xl">{texts.orderActions}</h2>
        <p className="mt-2 text-sm leading-7 text-white/60">{texts.orderActionsDescription}</p>
      </div>
      <label className="block text-sm text-white/70">
        {dictionary.products.status}
        <select className={inputClass} {...register("status")}>
          <option value="NEW">NEW</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </label>
      <label className="block text-sm text-white/70">
        {texts.carrier}
        <input className={inputClass} {...register("carrier")} placeholder="DHL / FedEx / UPS" />
      </label>
      <label className="block text-sm text-white/70">
        {texts.trackingNumber}
        <input className={inputClass} {...register("trackingNumber")} placeholder="Tracking number" />
      </label>
      <label className="block text-sm text-white/70">
        {texts.internalNote}
        <textarea className={`${inputClass} min-h-28 resize-y`} {...register("note")} />
      </label>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${error ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {error ?? message}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? dictionary.common.loading : texts.updateOrder}
        </Button>
        <Button href={adminHref("/admin/orders", locale)} variant="secondary">
          {texts.backToOrders}
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex h-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {isDeleting ? dictionary.common.loading : deleteTexts.deleteOrder}
        </button>
      </div>
    </form>
  );
}
