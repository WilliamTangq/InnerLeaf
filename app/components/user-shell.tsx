"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Archive,
  Leaf,
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
import { AppMobileDrawer } from "./app-mobile-drawer";
import { AppTopbar } from "./app-topbar";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { resolveRoleAwareNextPath } from "../lib/routes";
import { trackEvent } from "../lib/analytics";
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
          ? "bg-[linear-gradient(135deg,rgba(231,244,239,0.98),rgba(255,248,226,0.42))] text-[var(--brand-teal-deep)] shadow-[inset_0_0_0_1px_rgba(31,155,143,0.15),0_8px_24px_rgba(17,111,104,0.08)]"
          : "text-[var(--foreground-muted)] hover:bg-[rgba(255,254,248,0.78)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-sm)]",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

function UserSidebarContent({
  onClose,
  onLogout,
  pathname,
  role,
  t,
}: {
  onClose: () => void;
  onLogout: () => void;
  pathname: string;
  role: "user" | "admin" | "tester" | null;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  return (
    <div className="shell-panel flex h-full max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-[1.35rem] p-2 lg:max-h-none lg:min-h-[calc(100vh-8.25rem)] lg:rounded-[1.7rem] lg:p-2.5">
      <div className="mb-2 rounded-[1.1rem] border border-[rgba(31,155,143,0.12)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.54))] p-2.5 shadow-[var(--shadow-sm)] lg:mb-2.5 lg:p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)] lg:h-9 lg:w-9">
              <Leaf aria-hidden="true" size={16} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t.app.title}
              </p>
              {role && (
                <span className="mt-1 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.76)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand-teal-deep)]">
                  {t.admin.roleLabels[role]}
                </span>
              )}
            </div>
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
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--foreground-subtle)]">
          {t.app.privacy}
        </p>
      </div>
      <nav
        aria-label={t.app.title}
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5 lg:gap-1"
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
              onClose();
              if (link.href === pathname && link.href === "/dashboard/quick") {
                window.dispatchEvent(new Event("innerleaf:new-quick-reflection"));
              }
            }}
          />
        ))}
        <div className="min-w-px border-l border-[var(--border)] lg:my-2.5 lg:border-l-0 lg:border-t" />
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[rgba(255,254,248,0.76)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>{t.nav.logout}</span>
        </button>
      </nav>
    </div>
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
  const { language, t } = useLanguage();
  const { isAdmin, profile, role, signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;

  async function logOut() {
    trackEvent("logout_clicked", {
      locale: language,
      authenticated_state: true,
      role_bucket: role ?? "user",
    });
    await signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (isAdmin) {
      router.replace(resolveRoleAwareNextPath(pathname, "admin"));
    }
  }, [isAdmin, pathname, router]);

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
      <AppMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        label={t.nav.menu}
      >
        <UserSidebarContent
          onClose={() => setSidebarOpen(false)}
          onLogout={() => void logOut()}
          pathname={pathname}
          role={role}
          t={t}
        />
      </AppMobileDrawer>

      <main className="mx-auto grid w-full max-w-[1360px] flex-1 gap-4 px-3 py-3 sm:px-7 sm:py-6 lg:grid-cols-[244px_1fr] lg:gap-5">
        <aside className="hidden lg:sticky lg:top-24 lg:z-[10] lg:block lg:self-start">
          <UserSidebarContent
            onClose={() => setSidebarOpen(false)}
            onLogout={() => void logOut()}
            pathname={pathname}
            role={role}
            t={t}
          />
        </aside>

        <section className={["w-full pb-6 sm:pb-7", maxWidth].join(" ")}>{children}</section>
      </main>
    </div>
  );
}
