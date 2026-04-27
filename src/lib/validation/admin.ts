import { z } from "zod";

const nullableTrimmedString = z.string().optional().transform((value) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
});

const galleryImageSchema = z.object({
  url: z.string().min(1),
  altEn: nullableTrimmedString,
  altZh: nullableTrimmedString,
});

export const adminProductVariantSchema = z.object({
  labelEn: z.string().min(1),
  labelZh: z.string().min(1),
  price: z.number().nonnegative().optional(),
  inventory: z.number().int().nonnegative().optional(),
});

export const adminProductSpecSchema = z.object({
  labelEn: z.string().min(1),
  labelZh: z.string().min(1),
  valueEn: z.string().min(1),
  valueZh: z.string().min(1),
});

export const adminProductPayloadSchema = z.object({
  slug: z.string().min(2),
  categoryId: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  nameEn: z.string().min(2),
  nameZh: z.string().min(1),
  subtitleEn: nullableTrimmedString,
  subtitleZh: nullableTrimmedString,
  descriptionEn: nullableTrimmedString,
  descriptionZh: nullableTrimmedString,
  storyEn: nullableTrimmedString,
  storyZh: nullableTrimmedString,
  leadTimeEn: nullableTrimmedString,
  leadTimeZh: nullableTrimmedString,
  shippingNoteEn: nullableTrimmedString,
  shippingNoteZh: nullableTrimmedString,
  imageUrl: nullableTrimmedString,
  galleryImages: z.array(galleryImageSchema).default([]),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
  variants: z.array(adminProductVariantSchema).default([]),
  specs: z.array(adminProductSpecSchema).default([]),
  sourcePayload: z.record(z.string(), z.unknown()).optional(),
});

export const externalProductPublishPayloadSchema = adminProductPayloadSchema
  .omit({
    categoryId: true,
  })
  .extend({
    categoryId: nullableTrimmedString,
    categorySlug: nullableTrimmedString,
  })
  .superRefine((value, ctx) => {
    if (!value.categoryId && !value.categorySlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "categoryId 和 categorySlug 至少提供一个",
      });
    }
  });

export const adminOrderUpdatePayloadSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "AWAITING_PAYMENT", "PROCESSING", "SHIPPED", "CANCELLED"]),
  note: nullableTrimmedString,
  carrier: nullableTrimmedString,
  trackingNumber: nullableTrimmedString,
});

export const adminBulkDeletePayloadSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});

export type AdminProductPayload = z.infer<typeof adminProductPayloadSchema>;
export type ExternalProductPublishPayload = z.infer<typeof externalProductPublishPayloadSchema>;
export type AdminOrderUpdatePayload = z.infer<typeof adminOrderUpdatePayloadSchema>;
export type AdminBulkDeletePayload = z.infer<typeof adminBulkDeletePayloadSchema>;
