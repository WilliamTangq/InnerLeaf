"use client";

import Link from "next/link";
import { FileText, Inbox, Settings, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminMetricCard, AdminShell } from "../components/admin-shell";
import { RequireAdmin } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { Card, MiniBar, StatusCard } from "../components/ui";

type Overview = {
  totalUsers: number;
  totalTesters: number;
  totalAdmins: number;
  totalFeedback: number;
  totalReflections: number;
  usersLast7Days: number;
  reflectionsLast7Days: number;
  feedbackLast7Days: number;
};

const statusItems = [
  "authMode",
  "googleLogin",
  "reflectionAccess",
  "privacyMode",
  "demoMode",
] as const;

function AdminOverviewContent() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      if (!session?.access_token) {
        return;
      }

      try {
        const response = await fetch("/api/admin/overview", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Admin unavailable");
        }

        setOverview(data);
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadOverview();
  }, [session?.access_token, t.admin.unavailable]);

  const stats = overview
    ? [
        { label: t.admin.totalUsers, value: overview.totalUsers, icon: Users },
        { label: t.admin.totalTesters, value: overview.totalTesters, icon: UserCheck },
        { label: t.admin.totalAdmins, value: overview.totalAdmins, icon: ShieldCheck },
        { label: t.admin.totalFeedback, value: overview.totalFeedback, icon: Inbox },
        { label: t.admin.totalReflections, value: overview.totalReflections, icon: FileText },
        { label: t.admin.users7d, value: overview.usersLast7Days, icon: Users },
        { label: t.admin.reflections7d, value: overview.reflectionsLast7Days, icon: FileText },
        { label: t.admin.feedback7d, value: overview.feedbackLast7Days, icon: Inbox },
      ]
    : [];
  const activityMax = overview
    ? Math.max(
        overview.usersLast7Days,
        overview.reflectionsLast7Days,
        overview.feedbackLast7Days,
        1
      )
    : 1;

  return (
    <AdminShell title={t.admin.overview} purpose={t.admin.overviewPurpose}>
      {error && <StatusCard tone="error">{error}</StatusCard>}

      {overview && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map(({ label, value, icon }) => (
            <AdminMetricCard
              key={label}
              label={label}
              value={value}
              icon={icon}
            />
          ))}
        </div>
      )}

      {overview && (
        <Card className="mt-4 hover:translate-y-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {t.admin.overview}
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-[var(--foreground-subtle)]">
                {t.admin.overviewPurpose}
              </p>
            </div>
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 lg:max-w-2xl">
              <MiniBar
                label={t.admin.users7d}
                value={overview.usersLast7Days}
                max={activityMax}
                unitLabel="users"
              />
              <MiniBar
                label={t.admin.reflections7d}
                value={overview.reflectionsLast7Days}
                max={activityMax}
                unitLabel="cards"
              />
              <MiniBar
                label={t.admin.feedback7d}
                value={overview.feedbackLast7Days}
                max={activityMax}
                unitLabel="entries"
              />
            </div>
          </div>
        </Card>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {[
          {
            title: t.admin.usersTitle,
            body: t.admin.usersPurpose,
            href: "/admin/users",
            icon: Users,
          },
          {
            title: t.admin.feedbackTitle,
            body: t.admin.feedbackPurpose,
            href: "/admin/feedback",
            icon: Inbox,
          },
          {
            title: t.admin.systemTitle,
            body: t.admin.systemPurpose,
            href: "/admin/system",
            icon: Settings,
          },
          {
            title: t.admin.adminAccountNav,
            body: t.account.adminAccountBody,
            href: "/admin/account",
            icon: ShieldCheck,
          },
        ].map(({ title, body, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(31,155,143,0.22)] hover:shadow-[var(--shadow-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
            </span>
            <span className="block text-base font-semibold text-[var(--foreground)]">
              {title}
            </span>
            <span className="mt-1.5 block line-clamp-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {body}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.admin.systemTitle}
          </h2>
          <div className="mt-3 grid gap-2">
            {statusItems.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2"
              >
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.admin[key]}
                </span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {key === "googleLogin"
                    ? t.admin.disabled
                    : key === "authMode"
                      ? "Email/password"
                      : key === "reflectionAccess"
                        ? t.admin.loginRequired
                        : key === "privacyMode"
                          ? t.admin.userSpecificHistory
                          : t.admin.staticDemoData}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>
          <StatusCard tone="neutral">{t.admin.turnstileTodo}</StatusCard>
        </div>
      </div>

      <div className="mt-4">
        <StatusCard tone="neutral">{t.admin.deleteDisabled}</StatusCard>
      </div>
    </AdminShell>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminOverviewContent />
    </RequireAdmin>
  );
}
