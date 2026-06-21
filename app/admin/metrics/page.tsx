"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  LineChart,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminMetricCard, AdminShell } from "../../components/admin-shell";
import { useAuth } from "../../components/auth-provider";
import { RequireAdmin } from "../../components/route-guards";
import { useLanguage } from "../../components/language-provider";
import { Card, SectionLabel, StatusCard } from "../../components/ui";

type EventName =
  | "landing_page_viewed"
  | "hero_create_account_clicked"
  | "hero_view_demo_clicked"
  | "register_completed"
  | "login_completed"
  | "quick_reflection_started"
  | "guided_reflection_started"
  | "reflection_generated"
  | "reflection_saved"
  | "history_viewed"
  | "summary_viewed"
  | "check_in_completed"
  | "feedback_submitted";

type MetricsResponse = {
  trackedEvents: EventName[];
  eventCounts: Record<EventName, number | null> | null;
  analyticsConnected: boolean;
  databaseMetrics: {
    totalUsers: number;
    usersLast7Days: number;
    totalFeedback: number;
    feedbackLast7Days: number;
    totalReflections: number;
    reflectionsLast7Days: number;
    quickSaved: number;
    guidedSaved: number;
    quickSavedLast7Days: number;
    guidedSavedLast7Days: number;
    positiveFeedback: number;
    repeatIntent: number;
  };
};

const eventLabels: Record<EventName, string> = {
  landing_page_viewed: "Landing page views",
  hero_create_account_clicked: "Create account clicks",
  hero_view_demo_clicked: "Demo clicks",
  register_completed: "Register completed",
  login_completed: "Login completed",
  quick_reflection_started: "Quick started",
  guided_reflection_started: "Guided started",
  reflection_generated: "Reflection generated",
  reflection_saved: "Reflection saved",
  history_viewed: "History viewed",
  summary_viewed: "Summary viewed",
  check_in_completed: "Check-in completed",
  feedback_submitted: "Feedback submitted",
};

function rate(numerator?: number | null, denominator?: number | null) {
  if (!numerator || !denominator) {
    return "0%";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}

function MetricRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(246,242,233,0.68)] px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--foreground-subtle)]">
          {hint}
        </p>
      </div>
      <span className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand-teal-deep)]">
        {value}
      </span>
    </div>
  );
}

function FounderMetricsContent() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMetrics() {
      if (!session?.access_token) {
        return;
      }

      try {
        const response = await fetch("/api/admin/metrics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Metrics unavailable");
        }

        setMetrics(data);
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadMetrics();
  }, [session?.access_token, t.admin.unavailable]);

  const eventCounts = metrics?.eventCounts;
  const db = metrics?.databaseMetrics;
  const fallbackCounts = useMemo(
    () =>
      db
        ? {
            register_completed: db.totalUsers,
            reflection_saved: db.totalReflections,
            feedback_submitted: db.totalFeedback,
          }
        : {},
    [db]
  );
  const valueFor = (event: EventName) =>
    eventCounts?.[event] ?? fallbackCounts[event as keyof typeof fallbackCounts] ?? null;

  const coreStats = db
    ? [
        { label: "Users", value: db.totalUsers, icon: Users },
        { label: "Saved reflections", value: db.totalReflections, icon: FileText },
        { label: "Feedback", value: db.totalFeedback, icon: Inbox },
        { label: "New users 7d", value: db.usersLast7Days, icon: UserPlus },
        { label: "Reflections 7d", value: db.reflectionsLast7Days, icon: Save },
        { label: "Feedback 7d", value: db.feedbackLast7Days, icon: Clock3 },
        { label: "Quick saved", value: db.quickSaved, icon: Sparkles },
        { label: "Guided saved", value: db.guidedSaved, icon: BarChart3 },
      ]
    : [];

  return (
    <AdminShell
      title={t.admin.metricsTitle}
      purpose={t.admin.metricsPurpose}
      eyebrow={t.admin.metrics}
    >
      {error && <StatusCard tone="error">{error}</StatusCard>}

      {metrics && (
        <>
          {!metrics.analyticsConnected && (
            <div className="mb-5">
              <StatusCard tone="warning">{t.admin.metricsExportNote}</StatusCard>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {coreStats.map(({ label, value, icon }) => (
              <AdminMetricCard
                key={label}
                label={label}
                value={value}
                icon={icon}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="hover:translate-y-0">
              <SectionLabel>{t.admin.funnelRates}</SectionLabel>
              <div className="mt-4 grid gap-3">
                <MetricRow
                  label="Landing → create account"
                  value={rate(
                    valueFor("hero_create_account_clicked"),
                    valueFor("landing_page_viewed")
                  )}
                  hint="Needs analytics export for exact landing views."
                />
                <MetricRow
                  label="Create account → register"
                  value={rate(
                    valueFor("register_completed"),
                    valueFor("hero_create_account_clicked")
                  )}
                  hint="Shows signup intent quality."
                />
                <MetricRow
                  label="Register → first reflection"
                  value={rate(valueFor("reflection_generated"), valueFor("register_completed"))}
                  hint="Approximated until per-user event joins are available."
                />
                <MetricRow
                  label="Generated → saved"
                  value={rate(valueFor("reflection_saved"), valueFor("reflection_generated"))}
                  hint="Auto-save means this should usually stay high."
                />
                <MetricRow
                  label="Save → summary"
                  value={rate(valueFor("summary_viewed"), valueFor("reflection_saved"))}
                  hint="Early retention signal."
                />
                <MetricRow
                  label="Save → check-in"
                  value={rate(valueFor("check_in_completed"), valueFor("reflection_saved"))}
                  hint="Later reflection loop signal."
                />
                <MetricRow
                  label="Save → feedback"
                  value={rate(valueFor("feedback_submitted"), valueFor("reflection_saved"))}
                  hint="Tester response signal."
                />
              </div>
            </Card>

            <Card className="hover:translate-y-0">
              <SectionLabel>{t.admin.eventCoverage}</SectionLabel>
              <div className="mt-4 grid gap-2">
                {metrics.trackedEvents.map((event) => {
                  const value = valueFor(event);
                  return (
                    <div
                      key={event}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(246,242,233,0.58)] px-3 py-2"
                    >
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {eventLabels[event]}
                      </span>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {value === null ? "Pending" : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <Card className="hover:translate-y-0">
              <LineChart
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Quick vs guided
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                Quick saved: {db?.quickSaved ?? 0}. Guided saved:{" "}
                {db?.guidedSaved ?? 0}.
              </p>
            </Card>
            <Card className="hover:translate-y-0">
              <CheckCircle2
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Feedback quality
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {db?.positiveFeedback ?? 0} users said clarity helped.{" "}
                {db?.repeatIntent ?? 0} said they would use it again.
              </p>
            </Card>
            <Card className="hover:translate-y-0">
              <ShieldCheck
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Privacy boundary
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                This page shows counts and rates only. It does not expose private
                reflection text, AI output, or check-in notes.
              </p>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}

export default function FounderMetricsPage() {
  return (
    <RequireAdmin>
      <FounderMetricsContent />
    </RequireAdmin>
  );
}
