import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(248,192,205,0.62)] bg-[rgba(255,243,246,0.96)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6d88] shadow-[0_10px_26px_-22px_rgba(255,109,136,0.52)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
