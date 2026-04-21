# mall

一个基于 **Next.js 16 + React 19 + Prisma + PostgreSQL** 的双语精品外贸商城 MVP。

这个项目面向“精选商品展示 + 购物车 + 下单 + 模拟支付 + 订单追踪 + 后台商品/订单管理”的完整基础链路，适合继续扩展为真实的独立站商城或内部业务演示项目。

---

## 1. 项目简介

当前项目已经覆盖以下核心能力：

### 前台能力

- `/en`、`/zh` 双语路由
- 首页、商品列表页、商品详情页
- 搜索页
- 购物车
- 结账页
- 支付体验页
- 支付成功页
- 订单追踪页
- FAQ / 联系我们 / 隐私政策 / 发货政策 / 退换政策 / 服务条款

### 后台能力

- 管理后台首页
- 商品列表 / 新建 / 编辑
- 订单列表 / 订单详情 / 状态更新 / 运单录入
- 导入中心
- 内容页与设置页的后台壳子页面

### 当前实现特性说明

- 支付流程目前是 **站内模拟支付流程**，并未接入真实 Stripe / PayPal SDK
- 下单后订单会进入 `AWAITING_PAYMENT`
- 在支付页确认支付后，订单会更新为 `CONFIRMED`
- 管理后台可以继续把订单更新为 `PROCESSING`、`SHIPPED` 等状态
- `/admin/login` 目前是**预览入口**，还没有真正的账号密码鉴权逻辑

---

## 2. 技术栈

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

## 3. 本地运行环境要求

建议准备以下环境：

- **Node.js 20+**
- **npm**
- **Docker + Docker Compose**（推荐，用于本地启动 PostgreSQL）

如果你不使用 Docker，也可以自己准备一个 PostgreSQL 数据库，然后修改 `.env` 中的 `DATABASE_URL`。

---

## 4. 环境变量

项目默认使用以下数据库连接：

```env
DATABASE_URL="postgresql://mall:mall@localhost:54320/mall?schema=public"
```

对应文件：

- 示例文件：`.env.example`
- 本地实际文件：`.env`

如果使用仓库内自带的 `compose.yaml` 启动数据库，默认不需要改动这个连接串。

---

## 5. 快速开始

### 5.1 克隆项目

```bash
git clone git@github.com:woyaozuofeiji/mall.git
cd mall
```

### 5.2 安装依赖

```bash
npm install
```

### 5.3 配置环境变量

如果本地还没有 `.env`：

```bash
cp .env.example .env
```

### 5.4 启动 PostgreSQL

使用项目自带 Docker Compose：

```bash
npm run db:up
```

这会启动一个本地 PostgreSQL 16 容器，映射端口：

- `localhost:54320`

### 5.5 生成 Prisma Client

```bash
npm run db:generate
```

### 5.6 初始化数据库结构并写入种子数据

首次启动推荐直接执行：

```bash
npm run db:reset
```

这个命令会：

1. 强制重建数据库结构
2. 执行 Prisma schema 同步
3. 写入种子数据

> 注意：`db:reset` 会清空当前数据库中的已有数据，请不要在有重要数据时直接执行。

### 5.7 启动开发服务器

```bash
npm run dev
```

项目默认运行在：

```text
http://localhost:30000
```

说明：

- 访问 `/` 会自动重定向到 `/en`
- 中文首页地址是 `/zh`

---

## 6. 常用启动与操作命令

### 开发相关

```bash
npm run dev
```

启动开发环境，端口为 `30000`。

```bash
npm run build
```

执行生产构建。

```bash
npm run start
```

用生产模式启动服务，端口为 `30000`。

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

把 Prisma schema 同步到数据库。

```bash
npm run db:seed
```

执行种子数据脚本。

```bash
npm run db:reset
```

强制重建数据库并重新灌入种子数据。

```bash
npm run db:studio
```

打开 Prisma Studio，方便查看和编辑数据库内容。

---

## 7. 推荐的首次启动流程

如果你是第一次拉起项目，按下面顺序执行最稳：

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:generate
npm run db:reset
npm run dev
```

完成后直接打开：

```text
http://localhost:30000
```

---

## 8. 主要页面地址

### 前台页面

- 英文首页：`/en`
- 中文首页：`/zh`
- 英文商品页：`/en/shop`
- 中文商品页：`/zh/shop`
- 英文购物车：`/en/cart`
- 中文购物车：`/zh/cart`
- 英文结账：`/en/checkout`
- 中文结账：`/zh/checkout`
- 英文订单追踪：`/en/order-tracking`
- 中文订单追踪：`/zh/order-tracking`

### 后台页面

- 后台登录预览：`/admin/login`
- 后台首页：`/admin`
- 商品管理：`/admin/products`
- 订单管理：`/admin/orders`
- 导入中心：`/admin/imports`
- 内容页：`/admin/content`
- 设置页：`/admin/settings`

---

## 9. 种子数据说明

执行 `npm run db:reset` 后，系统会写入：

- 分类数据
- 商品数据
- 标签数据
- 内容页占位数据
- 站点设置数据
- 订单样例数据
- 一个导入批次样例

### 可用于订单追踪测试的样例订单

你可以直接使用下面这些数据测试订单追踪页：

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

你也可以直接访问类似：

```text
http://localhost:30000/en/order-tracking?order=NSA-20260419-Z9X8&email=mia@example.com
```

---

## 10. 导入中心说明

后台导入页位于：

```text
/admin/imports
```

当前导入逻辑支持：

1. 从外部商品源抓取示例商品
2. 生成导入批次
3. 再将该批次发布为站内商品

目前示例导入依赖：

- `https://dummyjson.com`

也就是说，如果服务器不能访问外网，点击“导入示例数据”时可能会失败。

---

## 11. 支付流程说明

当前支付不是第三方真实支付，而是项目内部模拟：

1. 用户在结账页填写地址与联系方式
2. 提交后调用 `POST /api/orders`
3. 系统创建订单，状态写为 `AWAITING_PAYMENT`
4. 用户进入支付页，选择 `card` 或 `paypal`
5. 支付页调用 `POST /api/orders/pay`
6. 系统把订单更新为 `CONFIRMED`

这套流程适合：

- 演示商城闭环
- 验证下单和状态流转
- 为后续接 Stripe / PayPal 做结构预留

如果后续要接真实支付，推荐从 `src/app/api/orders/pay/route.ts` 和 `src/components/checkout/payment-experience.tsx` 开始扩展。

---

## 12. 目录结构说明

```text
mall/
├── docs/                    # 项目文档
├── prisma/                  # Prisma schema 与 seed
├── public/                  # 静态资源
├── src/
│   ├── app/                 # Next.js App Router 页面与 API
│   ├── components/          # 业务组件
│   ├── lib/                 # 数据访问、工具函数、业务逻辑
│   └── messages/            # 中英文文案
├── compose.yaml             # 本地 PostgreSQL 容器配置
├── package.json             # 脚本与依赖
└── README.md
```

---

## 13. 生产启动方式

如果你要用生产模式运行：

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:generate
npm run db:push
npm run build
npm run start
```

如果数据库里还没有任何数据，再补一次：

```bash
npm run db:seed
```

---

## 14. 常见问题

### 14.1 页面打不开？

先确认开发服务器是否已经启动：

```bash
npm run dev
```

项目默认端口不是 `3000`，而是：

```text
30000
```

### 14.2 Prisma 连不上数据库？

先确认数据库容器是否已经起来：

```bash
npm run db:up
```

再检查 `.env` 里的 `DATABASE_URL` 是否正确。

### 14.3 数据表没生成？

执行：

```bash
npm run db:generate
npm run db:push
```

如果你还需要示例数据：

```bash
npm run db:seed
```

### 14.4 导入示例失败？

后台“导入示例”依赖外部接口 `dummyjson.com`。

如果服务器网络受限，可能会报错。此时可以：

- 检查服务器外网访问能力
- 先使用本地种子数据继续开发
- 后续把导入源改成自己的供应商接口或本地文件

### 14.5 后台为什么没有真正登录？

当前 `/admin/login` 是预览页，还没有接入真实管理员认证。

如果你后续要补完整后台登录，建议新增：

- 管理员登录表单
- Session / JWT / Cookie 鉴权
- 后台路由守卫
- 权限控制

---

## 15. 后续建议扩展

这个项目下一步比较适合继续补这些方向：

1. 真实支付接入（Stripe / PayPal）
2. 管理后台登录鉴权
3. 内容页与设置页真正可编辑
4. 邮件通知（下单成功、发货通知）
5. 库存与 SKU 管理增强
6. 文件导入（CSV / Excel）替代示例导入源

---

## 16. 参考文档

- 项目功能清单：`docs/mvp-functional-checklist.md`
- Prisma Schema：`prisma/schema.prisma`
- 种子数据：`prisma/seed.ts`

如果你准备继续开发，建议先从以下几个入口看起：

- 前台下单流程：`src/components/checkout/checkout-form.tsx`
- 支付流程：`src/components/checkout/payment-experience.tsx`
- 订单 API：`src/app/api/orders/route.ts`
- 支付 API：`src/app/api/orders/pay/route.ts`
- 后台商品逻辑：`src/lib/admin.ts`
- 导入逻辑：`src/lib/imports.ts`

