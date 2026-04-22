"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrderDeleteResult, AdminOrderListItem } from "@/lib/orders";
import type { Locale } from "@/lib/types";
import { adminHref, type AdminDictionary } from "@/lib/admin-i18n";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatBatchOrderResult(locale: Locale, result: AdminOrderDeleteResult) {
  if (locale === "zh") {
    const parts = [];
    if (result.deletedCount > 0) {
      parts.push(`已删除 ${result.deletedCount} 笔订单`);
    }
    if (result.notFoundCount > 0) {
      parts.push(`${result.notFoundCount} 笔订单未找到`);
    }
    return parts.join("，") || "没有订单被处理。";
  }

  const parts = [];
  if (result.deletedCount > 0) {
    parts.push(`${result.deletedCount} deleted`);
  }
  if (result.notFoundCount > 0) {
    parts.push(`${result.notFoundCount} not found`);
  }
  return parts.join(", ") || "No orders were processed.";
}

export function AdminOrdersList({
  orders,
  locale,
  dictionary,
}: {
  orders: AdminOrderListItem[];
  locale: Locale;
  dictionary: AdminDictionary;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  const ui =
    locale === "zh"
      ? {
          selectAll: "全选",
          selectedCount: "已选",
          batchDelete: "批量删除订单",
          noSelection: "请先选择至少一笔订单。",
          viewDetail: "查看详情",
          deleteConfirm: (count: number) => `确认永久删除这 ${count} 笔订单吗？订单项、物流记录和孤立地址也会一起清理。`,
        }
      : {
          selectAll: "Select all",
          selectedCount: "selected",
          batchDelete: "Bulk delete orders",
          noSelection: "Select at least one order first.",
          viewDetail: "View details",
          deleteConfirm: (count: number) =>
            `Delete these ${count} orders permanently? Line items, shipment records, and orphaned addresses will also be removed.`,
        };

  const toggleOrder = (orderId: string) => {
    setSelectedIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : orders.map((order) => order.id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setError(ui.noSelection);
      setMessage(null);
      return;
    }

    const confirmed = window.confirm(ui.deleteConfirm(selectedIds.length));
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/admin/orders/batch-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = (await response.json()) as AdminOrderDeleteResult & { message?: string };
      if (!response.ok) {
        setError(result.message ?? (locale === "zh" ? "批量删除订单失败。" : "Failed to bulk delete orders."));
        return;
      }

      setMessage(formatBatchOrderResult(locale, result));
      setSelectedIds([]);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 text-sm text-white/60">
          <p>
            {dictionary.common.total} {orders.length} {dictionary.orders.countLabel}
          </p>
          <p>
            {ui.selectedCount} {selectedIds.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label={ui.selectAll}
              className="h-4 w-4 rounded border-white/20 bg-slate-950/40 accent-white"
            />
            {ui.selectAll}
          </label>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || isDeleting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:pointer-events-none disabled:opacity-50"
          >
            {isDeleting ? dictionary.common.loading : ui.batchDelete}
          </button>
        </div>
      </div>

      {(error || message) && (
        <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${error ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {error ?? message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          const isSelected = selectedIdSet.has(order.id);

          return (
            <div
              key={order.id}
              className={`rounded-[1.75rem] border p-5 transition ${
                isSelected ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOrder(order.id)}
                    aria-label={`${ui.selectAll}: ${order.orderNumber}`}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/40 accent-white"
                  />
                  {order.status}
                </label>

                <Link
                  href={adminHref(`/admin/orders/${order.id}`, locale)}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-4 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {ui.viewDetail}
                </Link>
              </div>

              <h2 className="mt-4 font-serif text-3xl">{order.orderNumber}</h2>
              <p className="mt-2 text-sm text-white/70">{order.customerName}</p>
              <p className="mt-1 text-xs text-white/45">{order.email}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-white/70">
                <span>
                  {order.itemCount} {dictionary.orders.items}
                </span>
                <span>{moneyFormatter.format(order.totalAmount)}</span>
              </div>
              {order.trackingNumber ? (
                <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {order.carrier ?? dictionary.orders.carrier}: {order.trackingNumber}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
