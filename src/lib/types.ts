export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export type LocalizedText = Record<Locale, string>;

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface ProductVariant {
  id: string;
  label: LocalizedText;
}

export interface ProductSpec {
  label: LocalizedText;
  value: LocalizedText;
}

export interface ProductImage {
  url: string;
  alt: LocalizedText;
  isCover?: boolean;
  sortOrder?: number;
}

export interface ProductReviewSummary {
  rating: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  name: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  story: LocalizedText;
  tags: string[];
  sku?: string;
  availability?: LocalizedText;
  price: number;
  compareAtPrice?: number;
  featured?: boolean;
  isNew?: boolean;
  leadTime: LocalizedText;
  shippingNote: LocalizedText;
  image: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specs: ProductSpec[];
  reviewSummary?: ProductReviewSummary;
}

export interface SiteDictionary {
  common: {
    brand: string;
    currency: string;
    defaultLeadTime: string;
    addToCart: string;
    added: string;
    viewAll: string;
    continueShopping: string;
    submit: string;
    track: string;
    empty: string;
  };
  nav: {
    home: string;
    shop: string;
    guides: string;
    search: string;
    cart: string;
    tracking: string;
    faq: string;
    contact: string;
    admin: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ label: string; value: string }>;
  };
  sections: {
    featured: string;
    categories: string;
    whyUs: string;
    newArrivals: string;
    faq: string;
    policy: string;
    admin: string;
  };
  shop: {
    title: string;
    description: string;
    filters: string;
    allCategories: string;
    sortBy: string;
    featured: string;
    newest: string;
    priceLow: string;
    priceHigh: string;
    searchPlaceholder: string;
    relatedProducts: string;
    specs: string;
    leadTime: string;
    shipping: string;
    quantity: string;
    selectVariant: string;
  };
  cart: {
    title: string;
    description: string;
    subtotal: string;
    checkout: string;
    emptyTitle: string;
    emptyDescription: string;
    remove: string;
  };
  checkout: {
    title: string;
    description: string;
    customerInfo: string;
    shippingAddress: string;
    note: string;
    terms: string;
    successTitle: string;
    successDescription: string;
    orderLookupHint: string;
    submitOrder: string;
  };
  tracking: {
    title: string;
    description: string;
    orderNumber: string;
    email: string;
    noResult: string;
    shipped: string;
    processing: string;
    new: string;
    trackingNumber: string;
  };
  content: {
    contactTitle: string;
    contactDescription: string;
    faqTitle: string;
    faqDescription: string;
  };
  admin: {
    dashboard: string;
    products: string;
    orders: string;
    imports: string;
    content: string;
    settings: string;
    login: string;
    loginDescription: string;
    kpis: Array<{ label: string; value: string }>;
  };
}

export interface CartLine {
  id: string;
  slug: string;
  name: LocalizedText;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantLabel?: LocalizedText;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
  note?: string;
}

export interface StoredOrder {
  orderNumber: string;
  locale: Locale;
  customer: CustomerDetails;
  items: CartLine[];
  subtotal: number;
  status: "new" | "processing" | "shipped";
  trackingNumber?: string;
  createdAt: string;
}
