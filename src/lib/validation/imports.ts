import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}

const optionalTrimmedString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalNumber = z.preprocess((value) => {
  const normalized = emptyToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === "number") return normalized;
  if (typeof normalized === "string") return Number(normalized);
  return normalized;
}, z.number().finite().optional());

const optionalInt = z.preprocess((value) => {
  const normalized = emptyToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized === "number") return normalized;
  if (typeof normalized === "string") return Number.parseInt(normalized, 10);
  return normalized;
}, z.number().int().optional());

const booleanLike = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

export const importBatchPublishRequestSchema = z.object({
  categoryId: optionalTrimmedString,
});

export const amazonImportRequestSchema = z.object({
  jobName: optionalTrimmedString,
  domain: z.preprocess((value) => emptyToUndefined(value) ?? "com", z.string().trim().min(2).max(20)),
  browseNodeId: z.preprocess(emptyToUndefined, z.string().trim().min(1, "请填写 Amazon 分类 Node ID")),
  localCategoryId: z.preprocess(emptyToUndefined, z.string().trim().min(1, "请选择本地分类")),
  geoLocation: optionalTrimmedString,
  locale: optionalTrimmedString,
  targetCount: z.preprocess((value) => {
    const normalized = emptyToUndefined(value);
    if (normalized === undefined) return 10;
    if (typeof normalized === "number") return normalized;
    if (typeof normalized === "string") return Number(normalized);
    return normalized;
  }, z.number().int().min(1).max(50)),
  candidatePoolSize: z.preprocess((value) => {
    const normalized = emptyToUndefined(value);
    if (normalized === undefined) return 24;
    if (typeof normalized === "number") return normalized;
    if (typeof normalized === "string") return Number(normalized);
    return normalized;
  }, z.number().int().min(1).max(200)),
  maxPages: z.preprocess((value) => {
    const normalized = emptyToUndefined(value);
    if (normalized === undefined) return 2;
    if (typeof normalized === "number") return normalized;
    if (typeof normalized === "string") return Number(normalized);
    return normalized;
  }, z.number().int().min(1).max(5)),
  minPrice: optionalNumber.refine((value) => value == null || value >= 0, "最低价格不能小于 0"),
  maxPrice: optionalNumber.refine((value) => value == null || value >= 0, "最高价格不能小于 0"),
  minRating: optionalNumber.refine((value) => value == null || (value >= 0 && value <= 5), "评分范围必须在 0~5 之间"),
  minReviews: optionalInt.refine((value) => value == null || value >= 0, "评论数不能小于 0"),
  onlyPrime: booleanLike.default(false),
  autoPublish: booleanLike.default(false),
  includePricing: booleanLike.default(true),
  downloadImages: booleanLike.default(true),
  featuredTopN: z.preprocess((value) => {
    const normalized = emptyToUndefined(value);
    if (normalized === undefined) return 3;
    if (typeof normalized === "number") return normalized;
    if (typeof normalized === "string") return Number(normalized);
    return normalized;
  }, z.number().int().min(0).max(20)),
  customTagText: optionalTrimmedString,
}).superRefine((value, ctx) => {
  if (value.maxPrice != null && value.minPrice != null && value.maxPrice < value.minPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxPrice"],
      message: "最高价格不能小于最低价格",
    });
  }

  if (value.candidatePoolSize < value.targetCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["candidatePoolSize"],
      message: "候选池数量不能小于目标导入数量",
    });
  }
});

export const amazonImportCronRequestSchema = z.object({
  jobs: z.array(amazonImportRequestSchema).min(1).max(20),
});

export type AmazonImportRequest = z.infer<typeof amazonImportRequestSchema>;
export type AmazonImportCronRequest = z.infer<typeof amazonImportCronRequestSchema>;
