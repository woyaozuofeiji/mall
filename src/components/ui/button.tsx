import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold tracking-[0.04em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9aae]/45 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "h-12 bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] px-6 text-white shadow-[0_20px_40px_-24px_rgba(255,109,136,0.82)] hover:-translate-y-0.5",
        secondary:
          "h-12 border border-[rgba(248,192,205,0.72)] bg-white px-6 text-[#3a353d] shadow-[0_18px_40px_-28px_rgba(214,187,198,0.7)] hover:-translate-y-0.5 hover:border-[rgba(255,126,149,0.55)] hover:text-[#ff6d88]",
        ghost: "h-auto px-0 py-0 text-[#6d6670] hover:text-[#ff6d88]",
        champagne:
          "h-12 border border-[rgba(255,200,211,0.7)] bg-[#fff3f6] px-6 text-[#ff6d88] shadow-[0_18px_36px_-30px_rgba(255,109,136,0.42)] hover:-translate-y-0.5 hover:bg-[#ffedf2]",
      },
      size: {
        default: "",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-7 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export function Button({ className, variant, size, href, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link className={cn(buttonVariants({ variant, size }), className)} href={href}>
        {props.children}
      </Link>
    );
  }

  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
