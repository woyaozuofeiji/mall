import { PrismaClient, ProductStatus } from "@prisma/client";
import { hashAdminPassword } from "../src/lib/admin-crypto";
import { categories, products } from "../src/lib/data";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contentPage.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.importItem.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.admin.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        nameEn: category.name.en,
        nameZh: category.name.zh,
        descriptionEn: category.description.en,
        descriptionZh: category.description.zh,
      },
    });
    categoryMap.set(category.slug, created.id);
  }

  const tagValues = [...new Set(products.flatMap((product) => product.tags))];
  const tagMap = new Map<string, string>();
  for (const value of tagValues) {
    const created = await prisma.tag.create({
      data: {
        slug: slugify(value),
        labelEn: value,
        labelZh: value,
      },
    });
    tagMap.set(value, created.id);
  }

  const seededProducts = [] as Array<{ id: string; slug: string; nameEn: string; nameZh: string }>;

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        status: ProductStatus.PUBLISHED,
        categoryId: categoryMap.get(product.categorySlug)!,
        nameEn: product.name.en,
        nameZh: product.name.zh,
        subtitleEn: product.subtitle.en,
        subtitleZh: product.subtitle.zh,
        descriptionEn: product.description.en,
        descriptionZh: product.description.zh,
        storyEn: product.story.en,
        storyZh: product.story.zh,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        featured: Boolean(product.featured),
        isNew: Boolean(product.isNew),
        leadTimeEn: product.leadTime.en,
        leadTimeZh: product.leadTime.zh,
        shippingNoteEn: product.shippingNote.en,
        shippingNoteZh: product.shippingNote.zh,
        attributes: {
          specs: product.specs.map((spec) => ({
            labelEn: spec.label.en,
            labelZh: spec.label.zh,
            valueEn: spec.value.en,
            valueZh: spec.value.zh,
          })),
        },
        sourcePayload: {
          source: "seed",
          tags: product.tags,
        },
        images: {
          create: product.images.map((image, index) => ({
            url: image.url,
            altEn: image.alt.en,
            altZh: image.alt.zh,
            sortOrder: image.sortOrder ?? index,
            isCover: image.isCover ?? index === 0,
          })),
        },
        variants: {
          create: product.variants.map((variant, index) => ({
            sku: `${product.slug.toUpperCase().replace(/-/g, "_")}_${String(index + 1).padStart(2, "0")}`,
            labelEn: variant.label.en,
            labelZh: variant.label.zh,
            inventory: 120 - index * 8,
            metadata: { seeded: true },
          })),
        },
        tags: {
          create: product.tags.map((tag) => ({
            tag: {
              connect: {
                id: tagMap.get(tag)!,
              },
            },
          })),
        },
      },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameZh: true,
      },
    });

    seededProducts.push(created);
  }

  await prisma.importBatch.create({
    data: {
      name: "seed-demo-import.csv",
      source: "seed",
      status: "READY_FOR_REVIEW",
      totalItems: 12,
      items: {
        create: [
          {
            sourceId: "demo-001",
            status: "PENDING_REVIEW",
            rawPayload: { title: "Supplier Plush Item A", source: "seed" },
          },
          {
            sourceId: "demo-002",
            status: "APPROVED",
            rawPayload: { title: "Supplier Jewelry Item B", source: "seed" },
            normalizedData: { category: "jewelry", priceSuggestion: 24 },
          },
        ],
      },
    },
  });

  await prisma.contentPage.createMany({
    data: [
      {
        slug: "privacy-policy",
        titleEn: "Privacy Policy",
        titleZh: "隐私政策",
        bodyEn: "Seeded content page placeholder.",
        bodyZh: "这是一个种子数据内容页占位。",
        published: true,
      },
      {
        slug: "shipping-policy",
        titleEn: "Shipping Policy",
        titleZh: "发货政策",
        bodyEn: "Seeded shipping page placeholder.",
        bodyZh: "这是一个发货政策占位页。",
        published: true,
      },
    ],
  });

  await prisma.siteSetting.create({
    data: {
      key: "storefront",
      value: {
        brand: "Northstar Atelier",
        localeDefault: "en",
        currency: "USD",
      },
    },
  });

  const primary = seededProducts[0];
  const secondary = seededProducts[2];
  const tertiary = seededProducts[3];

  const addressOne = await prisma.address.create({
    data: {
      fullName: "Emily Carter",
      email: "emily@example.com",
      phone: "+1 202 555 0102",
      country: "United States",
      region: "California",
      city: "Los Angeles",
      address1: "128 Sunset Grove",
      postalCode: "90012",
    },
  });

  const orderOne = await prisma.order.create({
    data: {
      orderNumber: "NSA-20260420-A1B2",
      status: "NEW",
      email: addressOne.email,
      currency: "USD",
      subtotal: 77,
      totalAmount: 77,
      addressId: addressOne.id,
      items: {
        create: [
          {
            productId: primary.id,
            productName: primary.nameEn,
            quantity: 2,
            unitPrice: 29,
          },
          {
            productId: tertiary.id,
            productName: tertiary.nameEn,
            quantity: 1,
            unitPrice: 19,
          },
        ],
      },
    },
  });

  const addressTwo = await prisma.address.create({
    data: {
      fullName: "Olivia Stone",
      email: "olivia@example.com",
      phone: "+44 20 7946 0201",
      country: "United Kingdom",
      region: "England",
      city: "London",
      address1: "22 Brookline Lane",
      postalCode: "SW1A 1AA",
    },
  });

  const orderTwo = await prisma.order.create({
    data: {
      orderNumber: "NSA-20260420-C3D4",
      status: "PROCESSING",
      email: addressTwo.email,
      currency: "USD",
      subtotal: 29,
      totalAmount: 29,
      addressId: addressTwo.id,
      items: {
        create: [
          {
            productId: primary.id,
            productName: primary.nameEn,
            quantity: 1,
            unitPrice: 29,
          },
        ],
      },
    },
  });

  const addressThree = await prisma.address.create({
    data: {
      fullName: "Mia Scott",
      email: "mia@example.com",
      phone: "+49 30 12345678",
      country: "Germany",
      region: "Berlin",
      city: "Berlin",
      address1: "7 Linden Platz",
      postalCode: "10115",
    },
  });

  const orderThree = await prisma.order.create({
    data: {
      orderNumber: "NSA-20260419-Z9X8",
      status: "SHIPPED",
      email: addressThree.email,
      currency: "USD",
      subtotal: 41,
      totalAmount: 41,
      addressId: addressThree.id,
      trackingNumber: "DHL1234567890",
      carrier: "DHL",
      items: {
        create: [
          {
            productId: secondary.id,
            productName: secondary.nameEn,
            quantity: 1,
            unitPrice: 22,
          },
          {
            productId: tertiary.id,
            productName: tertiary.nameEn,
            quantity: 1,
            unitPrice: 19,
          },
        ],
      },
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: orderThree.id,
      carrier: "DHL",
      trackingNumber: "DHL1234567890",
      statusNote: "Seeded shipped order",
      shippedAt: new Date("2026-04-19T12:00:00.000Z"),
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@northstaratelier.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123456!";

  await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash: hashAdminPassword(adminPassword),
      displayName: "Store Admin",
      role: "admin",
      active: true,
    },
  });

  console.log(`Seed completed with ${seededProducts.length} products.`);
  console.log(`Sample orders: ${orderOne.orderNumber}, ${orderTwo.orderNumber}, ${orderThree.orderNumber}`);
  console.log(`Admin login: ${adminEmail}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD is not set. Using default seed password: Admin123456!");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
