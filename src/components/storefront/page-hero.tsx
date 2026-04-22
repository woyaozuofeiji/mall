import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function StorefrontPageHero({
  eyebrow,
  title,
  description,
  side,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  side?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("pt-8 sm:pt-10", className)}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="space-y-4 rounded-[1.8rem] bg-[linear-gradient(135deg,#fff8fa_0%,#fff0f4_46%,#fffdfd_100%)] p-5 shadow-[0_24px_70px_-48px_rgba(233,165,186,0.46)] ring-1 ring-[rgba(248,192,205,0.42)] sm:rounded-[2rem] sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#ff7e95]">{eyebrow}</p>
            <h1 className="max-w-4xl text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.04em] text-[#2f2b32] sm:text-[4.25rem] sm:leading-[1.02]">
              {title}
            </h1>
            <p className="max-w-3xl text-[14px] leading-7 text-[#6a6470] sm:text-[17px] sm:leading-8">{description}</p>
          </div>

          {side ? (
            <div className="rounded-[1.8rem] bg-white/92 p-5 shadow-[0_24px_70px_-52px_rgba(214,187,198,0.7)] ring-1 ring-[rgba(241,225,230,0.95)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7">
              {side}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function StorefrontPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[1.8rem] bg-white/94 p-5 shadow-[0_22px_58px_-44px_rgba(214,187,198,0.72)] ring-1 ring-[rgba(241,225,230,0.95)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StorefrontInfoPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#fff3f6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6d88] ring-1 ring-[rgba(248,192,205,0.55)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
