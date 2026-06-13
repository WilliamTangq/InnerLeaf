"use client";

import Link from "next/link";
import {
  Archive,
  ChevronDown,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  PenLine,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentType, ReactNode } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";
import { useAuth } from "./auth-provider";

const publicDesktopLinks = [
  { href: "/", key: "home" },
  { href: "/demo", key: "demo" },
  { href: "/test", key: "test" },
  { href: "/faq", key: "faq" },
  { href: "/privacy", key: "privacy" },
] as const;

const publicMenuLinks = [
  { href: "/", key: "home", icon: LayoutDashboard },
  { href: "/demo", key: "demo", icon: Sparkles },
  { href: "/test", key: "test", icon: PenLine },
  { href: "/faq", key: "faq", icon: MessageSquare },
  { href: "/privacy", key: "privacy", icon: Shield },
  { href: "/feedback", key: "feedback", icon: MessageSquare },
] as const;

const workspaceLinks = [
  {
    href: "/app",
    label: "workspace",
    desc: "workspace",
    icon: LayoutDashboard,
  },
  { href: "/quick", label: "quick", desc: "quick", icon: Sparkles },
  { href: "/guided", label: "guided", desc: "guided", icon: ListChecks },
  { href: "/history", label: "history", desc: "history", icon: Archive },
  { href: "/summary", label: "summary", desc: "summary", icon: TrendingUp },
] as const;

const accountLinks = [
  { href: "/account", label: "account", desc: "account", icon: UserRound },
  { href: "/feedback", label: "feedback", desc: "feedback", icon: MessageSquare },
  { href: "/privacy", label: "privacy", desc: "privacy", icon: Shield },
] as const;

const adminLinks = [
  {
    href: "/admin",
    label: "overview",
    desc: "adminOverview",
    icon: ShieldCheck,
  },
  { href: "/admin/users", label: "users", desc: "adminUsers", icon: Users },
  {
    href: "/admin/feedback",
    label: "feedback",
    desc: "adminFeedback",
    icon: MessageSquare,
  },
  { href: "/admin/system", label: "system", desc: "adminSystem", icon: Settings },
] as const;

type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

function initials(name?: string | null, email?: string | null) {
  const value = name || email?.split("@")[0] || "InnerLeaf";
  const letters = value
    .split(/\s|[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "IL";
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Avatar({
  avatarUrl,
  displayName,
  email,
  isAdmin,
  size = "md",
}: {
  avatarUrl?: string;
  displayName?: string | null;
  email?: string | null;
  isAdmin?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--brand-teal-deep)]",
        isAdmin ? "ring-2 ring-[rgba(31,155,143,0.24)]" : "",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-12 w-12 text-sm",
        size === "xl" && "h-[52px] w-[52px] text-sm",
      ].join(" ")}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(displayName, email)
      )}
    </span>
  );
}

function useEscapeToClose(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CommandLink({
  href,
  icon: Icon,
  active,
  label,
  description,
  onClick,
}: {
  href: string;
  icon: IconType;
  active: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={[
        "group flex min-h-[52px] items-center gap-2.5 rounded-xl px-2.5 py-2 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        active
          ? "bg-[rgba(230,245,243,0.72)] text-[var(--brand-teal-deep)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
          active
            ? "border-[rgba(31,155,143,0.18)] bg-[var(--surface)] text-[var(--brand-teal-deep)]"
            : "border-[var(--border)] bg-[rgba(255,255,255,0.45)] text-[var(--foreground-subtle)] group-hover:text-[var(--brand-teal-deep)]",
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold leading-5">{label}</span>
        {description && (
          <span className="mt-0.5 block truncate text-[12px] font-normal leading-4 text-[var(--foreground-subtle)]">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}

function AccountDrawerPortal({
  admin,
  avatarUrl,
  close,
  displayName,
  email,
  isAdmin,
  menuId,
  pathname,
  roleText,
  signOut,
  t,
}: {
  admin: boolean;
  avatarUrl: string;
  close: () => void;
  displayName: string;
  email?: string | null;
  isAdmin: boolean;
  menuId: string;
  pathname: string;
  roleText: string;
  signOut: () => Promise<void>;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEscapeToClose(true, close);

  async function logOut() {
    await signOut();
    close();
    router.push("/");
    router.refresh();
  }

  const drawer: ReactNode = (
    <>
      <button
        type="button"
        aria-label={t.nav.menu}
        onClick={close}
        className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.08)] backdrop-blur-[1px]"
      />
      <aside
        id={menuId}
        role="menu"
        aria-label={t.nav.openAccountMenu}
        className="fixed right-3 top-[72px] z-[9999] max-h-[calc(100vh-88px)] w-[calc(100vw-24px)] overflow-y-auto rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgb(255,255,248)] p-3 shadow-[0_32px_110px_rgba(20,35,28,0.24)] sm:right-6 sm:top-20 sm:max-h-[calc(100vh-96px)] sm:w-[min(380px,calc(100vw-48px))] motion-safe:animate-[menuIn_180ms_ease-out]"
      >
        <div className="mb-3 rounded-[22px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.72))] p-3">
          <div className="flex items-start gap-3">
            <Avatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              email={email}
              isAdmin={isAdmin}
              size="xl"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-[15px] font-semibold leading-5 text-[var(--foreground)]">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs leading-5 text-[var(--foreground-subtle)]">
                {email}
              </p>
              {roleText && (
                <span className="mt-2 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {roleText}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label={t.nav.menu}
              onClick={close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.62)] text-[var(--foreground-subtle)] transition duration-200 hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              <X aria-hidden="true" size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <MenuSection title={t.menu.sections.workspace}>
            {workspaceLinks.map((link) => (
              <CommandLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={isActive(pathname, link.href)}
                label={t.nav[link.label]}
                description={t.menu.descriptions[link.desc]}
                onClick={close}
              />
            ))}
          </MenuSection>

          <MenuSection title={t.menu.sections.account}>
            {accountLinks.map((link) => (
              <CommandLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={isActive(pathname, link.href)}
                label={
                  link.label === "account" ? t.account.settings : t.nav[link.label]
                }
                description={t.menu.descriptions[link.desc]}
                onClick={close}
              />
            ))}
          </MenuSection>

          {admin && (
            <MenuSection title={t.menu.sections.admin}>
              {adminLinks.map((link) => (
                <CommandLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  active={isActive(pathname, link.href)}
                  label={t.admin[link.label]}
                  description={t.menu.descriptions[link.desc]}
                  onClick={close}
                />
              ))}
            </MenuSection>
          )}

          <MenuSection title={t.menu.sections.session}>
            <button
              type="button"
              role="menuitem"
              onClick={() => void logOut()}
              className="group flex min-h-[52px] w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.45)] text-[var(--foreground-subtle)] group-hover:text-[var(--brand-teal-deep)]"
                aria-hidden="true"
              >
                <LogOut size={15} strokeWidth={1.8} />
              </span>
              <span className="text-[15px] font-semibold">{t.nav.logout}</span>
            </button>
          </MenuSection>
        </div>
      </aside>
    </>
  );

  return typeof document === "undefined" ? null : createPortal(drawer, document.body);
}

export function NavLinks() {
  const pathname = usePathname();
  const menuId = useId();
  const { t } = useLanguage();
  const { isAdmin, loading, profile, role, signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  useEscapeToClose(open && !user, () => setOpen(false));
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;
  const avatarUrl = profile?.avatar_url || "";
  const roleText = !loading && profile ? t.admin.roleLabels[role] : "";

  return (
    <div className="flex max-w-full items-center gap-2">
      {!user && (
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {publicDesktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "rounded-lg px-3 py-2 text-sm whitespace-nowrap transition duration-200",
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
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] md:inline-flex"
        >
          {t.nav.workspace}
        </Link>
      )}

      <LanguageSelector />

      <div className="relative">
        {!user && (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
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
          aria-label={user ? t.nav.openAccountMenu : t.nav.menu}
          aria-controls={menuId}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={[
            "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.78)] px-2.5 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] backdrop-blur-xl transition duration-200 hover:bg-[var(--surface-muted)] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
            user ? "" : "sm:hidden",
          ].join(" ")}
        >
          {user ? (
            <>
              <Avatar
                avatarUrl={avatarUrl}
                displayName={profile?.display_name}
                email={user.email}
                isAdmin={isAdmin}
                size="sm"
              />
              <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                {displayName}
              </span>
              <ChevronDown
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className={[
                  "text-[var(--foreground-subtle)] transition duration-200",
                  open ? "rotate-180" : "",
                ].join(" ")}
              />
            </>
          ) : open ? (
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
          )}
        </button>

        {open && user && (
          <AccountDrawerPortal
            admin={isAdmin}
            avatarUrl={avatarUrl}
            close={() => setOpen(false)}
            displayName={displayName}
            email={user.email}
            isAdmin={isAdmin}
            menuId={menuId}
            pathname={pathname}
            roleText={roleText}
            signOut={signOut}
            t={t}
          />
        )}

        {open && !user && (
          <>
            <button
              type="button"
              aria-label={t.nav.menu}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.08)] backdrop-blur-[1px] sm:hidden"
            />
            <div
              id={menuId}
              role="menu"
              aria-label={t.nav.menu}
              className="fixed right-3 top-[72px] z-[9999] max-h-[calc(100vh-88px)] w-[calc(100vw-24px)] overflow-y-auto rounded-[24px] border border-[rgba(40,80,60,0.14)] bg-[rgb(255,255,248)] p-3 shadow-[0_28px_90px_rgba(20,35,28,0.20)] motion-safe:animate-[menuIn_180ms_ease-out] sm:hidden"
            >
              <MenuSection title={t.menu.sections.product}>
                {publicMenuLinks.map((link) => (
                  <CommandLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    active={isActive(pathname, link.href)}
                    label={t.nav[link.key]}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </MenuSection>
              <div className="mt-3 grid gap-2 border-t border-[var(--border)] pt-3">
                <Link
                  href="/register"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-teal)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                >
                  {t.common.createAccount}
                </Link>
                <Link
                  href="/login"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                >
                  {t.nav.login}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
