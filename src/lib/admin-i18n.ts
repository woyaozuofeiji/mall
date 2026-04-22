import type { Locale } from "@/lib/types";
import { toPublicAdminPath } from "@/lib/admin-path";

export interface AdminDictionary {
  common: {
    english: string;
    chinese: string;
    create: string;
    save: string;
    back: string;
    delete: string;
    archive: string;
    update: string;
    loading: string;
    total: string;
    actions: string;
    localeLabel: string;
    importSample: string;
    publishBatch: string;
    createdAt: string;
  };
  nav: {
    dashboard: string;
    products: string;
    orders: string;
    imports: string;
    content: string;
    settings: string;
  };
  shell: {
    brandSubline: string;
  };
  dashboard: {
    title: string;
    description: string;
    categories: string;
    publishedProducts: string;
    featuredProducts: string;
    orders: string;
    backendState: string;
    nextFocus: string;
    backendStateItems: string[];
    nextFocusItems: string[];
  };
  products: {
    title: string;
    description: string;
    countLabel: string;
    newProduct: string;
    product: string;
    category: string;
    price: string;
    variants: string;
    status: string;
    createTitle: string;
    createDescription: string;
    editPrefix: string;
    editDescription: string;
    basicInfo: string;
    commerce: string;
    structuredContent: string;
    nameEn: string;
    nameZh: string;
    slug: string;
    slugHint: string;
    coverImage: string;
    galleryImages: string;
    galleryHelp: string;
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
    featured: string;
    isNew: string;
    tags: string;
    tagsHint: string;
    variantsHelp: string;
    specs: string;
    specsHelp: string;
    compareAtPrice: string;
    createSuccess: string;
    updateSuccess: string;
    createFail: string;
    updateFail: string;
    deleteConfirm: string;
    archiveConfirm: string;
    deletedSuccess: string;
    archivedSuccess: string;
    deleteFail: string;
    saveChanges: string;
    backToProducts: string;
    createProduct: string;
    deleteProduct: string;
    archiveProduct: string;
  };
  orders: {
    title: string;
    description: string;
    countLabel: string;
    customer: string;
    items: string;
    total: string;
    orderActions: string;
    orderActionsDescription: string;
    carrier: string;
    trackingNumber: string;
    internalNote: string;
    updateOrder: string;
    backToOrders: string;
    updateSuccess: string;
    updateFail: string;
    detailDescription: string;
    createdAtPrefix: string;
  };
  imports: {
    title: string;
    description: string;
    sourceItems: string;
    sampleHint: string;
    publishTargetCategory: string;
    keepOriginalCategory: string;
    batchStatus: string;
    approvedItems: string;
    publishedItems: string;
    noBatches: string;
    noBatchesDescription: string;
    importSuccess: string;
    publishSuccess: string;
    actionFailed: string;
  };
  content: {
    title: string;
    description: string;
    homepageBlocks: string;
    homepageDescription: string;
    policyPages: string;
    policyDescription: string;
  };
  settings: {
    title: string;
    description: string;
    storeIdentity: string;
    storeIdentityDescription: string;
    commerceSettings: string;
    commerceSettingsDescription: string;
  };
  login: {
    title: string;
    description: string;
    enterPreview: string;
  };
}

const adminEn: AdminDictionary = {
  common: {
    english: "English",
    chinese: "Chinese",
    create: "Create",
    save: "Save",
    back: "Back",
    delete: "Delete",
    archive: "Archive",
    update: "Update",
    loading: "Loading...",
    total: "Total",
    actions: "Actions",
    localeLabel: "Admin language",
    importSample: "Sync catalog feed",
    publishBatch: "Publish batch",
    createdAt: "Created at",
  },
  nav: {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    imports: "Imports",
    content: "Content",
    settings: "Settings",
  },
  shell: {
    brandSubline: "Operations console",
  },
  dashboard: {
    title: "Admin Dashboard",
    description: "This admin area supports product operations, order handling and catalog synchronization with bilingual configuration switching.",
    categories: "Curated categories",
    publishedProducts: "Published products",
    featuredProducts: "Featured products",
    orders: "Orders",
    backendState: "Current backend state",
    nextFocus: "Next implementation focus",
    backendStateItems: [
      "PostgreSQL is connected",
      "Prisma seed and catalog sync flow are available",
      "Storefront pages read products from database",
      "Checkout writes orders into database",
      "Admin pages support core operations",
    ],
    nextFocusItems: [
      "CSV upload and mapping UI",
      "Admin authentication",
      "Shipment notification emails",
      "Image upload and media library",
    ],
  },
  products: {
    title: "Products",
    description: "Manage curated products, product content, structured specs and publish status from the database.",
    countLabel: "products",
    newProduct: "New product",
    product: "Product",
    category: "Category",
    price: "Price",
    variants: "Variants",
    status: "Status",
    createTitle: "Create product",
    createDescription: "Create a new product record with category, tags, variants and complete storefront fields.",
    editPrefix: "Edit",
    editDescription: "Update database-backed product data directly. Products referenced by orders will be archived instead of deleted.",
    basicInfo: "Basic information",
    commerce: "Commerce",
    structuredContent: "Structured content",
    nameEn: "Name (EN)",
    nameZh: "Name (ZH)",
    slug: "Slug",
    slugHint: "Frontend route: /shop/your-product-slug",
    coverImage: "Cover image URL",
    galleryImages: "Gallery images",
    galleryHelp: "One line per image: url|altEn|altZh",
    subtitleEn: "Subtitle (EN)",
    subtitleZh: "Subtitle (ZH)",
    descriptionEn: "Description (EN)",
    descriptionZh: "Description (ZH)",
    storyEn: "Story (EN)",
    storyZh: "Story (ZH)",
    leadTimeEn: "Lead time (EN)",
    leadTimeZh: "Lead time (ZH)",
    shippingNoteEn: "Shipping note (EN)",
    shippingNoteZh: "Shipping note (ZH)",
    featured: "Featured product",
    isNew: "Mark as new",
    tags: "Tags (comma separated)",
    tagsHint: "Example: gift, jewelry, boutique",
    variantsHelp: "One line per variant: labelEn|labelZh|price|inventory",
    specs: "Specs",
    specsHelp: "One line per spec: labelEn|labelZh|valueEn|valueZh",
    compareAtPrice: "Compare-at price",
    createSuccess: "Product created successfully.",
    updateSuccess: "Product updated successfully.",
    createFail: "Failed to create product.",
    updateFail: "Failed to update product.",
    deleteConfirm: "Delete this product permanently?",
    archiveConfirm: "This product is referenced by orders and will be archived instead of deleted. Continue?",
    deletedSuccess: "Product deleted.",
    archivedSuccess: "Product archived.",
    deleteFail: "Failed to delete product.",
    saveChanges: "Save changes",
    backToProducts: "Back to products",
    createProduct: "Create product",
    deleteProduct: "Delete product",
    archiveProduct: "Archive product",
  },
  orders: {
    title: "Orders",
    description: "Review real orders from the database and manually update status, carrier and tracking information.",
    countLabel: "orders",
    customer: "Customer",
    items: "Items",
    total: "Total",
    orderActions: "Order actions",
    orderActionsDescription: "Update order status, enter carrier and tracking number, and add internal notes.",
    carrier: "Carrier",
    trackingNumber: "Tracking number",
    internalNote: "Internal note",
    updateOrder: "Update order",
    backToOrders: "Back to orders",
    updateSuccess: "Order updated successfully.",
    updateFail: "Failed to update order.",
    detailDescription: "Inspect customer info, line items and shipment data from the live database.",
    createdAtPrefix: "Created at",
  },
  imports: {
    title: "Imports",
    description: "Use this page to sync normalized catalog items into import batches, then publish them into the live product catalog.",
    sourceItems: "source items",
    sampleHint: "Data source: external catalog feed normalized into your schema.",
    publishTargetCategory: "Publish to category",
    keepOriginalCategory: "Keep original category",
    batchStatus: "Batch status",
    approvedItems: "approved",
    publishedItems: "published",
    noBatches: "No import batches yet",
    noBatchesDescription: "Sync a small normalized batch to begin catalog review.",
    importSuccess: "Catalog feed imported successfully.",
    publishSuccess: "Batch published into products successfully.",
    actionFailed: "Import action failed.",
  },
  content: {
    title: "Content",
    description: "Use this section to manage homepage banners, FAQs, contact channels and policy pages without editing source code.",
    homepageBlocks: "Homepage blocks",
    homepageDescription: "Hero, featured products, category highlights and campaign modules can be managed here.",
    policyPages: "Policy pages",
    policyDescription: "Shipping, privacy, terms and return pages can be maintained as editable admin content.",
  },
  settings: {
    title: "Settings",
    description: "Use this section for store identity, emails, supplier settings, localization and payment credentials.",
    storeIdentity: "Store identity",
    storeIdentityDescription: "Brand name, support email, social links, default locale and storefront copy presets.",
    commerceSettings: "Commerce settings",
    commerceSettingsDescription: "Configure tax rules, shipping defaults, payment providers and order notification endpoints here.",
  },
  login: {
    title: "Login",
    description: "Use this route as the operations sign-in entry before entering the admin console.",
    enterPreview: "Continue to console",
  },
};

const adminZh: AdminDictionary = {
  common: {
    english: "英文",
    chinese: "中文",
    create: "创建",
    save: "保存",
    back: "返回",
    delete: "删除",
    archive: "归档",
    update: "更新",
    loading: "处理中...",
    total: "总数",
    actions: "操作",
    localeLabel: "后台语言",
    importSample: "同步商品源",
    publishBatch: "发布批次",
    createdAt: "创建时间",
  },
  nav: {
    dashboard: "控制台",
    products: "商品",
    orders: "订单",
    imports: "导入",
    content: "内容",
    settings: "设置",
  },
  shell: {
    brandSubline: "运营后台",
  },
  dashboard: {
    title: "后台控制台",
    description: "当前后台已经支持商品管理、订单处理，以及中英文切换下的商品源同步流程。",
    categories: "精选分类",
    publishedProducts: "已发布商品",
    featuredProducts: "精选商品",
    orders: "订单数",
    backendState: "当前后端状态",
    nextFocus: "下一步重点",
    backendStateItems: [
      "PostgreSQL 已接入",
      "Prisma seed 和商品源同步流程已可用",
      "前台商品页走数据库读取",
      "checkout 已写入真实订单",
      "后台页面已支持核心运营操作",
    ],
    nextFocusItems: [
      "CSV 上传与字段映射界面",
      "管理员认证",
      "发货通知邮件",
      "图片上传与媒体库",
    ],
  },
  products: {
    title: "商品管理",
    description: "在数据库中管理精选商品、商品文案、结构化参数和发布状态。",
    countLabel: "个商品",
    newProduct: "新建商品",
    product: "商品",
    category: "分类",
    price: "价格",
    variants: "规格数",
    status: "状态",
    createTitle: "创建商品",
    createDescription: "创建新的商品记录，并写入分类、标签、规格、SKU 与完整前台字段。",
    editPrefix: "编辑",
    editDescription: "这里可以直接修改数据库中的商品信息。若商品已有订单引用，则删除会自动降级为归档。",
    basicInfo: "基础信息",
    commerce: "交易信息",
    structuredContent: "结构化内容",
    nameEn: "英文名称",
    nameZh: "中文名称",
    slug: "Slug 标识",
    slugHint: "前台路由示例：/shop/your-product-slug",
    coverImage: "封面图地址",
    galleryImages: "商品图集",
    galleryHelp: "每行一张图：url|altEn|altZh",
    subtitleEn: "英文副标题",
    subtitleZh: "中文副标题",
    descriptionEn: "英文描述",
    descriptionZh: "中文描述",
    storyEn: "英文故事文案",
    storyZh: "中文故事文案",
    leadTimeEn: "英文发货周期",
    leadTimeZh: "中文发货周期",
    shippingNoteEn: "英文配送说明",
    shippingNoteZh: "中文配送说明",
    featured: "标记为精选",
    isNew: "标记为新品",
    tags: "标签（逗号分隔）",
    tagsHint: "例如：gift, jewelry, boutique",
    variantsHelp: "每行一个规格：labelEn|labelZh|price|inventory",
    specs: "商品参数",
    specsHelp: "每行一个参数：labelEn|labelZh|valueEn|valueZh",
    compareAtPrice: "划线价",
    createSuccess: "商品创建成功。",
    updateSuccess: "商品更新成功。",
    createFail: "创建商品失败。",
    updateFail: "更新商品失败。",
    deleteConfirm: "确认永久删除这个商品吗？",
    archiveConfirm: "该商品已被订单引用，将归档而不是物理删除，是否继续？",
    deletedSuccess: "商品已删除。",
    archivedSuccess: "商品已归档。",
    deleteFail: "删除商品失败。",
    saveChanges: "保存修改",
    backToProducts: "返回商品列表",
    createProduct: "创建商品",
    deleteProduct: "删除商品",
    archiveProduct: "归档商品",
  },
  orders: {
    title: "订单管理",
    description: "查看数据库中的真实订单，并手动更新状态、物流公司与运单号。",
    countLabel: "笔订单",
    customer: "客户信息",
    items: "订单商品",
    total: "总金额",
    orderActions: "订单操作",
    orderActionsDescription: "在这里手动更新订单状态、录入物流公司和运单号，并补充内部备注。",
    carrier: "物流公司",
    trackingNumber: "运单号",
    internalNote: "内部备注",
    updateOrder: "更新订单",
    backToOrders: "返回订单列表",
    updateSuccess: "订单更新成功。",
    updateFail: "更新订单失败。",
    detailDescription: "查看实时数据库中的客户信息、订单项和发货数据。",
    createdAtPrefix: "创建于",
  },
  imports: {
    title: "导入中心",
    description: "在这里同步规范化后的商品源数据，进入导入批次后，再发布到正式商品库。",
    sourceItems: "条源数据",
    sampleHint: "数据来源：外部商品源数据，已规范化映射到你的商城结构。",
    publishTargetCategory: "发布到分类",
    keepOriginalCategory: "保持原分类",
    batchStatus: "批次状态",
    approvedItems: "已审核",
    publishedItems: "已发布",
    noBatches: "暂时还没有导入批次",
    noBatchesDescription: "你可以先同步一小批规范化商品数据，进入审核与发布流程。",
    importSuccess: "商品源数据同步成功。",
    publishSuccess: "批次已成功发布到商品库。",
    actionFailed: "导入操作失败。",
  },
  content: {
    title: "内容管理",
    description: "你可以在这里管理首页 Banner、FAQ、联系方式和政策页，而不需要改源码。",
    homepageBlocks: "首页模块",
    homepageDescription: "这里可以管理 Hero、精选商品、分类入口和活动模块。",
    policyPages: "政策页面",
    policyDescription: "发货、隐私、条款和退换政策页都可以作为可配置内容维护。",
  },
  settings: {
    title: "系统设置",
    description: "这里用于店铺信息、邮件、供应商配置、多语言和支付参数管理。",
    storeIdentity: "店铺信息",
    storeIdentityDescription: "品牌名、支持邮箱、社媒链接、默认语言和站点文案预设。",
    commerceSettings: "交易设置",
    commerceSettingsDescription: "这里用于税费规则、发货默认值、支付提供商和通知地址配置。",
  },
  login: {
    title: "后台登录",
    description: "这是店铺运营登录入口，可继续进入后台控制台。",
    enterPreview: "进入后台控制台",
  },
};

export function getAdminDictionary(locale: Locale): AdminDictionary {
  return locale === "zh" ? adminZh : adminEn;
}

export function resolveAdminLocale(value?: string): Locale {
  return value === "zh" ? "zh" : "en";
}

export function adminHref(path: string, locale: Locale) {
  return `${toPublicAdminPath(path)}?locale=${locale}`;
}
