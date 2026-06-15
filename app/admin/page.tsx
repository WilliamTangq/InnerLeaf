"use client";

import { FileText, Inbox, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminMetricCard, AdminShell } from "../components/admin-shell";
import { RequireAdmin } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { Card, StatusCard } from "../components/ui";

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

  return (
    <AdminShell title={t.admin.overview} purpose={t.admin.overviewPurpose}>
      {error && <StatusCard tone="error">{error}</StatusCard>}

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t.admin.systemTitle}
          </h2>
          <div className="mt-4 grid gap-3">
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

      <div className="mt-6">
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
