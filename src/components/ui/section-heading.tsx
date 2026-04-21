import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl space-y-4", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <div className={cn("inline-flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="h-px w-10 bg-[rgba(255,126,149,0.45)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ff7e95]">{eyebrow}</p>
        </div>
      ) : null}
      <h2 className="max-w-4xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[#2f2b32] sm:text-[3.2rem]">
        {title}
      </h2>
      {description ? <p className="max-w-2xl text-[15px] leading-8 text-[#6d6670] sm:text-base">{description}</p> : null}
    </div>
  );
}
