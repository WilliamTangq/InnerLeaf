"use client";

import { BarChart3, CheckCircle2, Footprints, Leaf, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
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

function SummaryNarrativeCard({
  repeatedTriggers,
  repeatedThoughtPatterns,
  checkInSignals,
  reflectionCount,
  checkInCount,
  trendValues,
}: {
  repeatedTriggers: Array<{ value: string; count: number }>;
  repeatedThoughtPatterns: Array<{ value: string; count: number }>;
  checkInSignals: Array<{ value: string; count: number }>;
  reflectionCount: number;
  checkInCount: number;
  trendValues: number[];
}) {
  const { t } = useLanguage();
  const topTrigger = repeatedTriggers[0]?.value || "";
  const topThought = repeatedThoughtPatterns[0]?.value || "";
  const currentSignal =
    checkInSignals.find((item) => item.value !== "Not checked in" && item.value !== "尚未回看")
      ?.value ||
    checkInSignals[0]?.value ||
    t.summary.checkInEmpty;
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
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {t.summary.narrativeTitle}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground-subtle)]">
                {t.summary.narrativeDesc}
              </p>
            </div>
            <IconFrame icon={Leaf} size="md" />
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            {metrics.map(([label, text]) => (
              <div
                key={label}
                className="rounded-[var(--radius-lg)] border border-[rgba(40,80,60,0.075)] bg-[rgba(255,254,248,0.62)] px-3.5 py-2.5"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {label}
                </dt>
                <dd className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-[1.25rem] border border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(231,244,239,0.54),rgba(255,254,248,0.82))] p-3.5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.common.insights}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.summary.purpose}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.76)] px-3 py-2">
              <p className="text-xl font-semibold text-[var(--foreground)]">
                {reflectionCount}
              </p>
              <p className="text-xs font-medium text-[var(--foreground-subtle)]">
                {t.history.saved}
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.76)] px-3 py-2">
              <p className="text-xl font-semibold text-[var(--foreground)]">
                {checkInCount}
              </p>
              <p className="text-xs font-medium text-[var(--foreground-subtle)]">
                {t.history.checkedIn}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MiniSparkline values={trendValues} label={t.summary.title} />
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

function InsightPatternList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ value: string; count: number }>;
}) {
  if (items.length === 0) {
    return null;
  }

  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--foreground-subtle)]">
            {description}
          </p>
        </div>
        <IconFrame icon={BarChart3} size="sm" />
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
            <li
              key={item.value}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.62)] px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium leading-6 text-[var(--foreground)]">
                  {item.value}
                </span>
                <span className="shrink-0 text-xs text-[var(--foreground-subtle)]">
                  {item.count}×
                </span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),rgba(217,179,74,0.72))]"
                  style={{ width: `${Math.max(12, (item.count / maxCount) * 100)}%` }}
                />
              </span>
            </li>
        ))}
      </ul>
    </Card>
  );
}

function HelpfulNextStepsSection({
  items,
}: {
  items: Array<{ value: string; used: number; helped: number }>;
}) {
  const { language, t } = useLanguage();
  const maxUsed = Math.max(...items.map((item) => item.used), 1);

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.summary.helpfulSteps}
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            {t.summary.helpfulStepsDesc}
          </p>
        </div>
        <Footprints
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          {t.summary.checkInEmpty}
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {items.map((item) => (
            <li
              key={item.value}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-start gap-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.8}
                    className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
                  />
                  {localizedCanonicalLabel(item.value, language)}
                </span>
                <span className="shrink-0 text-xs text-[var(--foreground-subtle)]">
                  {item.used}×
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {t.summary.used} {item.used} {t.summary.times} ·{" "}
                {t.summary.markedHelpful} {item.helped} {t.summary.times}
              </p>
              <span className="mt-3 block h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <span
                  className="block h-full rounded-full bg-[var(--brand-teal)]/55"
                  style={{
                    width: `${Math.max(16, (item.used / maxUsed) * 100)}%`,
                  }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function CheckInSignalsSection({
  checkInSignals,
  settledTriggers,
  repeatingTriggers,
}: {
  checkInSignals: Array<{ value: string; count: number }>;
  settledTriggers: Array<{ value: string; count: number }>;
  repeatingTriggers: Array<{ value: string; count: number }>;
}) {
  const { t } = useLanguage();

  if (
    checkInSignals.length === 0 &&
    settledTriggers.length === 0 &&
    repeatingTriggers.length === 0
  ) {
    return null;
  }

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.summary.checkInSignals}
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            {t.summary.checkInSignalsDesc}
          </p>
        </div>
        <RefreshCcw
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {checkInSignals.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {checkInSignals.map((item) => (
            <span
              key={item.value}
              className="rounded-full border border-[rgba(31,155,143,0.18)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]"
            >
              {item.value} · {item.count}×
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            {t.summary.triggersSettled}
          </p>
          {settledTriggers.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.summary.noSettledTriggers}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {settledTriggers.map((item) => (
                <li
                  key={item.value}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {item.value}
                  </span>
                  <span className="text-xs text-[var(--foreground-subtle)]">
                    {item.count}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            {t.summary.triggersRepeating}
          </p>
          {repeatingTriggers.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.summary.noRepeatingTriggers}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {repeatingTriggers.map((item) => (
                <li
                  key={item.value}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {item.value}
                  </span>
                  <span className="text-xs text-[var(--foreground-subtle)]">
                    {item.count}×
                  </span>
                </li>
              ))}
            </ul>
          )}
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
  const settledTriggers = topPatterns(settledTriggerValues);
  const repeatingTriggers = repeatedTriggers.filter((item) => item.count > 1);
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
            <SummaryNarrativeCard
              repeatedTriggers={repeatedTriggers}
              repeatedThoughtPatterns={repeatedThoughtPatterns}
              checkInSignals={repeatedCheckInSignals}
              reflectionCount={reflectionCount}
              checkInCount={checkInCount}
              trendValues={trendValues}
            />
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              <InsightPatternList
                title={t.summary.repeatedTriggers}
                description={t.summary.repeatedTriggersDesc}
                items={repeatedTriggers}
              />
              <InsightPatternList
                title={t.summary.repeatedThoughts}
                description={t.summary.repeatedThoughtsDesc}
                items={repeatedThoughtPatterns}
              />
              <InsightPatternList
                title={t.summary.helpfulSteps}
                description={t.summary.helpfulStepsDesc}
                items={repeatedNextStepTypes}
              />
            </div>
            <HelpfulNextStepsSection items={nextSteps} />
            <CheckInSignalsSection
              checkInSignals={repeatedCheckInSignals}
              settledTriggers={settledTriggers}
              repeatingTriggers={repeatingTriggers}
            />
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
