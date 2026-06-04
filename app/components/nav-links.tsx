"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/quick", label: "Quick" },
  { href: "/guided", label: "Guided" },
  { href: "/history", label: "History" },
  { href: "/summary", label: "Patterns" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 sm:gap-0.5">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "rounded-lg px-3 py-2 text-sm transition",
              isActive
                ? "bg-[var(--accent-soft)] font-medium text-[var(--brand-teal-deep)]"
                : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/feedback"
        className={[
          "rounded-lg px-3 py-2 text-sm transition",
          pathname === "/feedback"
            ? "bg-[var(--accent-soft)] font-medium text-[var(--brand-teal-deep)]"
            : "text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]",
        ].join(" ")}
      >
        Feedback
      </Link>
    </nav>
  );
}
