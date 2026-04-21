import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(5),
  country: z.string().min(2),
  region: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(4),
  postalCode: z.string().min(3),
  note: z.string().optional(),
});

export const checkoutLineSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().positive(),
  variantId: z.string().optional(),
});

export const checkoutPayloadSchema = z.object({
  locale: z.enum(["en", "zh"]),
  customer: checkoutCustomerSchema,
  items: z.array(checkoutLineSchema).min(1),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
