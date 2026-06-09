"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector, useLanguage } from "./language-provider";

const links = [
  { href: "/", key: "home" },
  { href: "/demo", key: "demo" },
  { href: "/test", key: "test" },
  { href: "/faq", key: "faq" },
  { href: "/privacy", key: "privacy" },
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
          const label = t.nav[link.key];
          const isActive =
            !link.href.includes("#") &&
            (pathname === link.href || pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
                isActive
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--brand-teal-deep)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Link
          href="/quick"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-teal)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          {t.common.startReflection}
        </Link>
        <Link
          href="/history"
          className="text-sm text-[var(--foreground-subtle)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline"
        >
          {t.nav.history}
        </Link>
        <Link
          href="/guided"
          className="text-sm text-[var(--foreground-subtle)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline"
        >
          {t.nav.guided}
        </Link>
        <Link
          href="/summary"
          className="text-sm text-[var(--foreground-subtle)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline"
        >
          {t.nav.summary}
        </Link>
        <LanguageSelector />
      </div>
    </div>
  );
}
