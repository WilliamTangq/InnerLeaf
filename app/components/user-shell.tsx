"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Archive,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PenLine,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./avatar";
import { BrandLogo } from "./brand-logo";
import { useAuth } from "./auth-provider";
import { LanguageSelector, useLanguage } from "./language-provider";

type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const userLinks = [
  { href: "/dashboard", key: "workspace", icon: LayoutDashboard },
  { href: "/dashboard/quick", key: "quick", icon: PenLine },
  { href: "/dashboard/guided", key: "guided", icon: ListChecks },
  { href: "/dashboard/history", key: "history", icon: Archive },
  { href: "/dashboard/summary", key: "summary", icon: TrendingUp },
  { href: "/dashboard/account", key: "account", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === pathname;
}

function UserNavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: IconType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        active
          ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

export function UserShell({
  children,
  maxWidth = "max-w-5xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isAdmin, profile, role, signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;

  async function logOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <header className="sticky top-0 z-[900] border-b border-[rgba(40,80,60,0.08)] bg-[rgba(253,252,250,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] lg:hidden"
              aria-label={t.nav.menu}
            >
              <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
            <BrandLogo size="md" />
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-lg border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--brand-teal-deep)] transition hover:bg-[var(--surface-muted)] sm:inline-flex"
              >
                {t.app.openAdmin}
              </Link>
            )}
            <LanguageSelector />
            <Link
              href={isAdmin ? "/admin/account" : "/dashboard/account"}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] px-2.5 py-1.5 shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)]"
            >
              <Avatar
                avatarUrl={profile?.avatar_url ?? ""}
                displayName={profile?.display_name}
                email={user?.email}
                isAdmin={isAdmin}
                size="sm"
              />
              <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                {displayName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1320px] flex-1 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[250px_1fr]">
        {sidebarOpen && (
          <button
            type="button"
            aria-label={t.nav.menu}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.12)] backdrop-blur-[1px] lg:hidden"
          />
        )}
        <aside
          className={[
            "fixed left-3 top-[72px] z-[9999] w-[min(320px,calc(100vw-24px))] transition duration-200 lg:sticky lg:left-auto lg:top-24 lg:z-auto lg:w-auto lg:self-start",
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)] lg:translate-x-0",
          ].join(" ")}
        >
          <div className="rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgba(255,255,248,0.86)] p-3 shadow-[0_24px_80px_rgba(20,35,28,0.10)] backdrop-blur-xl">
            <div className="mb-3 rounded-[22px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.72))] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t.app.title}
                </p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] lg:hidden"
                  aria-label={t.nav.menu}
                >
                  <X aria-hidden="true" size={16} strokeWidth={1.8} />
                </button>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-subtle)]">
                {t.app.privacy}
              </p>
              {role && (
                <span className="mt-3 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {t.admin.roleLabels[role]}
                </span>
              )}
            </div>
            <nav
              aria-label={t.app.title}
              className="flex flex-col gap-2"
            >
              {userLinks.map((link) => (
                <UserNavLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={
                    link.key === "account"
                      ? t.account.settings
                      : t.nav[link.key]
                  }
                  active={isActive(pathname, link.href)}
                />
              ))}
              <div className="min-w-px border-l border-[var(--border)] lg:my-2 lg:border-l-0 lg:border-t" />
              <button
                type="button"
                onClick={() => void logOut()}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>{t.nav.logout}</span>
              </button>
            </nav>
          </div>
        </aside>

        <section className={["w-full", maxWidth].join(" ")}>{children}</section>
      </main>
    </div>
  );
}
