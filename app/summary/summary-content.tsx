"use client";

import {
  BarChart3,
  Footprints,
  Leaf,
  LineChart as LineChartIcon,
  RefreshCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  EmptyState,
  IconFrame,
  LinkButton,
  MiniSparkline,
  PageActions,
  PageHeader,
  StatusCard,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { trackEvent } from "../lib/analytics";
import {
  canonicalFromSavedReflection,
  localizedCanonicalLabel,
} from "../lib/reflection-card";

type SummaryReflection = {
  id: string | number;
  created_at: string;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
  next_step_type: string | null;
  next_step: string | null;
  ui_language?: string | null;
  reflection_language?: string | null;
  short_title?: string | null;
  mood_chip?: string | null;
  normalized_trigger?: string | null;
  normalized_thought_pattern?: string | null;
  normalized_next_step_type?: string | null;
  normalized_check_in_signal?: string | null;
  follow_up_result: string | null;
  follow_up_at: string | null;
};

type SummaryItem = {
  value: string;
  count: number;
};

type SummaryIcon = typeof BarChart3;

function topPatterns(values: string[]) {
  const counts = new Map<string, number>();

  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) => second.count - first.count || first.value.localeCompare(second.value))
    .slice(0, 3);
}

function recentActivityTrend(reflections: SummaryReflection[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return reflections.filter((item) => {
      const created = new Date(item.created_at);
      return created >= day && created < next;
    }).length;
  });
}

function MotionBlock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function QuietTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,254,248,0.96)] px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-soft)]">
      {label}: {payload[0]?.value ?? 0}×
    </div>
  );
}

function SummaryBlockShell({
  icon,
  title,
  description,
  children,
}: {
  icon: SummaryIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="h-full rounded-[28px] border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.9)] shadow-[0_18px_55px_rgba(20,35,28,0.055)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-[var(--foreground-subtle)]">
            {description}
          </p>
        </div>
        <IconFrame icon={icon} size="sm" />
      </div>
      {children}
    </Card>
  );
}

function LowDataState({
  icon,
  children,
}: {
  icon: SummaryIcon;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 rounded-[22px] border border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(231,244,239,0.52),rgba(255,254,248,0.82))] p-4">
      <div className="flex gap-3">
        <IconFrame icon={icon} size="sm" />
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">
          {children}
        </p>
      </div>
    </div>
  );
}

function RankedChartBlock({
  icon,
  title,
  description,
  items,
  lowDataText,
}: {
  icon: SummaryIcon;
  title: string;
  description: string;
  items: SummaryItem[];
  lowDataText: string;
}) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);
  const chartData = items.slice(0, 5).map((item) => ({
    name: item.value,
    count: item.count,
  }));

  return (
    <SummaryBlockShell icon={icon} title={title} description={description}>
      {chartData.length === 0 ? (
        <LowDataState icon={icon}>{lowDataText}</LowDataState>
      ) : (
        <div className="mt-5">
          <div className="h-[150px] overflow-hidden rounded-[22px] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.58)] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <XAxis type="number" hide domain={[0, maxCount]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={132}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "rgba(45,61,52,0.62)" }}
                />
                <Tooltip content={<QuietTooltip />} cursor={{ fill: "rgba(31,155,143,0.045)" }} />
                <Bar
                  dataKey="count"
                  radius={[0, 9, 9, 0]}
                  fill="rgba(31,155,143,0.58)"
                  animationDuration={650}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chartData.map((item, index) => (
              <span
                key={item.name}
                className="rounded-full border border-[rgba(31,155,143,0.15)] bg-[rgba(255,254,248,0.74)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]"
              >
                #{index + 1} {item.name} · {item.count}×
              </span>
            ))}
          </div>
        </div>
      )}
    </SummaryBlockShell>
  );
}

function HelpfulCheckInBlock({
  nextSteps,
  checkInSignals,
  checkInCount,
}: {
  nextSteps: Array<{ value: string; used: number; helped: number }>;
  checkInSignals: SummaryItem[];
  checkInCount: number;
}) {
  const { language, t } = useLanguage();

  return (
    <SummaryBlockShell
      icon={Footprints}
      title={t.summary.helpfulSteps}
      description={t.summary.helpfulStepsDesc}
    >
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.62)] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            {t.summary.helpfulSteps}
          </p>
          {nextSteps.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.summary.checkInEmpty}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {nextSteps.map((item) => (
                <div
                  key={item.value}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.72)] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {localizedCanonicalLabel(item.value, language)}
                    </span>
                    <span className="text-xs text-[var(--foreground-subtle)]">
                      {item.used}×
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                    {t.summary.markedHelpful} {item.helped} {t.summary.times}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(231,244,239,0.54),rgba(255,254,248,0.78))] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            {t.summary.checkInSignals}
          </p>
          {checkInCount === 0 ? (
            <LowDataState icon={RefreshCcw}>
              {t.summary.checkInEmpty}
            </LowDataState>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {checkInSignals.map((item) => (
                <span
                  key={item.value}
                  className="rounded-full border border-[rgba(31,155,143,0.17)] bg-[rgba(255,254,248,0.76)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]"
                >
                  {item.value} · {item.count}×
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </SummaryBlockShell>
  );
}

function ActivityRhythmBlock({
  trendValues,
  reflectionCount,
  checkInCount,
}: {
  trendValues: number[];
  reflectionCount: number;
  checkInCount: number;
}) {
  const { language, t } = useLanguage();
  const recentTotal = trendValues.reduce((sum, value) => sum + value, 0);
  const data = trendValues.map((value, index) => ({
    day: `${index + 1}`,
    value,
  }));
  const caption =
    recentTotal === 0
      ? language === "zh"
        ? "保存几张反思卡片后，这里会显示你的近期节奏。"
        : "Save a few reflection cards to see your recent rhythm here."
      : recentTotal >= 3
        ? language === "zh"
          ? "这周已经有几个情绪时刻可以回看。"
          : "You have a few moments from this week to compare."
        : language === "zh"
          ? "再保存几张卡片后，节奏会更清楚。"
          : "A few more saved cards will make the rhythm clearer.";

  return (
    <SummaryBlockShell
      icon={LineChartIcon}
      title={language === "zh" ? "近期反思节奏" : "Recent reflection rhythm"}
      description={
        language === "zh"
          ? "轻量显示最近保存反思的节奏。"
          : "A quiet view of how often reflection has been happening recently."
      }
    >
      <div className="mt-5 rounded-[22px] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.62)] p-3">
        {recentTotal === 0 ? (
          <LowDataState icon={LineChartIcon}>{caption}</LowDataState>
        ) : (
          <div className="h-[126px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 12, right: 8, bottom: 4, left: 8 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(40,80,60,0.08)"
                  strokeDasharray="3 5"
                />
                <XAxis dataKey="day" hide />
                <YAxis hide domain={[0, "dataMax + 1"]} />
                <Tooltip content={<QuietTooltip />} cursor={{ stroke: "rgba(31,155,143,0.12)" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(17,111,104,0.72)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "rgba(17,111,104,0.72)", strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: "rgba(17,111,104,0.9)", strokeWidth: 0 }}
                  animationDuration={650}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-medium text-[var(--brand-teal-deep)]">
          {recentTotal} {language === "zh" ? "近 7 天" : "last 7 days"}
        </span>
        <span className="rounded-full border border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)]">
          {reflectionCount} {t.history.saved}
        </span>
        <span className="rounded-full border border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)]">
          {checkInCount} {t.history.checkedIn}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
        {caption}
      </p>
    </SummaryBlockShell>
  );
}

function SummaryNarrativeCard({
  repeatedTriggers,
  repeatedThoughtPatterns,
  nextStepTypes,
  checkInSignals,
  reflectionCount,
  checkInCount,
  trendValues,
}: {
  repeatedTriggers: Array<{ value: string; count: number }>;
  repeatedThoughtPatterns: Array<{ value: string; count: number }>;
  nextStepTypes: Array<{ value: string; count: number }>;
  checkInSignals: Array<{ value: string; count: number }>;
  reflectionCount: number;
  checkInCount: number;
  trendValues: number[];
}) {
  const { language, t } = useLanguage();
  const topTrigger = repeatedTriggers[0]?.value || "";
  const topThought = repeatedThoughtPatterns[0]?.value || "";
  const topStepType = nextStepTypes[0]?.value || "";
  const currentSignal =
    checkInSignals.find((item) => item.value !== "Not checked in" && item.value !== "尚未回看")
      ?.value ||
    checkInSignals[0]?.value ||
    t.summary.checkInEmpty;
  const keyInsight = topTrigger
    ? language === "zh"
      ? `最近最常出现的触发点是 ${topTrigger}。`
      : `Your most repeated trigger lately has been ${topTrigger}.`
    : t.summary.noRepeatedTrigger;
  const patternInsight = topThought
    ? language === "zh"
      ? `${topThought} 出现得比其他思维模式更频繁。`
      : `${topThought} appears more often than other thought patterns.`
    : t.summary.noRepeatedThought;
  const supportChips = [topTrigger, topThought, topStepType, currentSignal].filter(Boolean);
  const metrics = [
    [t.history.saved, String(reflectionCount)],
    [t.summary.repeatedTrigger, topTrigger || t.summary.noRepeatedTrigger],
    [t.summary.repeatedThoughtPattern, topThought || t.summary.noRepeatedThought],
    [t.summary.checkInSignals, currentSignal],
  ];

  return (
    <Card
      variant="elevated"
      className="border-[rgba(31,155,143,0.15)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(238,249,244,0.58))] hover:translate-y-0"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_248px]">
        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                {t.summary.title}
              </p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {t.summary.narrativeTitle}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground-subtle)]">
                {t.summary.narrativeDesc}
              </p>
            </div>
            <IconFrame icon={Leaf} size="md" />
          </div>
          <div className="mt-5 rounded-[24px] border border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.62)] p-4">
            <p className="text-xl font-semibold leading-8 text-[var(--foreground)]">
              {keyInsight}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {patternInsight}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {supportChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.76)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(231,244,239,0.54),rgba(255,254,248,0.82))] p-3.5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.common.insights}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.summary.purpose}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.76)] px-3 py-2"
              >
                <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--foreground)]">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--foreground-subtle)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <MiniSparkline values={trendValues} label={t.summary.title} />
            <p className="mt-2 text-xs font-medium text-[var(--foreground-subtle)]">
              {checkInCount} {t.history.checkedIn}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {repeatedTriggers.slice(0, 3).map((item) => (
              <span
                key={item.value}
                className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.72)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]"
              >
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SummaryContent() {
  const { language, t } = useLanguage();
  const { role, session, user, loading: authLoading } = useAuth();
  const [reflections, setReflections] = useState<SummaryReflection[]>([]);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadReflections() {
      if (authLoading) {
        return;
      }

      if (!session?.access_token) {
        setReflections([]);
        setLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/reflections", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Summary unavailable");
        }

        setReflections(data.reflections || []);
      } catch {
        setHasError(true);
      } finally {
        setLoaded(true);
      }
    }

    loadReflections();
  }, [authLoading, session?.access_token]);

  useEffect(() => {
    if (!authLoading) {
      trackEvent("summary_viewed", {
        locale: language,
        authenticated_state: Boolean(user),
        role_bucket: role ?? (user ? "user" : "logged_out"),
      });
    }
  }, [authLoading, language, role, user]);

  const reflectionCount = reflections.length;
  const hasEnoughData = reflectionCount >= 3;
  const canonicalCards = reflections.map(canonicalFromSavedReflection);
  const repeatedTriggers = topPatterns(
    canonicalCards.map((item) => item.normalizedTrigger)
  ).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
  const repeatedThoughtPatterns = topPatterns(
    canonicalCards.map((item) => item.normalizedThoughtPattern)
  ).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
  const repeatedNextStepTypes = topPatterns(
    canonicalCards.map((item) => item.normalizedNextStepType)
  ).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
  const repeatedCheckInSignals = topPatterns(
    canonicalCards.map((item) => item.normalizedCheckInSignal)
  ).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
  const nextStepCounts = new Map<string, { value: string; used: number; helped: number }>();
  const settledTriggerValues: string[] = [];

  reflections.forEach((item) => {
    const canonical = canonicalFromSavedReflection(item);
    const type = canonical.normalizedNextStepType;
    const result = canonical.normalizedCheckInSignal;
    const trigger = canonical.normalizedTrigger;

    if (!type || !result) {
      return;
    }

    const current = nextStepCounts.get(type) ?? { value: type, used: 0, helped: 0 };
    current.used += 1;
    if (result === "felt_lighter_later" || result === "mostly_resolved") {
      current.helped += 1;
      if (trigger) {
        settledTriggerValues.push(localizedCanonicalLabel(trigger, language));
      }
    }
    nextStepCounts.set(type, current);
  });

  const nextSteps = Array.from(nextStepCounts.values()).slice(0, 3);
  const trendValues = recentActivityTrend(reflections);
  const checkInCount = reflections.filter((item) => item.follow_up_result).length;

  return (
    <>
      <PageHeader compact eyebrow={t.common.insights} title={t.summary.title}>
        {t.summary.purpose}
      </PageHeader>

      <PageActions className="mb-6">
        <LinkButton href="/dashboard/quick">{t.summary.createAnother}</LinkButton>
        <LinkButton href="/dashboard/history" variant="secondary">
          {t.common.viewHistory}
        </LinkButton>
      </PageActions>

      {hasError && <StatusCard tone="error">{t.summary.unavailable}</StatusCard>}

      {!hasError && loaded && !user && (
        <EmptyState
          icon={BarChart3}
          title={t.summary.authTitle}
          description={t.summary.authBody}
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/login?next=/dashboard/summary">
                {t.auth.loginRequired}
              </LinkButton>
              <LinkButton href="/register?next=/dashboard/summary" variant="secondary">
                {t.auth.createAccount}
              </LinkButton>
            </div>
          }
        />
      )}

      {!hasError && loaded && user && !hasEnoughData && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <EmptyState
            icon={BarChart3}
            title={t.summary.emptyTitle}
            description={t.summary.moreReflectionsNeeded}
            action={<LinkButton href="/dashboard/quick">{t.common.startQuick}</LinkButton>}
          />
          <Card className="hover:translate-y-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              {t.summary.notEnoughData}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
              {reflectionCount}/3
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.summary.emptySubtext}
            </p>
            <span className="mt-5 block h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <span
                className="block h-full rounded-full bg-[var(--brand-teal)]/60"
                style={{ width: `${Math.min(100, (reflectionCount / 3) * 100)}%` }}
              />
            </span>
          </Card>
        </div>
      )}

      {!hasError && loaded && user && hasEnoughData && (
        <>
          <div className="grid gap-4 lg:gap-5">
            <MotionBlock>
              <SummaryNarrativeCard
                repeatedTriggers={repeatedTriggers}
                repeatedThoughtPatterns={repeatedThoughtPatterns}
                nextStepTypes={repeatedNextStepTypes}
                checkInSignals={repeatedCheckInSignals}
                reflectionCount={reflectionCount}
                checkInCount={checkInCount}
                trendValues={trendValues}
              />
            </MotionBlock>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <MotionBlock>
                <RankedChartBlock
                  icon={BarChart3}
                  title={t.summary.repeatedTriggers}
                  description={t.summary.repeatedTriggersDesc}
                  items={repeatedTriggers}
                  lowDataText={t.summary.moreReflectionsNeeded}
                />
              </MotionBlock>
              <MotionBlock>
                <RankedChartBlock
                  icon={Leaf}
                  title={t.summary.repeatedThoughts}
                  description={t.summary.repeatedThoughtsDesc}
                  items={repeatedThoughtPatterns}
                  lowDataText={t.summary.moreReflectionsNeeded}
                />
              </MotionBlock>
              <MotionBlock>
                <HelpfulCheckInBlock
                  nextSteps={nextSteps}
                  checkInSignals={repeatedCheckInSignals}
                  checkInCount={checkInCount}
                />
              </MotionBlock>
              <MotionBlock>
                <ActivityRhythmBlock
                  trendValues={trendValues}
                  reflectionCount={reflectionCount}
                  checkInCount={checkInCount}
                />
              </MotionBlock>
            </div>
          </div>
        </>
      )}
      {!hasError && loaded && user && (
        <div className="mt-8 grid gap-4">
          <Card className="hover:translate-y-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  {t.feedbackPrompt.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.feedbackPrompt.body}
                </p>
              </div>
              <LinkButton
                href="/feedback"
                variant="secondary"
                size="sm"
                onClick={() =>
                  trackEvent("feedback_prompt_clicked", {
                    locale: language,
                    authenticated_state: Boolean(user),
                    role_bucket: role ?? "user",
                    source: "summary",
                    has_enough_data: hasEnoughData,
                  })
                }
              >
                {t.feedbackPrompt.cta}
              </LinkButton>
            </div>
          </Card>
          {hasEnoughData && (
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/dashboard/quick">{t.summary.makeClearer}</LinkButton>
              <LinkButton href="/dashboard/history" variant="secondary">
                {t.summary.openHistory}
              </LinkButton>
            </div>
          )}
        </div>
      )}
    </>
  );
}
