"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { Avatar } from "./avatar";
import { BrandLogo } from "./brand-logo";
import { LanguageSelector } from "./language-provider";

export function AppTopbar({
  accountHref,
  accountLabel,
  avatarUrl,
  badgeLabel,
  displayName,
  email,
  isAdmin = false,
  logoutLabel,
  menuLabel,
  onLogout,
  onMenu,
  roleChip,
}: {
  accountHref: string;
  accountLabel: string;
  avatarUrl?: string | null;
  badgeLabel: string;
  displayName: string;
  email?: string | null;
  isAdmin?: boolean;
  logoutLabel: string;
  menuLabel: string;
  onLogout: () => void;
  onMenu: () => void;
  roleChip?: string;
}) {
  return (
    <header className="topbar-surface sticky top-0 z-[1200]">
      <div className="mx-auto flex min-h-[74px] w-full max-w-[1360px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.92)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-soft)] lg:hidden"
            aria-label={menuLabel}
          >
            <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
          <BrandLogo size="md" />
          <span className="hidden rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:inline-flex">
            {badgeLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSelector />
          <Link
            href={accountHref}
            aria-label={accountLabel}
            className="flex min-h-10 items-center gap-2 rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.92)] px-2.5 py-1.5 shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:shadow-[var(--shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
          >
            <Avatar
              avatarUrl={avatarUrl ?? ""}
              displayName={displayName}
              email={email}
              isAdmin={isAdmin}
              size="sm"
            />
            <span className="hidden max-w-32 truncate text-sm font-semibold text-[var(--foreground)] md:inline">
              {displayName}
            </span>
            {roleChip && (
              <span className="hidden rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-teal-deep)] lg:inline-flex">
                {roleChip}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.92)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            aria-label={logoutLabel}
          >
            <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
