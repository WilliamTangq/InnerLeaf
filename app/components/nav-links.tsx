"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";
import { useAuth } from "./auth-provider";

const publicLinks = [
  { href: "/", key: "home" },
  { href: "/demo", key: "demo" },
  { href: "/test", key: "test" },
  { href: "/faq", key: "faq" },
  { href: "/privacy", key: "privacy" },
] as const;

const userLinks = [
  { href: "/app", label: "workspace" },
  { href: "/quick", label: "quick" },
  { href: "/guided", label: "guided" },
  { href: "/history", label: "history" },
  { href: "/summary", label: "summary" },
  { href: "/account", label: "account" },
  { href: "/feedback", label: "feedback" },
] as const;

const adminLinks = [
  { href: "/admin", label: "overview" },
  { href: "/admin/users", label: "users" },
  { href: "/admin/feedback", label: "feedback" },
  { href: "/admin/system", label: "system" },
] as const;

function initials(name?: string | null, email?: string | null) {
  const value = name || email?.split("@")[0] || "InnerLeaf";
  return value
    .split(/\s|[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "block rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function useDismissMenu(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return ref;
}

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isAdmin, profile, signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useDismissMenu(open, () => setOpen(false));
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;
  const avatarUrl = profile?.avatar_url || "";

  async function logOut() {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex max-w-full items-center gap-2">
      {!user && (
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
                isActive(pathname, link.href)
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--brand-teal-deep)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>
      )}

      {user && (
        <Link
          href="/app"
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] md:inline-flex"
        >
          {t.nav.workspace}
        </Link>
      )}

      <LanguageSelector />

      <div className="relative" ref={menuRef}>
        {!user && (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-teal)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              {t.common.createAccount}
            </Link>
          </div>
        )}

        <button
          type="button"
          aria-label={t.nav.menu}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={[
            "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
            user ? "" : "sm:hidden",
          ].join(" ")}
        >
          {user ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--brand-teal-deep)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(profile?.display_name, user.email)
                )}
              </span>
              <Menu aria-hidden="true" size={16} strokeWidth={1.8} />
            </>
          ) : open ? (
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[rgba(255,255,248,0.96)] p-2 shadow-[var(--shadow-lg)] backdrop-blur-xl">
            {user ? (
              <>
                <div className="mb-2 rounded-xl bg-[var(--surface-muted)] px-3 py-3">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--foreground-subtle)]">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <span className="mt-2 inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                      {t.auth.admin}
                    </span>
                  )}
                </div>
                {userLinks.map((link) => (
                  <MenuLink
                    key={link.href}
                    href={link.href}
                    active={isActive(pathname, link.href)}
                    onClick={() => setOpen(false)}
                  >
                    {t.nav[link.label]}
                  </MenuLink>
                ))}
                {isAdmin && (
                  <div className="mt-2 border-t border-[var(--border)] pt-2">
                    {adminLinks.map((link) => (
                      <MenuLink
                        key={link.href}
                        href={link.href}
                        active={isActive(pathname, link.href)}
                        onClick={() => setOpen(false)}
                      >
                        {t.admin[link.label]}
                      </MenuLink>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => void logOut()}
                  className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <>
                {publicLinks.map((link) => (
                  <MenuLink
                    key={link.href}
                    href={link.href}
                    active={isActive(pathname, link.href)}
                    onClick={() => setOpen(false)}
                  >
                    {t.nav[link.key]}
                  </MenuLink>
                ))}
                <div className="mt-2 border-t border-[var(--border)] pt-2">
                  <MenuLink
                    href="/login"
                    active={isActive(pathname, "/login")}
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.login}
                  </MenuLink>
                  <MenuLink
                    href="/register"
                    active={isActive(pathname, "/register")}
                    onClick={() => setOpen(false)}
                  >
                    {t.common.createAccount}
                  </MenuLink>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
