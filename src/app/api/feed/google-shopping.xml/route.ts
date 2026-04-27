import { getShopProducts } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textContent(value: string, maxLength: number) {
  return escapeXml(value.replace(/\s+/g, " ").trim().slice(0, maxLength));
}

function xmlTag(name: string, value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

export async function GET() {
  const { products } = await getShopProducts({ sort: "newest" });

  const items = products
    .map((product) => {
      const title = textContent(t("en", product.name), 150);
      const description = textContent(t("en", product.description) || t("en", product.subtitle), 5000);
      const link = absoluteUrl(`/en/shop/${product.slug}`);
      const imageLink = absoluteUrl(product.image);
      const additionalImages = product.images
        .slice(1, 10)
        .map((image) => `<g:additional_image_link>${escapeXml(absoluteUrl(image.url))}</g:additional_image_link>`)
        .join("");
      const availability = product.availability?.en && /out\s*of\s*stock|sold\s*out|unavailable/i.test(product.availability.en)
        ? "out_of_stock"
        : "in_stock";

      return [
        "<item>",
        xmlTag("g:id", product.sku ?? product.slug),
        `<g:title>${title}</g:title>`,
        `<g:description>${description}</g:description>`,
        xmlTag("g:link", link),
        xmlTag("g:image_link", imageLink),
        additionalImages,
        xmlTag("g:availability", availability),
        xmlTag("g:price", `${product.price.toFixed(2)} USD`),
        xmlTag("g:brand", SITE_NAME),
        xmlTag("g:condition", "new"),
        xmlTag("g:product_type", product.categorySlug),
        xmlTag("g:identifier_exists", product.sku ? "yes" : "no"),
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    `<title>${escapeXml(SITE_NAME)} Product Feed</title>`,
    `<link>${escapeXml(absoluteUrl("/en"))}</link>`,
    `<description>${escapeXml("Latest published products from Northstar Atelier.")}</description>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
