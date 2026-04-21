import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { Container } from "@/components/ui/container";

const items = {
  en: [
    { label: "Plush Toys", href: "/shop?category=plush", image: "/products/aurora-bunny.svg" },
    { label: "Jewelry", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "Necklaces", href: "/shop?category=jewelry", image: "/products/moon-ribbon.svg" },
    { label: "Bracelets", href: "/shop?category=jewelry", image: "/products/moon-ribbon.svg" },
    { label: "Earrings", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "Rings", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "Accessories", href: "/shop?category=gifts", image: "/products/star-note.svg" },
    { label: "Gift Ideas", href: "/shop?category=gifts", image: "/products/cloud-tray.svg" },
  ],
  zh: [
    { label: "毛绒玩具", href: "/shop?category=plush", image: "/products/aurora-bunny.svg" },
    { label: "饰品首饰", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "项链挂坠", href: "/shop?category=jewelry", image: "/products/moon-ribbon.svg" },
    { label: "手链手串", href: "/shop?category=jewelry", image: "/products/moon-ribbon.svg" },
    { label: "耳饰耳环", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "戒指系列", href: "/shop?category=jewelry", image: "/products/starlight-earrings.svg" },
    { label: "配饰小物", href: "/shop?category=gifts", image: "/products/star-note.svg" },
    { label: "送礼灵感", href: "/shop?category=gifts", image: "/products/cloud-tray.svg" },
  ],
} as const;

export function HomeReferenceCategories({ locale }: { locale: Locale }) {
  const list = items[locale];

  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-8">
          {list.map((item) => (
            <Link key={item.label} href={`/${locale}${item.href}`} className="group text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#fff6f8_0%,#fffdfd_100%)] shadow-[0_18px_40px_-30px_rgba(233,165,186,0.62)] ring-1 ring-[rgba(248,192,205,0.45)] transition group-hover:-translate-y-1 group-hover:shadow-[0_24px_46px_-26px_rgba(233,165,186,0.72)] sm:h-28 sm:w-28">
                <div className="relative h-[66%] w-[66%] overflow-hidden rounded-full bg-white/78">
                  <Image src={item.image} alt={item.label} fill sizes="112px" className="object-cover" />
                </div>
              </div>
              <p className="mt-4 text-[15px] font-medium text-[#49444b] transition group-hover:text-[#ff6d88]">{item.label}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
