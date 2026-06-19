"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
  Menu,
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

const adminLinks = [
  { href: "/admin", key: "overview", icon: LayoutDashboard },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/feedback", key: "feedback", icon: Inbox },
  { href: "/admin/system", key: "system", icon: Settings },
  { href: "/admin/account", key: "adminAccountNav", icon: ShieldCheck },
  { href: "/dashboard", key: "userDashboardNav", icon: LayoutDashboard },
] as const;

function isActive(pathname: string, href: string) {
  if (href !== "/admin" && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return href === pathname;
}

function AdminNavLink({
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

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: IconType;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
        <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      </div>
      <p className="text-2xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
        {label}
      </p>
    </div>
  );
}

export function AdminShell({
  title,
  purpose,
  children,
  maxWidth = "max-w-6xl",
}: {
  title: string;
  purpose: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, role, signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <header className="sticky top-0 z-[900] border-b border-[rgba(40,80,60,0.08)] bg-[rgba(253,252,250,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] lg:hidden"
              aria-label={t.nav.menu}
            >
              <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
            <BrandLogo size="md" />
            <span className="hidden rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)] sm:inline-flex">
              {t.admin.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link
              href="/admin/account"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] px-2.5 py-1.5 shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)]"
            >
              <Avatar
                avatarUrl={profile?.avatar_url ?? ""}
                displayName={profile?.display_name}
                email={user?.email}
                isAdmin
                size="sm"
              />
              <span className="hidden max-w-32 truncate text-sm font-semibold md:inline">
                {profile?.display_name || user?.email || t.app.fallbackName}
              </span>
              {role && (
                <span className="hidden rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-teal-deep)] lg:inline-flex">
                  {t.admin.roleLabels[role]}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => void logOut()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              aria-label={t.nav.logout}
            >
              <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-[1320px] flex-1 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr]">
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
            "fixed left-3 top-[72px] z-[9999] w-[min(330px,calc(100vw-24px))] transition duration-200 lg:sticky lg:left-auto lg:top-24 lg:z-auto lg:w-auto lg:self-start",
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)] lg:translate-x-0",
          ].join(" ")}
        >
          <div className="h-full rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgba(255,255,248,0.94)] p-3 shadow-[0_24px_80px_rgba(20,35,28,0.10)] backdrop-blur-xl lg:min-h-[calc(100vh-8rem)] lg:rounded-3xl lg:bg-[rgba(255,255,248,0.78)] lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            <div className="mb-3 rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.72))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                  <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.8} />
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] lg:hidden"
                  aria-label={t.nav.menu}
                >
                  <X aria-hidden="true" size={16} strokeWidth={1.8} />
                </button>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t.admin.consoleTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-subtle)]">
                {t.admin.superHostBody}
              </p>
            </div>

            <nav
              aria-label={t.admin.consoleTitle}
              className="flex flex-col gap-1.5"
            >
              {adminLinks.map((link) => (
                <AdminNavLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={t.admin[link.key]}
                  active={isActive(pathname, link.href)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <section className={["w-full", maxWidth].join(" ")}>
          <div className="mb-6 rounded-[28px] border border-[rgba(31,92,70,0.16)] bg-[linear-gradient(135deg,rgba(250,255,240,0.92),rgba(255,255,248,0.86))] p-6 shadow-[var(--shadow-md)]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                {t.admin.secureManagement}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                {t.admin.title}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--foreground-muted)]">
              {purpose}
            </p>
          </div>

          {children}
          <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground-subtle)]">
            {t.admin.privateNote}
          </div>
        </section>
      </main>
    </div>
  );
}
