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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { AdminMetricCard, AdminShell } from "../../components/admin-shell";
import { useAuth } from "../../components/auth-provider";
import { RequireAdmin } from "../../components/route-guards";
import { useLanguage } from "../../components/language-provider";
import {
  Card,
  MiniBar,
  MiniSparkline,
  SectionLabel,
  StatusCard,
} from "../../components/ui";

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
  activityTrend: Array<{
    label: string;
    users: number;
    reflections: number;
    feedback: number;
  }>;
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

function valueLabel(value: number | null) {
  return value === null ? "Pending" : value.toLocaleString();
}

function ActivityTrendChart({
  data,
}: {
  data: MetricsResponse["activityTrend"];
}) {
  return (
    <div className="rounded-[1.25rem] border border-[rgba(31,155,143,0.12)] bg-[linear-gradient(135deg,rgba(231,244,239,0.42),rgba(255,254,248,0.84))] p-3.5">
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(80,97,90,0.72)", fontSize: 10 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(31,155,143,0.06)" }}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgba(40,80,60,0.12)",
                background: "rgb(255,254,248)",
                boxShadow: "0 16px 48px rgba(20,35,28,0.12)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="users" fill="rgba(31,155,143,0.72)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="reflections" fill="rgba(217,179,74,0.72)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="feedback" fill="rgba(80,97,90,0.46)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--foreground-subtle)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[rgba(31,155,143,0.72)]" />
          Users
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[rgba(217,179,74,0.72)]" />
          Saves
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[rgba(80,97,90,0.46)]" />
          Feedback
        </span>
      </div>
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
  const activityMax = db
    ? Math.max(db.usersLast7Days, db.reflectionsLast7Days, db.feedbackLast7Days, 1)
    : 1;
  const savedModeMax = db ? Math.max(db.quickSaved, db.guidedSaved, 1) : 1;
  const startedQuick = valueFor("quick_reflection_started");
  const startedGuided = valueFor("guided_reflection_started");
  const startedTotal =
    startedQuick !== null || startedGuided !== null
      ? (startedQuick ?? 0) + (startedGuided ?? 0)
      : null;
  const generated = valueFor("reflection_generated");
  const saved = valueFor("reflection_saved");
  const funnelBlocks = [
    {
      label: "Landing → Create account",
      value: rate(valueFor("hero_create_account_clicked"), valueFor("landing_page_viewed")),
      from: valueFor("landing_page_viewed"),
      to: valueFor("hero_create_account_clicked"),
    },
    {
      label: "Create account → Register",
      value: rate(valueFor("register_completed"), valueFor("hero_create_account_clicked")),
      from: valueFor("hero_create_account_clicked"),
      to: valueFor("register_completed"),
    },
    {
      label: "Register → First reflection",
      value: rate(generated, valueFor("register_completed")),
      from: valueFor("register_completed"),
      to: generated,
    },
    {
      label: "Generated → Saved",
      value: rate(saved, generated),
      from: generated,
      to: saved,
    },
    {
      label: "Saved → Summary",
      value: rate(valueFor("summary_viewed"), saved),
      from: saved,
      to: valueFor("summary_viewed"),
    },
    {
      label: "Saved → Check-in",
      value: rate(valueFor("check_in_completed"), saved),
      from: saved,
      to: valueFor("check_in_completed"),
    },
    {
      label: "Saved → Feedback",
      value: rate(valueFor("feedback_submitted"), saved),
      from: saved,
      to: valueFor("feedback_submitted"),
    },
  ];

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

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {coreStats.map(({ label, value, icon }) => (
              <AdminMetricCard
                key={label}
                label={label}
                value={value}
                icon={icon}
              />
            ))}
          </div>

          <Card className="mt-4 hover:translate-y-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <SectionLabel>{t.admin.eventCoverage}</SectionLabel>
                <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  Funnel overview
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
                  Core event counts from the privacy-safe analytics layer. Private reflection content is never shown here.
                </p>
              </div>
              <span className="w-fit rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-teal-deep)]">
                {metrics.analyticsConnected ? "Analytics connected" : "DB fallback active"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {metrics.trackedEvents.map((event) => {
                const value = valueFor(event);
                return (
                  <div
                    key={event}
                    className="rounded-[1rem] border border-[var(--border)] bg-[rgba(246,242,233,0.58)] px-3 py-2.5"
                  >
                    <p className="text-lg font-semibold leading-none text-[var(--foreground)]">
                      {valueLabel(value)}
                    </p>
                    <p className="mt-2 text-[11px] font-medium leading-4 text-[var(--foreground-subtle)]">
                      {eventLabels[event]}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="hover:translate-y-0">
              <SectionLabel>{t.admin.funnelRates}</SectionLabel>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {funnelBlocks.map((item) => (
                  <MetricRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    hint={`${valueLabel(item.from)} → ${valueLabel(item.to)}`}
                  />
                ))}
              </div>
            </Card>

            <Card className="hover:translate-y-0">
              <SectionLabel>{t.admin.overview}</SectionLabel>
              <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Last 7 days activity
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                Aggregate trend only: users, saved reflections, and feedback submissions.
              </p>
              <div className="mt-4">
                <ActivityTrendChart data={metrics.activityTrend} />
              </div>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="hover:translate-y-0">
              <LineChart
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">
                Quick vs guided
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                Quick saved: {db?.quickSaved ?? 0}. Guided saved:{" "}
                {db?.guidedSaved ?? 0}.
              </p>
              <div className="mt-4 grid gap-2">
                {startedTotal !== null && (
                  <MiniBar
                    label="Started reflections"
                    value={startedTotal}
                    max={Math.max(startedTotal, saved ?? 0, 1)}
                  />
                )}
                <MiniBar
                  label={t.nav.quick}
                  value={db?.quickSaved ?? 0}
                  max={savedModeMax}
                />
                <MiniBar
                  label={t.nav.guided}
                  value={db?.guidedSaved ?? 0}
                  max={savedModeMax}
                />
              </div>
            </Card>
            <Card className="hover:translate-y-0">
              <CheckCircle2
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">
                Feedback quality
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                {db?.positiveFeedback ?? 0} users said clarity helped.{" "}
                {db?.repeatIntent ?? 0} said they would use it again.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniBar
                  label={t.feedback.questions.clarity_help[0]}
                  value={db?.positiveFeedback ?? 0}
                  max={Math.max(db?.totalFeedback ?? 0, 1)}
                />
                <MiniBar
                  label={t.feedback.questions.would_use_again[0]}
                  value={db?.repeatIntent ?? 0}
                  max={Math.max(db?.totalFeedback ?? 0, 1)}
                />
              </div>
            </Card>
            <Card className="hover:translate-y-0">
              <ShieldCheck
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">
                Privacy boundary
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                This page shows counts and rates only. It does not expose private
                reflection text, AI output, or check-in notes.
              </p>
              <div className="mt-4">
                <MiniSparkline
                  values={[
                    db?.usersLast7Days ?? 0,
                    db?.reflectionsLast7Days ?? 0,
                    db?.feedbackLast7Days ?? 0,
                  ]}
                  label={t.admin.overview}
                />
              </div>
            </Card>
          </div>

          <Card className="mt-4 hover:translate-y-0">
            <SectionLabel>{t.admin.overview}</SectionLabel>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <MiniBar
                label={t.admin.users7d}
                value={db?.usersLast7Days ?? 0}
                max={activityMax}
              />
              <MiniBar
                label={t.admin.reflections7d}
                value={db?.reflectionsLast7Days ?? 0}
                max={activityMax}
              />
              <MiniBar
                label={t.admin.feedback7d}
                value={db?.feedbackLast7Days ?? 0}
                max={activityMax}
              />
            </div>
          </Card>
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
