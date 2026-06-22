"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
  {
    variants: {
      variant: {
        primary: "btn-brand text-white",
        secondary:
          "border border-[rgba(40,80,60,0.12)] bg-[rgba(255,254,248,0.86)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] hover:shadow-[var(--shadow-soft)]",
        ghost:
          "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        quiet:
          "border border-[var(--border)] bg-[rgba(255,254,248,0.72)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
      },
      size: {
        sm: "px-3.5 py-1.5 text-[13px]",
        md: "px-[1.05rem] py-2.5 text-sm",
        lg: "px-5 py-2.5 text-[15px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export function ShadButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export const cardVariants = cva(
  "rounded-[1.45rem] border",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(40,80,60,0.085)] bg-[rgba(255,254,248,0.88)] shadow-[var(--shadow-soft)] transition duration-200",
        muted:
          "border-[rgba(40,80,60,0.07)] bg-[rgba(246,242,233,0.58)] shadow-[var(--shadow-sm)]",
        elevated:
          "border-[rgba(40,80,60,0.105)] bg-[rgba(255,254,248,0.94)] shadow-[var(--shadow-md)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(31,155,143,0.2)] hover:shadow-[var(--shadow-lg)]",
      },
      padding: {
        md: "p-4 sm:p-[1.125rem]",
        lg: "p-5",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export function ShadCard({
  className,
  variant,
  padding,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-[var(--surface-muted)] text-[var(--foreground-muted)]",
        accent:
          "border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]",
        outline:
          "border border-[var(--border)] text-[var(--foreground-muted)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);
