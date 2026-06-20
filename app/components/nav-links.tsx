"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  History as HistoryIcon,
  Info,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquare,
  NotebookPen,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentType, ReactNode } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";
import { useAuth } from "./auth-provider";
import { Avatar } from "./avatar";
import { BrandLogo } from "./brand-logo";
import { trackEvent } from "../lib/analytics";

const publicDesktopLinks = [
  { href: "/students", key: "forStudents" },
  { href: "/pricing", key: "pricing" },
] as const;

type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
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

type MegaItem = {
  title: string;
  description: string;
  href: string;
  icon: IconType;
};

type MegaSection = {
  title: string;
  items: MegaItem[];
};

function MegaPanel({
  close,
  sections,
}: {
  close: () => void;
  sections: MegaSection[];
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgb(255,255,248)] p-4 shadow-[0_28px_90px_rgba(20,35,28,0.18)]">
      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-[22px] bg-[rgba(247,246,243,0.62)] p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={close}
                    className="group flex gap-3 rounded-2xl p-3 transition duration-200 hover:bg-[rgba(230,245,243,0.72)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(31,155,143,0.14)] bg-[rgba(255,255,255,0.58)] text-[var(--brand-teal-deep)] transition group-hover:bg-[var(--surface)]">
                      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-[var(--foreground)]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--foreground-subtle)]">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MegaOverlayPortal({
  close,
  sections,
}: {
  close: () => void;
  sections: MegaSection[];
}) {
  const overlay: ReactNode = (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={close}
        className="fixed inset-x-0 bottom-0 top-[68px] z-[910] hidden bg-[rgba(20,35,28,0.08)] lg:block"
      />
      <div className="fixed left-1/2 top-[82px] z-[920] hidden w-[min(980px,calc(100vw-64px))] -translate-x-1/2 lg:block">
        <MegaPanel close={close} sections={sections} />
      </div>
    </>
  );

  return typeof document === "undefined" ? null : createPortal(overlay, document.body);
}

function MegaTrigger({
  active,
  label,
  open,
  onClick,
}: {
  active: boolean;
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={onClick}
        className={[
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
          open
            ? "bg-[rgba(31,155,143,0.12)] text-[var(--brand-teal-deep)] shadow-[inset_0_0_0_1px_rgba(31,155,143,0.16)]"
            : active
              ? "bg-[rgba(247,246,243,0.9)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(40,80,60,0.10)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        ].join(" ")}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.9}
          className={open ? "rotate-180 transition" : "transition"}
        />
      </button>
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
        <span className="block text-[15px] font-semibold leading-5">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[12px] font-normal leading-4 text-[var(--foreground-subtle)]">
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
    trackEvent("logout_clicked", {
      authenticated_state: true,
      role_bucket: isAdmin ? "admin" : "user",
    });
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
        className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.26)]"
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
          {!admin && (
            <MenuSection title={t.menu.sections.workspace}>
              <CommandLink
                href="/dashboard"
                icon={LayoutDashboard}
                active={isActive(pathname, "/dashboard")}
                label={t.nav.workspace}
                description={t.menu.descriptions.workspace}
                onClick={close}
              />
            </MenuSection>
          )}

          <MenuSection title={t.menu.sections.account}>
            <CommandLink
              href={admin ? "/admin/account" : "/dashboard/account"}
              icon={UserRound}
              active={isActive(
                pathname,
                admin ? "/admin/account" : "/dashboard/account"
              )}
              label={t.account.settings}
              description={t.menu.descriptions.account}
              onClick={close}
            />
          </MenuSection>

          {admin && (
            <MenuSection title={t.menu.sections.admin}>
              <CommandLink
                href="/admin"
                icon={ShieldCheck}
                active={isActive(pathname, "/admin")}
                label={t.app.openAdmin}
                description={t.menu.descriptions.adminOverview}
                onClick={close}
              />
              <CommandLink
                href="/dashboard"
                icon={LayoutDashboard}
                active={isActive(pathname, "/dashboard")}
                label={t.nav.workspace}
                description={t.menu.descriptions.workspace}
                onClick={close}
              />
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

function MobileAccordion({
  defaultOpen = false,
  sections,
  title,
  pathname,
  close,
}: {
  defaultOpen?: boolean;
  sections: MegaSection[];
  title: string;
  pathname: string;
  close: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[rgba(247,246,243,0.72)] p-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl px-3 text-left text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
      >
        {title}
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={1.9}
          className={expanded ? "rotate-180 transition" : "transition"}
        />
      </button>
      {expanded && (
        <div className="mt-2 space-y-4 px-1 pb-1">
          {sections.map((section) => (
            <MenuSection key={section.title} title={section.title}>
              {section.items.map((item) => (
                <CommandLink
                  key={item.title}
                  href={item.href}
                  icon={item.icon}
                  active={isActive(pathname, item.href)}
                  label={item.title}
                  description={item.description}
                  onClick={close}
                />
              ))}
            </MenuSection>
          ))}
        </div>
      )}
    </div>
  );
}

function PublicMobileDrawerPortal({
  close,
  menuId,
  pathname,
  productSections,
  resourceSections,
  t,
}: {
  close: () => void;
  menuId: string;
  pathname: string;
  productSections: MegaSection[];
  resourceSections: MegaSection[];
  t: ReturnType<typeof useLanguage>["t"];
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEscapeToClose(true, close);

  const drawer: ReactNode = (
    <>
      <button
        type="button"
        aria-label={t.nav.menu}
        onClick={close}
        className="fixed inset-0 z-[9998] bg-[rgba(20,35,28,0.30)]"
      />
      <aside
        id={menuId}
        role="menu"
        aria-label={t.nav.menu}
        className="fixed inset-y-3 right-3 z-[9999] flex w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgb(255,255,248)] shadow-[0_32px_110px_rgba(20,35,28,0.24)] motion-safe:animate-[menuIn_180ms_ease-out] sm:hidden"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              type="button"
              aria-label={t.nav.menu}
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          <MobileAccordion
            title={t.nav.product}
            sections={productSections}
            pathname={pathname}
            close={close}
            defaultOpen
          />
          <MobileAccordion
            title={t.nav.resources}
            sections={resourceSections}
            pathname={pathname}
            close={close}
          />
          <MenuSection title={t.publicNav.more}>
            <CommandLink
              href="/students"
              icon={GraduationCap}
              active={isActive(pathname, "/students")}
              label={t.nav.forStudents}
              description={t.students.short}
              onClick={close}
            />
            <CommandLink
              href="/pricing"
              icon={ShieldCheck}
              active={isActive(pathname, "/pricing")}
              label={t.nav.pricing}
              description={t.pricing.short}
              onClick={close}
            />
            <CommandLink
              href="/demo"
              icon={Sparkles}
              active={isActive(pathname, "/demo")}
              label={t.nav.demo}
              description={t.publicNav.items.demo.description}
              onClick={close}
            />
            <CommandLink
              href="/login"
              icon={LayoutDashboard}
              active={false}
              label={t.nav.dashboard}
              description={t.publicNav.dashboardHint}
              onClick={() => {
                trackEvent("header_dashboard_clicked", {
                  authenticated_state: false,
                  role_bucket: "logged_out",
                });
                close();
              }}
            />
          </MenuSection>
        </div>

        <div className="grid gap-2 border-t border-[var(--border)] p-3">
          <Link
            href="/register"
            role="menuitem"
            onClick={() => {
              trackEvent("header_get_started_clicked", {
                authenticated_state: false,
                role_bucket: "logged_out",
              });
              close();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-teal)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
          >
            {t.common.getStarted}
          </Link>
          <Link
            href="/login"
            role="menuitem"
            onClick={() => {
              trackEvent("header_login_clicked", {
                authenticated_state: false,
                role_bucket: "logged_out",
              });
              close();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
          >
            {t.nav.login}
          </Link>
        </div>
      </aside>
    </>
  );

  return typeof document === "undefined" ? null : createPortal(drawer, document.body);
}

export function NavLinks() {
  const pathname = usePathname();
  const menuId = useId();
  const { language, t } = useLanguage();
  const { isAdmin, loading, profile, role, signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<"product" | "resources" | null>(
    null
  );
  useEscapeToClose(open && !user, () => setOpen(false));
  useEscapeToClose(megaOpen !== null, () => setMegaOpen(null));
  useEffect(() => {
    queueMicrotask(() => {
      setMegaOpen(null);
      setOpen(false);
    });
  }, [pathname]);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    function closeDesktopMenu(event: MediaQueryListEvent) {
      if (event.matches) {
        setMegaOpen(null);
      }
    }

    mediaQuery.addEventListener("change", closeDesktopMenu);

    return () => {
      mediaQuery.removeEventListener("change", closeDesktopMenu);
    };
  }, []);
  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;
  const avatarUrl = profile?.avatar_url || "";
  const roleText = !loading && profile && role ? t.admin.roleLabels[role] : "";
  const defaultRoute = user ? (isAdmin ? "/admin" : "/dashboard") : "/login";
  const privateHref = (href: string) =>
    user ? href : `/login?next=${encodeURIComponent(href)}`;
  const productSections: MegaSection[] = [
    {
      title: t.publicNav.productSections.reflect,
      items: [
        {
          title: t.publicNav.items.quick.title,
          description: t.publicNav.items.quick.description,
          href: privateHref("/dashboard/quick"),
          icon: PenLine,
        },
        {
          title: t.publicNav.items.guided.title,
          description: t.publicNav.items.guided.description,
          href: privateHref("/dashboard/guided"),
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: t.publicNav.productSections.review,
      items: [
        {
          title: t.publicNav.items.history.title,
          description: t.publicNav.items.history.description,
          href: privateHref("/dashboard/history"),
          icon: HistoryIcon,
        },
        {
          title: t.publicNav.items.summary.title,
          description: t.publicNav.items.summary.description,
          href: privateHref("/dashboard/summary"),
          icon: Layers3,
        },
      ],
    },
    {
      title: t.publicNav.productSections.followUp,
      items: [
        {
          title: t.publicNav.items.checkIn.title,
          description: t.publicNav.items.checkIn.description,
          href: privateHref("/dashboard/history"),
          icon: MessageSquare,
        },
        {
          title: t.publicNav.items.demo.title,
          description: t.publicNav.items.demo.description,
          href: "/demo",
          icon: Sparkles,
        },
      ],
    },
  ];
  const resourceSections: MegaSection[] = [
    {
      title: t.publicNav.resourceSections.learn,
      items: [
        {
          title: t.publicNav.items.how.title,
          description: t.publicNav.items.how.description,
          href: "/#how-it-works",
          icon: BookOpen,
        },
        {
          title: t.publicNav.items.faq.title,
          description: t.publicNav.items.faq.description,
          href: "/faq",
          icon: HelpCircle,
        },
        {
          title: t.publicNav.items.privacy.title,
          description: t.publicNav.items.privacy.description,
          href: "/privacy",
          icon: LockKeyhole,
        },
      ],
    },
    {
      title: t.publicNav.resourceSections.explore,
      items: [
        {
          title: t.publicNav.items.demo.title,
          description: t.publicNav.items.demo.description,
          href: "/demo",
          icon: Sparkles,
        },
        {
          title: t.publicNav.items.test.title,
          description: t.publicNav.items.test.description,
          href: "/test",
          icon: NotebookPen,
        },
        {
          title: t.publicNav.items.feedback.title,
          description: t.publicNav.items.feedback.description,
          href: "/feedback",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: t.publicNav.resourceSections.about,
      items: [
        {
          title: t.publicNav.items.about.title,
          description: t.publicNav.items.about.description,
          href: "/about",
          icon: Info,
        },
        {
          title: t.publicNav.items.founder.title,
          description: t.publicNav.items.founder.description,
          href: "/about",
          icon: UserRound,
        },
        {
          title: t.publicNav.items.structured.title,
          description: t.publicNav.items.structured.description,
          href: "/#why-innerleaf",
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
      <nav
        aria-label="Main"
        className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex"
      >
        <MegaTrigger
          label={t.nav.product}
          active={isActive(pathname, "/dashboard/quick") || isActive(pathname, "/demo")}
          open={megaOpen === "product"}
          onClick={() =>
            setMegaOpen((current) => (current === "product" ? null : "product"))
          }
        />
        <MegaTrigger
          label={t.nav.resources}
          active={
            isActive(pathname, "/faq") ||
            isActive(pathname, "/privacy") ||
            isActive(pathname, "/about") ||
            isActive(pathname, "/test") ||
            isActive(pathname, "/feedback")
          }
          open={megaOpen === "resources"}
          onClick={() =>
            setMegaOpen((current) =>
              current === "resources" ? null : "resources"
            )
          }
        />
        <div className="flex items-center gap-0.5">
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
        </div>
      </nav>

      {megaOpen && (
        <MegaOverlayPortal
          close={() => setMegaOpen(null)}
          sections={megaOpen === "product" ? productSections : resourceSections}
        />
      )}

      {user && (
        <Link
          href={defaultRoute}
          onClick={() =>
            trackEvent("header_dashboard_clicked", {
              locale: language,
              authenticated_state: true,
              role_bucket: role ?? "user",
            })
          }
          className="hidden rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.72)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] md:inline-flex"
        >
          {isAdmin ? t.admin.overview : t.nav.workspace}
        </Link>
      )}

      <LanguageSelector />

      <div className="relative">
        {!user && (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/demo"
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {t.nav.demo}
            </Link>
            <Link
              href="/login"
              onClick={() =>
                trackEvent("header_dashboard_clicked", {
                  locale: language,
                  authenticated_state: false,
                  role_bucket: "logged_out",
                })
              }
              className="rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.72)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {t.nav.dashboard}
            </Link>
            <Link
              href="/login"
              onClick={() =>
                trackEvent("header_login_clicked", {
                  locale: language,
                  authenticated_state: false,
                  role_bucket: "logged_out",
                })
              }
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              onClick={() =>
                trackEvent("header_get_started_clicked", {
                  locale: language,
                  authenticated_state: false,
                  role_bucket: "logged_out",
                })
              }
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-teal)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition duration-200 hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              {t.common.getStarted}
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
            "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,248,0.95)] px-2.5 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition duration-200 hover:bg-[var(--surface-muted)] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
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
          <PublicMobileDrawerPortal
            close={() => setOpen(false)}
            menuId={menuId}
            pathname={pathname}
            productSections={productSections}
            resourceSections={resourceSections}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
