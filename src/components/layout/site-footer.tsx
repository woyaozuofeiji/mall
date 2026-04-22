import Link from "next/link";
import { AtSign, ChevronDown, Globe, Music4, PlayCircle } from "lucide-react";
import { adminHref } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/container";

export function SiteFooter({ locale }: { locale: Locale }) {
  const content =
    locale === "zh"
      ? {
          tagline: "给生活里的每一个可爱瞬间，准备一点温柔和闪光。",
          brandDescription: "把玩偶、礼品与精致饰品放在同一间轻盈柔和的线上精品店里。",
          shop: "选购指南",
          customer: "客户服务",
          about: "关于我们",
          accept: "支持方式",
          shopLinks: [
            { href: `/${locale}/shop/category/plush`, label: "毛绒玩具" },
            { href: `/${locale}/shop/category/jewelry`, label: "饰品首饰" },
            { href: `/${locale}/shop?sort=newest`, label: "新品上架" },
            { href: `/${locale}/shop`, label: "热销推荐" },
            { href: `/${locale}/shop/category/gifts`, label: "送礼灵感" },
          ],
          customerLinks: [
            { href: `/${locale}/contact`, label: "联系我们" },
            { href: `/${locale}/policies/shipping`, label: "配送说明" },
            { href: `/${locale}/policies/returns`, label: "退换政策" },
            { href: `/${locale}/faq`, label: "常见问题" },
            { href: `/${locale}/order-tracking`, label: "订单查询" },
          ],
          aboutLinks: [
            { href: `/${locale}/contact`, label: "品牌故事" },
            { href: `/${locale}/guides`, label: "选购指南" },
            { href: adminHref("/admin/login", locale), label: "后台入口" },
            { href: `/${locale}/policies/privacy`, label: "隐私政策" },
            { href: `/${locale}/policies/terms`, label: "服务条款" },
          ],
          mobileQuickLinks: [
            { href: `/${locale}/shop`, label: "开始选购" },
            { href: `/${locale}/contact`, label: "联系客服" },
            { href: `/${locale}/order-tracking`, label: "查订单" },
          ],
          rights: "© 2026 Northstar Atelier. All rights reserved.",
        }
      : {
          tagline: "Treasures for every day",
          brandDescription: "A soft, giftable storefront for plush friends, delicate jewelry and charming little surprises.",
          shop: "Shop",
          customer: "Customer Service",
          about: "About Us",
          accept: "We Accept",
          shopLinks: [
            { href: `/${locale}/shop/category/plush`, label: "Plush Toys" },
            { href: `/${locale}/shop/category/jewelry`, label: "Jewelry" },
            { href: `/${locale}/shop?sort=newest`, label: "New Arrivals" },
            { href: `/${locale}/shop`, label: "Best Sellers" },
            { href: `/${locale}/shop/category/gifts`, label: "Gift Ideas" },
          ],
          customerLinks: [
            { href: `/${locale}/contact`, label: "Contact Us" },
            { href: `/${locale}/policies/shipping`, label: "Shipping Info" },
            { href: `/${locale}/policies/returns`, label: "Returns & Exchanges" },
            { href: `/${locale}/faq`, label: "FAQ" },
            { href: `/${locale}/order-tracking`, label: "Track Your Order" },
          ],
          aboutLinks: [
            { href: `/${locale}/contact`, label: "Our Story" },
            { href: `/${locale}/guides`, label: "Buying Guides" },
            { href: adminHref("/admin/login", locale), label: "Admin" },
            { href: `/${locale}/policies/privacy`, label: "Privacy Policy" },
            { href: `/${locale}/policies/terms`, label: "Terms of Service" },
          ],
          mobileQuickLinks: [
            { href: `/${locale}/shop`, label: "Shop Now" },
            { href: `/${locale}/contact`, label: "Contact" },
            { href: `/${locale}/order-tracking`, label: "Track Order" },
          ],
          rights: "© 2026 Northstar Atelier. All rights reserved.",
        };

  const socialLinks = [
    { href: "#", icon: <AtSign className="h-4 w-4" />, label: "Instagram" },
    { href: "#", icon: <Globe className="h-4 w-4" />, label: "Facebook" },
    { href: "#", icon: <PlayCircle className="h-4 w-4" />, label: "YouTube" },
    { href: "#", icon: <Music4 className="h-4 w-4" />, label: "TikTok" },
  ];

  const payments = ["Visa", "Mastercard", "PayPal", "Apple Pay", "G Pay"];
  const footerSections = [
    { title: content.shop, links: content.shopLinks, defaultOpen: true },
    { title: content.customer, links: content.customerLinks, defaultOpen: true },
    { title: content.about, links: content.aboutLinks, defaultOpen: false },
  ];

  return (
    <footer className="mt-10 border-t border-[rgba(247,208,219,0.7)] bg-white py-12 text-[#423d45]">
      <Container className="lg:hidden">
        <div className="rounded-[2rem] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] p-5 shadow-[0_24px_70px_-54px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)]">
          <p className="font-serif text-[2.6rem] leading-none tracking-[-0.04em] text-[#2f2b32]">Northstar</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8b838d]">{content.tagline}</p>
          <p className="mt-4 text-[15px] leading-7 text-[#6d6670]">{content.brandDescription}</p>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {content.mobileQuickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-3 text-center text-[13px] font-medium text-[#4d4650] ring-1 ring-[rgba(241,225,230,0.95)] transition hover:text-[#ff6d88]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5f7] text-[#4a444c] shadow-[0_14px_28px_-24px_rgba(201,176,187,0.8)] ring-1 ring-[rgba(241,225,230,0.9)] transition hover:text-[#ff6d88]"
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {footerSections.map((section) => (
            <details
              key={section.title}
              className="group overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-[rgba(241,225,230,0.95)]"
              open={section.defaultOpen}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-[15px] font-semibold text-[#2f2b32] [&::-webkit-details-marker]:hidden">
                <span>{section.title}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5f7] text-[#8f8791] transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <div className="border-t border-[rgba(241,225,230,0.9)] px-4 py-4">
                <div className="space-y-3 text-[15px] text-[#6d6670]">
                  {section.links.map((item) => (
                    <Link key={item.href} className="block transition hover:text-[#ff6d88]" href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          ))}

          <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-[rgba(241,225,230,0.95)]">
            <p className="text-[15px] font-semibold text-[#2f2b32]">{content.accept}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {payments.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#fff5f7] px-3 py-2 text-[13px] font-medium text-[#5f5860] ring-1 ring-[rgba(241,225,230,0.9)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container className="hidden gap-12 lg:grid lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr]">
        <div>
          <p className="font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#2f2b32]">Northstar</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-[#8b838d]">{content.tagline}</p>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-[#6d6670]">{content.brandDescription}</p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5f7] text-[#4a444c] shadow-[0_14px_28px_-24px_rgba(201,176,187,0.8)] ring-1 ring-[rgba(241,225,230,0.9)] transition hover:text-[#ff6d88]"
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <p className="mb-4 text-[15px] font-semibold text-[#2f2b32]">{section.title}</p>
            <div className="space-y-3 text-[15px] text-[#6d6670]">
              {section.links.map((item) => (
                <Link key={item.href} className="block transition hover:text-[#ff6d88]" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-4 text-[15px] font-semibold text-[#2f2b32]">{content.accept}</p>
          <div className="flex flex-wrap gap-2">
            {payments.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#fff5f7] px-3 py-2 text-[13px] font-medium text-[#5f5860] ring-1 ring-[rgba(241,225,230,0.9)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <Container className="mt-10 border-t border-[rgba(247,208,219,0.7)] pt-6 text-[13px] text-[#8a838d]">
        <div className="text-center sm:text-left">{content.rights}</div>
      </Container>
    </footer>
  );
}
