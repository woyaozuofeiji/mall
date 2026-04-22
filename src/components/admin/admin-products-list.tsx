"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProductDeleteResult, AdminProductListItem } from "@/lib/admin";
import type { Locale } from "@/lib/types";
import { adminHref, type AdminDictionary } from "@/lib/admin-i18n";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatBatchProductResult(locale: Locale, result: AdminProductDeleteResult) {
  if (locale === "zh") {
    const parts = [];
    if (result.deletedCount > 0) {
      parts.push(`已删除 ${result.deletedCount} 个商品`);
    }
    if (result.archivedCount > 0) {
      parts.push(`已归档 ${result.archivedCount} 个商品`);
    }
    if (result.notFoundCount > 0) {
      parts.push(`${result.notFoundCount} 个商品未找到`);
    }
    return parts.join("，") || "没有商品被处理。";
  }

  const parts = [];
  if (result.deletedCount > 0) {
    parts.push(`${result.deletedCount} deleted`);
  }
  if (result.archivedCount > 0) {
    parts.push(`${result.archivedCount} archived`);
  }
  if (result.notFoundCount > 0) {
    parts.push(`${result.notFoundCount} not found`);
  }
  return parts.join(", ") || "No products were processed.";
}

export function AdminProductsList({
  products,
  locale,
  dictionary,
}: {
  products: AdminProductListItem[];
  locale: Locale;
  dictionary: AdminDictionary;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedProducts = products.filter((product) => selectedIdSet.has(product.id));
  const hasReferencedProducts = selectedProducts.some((product) => product.orderItemCount > 0);
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  const ui =
    locale === "zh"
      ? {
          selectAll: "全选",
          selectedCount: "已选",
          batchDelete: "批量删除",
          noSelection: "请先选择至少一个商品。",
          featured: "精选",
          orderReference: (count: number) => `已被 ${count} 条订单项引用`,
          batchDeleteConfirm: (count: number, referenced: boolean) =>
            referenced
              ? `确认批量处理这 ${count} 个商品吗？其中已被订单引用的商品不会物理删除，而是自动归档。`
              : `确认永久删除这 ${count} 个商品吗？`,
        }
      : {
          selectAll: "Select all",
          selectedCount: "selected",
          batchDelete: "Bulk delete",
          noSelection: "Select at least one product first.",
          featured: "featured",
          orderReference: (count: number) => `Referenced by ${count} order item(s)`,
          batchDeleteConfirm: (count: number, referenced: boolean) =>
            referenced
              ? `Process these ${count} products? Products already referenced by orders will be archived instead of permanently deleted.`
              : `Delete these ${count} products permanently?`,
        };

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : products.map((product) => product.id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setError(ui.noSelection);
      setMessage(null);
      return;
    }

    const confirmed = window.confirm(ui.batchDeleteConfirm(selectedIds.length, hasReferencedProducts));
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/admin/products/batch-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = (await response.json()) as AdminProductDeleteResult & { message?: string };
      if (!response.ok) {
        setError(result.message ?? dictionary.products.deleteFail);
        return;
      }

      setMessage(formatBatchProductResult(locale, result));
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
            {dictionary.common.total} {products.length} {dictionary.products.countLabel}
          </p>
          <p>
            {ui.selectedCount} {selectedIds.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || isDeleting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:pointer-events-none disabled:opacity-50"
          >
            {isDeleting ? dictionary.common.loading : ui.batchDelete}
          </button>
          <Link
            href={adminHref("/admin/products/new", locale)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            {dictionary.products.newProduct}
          </Link>
        </div>
      </div>

      {(error || message) && (
        <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${error ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {error ?? message}
        </div>
      )}

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="w-14 px-5 py-4 font-medium">
                <input
                  type="checkbox"
                  aria-label={ui.selectAll}
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950/40 accent-white"
                />
              </th>
              <th className="px-5 py-4 font-medium">{dictionary.products.product}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.category}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.price}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.variants}</th>
              <th className="px-5 py-4 font-medium">{dictionary.products.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-white/5">
            {products.map((product) => {
              const isSelected = selectedIdSet.has(product.id);

              return (
                <tr key={product.id} className={`transition hover:bg-white/5 ${isSelected ? "bg-white/10" : ""}`}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                      aria-label={`${ui.selectAll}: ${product.nameEn}`}
                      className="h-4 w-4 rounded border-white/20 bg-slate-950/40 accent-white"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <Link href={adminHref(`/admin/products/${product.id}`, locale)} className="block">
                      <p className="font-medium text-white hover:underline">{product.nameEn}</p>
                      <p className="mt-1 text-xs text-white/50">/{product.slug}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">{moneyFormatter.format(product.price)}</td>
                  <td className="px-5 py-4">{product.variantCount}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
                      {product.featured ? ui.featured : product.status}
                    </span>
                    {product.orderItemCount > 0 ? (
                      <p className="mt-2 text-xs text-amber-200/80">{ui.orderReference(product.orderItemCount)}</p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
