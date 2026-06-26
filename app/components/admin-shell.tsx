"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Inbox,
  LineChart,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppMobileDrawer } from "./app-mobile-drawer";
import { AppTopbar } from "./app-topbar";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { trackEvent } from "../lib/analytics";

type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const adminLinks = [
  { href: "/admin", key: "overview", icon: LayoutDashboard },
  { href: "/admin/metrics", key: "metrics", icon: LineChart },
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
  onClick,
}: {
  href: string;
  icon: IconType;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        active
          ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] shadow-[inset_0_0_0_1px_rgba(31,155,143,0.13)]"
          : "text-[var(--foreground-muted)] hover:bg-[rgba(255,254,248,0.76)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-sm)]",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

function AdminSidebarContent({
  onClose,
  pathname,
  role,
  t,
}: {
  onClose: () => void;
  pathname: string;
  role: "user" | "admin" | "tester" | null;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  return (
    <div className="shell-panel flex h-full max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-[1.35rem] p-2 lg:max-h-none lg:min-h-[calc(100vh-8.25rem)] lg:rounded-[1.7rem] lg:p-2.5">
      <div className="mb-2 rounded-[1.1rem] border border-[rgba(31,155,143,0.12)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.54))] p-2.5 shadow-[var(--shadow-sm)] lg:mb-2.5 lg:p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] lg:mb-2 lg:h-9 lg:w-9">
            <ShieldCheck aria-hidden="true" size={17} strokeWidth={1.8} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.72)] text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)] lg:hidden"
            aria-label={t.nav.menu}
          >
            <X aria-hidden="true" size={16} strokeWidth={1.8} />
          </button>
        </div>
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {t.admin.consoleTitle}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--foreground-subtle)]">
          {t.admin.superHostBody}
        </p>
        {role && (
          <span className="mt-3 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
            {t.admin.roleLabels[role]}
          </span>
        )}
      </div>

      <nav
        aria-label={t.admin.consoleTitle}
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5 lg:gap-1"
      >
        {adminLinks.map((link) => (
          <AdminNavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={t.admin[link.key]}
            active={isActive(pathname, link.href)}
            onClick={onClose}
          />
        ))}
      </nav>
    </div>
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
    <div className="motion-soft-scale rounded-[1.05rem] border border-[rgba(40,80,60,0.085)] bg-[rgba(255,254,248,0.88)] p-3 shadow-[var(--shadow-sm)] sm:p-3.5">
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
        <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
      </div>
      <p className="text-lg font-semibold leading-none text-[var(--foreground)] sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
        {label}
      </p>
    </div>
  );
}

export function AdminShell({
  title,
  purpose,
  children,
  eyebrow,
  maxWidth = "max-w-6xl",
}: {
  title: string;
  purpose: string;
  children: ReactNode;
  eyebrow?: string;
  maxWidth?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { profile, role, signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logOut() {
    trackEvent("logout_clicked", {
      locale: language,
      authenticated_state: true,
      role_bucket: role ?? "admin",
    });
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <AppTopbar
        accountHref="/admin/account"
        accountLabel={t.nav.openAccountMenu}
        avatarUrl={profile?.avatar_url}
        badgeLabel={t.admin.title}
        displayName={profile?.display_name || user?.email || t.app.fallbackName}
        email={user?.email}
        isAdmin
        logoutLabel={t.nav.logout}
        menuLabel={t.nav.menu}
        onLogout={() => void logOut()}
        onMenu={() => setSidebarOpen(true)}
        roleChip={role ? t.admin.roleLabels[role] : undefined}
      />
      <AppMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        label={t.nav.menu}
      >
        <AdminSidebarContent
          onClose={() => setSidebarOpen(false)}
          pathname={pathname}
          role={role}
          t={t}
        />
      </AppMobileDrawer>
      <main className="mx-auto grid w-full max-w-[1360px] flex-1 gap-4 px-3 py-3 sm:px-7 sm:py-6 lg:grid-cols-[244px_1fr] lg:gap-5">
        <aside className="hidden lg:sticky lg:top-24 lg:z-[10] lg:block lg:self-start">
          <AdminSidebarContent
            onClose={() => setSidebarOpen(false)}
            pathname={pathname}
            role={role}
            t={t}
          />
        </aside>

        <section className={["w-full pb-7 sm:pb-8", maxWidth].join(" ")}>
          <div className="mb-4 rounded-[1.3rem] border border-[rgba(31,92,70,0.11)] bg-[linear-gradient(135deg,rgba(250,255,240,0.84),rgba(255,254,248,0.92))] p-3.5 shadow-[var(--shadow-soft)] sm:mb-5 sm:p-4">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                {eyebrow || t.admin.secureManagement}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                {t.admin.title}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.7rem]">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
              {purpose}
            </p>
          </div>

          {children}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(246,242,233,0.66)] px-4 py-3 text-xs leading-5 text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)]">
            {t.admin.privateNote}
          </div>
        </section>
      </main>
    </div>
  );
}
