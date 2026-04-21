"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";
import { adminHref, type AdminDictionary } from "@/lib/admin-i18n";

export interface AdminProductFormValues {
  slug: string;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  nameEn: string;
  nameZh: string;
  subtitleEn: string;
  subtitleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  storyEn: string;
  storyZh: string;
  leadTimeEn: string;
  leadTimeZh: string;
  shippingNoteEn: string;
  shippingNoteZh: string;
  imageUrl: string;
  galleryImagesText: string;
  price: string;
  compareAtPrice: string;
  featured: boolean;
  isNew: boolean;
  tagsText: string;
  variantsText: string;
  specsText: string;
}

interface AdminProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues: AdminProductFormValues;
  categories: Array<{ id: string; slug: string; nameEn: string; nameZh: string }>;
  statusOptions: readonly ["DRAFT", "PUBLISHED", "ARCHIVED"];
  orderItemCount?: number;
  locale: Locale;
  dictionary: AdminDictionary;
}

function parseTagList(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVariantsText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelEn = "", labelZh = "", price = "", inventory = ""] = line.split("|").map((item) => item.trim());
      return {
        labelEn,
        labelZh,
        ...(price ? { price: Number(price) } : {}),
        ...(inventory ? { inventory: Number(inventory) } : {}),
      };
    });
}

function parseGalleryImagesText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url = "", altEn = "", altZh = ""] = line.split("|").map((item) => item.trim());
      return { url, altEn, altZh };
    })
    .filter((image) => image.url);
}

function parseSpecsText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelEn = "", labelZh = "", valueEn = "", valueZh = ""] = line.split("|").map((item) => item.trim());
      return { labelEn, labelZh, valueEn, valueZh };
    });
}

export function AdminProductForm({
  mode,
  productId,
  initialValues,
  categories,
  statusOptions,
  orderItemCount = 0,
  locale,
  dictionary,
}: AdminProductFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AdminProductFormValues>({
    defaultValues: initialValues,
  });

  const texts = dictionary.products;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitMessage(null);

    const payload = {
      slug: values.slug.trim(),
      categoryId: values.categoryId,
      status: values.status,
      nameEn: values.nameEn.trim(),
      nameZh: values.nameZh.trim(),
      subtitleEn: values.subtitleEn,
      subtitleZh: values.subtitleZh,
      descriptionEn: values.descriptionEn,
      descriptionZh: values.descriptionZh,
      storyEn: values.storyEn,
      storyZh: values.storyZh,
      leadTimeEn: values.leadTimeEn,
      leadTimeZh: values.leadTimeZh,
      shippingNoteEn: values.shippingNoteEn,
      shippingNoteZh: values.shippingNoteZh,
      imageUrl: values.imageUrl,
      galleryImages: parseGalleryImagesText(values.galleryImagesText),
      price: Number(values.price),
      ...(values.compareAtPrice ? { compareAtPrice: Number(values.compareAtPrice) } : {}),
      featured: values.featured,
      isNew: values.isNew,
      tags: parseTagList(values.tagsText),
      variants: parseVariantsText(values.variantsText),
      specs: parseSpecsText(values.specsText),
    };

    const response = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { message?: string; id?: string };

    if (!response.ok) {
      setSubmitError(result.message ?? (mode === "create" ? texts.createFail : texts.updateFail));
      return;
    }

    const nextId = result.id ?? productId;
    setSubmitMessage(mode === "create" ? texts.createSuccess : texts.updateSuccess);

    if (nextId) {
      router.push(adminHref(`/admin/products/${nextId}`, locale));
    } else {
      router.push(adminHref("/admin/products", locale));
    }
    router.refresh();
  });

  const handleArchiveOrDelete = async () => {
    if (!productId) return;
    const confirmed = window.confirm(orderItemCount > 0 ? texts.archiveConfirm : texts.deleteConfirm);
    if (!confirmed) return;

    setSubmitError(null);
    setSubmitMessage(null);

    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { mode?: string; message?: string };
    if (!response.ok) {
      setSubmitError(result.message ?? texts.deleteFail);
      return;
    }

    setSubmitMessage(result.mode === "archived" ? texts.archivedSuccess : texts.deletedSuccess);
    router.push(adminHref("/admin/products", locale));
    router.refresh();
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30";
  const labelClass = "text-sm text-white/70";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-serif text-3xl">{texts.basicInfo}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              {texts.nameEn}
              <input className={inputClass} {...register("nameEn")} />
            </label>
            <label className={labelClass}>
              {texts.nameZh}
              <input className={inputClass} {...register("nameZh")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.slug}
              <input className={inputClass} {...register("slug")} />
              <span className="mt-2 block text-xs text-white/40">{texts.slugHint}</span>
            </label>
            <label className={labelClass}>
              {texts.category}
              <select className={inputClass} {...register("categoryId")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn} / {category.nameZh}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              {texts.status}
              <select className={inputClass} {...register("status")}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              {texts.price} (USD)
              <input className={inputClass} type="number" step="0.01" min="0" {...register("price")} />
            </label>
            <label className={labelClass}>
              {texts.compareAtPrice}
              <input className={inputClass} type="number" step="0.01" min="0" {...register("compareAtPrice")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.coverImage}
              <input className={inputClass} {...register("imageUrl")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.galleryImages}
              <textarea className={`${inputClass} min-h-32 resize-y font-mono text-xs`} {...register("galleryImagesText")} />
              <span className="mt-2 block text-xs text-white/40">{texts.galleryHelp}</span>
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.subtitleEn}
              <textarea className={`${inputClass} min-h-24 resize-y`} {...register("subtitleEn")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.subtitleZh}
              <textarea className={`${inputClass} min-h-24 resize-y`} {...register("subtitleZh")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.descriptionEn}
              <textarea className={`${inputClass} min-h-32 resize-y`} {...register("descriptionEn")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.descriptionZh}
              <textarea className={`${inputClass} min-h-32 resize-y`} {...register("descriptionZh")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.storyEn}
              <textarea className={`${inputClass} min-h-28 resize-y`} {...register("storyEn")} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              {texts.storyZh}
              <textarea className={`${inputClass} min-h-28 resize-y`} {...register("storyZh")} />
            </label>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-3xl">{texts.commerce}</h2>
            <div className="mt-6 space-y-5">
              <label className={labelClass}>
                {texts.leadTimeEn}
                <input className={inputClass} {...register("leadTimeEn")} />
              </label>
              <label className={labelClass}>
                {texts.leadTimeZh}
                <input className={inputClass} {...register("leadTimeZh")} />
              </label>
              <label className={labelClass}>
                {texts.shippingNoteEn}
                <textarea className={`${inputClass} min-h-24 resize-y`} {...register("shippingNoteEn")} />
              </label>
              <label className={labelClass}>
                {texts.shippingNoteZh}
                <textarea className={`${inputClass} min-h-24 resize-y`} {...register("shippingNoteZh")} />
              </label>
              <label className="flex items-center gap-3 text-sm text-white/80">
                <input type="checkbox" {...register("featured")} /> {texts.featured}
              </label>
              <label className="flex items-center gap-3 text-sm text-white/80">
                <input type="checkbox" {...register("isNew")} /> {texts.isNew}
              </label>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-3xl">{texts.structuredContent}</h2>
            <div className="mt-6 space-y-5">
              <label className={labelClass}>
                {texts.tags}
                <input className={inputClass} {...register("tagsText")} />
                <span className="mt-2 block text-xs text-white/40">{texts.tagsHint}</span>
              </label>
              <label className={labelClass}>
                {texts.variants}
                <textarea className={`${inputClass} min-h-40 resize-y font-mono text-xs`} {...register("variantsText")} />
                <span className="mt-2 block text-xs text-white/40">{texts.variantsHelp}</span>
              </label>
              <label className={labelClass}>
                {texts.specs}
                <textarea className={`${inputClass} min-h-40 resize-y font-mono text-xs`} {...register("specsText")} />
                <span className="mt-2 block text-xs text-white/40">{texts.specsHelp}</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      {(submitError || submitMessage) && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${submitError ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {submitError ?? submitMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? dictionary.common.loading : mode === "create" ? texts.createProduct : texts.saveChanges}
        </Button>
        <Button href={adminHref("/admin/products", locale)} variant="secondary">
          {texts.backToProducts}
        </Button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleArchiveOrDelete}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
          >
            {orderItemCount > 0 ? texts.archiveProduct : texts.deleteProduct}
          </button>
        ) : null}
      </div>
    </form>
  );
}
