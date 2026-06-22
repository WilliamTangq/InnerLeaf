"use client";

import {
  BarChart3,
  Cloud,
  CloudRain,
  Footprints,
  Leaf,
  LineChart as LineChartIcon,
  RefreshCcw,
  SunMedium,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Card,
  EmptyState,
  IconFrame,
  LinkButton,
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
  shouldDisplayNormalizedChip,
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
type WeatherType =
  | "no_data"
  | "cloudy_pressure"
  | "mostly_clear"
  | "mixed_weather"
  | "recurring_storm"
  | "steady_growth";

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

function meaningfulTopPatterns(values: string[], language: "en" | "zh") {
  return topPatterns(values.filter(shouldDisplayNormalizedChip)).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
}

function meaningfulCheckInPatterns(values: string[], language: "en" | "zh") {
  return topPatterns(
    values.filter(
      (value) =>
        value !== "not_checked_in" && shouldDisplayNormalizedChip(value)
    )
  ).map((item) => ({
    ...item,
    value: localizedCanonicalLabel(item.value, language),
  }));
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

const weatherIcons: Record<WeatherType, SummaryIcon> = {
  no_data: Cloud,
  cloudy_pressure: Cloud,
  mostly_clear: SunMedium,
  mixed_weather: Wind,
  recurring_storm: CloudRain,
  steady_growth: SunMedium,
};

function resolveEmotionalWeather({
  reflectionCount,
  triggerValues,
  thoughtValues,
  checkInValues,
}: {
  reflectionCount: number;
  triggerValues: string[];
  thoughtValues: string[];
  checkInValues: string[];
}): WeatherType {
  if (reflectionCount === 0) {
    return "no_data";
  }

  const heavyTriggers = new Set([
    "uncertainty",
    "workload_stress",
    "fear_of_rejection",
    "feeling_ignored",
    "silence_after_conflict",
  ]);
  const heavyThoughts = new Set([
    "catastrophising",
    "rejection_sensitivity",
    "self_blame",
    "reassurance_seeking",
    "avoidance",
  ]);
  const helpfulSignals = checkInValues.filter(
    (value) => value === "felt_lighter_later" || value === "mostly_resolved"
  ).length;
  const recurringSignals = checkInValues.filter(
    (value) => value === "still_recurring"
  ).length;
  const heavyCount =
    triggerValues.filter((value) => heavyTriggers.has(value)).length +
    thoughtValues.filter((value) => heavyThoughts.has(value)).length +
    recurringSignals;
  const topTriggerCount = Math.max(
    ...topPatterns(triggerValues.filter(shouldDisplayNormalizedChip)).map(
      (item) => item.count
    ),
    0
  );
  const topThoughtCount = Math.max(
    ...topPatterns(thoughtValues.filter(shouldDisplayNormalizedChip)).map(
      (item) => item.count
    ),
    0
  );
  const repeatedIntensity = Math.max(topTriggerCount, topThoughtCount);

  if (recurringSignals >= 2 || repeatedIntensity >= 3) {
    return "recurring_storm";
  }

  if (helpfulSignals >= 2 && heavyCount <= reflectionCount) {
    return "steady_growth";
  }

  if (helpfulSignals > 0 && heavyCount === 0) {
    return "mostly_clear";
  }

  if (heavyCount >= Math.max(2, reflectionCount)) {
    return "cloudy_pressure";
  }

  if (helpfulSignals > 0 && heavyCount > 0) {
    return "mixed_weather";
  }

  return heavyCount > 0 ? "cloudy_pressure" : "mixed_weather";
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

function RankedInsightBlock({
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
  const rankedItems = items.slice(0, 3);

  return (
    <SummaryBlockShell icon={icon} title={title} description={description}>
      {rankedItems.length === 0 ? (
        <LowDataState icon={icon}>{lowDataText}</LowDataState>
      ) : (
        <div className="mt-5 space-y-3">
          {rankedItems.map((item, index) => {
            const width = Math.max(12, Math.round((item.count / maxCount) * 100));

            return (
              <div
                key={item.value}
                className="rounded-[1.15rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.66)] px-3.5 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--brand-teal-deep)]">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {item.value}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-[rgba(246,242,233,0.72)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-subtle)]">
                    {item.count}×
                  </span>
                </div>
                <span className="mt-2.5 block h-2 overflow-hidden rounded-full bg-[rgba(40,80,60,0.08)]">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(31,155,143,0.62),rgba(217,179,74,0.50))]"
                    style={{ width: `${width}%` }}
                  />
                </span>
              </div>
            );
          })}
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
      title={t.summary.whatHelpsTitle}
      description={t.summary.whatHelpsDesc}
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
          {checkInCount === 0 || checkInSignals.length === 0 ? (
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
  const maxValue = Math.max(...trendValues, 1);
  const dayLabels = trendValues.map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
      weekday: "short",
    }).format(date);
  });
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
      title={t.summary.rhythmTitle}
      description={t.summary.rhythmDesc}
    >
      <div className="mt-5 rounded-[22px] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.62)] p-3.5">
        {recentTotal === 0 ? (
          <LowDataState icon={LineChartIcon}>{caption}</LowDataState>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {trendValues.map((value, index) => {
              const height = value === 0 ? 10 : Math.max(18, (value / maxValue) * 54);

              return (
                <div key={`${dayLabels[index]}-${index}`} className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-full items-end justify-center rounded-full bg-[rgba(40,80,60,0.06)] px-1.5 py-1.5">
                    <span
                      className={[
                        "block w-full max-w-5 rounded-full transition-all",
                        value > 0
                          ? "bg-[linear-gradient(180deg,rgba(31,155,143,0.62),rgba(217,179,74,0.44))]"
                          : "bg-[rgba(40,80,60,0.10)]",
                      ].join(" ")}
                      style={{ height }}
                      aria-label={`${dayLabels[index]}: ${value}`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-[var(--foreground-subtle)]">
                    {dayLabels[index]}
                  </span>
                </div>
              );
            })}
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

function EmotionalWeatherCard({
  weatherType,
  reflectionCount,
}: {
  weatherType: WeatherType;
  reflectionCount: number;
}) {
  const { t } = useLanguage();
  const WeatherIcon = weatherIcons[weatherType];
  const action =
    weatherType === "cloudy_pressure" || weatherType === "recurring_storm"
      ? {
          label: t.summary.weatherActions.breathing,
          href: "/dashboard/calm",
        }
      : weatherType === "mostly_clear" || weatherType === "steady_growth"
        ? {
            label: t.summary.weatherActions.pattern,
            href: "/dashboard/summary",
          }
        : {
            label: t.summary.weatherActions.reflection,
            href: "/dashboard/quick",
          };

  return (
    <Card
      className="relative overflow-hidden rounded-[30px] border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(232,246,241,0.62),rgba(255,248,226,0.38))] p-5 shadow-[0_20px_70px_rgba(20,35,28,0.07)] hover:translate-y-0 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(217,179,74,0.2),transparent_66%)]"
        aria-hidden="true"
      />
      <div className="relative grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.55rem] border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.72)] shadow-[var(--shadow-soft)]">
          <WeatherIcon
            aria-hidden="true"
            size={34}
            strokeWidth={1.55}
            className="text-[var(--brand-teal-deep)]"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
            {t.summary.emotionalWeatherTitle}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--foreground)]">
            {t.summary.weather[weatherType]}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.summary.emotionalWeatherSubtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
              {reflectionCount} {t.history.saved}
            </span>
          </div>
        </div>
        <LinkButton
          href={action.href}
          variant="secondary"
          size="sm"
          className="w-full md:w-auto"
        >
          {action.label}
        </LinkButton>
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
  const repeatedTriggers = meaningfulTopPatterns(
    canonicalCards.map((item) => item.normalizedTrigger),
    language
  );
  const repeatedThoughtPatterns = meaningfulTopPatterns(
    canonicalCards.map((item) => item.normalizedThoughtPattern),
    language
  );
  const repeatedCheckInSignals = meaningfulCheckInPatterns(
    canonicalCards.map((item) => item.normalizedCheckInSignal),
    language
  );
  const emotionalWeatherType = resolveEmotionalWeather({
    reflectionCount,
    triggerValues: canonicalCards.map((item) => item.normalizedTrigger),
    thoughtValues: canonicalCards.map((item) => item.normalizedThoughtPattern),
    checkInValues: canonicalCards.map((item) => item.normalizedCheckInSignal),
  });
  const nextStepCounts = new Map<string, { value: string; used: number; helped: number }>();

  reflections.forEach((item) => {
    const canonical = canonicalFromSavedReflection(item);
    const type = canonical.normalizedNextStepType;
    const result = canonical.normalizedCheckInSignal;

    if (!shouldDisplayNormalizedChip(type) || !result) {
      return;
    }

    const current = nextStepCounts.get(type) ?? { value: type, used: 0, helped: 0 };
    current.used += 1;
    if (result === "felt_lighter_later" || result === "mostly_resolved") {
      current.helped += 1;
    }
    nextStepCounts.set(type, current);
  });

  const nextSteps = Array.from(nextStepCounts.values()).slice(0, 3);
  const trendValues = recentActivityTrend(reflections);
  const checkInCount = reflections.filter((item) => item.follow_up_result).length;

  useEffect(() => {
    if (!loaded || !user) {
      return;
    }

    trackEvent("emotional_weather_viewed", {
      locale: language,
      reflection_count: reflectionCount,
      weather_type: emotionalWeatherType,
    });
  }, [emotionalWeatherType, language, loaded, reflectionCount, user]);

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
        <div className="grid gap-4">
          <MotionBlock>
            <EmotionalWeatherCard
              weatherType={emotionalWeatherType}
              reflectionCount={reflectionCount}
            />
          </MotionBlock>
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
        </div>
      )}

      {!hasError && loaded && user && hasEnoughData && (
        <>
          <div className="grid gap-4 lg:gap-5">
            <MotionBlock>
              <EmotionalWeatherCard
                weatherType={emotionalWeatherType}
                reflectionCount={reflectionCount}
              />
            </MotionBlock>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <MotionBlock>
                <RankedInsightBlock
                  icon={BarChart3}
                  title={t.summary.keepsReturningTitle}
                  description={t.summary.keepsReturningDesc}
                  items={repeatedTriggers}
                  lowDataText={t.summary.moreReflectionsNeeded}
                />
              </MotionBlock>
              <MotionBlock>
                <RankedInsightBlock
                  icon={Leaf}
                  title={t.summary.mindReactTitle}
                  description={t.summary.mindReactDesc}
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
