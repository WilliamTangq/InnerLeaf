"use client";

import {
  Archive,
  Home,
  Leaf,
  ListChecks,
  LockKeyhole,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quick", label: "Quick", icon: Leaf },
  { href: "/guided", label: "Guided", icon: ListChecks },
  { href: "/history", label: "History", icon: Archive },
  { href: "/summary", label: "Patterns", icon: TrendingUp },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/login", label: "Login", icon: LockKeyhole },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="-mx-1 flex max-w-full items-center gap-0.5 overflow-x-auto pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
              isActive
                ? "bg-[var(--accent-soft)] font-medium text-[var(--brand-teal-deep)]"
                : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
              link.href === "/login" &&
                "text-[var(--foreground-subtle)] sm:ml-1",
            ].join(" ")}
          >
            <Icon
              aria-hidden="true"
              size={14}
              strokeWidth={1.8}
              className="mr-1.5 hidden align-[-2px] sm:inline-block"
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
