"use client";

import { CheckCircle2, Footprints, Leaf, Sparkles } from "lucide-react";
import { PatternSection, type PatternItem } from "../components/pattern-section";
import {
  Card,
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { translateNextStepType } from "../lib/i18n";

function ChangeSection({ signals }: { signals: string[] }) {
  const { t } = useLanguage();
  const displaySignals = t.summary.observationItems.slice(0, signals.length);

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.summary.observations}
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            {t.summary.observationsDesc}
          </p>
        </div>
        <Leaf
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {displaySignals.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          {t.summary.emptyProgress}
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {displaySignals.map((signal) => (
            <li
              key={signal}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground-muted)]"
            >
              <Sparkles
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
              />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      )}
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
                  {translateNextStepType(language, item.value)}
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

export function SummaryContent({
  hasError,
  reflectionCount,
  remaining,
  hasEnoughData,
  repeatedTriggers,
  repeatedThoughtPatterns,
  recentBehaviouralThemes,
  signals,
  nextSteps,
}: {
  hasError: boolean;
  reflectionCount: number;
  remaining: number;
  hasEnoughData: boolean;
  repeatedTriggers: PatternItem[];
  repeatedThoughtPatterns: PatternItem[];
  recentBehaviouralThemes: PatternItem[];
  signals: string[];
  nextSteps: Array<{ value: string; used: number; helped: number }>;
}) {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow={t.common.insights} title={t.summary.title}>
        {t.summary.purpose}
      </PageHeader>

      <PageActions className="mb-6">
        <LinkButton href="/quick">{t.summary.createAnother}</LinkButton>
        <LinkButton href="/history" variant="secondary">
          {t.common.viewHistory}
        </LinkButton>
      </PageActions>

      {hasError && <StatusCard tone="error">{t.summary.unavailable}</StatusCard>}

      {!hasError && !hasEnoughData && (
        <EmptyState
          title={
            reflectionCount === 0
              ? t.summary.emptyTitle
              : `${remaining} ${t.summary.emptyNeed}`
          }
          description={
            reflectionCount === 0
              ? t.summary.emptyDescription
              : t.summary.emptyProgress
          }
          action={<LinkButton href="/quick">{t.common.startQuick}</LinkButton>}
        />
      )}

      {!hasError && hasEnoughData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <PatternSection
              title={t.summary.repeatedTriggers}
              description={t.summary.repeatedTriggersDesc}
              items={repeatedTriggers}
            />
            <PatternSection
              title={t.summary.repeatedThoughts}
              description={t.summary.repeatedThoughtsDesc}
              items={repeatedThoughtPatterns}
            />
            <PatternSection
              title={t.summary.behaviouralThemes}
              description={t.summary.behaviouralThemesDesc}
              items={recentBehaviouralThemes}
            />
            <ChangeSection signals={signals} />
            <HelpfulNextStepsSection items={nextSteps} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/quick">{t.summary.makeClearer}</LinkButton>
            <LinkButton href="/history" variant="secondary">
              {t.summary.openHistory}
            </LinkButton>
          </div>
        </>
      )}
    </PageShell>
  );
}
