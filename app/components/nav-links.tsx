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
import { useEffect, useId, useRef, useState } from "react";
import type { ComponentType } from "react";
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
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--brand-teal-deep)]",
        isAdmin ? "ring-2 ring-[rgba(31,155,143,0.24)]" : "",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-12 w-12 text-sm",
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
        "group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        active
          ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
          active
            ? "border-[rgba(31,155,143,0.18)] bg-[var(--surface)] text-[var(--brand-teal-deep)]"
            : "border-[var(--border)] bg-[rgba(255,255,255,0.45)] text-[var(--foreground-subtle)] group-hover:text-[var(--brand-teal-deep)]",
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        {description && (
          <span className="mt-0.5 block truncate text-xs font-normal text-[var(--foreground-subtle)]">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const { t } = useLanguage();
  const { isAdmin, profile, role, signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useDismissMenu(open, () => setOpen(false));
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;
  const avatarUrl = profile?.avatar_url || "";
  const roleText = t.admin.roleLabels[role];

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

      <div className="relative" ref={menuRef}>
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

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label={user ? t.nav.openAccountMenu : t.nav.menu}
            className="absolute right-0 top-12 z-50 max-h-[calc(100vh-5rem)] w-[min(22rem,calc(100vw-1.5rem))] origin-top-right overflow-y-auto rounded-[1.5rem] border border-[rgba(40,80,60,0.12)] bg-[rgba(255,255,248,0.96)] p-2.5 shadow-[0_28px_90px_rgba(26,34,32,0.16)] backdrop-blur-2xl motion-safe:animate-[menuIn_180ms_ease-out]"
          >
            {user ? (
              <>
                <div className="mb-3 rounded-[1.15rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,248,0.9),rgba(232,246,241,0.62))] p-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar
                      avatarUrl={avatarUrl}
                      displayName={profile?.display_name}
                      email={user.email}
                      isAdmin={isAdmin}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--foreground-subtle)]">
                        {user.email}
                      </p>
                      <span className="mt-2 inline-flex rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                        {roleText}
                      </span>
                    </div>
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
                        onClick={() => setOpen(false)}
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
                          link.label === "account"
                            ? t.account.settings
                            : t.nav[link.label]
                        }
                        description={t.menu.descriptions[link.desc]}
                        onClick={() => setOpen(false)}
                      />
                    ))}
                  </MenuSection>

                  {isAdmin && (
                    <MenuSection title={t.menu.sections.admin}>
                      {adminLinks.map((link) => (
                        <CommandLink
                          key={link.href}
                          href={link.href}
                          icon={link.icon}
                          active={isActive(pathname, link.href)}
                          label={t.admin[link.label]}
                          description={t.menu.descriptions[link.desc]}
                          onClick={() => setOpen(false)}
                        />
                      ))}
                    </MenuSection>
                  )}

                  <MenuSection title={t.menu.sections.session}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void logOut()}
                      className="group flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.45)] text-[var(--foreground-subtle)] group-hover:text-[var(--brand-teal-deep)]"
                        aria-hidden="true"
                      >
                        <LogOut size={16} strokeWidth={1.8} />
                      </span>
                      <span className="text-sm font-semibold">{t.nav.logout}</span>
                    </button>
                  </MenuSection>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
