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
    <header className="app-topbar-sticky topbar-surface">
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1360px] items-center justify-between gap-1.5 px-2 py-2 sm:min-h-[74px] sm:gap-3 sm:px-8 sm:py-3">
        <div className="flex min-w-0 flex-[1_1_auto] items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.92)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-soft)] sm:h-10 sm:w-10 lg:hidden"
            aria-label={menuLabel}
          >
            <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
          <div className="min-w-0 flex-[1_1_132px]">
            <BrandLogo
              size="sm"
              className="max-w-[132px] gap-1.5 sm:max-w-none sm:gap-3 [&>span:last-child>span:first-child]:text-[14px] sm:[&>span:last-child>span:first-child]:text-[15px] md:[&>span:first-child]:!h-10 md:[&>span:first-child]:!w-10"
            />
          </div>
          <span className="hidden rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:inline-flex">
            {badgeLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <LanguageSelector compact />
          <Link
            href={accountHref}
            aria-label={accountLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.92)] p-0.5 shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:shadow-[var(--shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)] min-[390px]:h-9 min-[390px]:w-9 min-[390px]:p-1 sm:h-auto sm:w-auto sm:min-h-10 sm:gap-2 sm:px-2.5 sm:py-1.5"
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.82)] text-[var(--foreground-subtle)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)] sm:h-10 sm:w-10"
            aria-label={logoutLabel}
          >
            <LogOut aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
