"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector, useLanguage } from "./language-provider";
import { useAuth } from "./auth-provider";

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
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="flex max-w-full items-center gap-2">
      <nav
        aria-label="Main"
        className="hidden max-w-full items-center gap-0.5 lg:flex"
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
      <div className="flex shrink-0 items-center gap-2">
        {user ? (
          <>
            <Link
              href="/history"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] sm:inline-flex"
            >
              {t.nav.history}
            </Link>
            <Link
              href="/summary"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] sm:inline-flex"
            >
              {t.nav.summary}
            </Link>
            <span className="hidden max-w-36 truncate text-xs text-[var(--foreground-subtle)] xl:inline">
              {user.email}
            </span>
            {isAdmin && (
              <span className="hidden rounded-full border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)] md:inline-flex">
                {t.auth.admin}
              </span>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              {t.nav.logout}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] sm:inline-flex"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/quick"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-teal)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              {t.common.startReflection}
            </Link>
          </>
        )}
        <LanguageSelector />
      </div>
    </div>
  );
}
