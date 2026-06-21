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
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    <div className="rounded-[calc(var(--radius-xl)+6px)] border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.92)] p-5 shadow-[var(--shadow-md)]">
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

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

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
      <main className="mx-auto grid w-full max-w-[1360px] flex-1 gap-7 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[266px_1fr]">
        {sidebarOpen && (
          <button
            type="button"
            aria-label={t.nav.menu}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.30)] lg:hidden"
          />
        )}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-[9999] w-[min(340px,calc(100vw-40px))] transition duration-200 lg:sticky lg:inset-y-auto lg:left-auto lg:top-24 lg:z-[10] lg:w-auto lg:self-start",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="shell-panel h-full overflow-y-auto border-r p-4 lg:min-h-[calc(100vh-8.5rem)] lg:rounded-[2rem] lg:p-3.5">
            <div className="mb-3 rounded-[1.5rem] border border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.6))] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-3">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                  <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.8} />
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.72)] text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)] lg:hidden"
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
              {role && (
                <span className="mt-3 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {t.admin.roleLabels[role]}
                </span>
              )}
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
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <section className={["w-full pb-8", maxWidth].join(" ")}>
          <div className="mb-6 rounded-[2rem] border border-[rgba(31,92,70,0.13)] bg-[linear-gradient(135deg,rgba(250,255,240,0.92),rgba(255,254,248,0.94))] p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                {eyebrow || t.admin.secureManagement}
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
          <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(246,242,233,0.72)] px-4 py-3 text-sm text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)]">
            {t.admin.privateNote}
          </div>
        </section>
      </main>
    </div>
  );
}
