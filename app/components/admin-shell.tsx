"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Footer, TopNav } from "./ui";
import { useLanguage } from "./language-provider";

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
] as const;

function isActive(pathname: string, href: string) {
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
  const { t } = useLanguage();

  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <TopNav />
      <main className="mx-auto grid w-full max-w-[1320px] flex-1 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgba(255,255,248,0.86)] p-3 shadow-[0_24px_80px_rgba(20,35,28,0.10)] backdrop-blur-xl">
            <div className="mb-3 rounded-[22px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.72))] p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t.admin.consoleTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-subtle)]">
                {t.admin.privateNote}
              </p>
            </div>

            <nav
              aria-label={t.admin.consoleTitle}
              className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
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
              <div className="min-w-px border-l border-[var(--border)] lg:my-2 lg:border-l-0 lg:border-t" />
              <AdminNavLink
                href="/app"
                icon={ArrowLeft}
                label={t.admin.backWorkspace}
                active={false}
              />
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
