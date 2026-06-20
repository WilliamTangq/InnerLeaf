"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Archive,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PenLine,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppTopbar } from "./app-topbar";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { resolveRoleAwareNextPath } from "../lib/routes";
import { LoadingCard } from "./ui";

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

  useEffect(() => {
    if (isAdmin) {
      router.replace(resolveRoleAwareNextPath(pathname, "admin"));
    }
  }, [isAdmin, pathname, router]);

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

  if (isAdmin) {
    return (
      <div className="page-glow min-h-screen px-5 py-10 text-[var(--foreground)] sm:px-8">
        <LoadingCard label={t.auth.loadingSession} />
      </div>
    );
  }

  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <AppTopbar
        accountHref="/dashboard/account"
        accountLabel={t.nav.openAccountMenu}
        avatarUrl={profile?.avatar_url}
        badgeLabel={t.app.workspaceBadge}
        displayName={displayName}
        email={user?.email}
        logoutLabel={t.nav.logout}
        menuLabel={t.nav.menu}
        onLogout={() => void logOut()}
        onMenu={() => setSidebarOpen(true)}
      />

      <main className="mx-auto grid w-full max-w-[1360px] flex-1 gap-7 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[258px_1fr]">
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
            "fixed inset-y-0 left-0 z-[9999] w-[min(330px,calc(100vw-40px))] transition duration-200 lg:sticky lg:inset-y-auto lg:left-auto lg:top-24 lg:z-[10] lg:w-auto lg:self-start",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="shell-panel h-full overflow-y-auto border-r p-4 lg:min-h-[calc(100vh-8.5rem)] lg:rounded-[2rem] lg:p-3.5">
            <div className="mb-3 rounded-[1.5rem] border border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.68))] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t.app.title}
                </p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.72)] text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)] lg:hidden"
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
              className="flex flex-col gap-1.5"
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
                  onClick={() => {
                    setSidebarOpen(false);
                    if (link.href === pathname && link.href === "/dashboard/quick") {
                      window.dispatchEvent(
                        new Event("innerleaf:new-quick-reflection")
                      );
                    }
                  }}
                />
              ))}
              <div className="min-w-px border-l border-[var(--border)] lg:my-2 lg:border-l-0 lg:border-t" />
              <button
                type="button"
                onClick={() => void logOut()}
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[rgba(255,254,248,0.76)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>{t.nav.logout}</span>
              </button>
            </nav>
          </div>
        </aside>

        <section className={["w-full pb-8", maxWidth].join(" ")}>{children}</section>
      </main>
    </div>
  );
}
