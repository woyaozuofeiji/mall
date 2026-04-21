import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Container } from "@/components/ui/container";

const iconClass = "h-6 w-6 text-[#4b4550]";

export function HomeReferenceHighlights({ locale }: { locale: Locale }) {
  const items =
    locale === "zh"
      ? [
          { title: "包邮门槛", description: "订单满 $59 即享包邮", icon: <Truck className={iconClass} /> },
          { title: "轻松售后", description: "30 天内支持售后处理", icon: <RotateCcw className={iconClass} /> },
          { title: "安全下单", description: "下单流程清晰可靠", icon: <ShieldCheck className={iconClass} /> },
          { title: "在线支持", description: "需要帮助时随时联系", icon: <Headphones className={iconClass} /> },
        ]
      : [
          { title: "Free Shipping", description: "On orders over $59", icon: <Truck className={iconClass} /> },
          { title: "Easy Returns", description: "30-day return policy", icon: <RotateCcw className={iconClass} /> },
          { title: "Secure Ordering", description: "A clear and reliable checkout flow", icon: <ShieldCheck className={iconClass} /> },
          { title: "24/7 Support", description: "We're here to help", icon: <Headphones className={iconClass} /> },
        ];

  return (
    <section className="pb-8 pt-2 sm:pb-10">
      <Container>
        <div className="grid gap-5 rounded-[1.8rem] bg-[linear-gradient(180deg,#fff6f8_0%,#fffdfd_100%)] px-6 py-6 shadow-[0_20px_56px_-40px_rgba(233,165,186,0.42)] ring-1 ring-[rgba(248,192,205,0.36)] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_14px_30px_-24px_rgba(102,78,90,0.35)]">
                {item.icon}
              </div>
              <div>
                <p className="text-[18px] font-medium text-[#2f2b32]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6b6470]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
