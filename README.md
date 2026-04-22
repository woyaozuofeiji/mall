# mall

一个基于 **Next.js 16 + React 19 + Prisma + PostgreSQL** 的双语精品外贸商城项目，面向“**精选商品展示 + 在线下单 + 模拟支付 + 订单追踪 + 后台管理 + SEO 内容页**”的完整链路。

当前线上站点：

- **正式域名**：<https://mall.67win.cc/>
- **GitHub 仓库**：<https://github.com/woyaozuofeiji/mall>

这个项目不是简单的静态展示页，而是已经具备：

- 双语前台商城
- 订单创建与支付状态流转
- 订单追踪
- 后台商品 / 订单 / 导入中心
- 分类落地页
- 选购指南内容页
- 基础到中期可用的 SEO 结构

---

## 1. 项目概览

当前项目已经覆盖以下能力。

### 1.1 前台能力

- `/en`、`/zh` 双语路由
- 首页
- 商品列表页
- 商品详情页
- 搜索页
- 购物车
- 结账页
- 支付页
- 支付成功页
- 订单追踪页
- FAQ / Contact / Privacy / Shipping / Returns / Terms
- 分类落地页
- 选购指南聚合页与详情页

### 1.2 后台能力

- 后台首页
- 商品列表 / 新建 / 编辑
- 订单列表 / 订单详情 / 状态更新 / 运单录入
- 导入中心
- 内容页与设置页的后台壳子页面
- 管理员邮箱密码登录
- HttpOnly Cookie 会话
- 后台页面与后台 API 鉴权
- 可配置公开后台入口路径（默认 `/console/login`）
- 后台整体 `noindex`

### 1.3 当前实现特性说明

- 支付流程目前是 **站内模拟支付流程**
  - 尚未接入真实 Stripe / PayPal SDK
- 下单后订单状态会进入 `AWAITING_PAYMENT`
- 在支付页确认支付后，订单会更新为 `CONFIRMED`
- 后台可以继续把订单更新为 `PROCESSING`、`SHIPPED` 等状态
- 后台当前已接入**管理员邮箱 + 密码登录**
- 默认公开后台入口为 **`/console/login`**
- 旧的 `/admin` 路径会跳转到新的公开后台路径

---

## 2. 线上已实现的 SEO 能力

项目目前已经不是“只有 title 和 description”的基础 SEO，而是完成了较完整的第一到第五阶段 SEO 结构。

### 2.1 基础技术 SEO

- 正式站点域名统一使用 `https://mall.67win.cc`
- 正确输出：
  - `title`
  - `meta description`
  - `canonical`
  - `hreflang`
  - Open Graph
  - Twitter Card
- 自动生成：
  - `robots.txt`
  - `sitemap.xml`

### 2.2 索引策略

#### 允许收录的页面

- 首页
- 商品列表页
- 商品详情页
- 分类落地页
- FAQ / Contact / Policy 页面
- Guides 聚合页
- Guides 详情页

#### 明确 `noindex` 的页面

- `/cart`
- `/checkout`
- `/checkout/payment`
- `/checkout/success`
- `/order-tracking`
- `/search`
- `/admin/*`
- 公开后台入口（默认 `/console/*`）

### 2.3 结构化数据

当前项目已经输出以下 JSON-LD：

- 首页：
  - `Organization`
  - `WebSite`
  - `SearchAction`
- FAQ 页：
  - `FAQPage`
- 商品详情页：
  - `Product`
  - `BreadcrumbList`
- 分类页：
  - `CollectionPage`
  - `BreadcrumbList`
- 指南详情页：
  - `Article`
  - `BreadcrumbList`
- 指南聚合页：
  - `ItemList`
  - `BreadcrumbList`

### 2.4 分类 SEO

项目已经不再只依赖 query 参数分类筛选，而是有正式可索引的分类页面：

- `/en/shop/category/plush`
- `/en/shop/category/jewelry`
- `/en/shop/category/gifts`
- `/zh/shop/category/plush`
- `/zh/shop/category/jewelry`
- `/zh/shop/category/gifts`

旧 URL 例如：

```text
/en/shop?category=plush
```

会重定向到：

```text
/en/shop/category/plush
```

### 2.5 内容型 SEO

当前已经加入 guide 内容体系，支持更长尾的搜索流量承接：

- `/en/guides`
- `/zh/guides`
- `/en/guides/gift-guide`
- `/en/guides/plush-buying-guide`
- `/en/guides/jewelry-gift-guide`
- `/en/guides/shipping-guide`
- `/en/guides/desk-gift-ideas`
- `/en/guides/earrings-buying-guide`

指南页和商品页 / 分类页之间已经建立双向内链：

- 商品页 → 相关指南
- 指南页 → 相关商品
- 分类页 → 相关指南
- 首页 / 头部导航 / 页脚 → Guides

---

## 3. 技术栈

- **Next.js 16.2.4**
- **React 19.2.4**
- **TypeScript 5**
- **Prisma 6**
- **PostgreSQL 16**
- **Tailwind CSS 4**
- **next-intl**
- **react-hook-form**
- **zod**

---

## 4. 本地运行环境要求

建议准备：

- **Node.js 20+**
- **npm**
- **Docker + Docker Compose**（推荐，用于本地 PostgreSQL）

如果不使用 Docker，也可以自己准备 PostgreSQL，然后修改 `.env` 中的 `DATABASE_URL`。

---

## 5. 环境变量

`.env.example` 当前内容如下：

```env
DATABASE_URL="postgresql://mall:mall@localhost:54320/mall?schema=public"
SITE_URL="https://mall.67win.cc"
GOOGLE_SITE_VERIFICATION=""
BING_SITE_VERIFICATION=""
NEXT_PUBLIC_ADMIN_PATH="/console"
ADMIN_SESSION_SECRET="change-this-admin-session-secret"
ADMIN_EMAIL="admin@northstaratelier.com"
ADMIN_PASSWORD="change-this-admin-password"
```

### 变量说明

#### `DATABASE_URL`

Prisma 连接 PostgreSQL 所需。

#### `SITE_URL`

站点正式地址，用于：

- canonical
- sitemap
- Open Graph
- Twitter 图片 / 链接
- 结构化数据中的绝对链接

#### `GOOGLE_SITE_VERIFICATION`

Google Search Console 验证码。配置后会自动输出：

```html
<meta name="google-site-verification" ... />
```

#### `BING_SITE_VERIFICATION`

Bing Webmaster 验证码。配置后会自动输出：

```html
<meta name="msvalidate.01" ... />
```

> 如果暂时没有 Search Console / Bing 的 token，可以先留空，不影响站点正常运行。

#### `NEXT_PUBLIC_ADMIN_PATH`

公开后台访问路径，默认值：

```env
NEXT_PUBLIC_ADMIN_PATH="/console"
```

也就是说，默认后台入口会是：

```text
/console/login
```

#### `ADMIN_SESSION_SECRET`

后台登录会话签名密钥。**生产环境必须改成强随机字符串。**

#### `ADMIN_EMAIL`

默认管理员邮箱。

#### `ADMIN_PASSWORD`

默认管理员密码。  
如果数据库里还没有管理员，且该变量已正确配置，系统支持首次登录时自动创建管理员。

---

## 6. 快速开始

### 6.1 克隆项目

```bash
git clone git@github.com:woyaozuofeiji/mall.git
cd mall
```

### 6.2 安装依赖

```bash
npm install
```

### 6.3 配置环境变量

如果本地还没有 `.env`：

```bash
cp .env.example .env
```

### 6.4 启动 PostgreSQL

```bash
npm run db:up
```

默认映射端口：

- `localhost:54320`

### 6.5 生成 Prisma Client

```bash
npm run db:generate
```

### 6.6 初始化数据库并写入种子数据

首次启动推荐：

```bash
npm run db:reset
```

该命令会：

1. 重建数据库结构
2. 执行 Prisma schema 同步
3. 写入种子数据

> 注意：`db:reset` 会清空当前数据库中的已有数据。

如果你准备登录后台，建议同时确认：

```env
ADMIN_EMAIL="your-admin@example.com"
ADMIN_PASSWORD="your-strong-password"
ADMIN_SESSION_SECRET="a-long-random-secret"
```

然后执行：

```bash
npm run db:seed
```

或直接执行：

```bash
npm run db:reset
```

这样数据库里会创建管理员账号。

如果你没有配置管理员环境变量，`seed` 也仍然会创建一个默认管理员：

```text
email: admin@northstaratelier.com
password: Admin123456!
```

首次本地联调时可以先用这组默认账号进入后台，之后再改为你自己的环境变量。

### 6.7 启动开发服务器

```bash
npm run dev
```

开发环境默认地址：

```text
http://localhost:30000
```

---

## 7. 常用命令

### 开发相关

```bash
npm run dev
```

启动开发环境，端口 `30000`。

```bash
npm run build
```

执行生产构建。

```bash
npm run start
```

启动生产模式服务，端口 `30000`。

```bash
npm run lint
```

执行 ESLint 检查。

### 数据库相关

```bash
npm run db:up
```

启动 PostgreSQL 容器。

```bash
npm run db:down
```

停止 PostgreSQL 容器。

```bash
npm run db:generate
```

生成 Prisma Client。

```bash
npm run db:push
```

同步 Prisma schema 到数据库。

```bash
npm run db:seed
```

执行种子脚本。

```bash
npm run db:reset
```

重建数据库并重新写入种子数据。

```bash
npm run db:studio
```

打开 Prisma Studio。

---

## 8. 推荐的首次启动流程

如果是第一次本地运行，建议按这个顺序：

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:generate
npm run db:reset
npm run dev
```

完成后访问：

```text
http://localhost:30000
```

---

## 9. 主要页面地址

### 首页

- 英文首页：`/en`
- 中文首页：`/zh`

### 商品页

- 英文商品列表：`/en/shop`
- 中文商品列表：`/zh/shop`

### 分类落地页

- Plush：`/en/shop/category/plush`
- Jewelry：`/en/shop/category/jewelry`
- Gifts：`/en/shop/category/gifts`

### Guide 内容页

- 英文 Guides 聚合页：`/en/guides`
- 中文 Guides 聚合页：`/zh/guides`

示例：

- `/en/guides/plush-buying-guide`
- `/en/guides/gift-guide`
- `/en/guides/jewelry-gift-guide`

### 交易流程页

- 购物车：`/en/cart`
- 结账：`/en/checkout`
- 支付：`/en/checkout/payment`
- 支付成功：`/en/checkout/success`
- 订单追踪：`/en/order-tracking`

### 后台页面

- **推荐登录入口**：`/console/login`
- 后台首页：`/console`
- 商品管理：`/console/products`
- 订单管理：`/console/orders`
- 导入中心：`/console/imports`
- 内容页：`/console/content`
- 设置页：`/console/settings`

说明：

- `/admin/*` 仍作为内部兼容路径保留
- 外部访问会被重定向 / rewrite 到新的公开后台路径
- 线上使用时建议只对外使用 `/console/login`

---

## 10. 种子数据说明

执行 `npm run db:reset` 后，系统会写入：

- 分类数据
- 商品数据
- 标签数据
- 内容页占位数据
- 站点设置数据
- 订单样例数据
- 一个导入批次样例
- 一个管理员账号

### 管理员种子账号

`seed` 会始终创建一个管理员账号。

如果你在环境变量中设置了：

```env
ADMIN_EMAIL="your-admin@example.com"
ADMIN_PASSWORD="your-strong-password"
```

那么执行：

```bash
npm run db:seed
```

或：

```bash
npm run db:reset
```

后，会创建这个管理员账号。

如果你没有设置环境变量，则会回退为：

```text
email: admin@northstaratelier.com
password: Admin123456!
```

如果数据库里还没有管理员，而你又没有执行 seed，系统也支持在首次登录时使用环境变量中的 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 自动创建管理员。

### 可用于订单追踪测试的样例订单

#### 样例 1

- 订单号：`NSA-20260420-A1B2`
- 邮箱：`emily@example.com`
- 状态：`NEW`

#### 样例 2

- 订单号：`NSA-20260420-C3D4`
- 邮箱：`olivia@example.com`
- 状态：`PROCESSING`

#### 样例 3

- 订单号：`NSA-20260419-Z9X8`
- 邮箱：`mia@example.com`
- 状态：`SHIPPED`

示例查询：

```text
http://localhost:30000/en/order-tracking?order=NSA-20260419-Z9X8&email=mia@example.com
```

---

## 11. 导入中心说明

后台导入页：

```text
/console/imports
```

当前导入逻辑支持：

1. 从外部商品源抓取示例商品
2. 生成导入批次
3. 把导入批次发布为站内商品

目前示例导入依赖：

- `https://dummyjson.com`

如果服务器不能访问外网，点击“导入示例数据”时可能失败。

---

## 12. 支付流程说明

当前支付是**站内模拟支付流程**，不是真实第三方支付。

流程如下：

1. 用户在结账页填写地址与联系方式
2. 提交后调用 `POST /api/orders`
3. 系统创建订单，状态为 `AWAITING_PAYMENT`
4. 用户进入支付页，选择 `card` 或 `paypal`
5. 支付页调用 `POST /api/orders/pay`
6. 系统把订单更新为 `CONFIRMED`

这套结构适合：

- 演示完整商城闭环
- 验证订单状态流转
- 为后续接 Stripe / PayPal 做预留

如果后续要接真实支付，建议从以下文件开始：

- `src/app/api/orders/pay/route.ts`
- `src/components/checkout/payment-experience.tsx`

---

## 13. 后台登录与路径说明

### 13.1 推荐后台入口

默认公开后台入口：

```text
/console/login
```

例如：

```text
https://mall.67win.cc/console/login?locale=en
```

### 13.2 登录方式

当前后台采用：

- 管理员邮箱
- 管理员密码
- HttpOnly Cookie 会话

登录成功后，后台页面和后台 API 才允许访问。

### 13.3 如果还没有管理员怎么办

有两种办法：

#### 方案 1：执行 seed

```bash
npm run db:seed
```

或：

```bash
npm run db:reset
```

数据库中会创建管理员。

如果未配置管理员环境变量，默认创建的账号是：

```text
email: admin@northstaratelier.com
password: Admin123456!
```

#### 方案 2：首次登录自动创建管理员

如果数据库中还没有任何管理员，并且环境变量里已经配置：

```env
ADMIN_EMAIL="your-admin@example.com"
ADMIN_PASSWORD="your-strong-password"
```

那么第一次在登录页用这组账号登录时，系统会自动创建管理员。

> 注意：如果 `ADMIN_PASSWORD` 仍然是 `.env.example` 里的占位值 `change-this-admin-password`，系统不会启用自动创建管理员逻辑。

### 13.4 后台 API 保护

这些接口现在都需要登录后才能访问：

- `/api/admin/products`
- `/api/admin/products/[id]`
- `/api/admin/orders/[id]`
- `/api/admin/imports/sample`
- `/api/admin/imports/[id]/publish`

未登录时会返回：

```http
401 Unauthorized
```

---

## 14. 部署流程

线上部署的标准顺序应该是：

```bash
git pull
npm install
npm run build
npm run start
```

如果线上已经有服务在跑，推荐理解成：

```bash
git pull
npm install
npm run build
重启服务
```

### 重要说明

**推荐顺序一定是先 build，再 start。**

也就是说，下面这种顺序不推荐：

```bash
npm install
npm run start
npm run build
```

因为 `next start` 会读取已有的 `.next` 构建产物，通常应该先构建新版本，再启动或重启服务。

### 如果你是手动部署到服务器

在服务器项目目录执行：

```bash
cd /root/arms/mall
git pull origin main
npm install
npm run build
npm run start
```

如果你不是直接手动前台运行，而是用进程管理器，最后一步应改成重启服务，例如：

- `pm2 restart mall`
- 或 `systemctl restart mall`
- 或 `docker compose up -d --build`

---

## 15. Search Console / Bing 接入

### 15.1 Google Search Console

选择 **HTML 标记验证** 后，会拿到一个 token。

把它写入线上环境变量：

```env
GOOGLE_SITE_VERIFICATION="你的token"
```

重新部署后，页面会自动输出：

```html
<meta name="google-site-verification" ... />
```

### 15.2 Bing Webmaster Tools

拿到验证 token 后，写入：

```env
BING_SITE_VERIFICATION="你的token"
```

重新部署后，页面会自动输出：

```html
<meta name="msvalidate.01" ... />
```

### 15.3 提交 sitemap

站长平台里提交：

```text
https://mall.67win.cc/sitemap.xml
```

---

## 16. 为什么“网页源代码看起来很乱”？

这是 **Next.js 16 + App Router + React Server Components** 的正常现象。

你在“查看网页源代码”时会看到很多：

- `self.__next_f.push(...)`
- hydration 数据
- 流式渲染载荷
- 预加载脚本

这不代表 SEO 有问题。

真正要检查的是页面里是否已经输出了：

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- `hreflang`
- `robots`
- JSON-LD

只要这些都在 HTML 里，搜索引擎一般就能正常识别。

---

## 17. 当前 SEO 发展阶段

### 第一阶段

- 基础 metadata
- robots
- sitemap
- noindex 策略
- 商品页 Product JSON-LD

### 第二阶段

- 分类落地页
- query 分类重定向
- 更接近搜索意图的正文文案

### 第三阶段

- Guides 聚合页
- Guides 详情页
- 站点验证环境变量支持

### 第四阶段

- 主导航加入 Guides
- 新增更多 evergreen guide 内容
- guide ↔ 商品 双向关联
- guide ↔ 分类 / 首页 / 页脚 多点内链

### 第五阶段

- 动态 OG 图片生成
- 专用分享图 API
- 带图片信息的 sitemap
- 更强的分享卡片与图片抓取信号

---

## 18. 项目结构

```text
mall/
├── docs/                         # 项目文档
├── prisma/                       # Prisma schema 与 seed
├── public/                       # 静态资源
├── src/
│   ├── app/                      # Next.js App Router 页面与 API
│   ├── components/               # 业务组件
│   ├── lib/                      # 数据访问、SEO、内容、工具函数
│   └── messages/                 # 中英文文案
├── compose.yaml                  # 本地 PostgreSQL 容器配置
├── package.json                  # 脚本与依赖
└── README.md
```

---

## 19. 关键代码入口

### SEO 相关

- `src/app/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/lib/site.ts`
- `src/lib/seo.ts`

### 分类页 / 商品页 / Guides

- `src/app/[locale]/shop/page.tsx`
- `src/app/[locale]/shop/category/[slug]/page.tsx`
- `src/app/[locale]/shop/[slug]/page.tsx`
- `src/app/[locale]/guides/page.tsx`
- `src/app/[locale]/guides/[slug]/page.tsx`
- `src/lib/category-content.ts`
- `src/lib/guide-content.ts`

### 订单与支付

- `src/app/api/orders/route.ts`
- `src/app/api/orders/pay/route.ts`
- `src/components/checkout/checkout-form.tsx`
- `src/components/checkout/payment-experience.tsx`

### 后台

- `src/lib/admin.ts`
- `src/lib/admin-auth.ts`
- `src/lib/admin-path.ts`
- `src/lib/admin-crypto.ts`
- `src/lib/imports.ts`
- `src/app/admin/actions.ts`
- `src/components/admin/admin-login-form.tsx`
- `src/proxy.ts`
- `src/app/admin/*`

---

## 20. 后续建议

如果继续往后做，建议优先考虑：

1. 接入真实支付（Stripe / PayPal）
2. 补充后台权限分级（例如 super admin / editor）
3. 增加管理员密码修改与重置流程
4. 扩充更多 guide 内容页
5. 接入 Google Search Console / Bing Webmaster Tools
6. 持续优化商品详情正文，使其更贴近真实搜索需求

---

## 21. 参考文档

- MVP 功能清单：`docs/mvp-functional-checklist.md`
- Prisma Schema：`prisma/schema.prisma`
- 种子数据：`prisma/seed.ts`
