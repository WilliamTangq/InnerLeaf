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
import { LanguageSelector, useLanguage } from "./language-provider";

const links = [
  { href: "/", key: "home", icon: Home },
  { href: "/quick", key: "quick", icon: Leaf },
  { href: "/guided", key: "guided", icon: ListChecks },
  { href: "/history", key: "history", icon: Archive },
  { href: "/summary", key: "summary", icon: TrendingUp },
  { href: "/feedback", key: "feedback", icon: MessageSquare },
  { href: "/login", key: "login", icon: LockKeyhole },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex max-w-full flex-col gap-3 sm:items-end">
      <nav
        aria-label="Main"
        className="-mx-1 flex max-w-full items-center gap-0.5 overflow-x-auto pb-0.5 sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const label = t.nav[link.key];
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
              {label}
            </Link>
          );
        })}
      </nav>
      <LanguageSelector />
    </div>
  );
}
