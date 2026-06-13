"use client";

import { MessageSquare, ShieldCheck, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAdmin } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatChip,
  StatusCard,
} from "../components/ui";

type Overview = {
  totalUsers: number;
  totalFeedback: number;
  totalReflections: number;
  usersLast7Days: number;
  reflectionsLast7Days: number;
  feedbackLast7Days: number;
};

const icons = [Users, MessageSquare, FileText, ShieldCheck, FileText, MessageSquare] as const;

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
        [t.admin.totalUsers, overview.totalUsers],
        [t.admin.totalFeedback, overview.totalFeedback],
        [t.admin.totalReflections, overview.totalReflections],
        [t.admin.users7d, overview.usersLast7Days],
        [t.admin.reflections7d, overview.reflectionsLast7Days],
        [t.admin.feedback7d, overview.feedbackLast7Days],
      ]
    : [];

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow={t.admin.title} title={t.admin.overview}>
        {t.admin.usersPurpose}
      </PageHeader>

      <PageActions>
        <LinkButton href="/admin/users">{t.admin.users}</LinkButton>
        <LinkButton href="/admin/feedback" variant="secondary">
          {t.admin.feedback}
        </LinkButton>
        <LinkButton href="/admin/system" variant="ghost">
          {t.admin.system}
        </LinkButton>
      </PageActions>

      {error && <StatusCard tone="error">{error}</StatusCard>}

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(([label, value], index) => {
            const Icon = icons[index];

            return (
              <Card key={label} className="hover:translate-y-0">
                <Icon
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className="mb-4 text-[var(--brand-teal-deep)]"
                />
                <StatChip label={String(label)} value={String(value)} />
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>
        <StatusCard tone="neutral">{t.admin.deleteDisabled}</StatusCard>
      </div>
    </PageShell>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminOverviewContent />
    </RequireAdmin>
  );
}
