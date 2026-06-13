"use client";

import { CheckCircle2, Footprints, Leaf, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PatternSection } from "../components/pattern-section";
import {
  Card,
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { translateNextStepType } from "../lib/i18n";

type SummaryReflection = {
  id: string | number;
  created_at: string;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
  next_step_type: string | null;
  follow_up_result: string | null;
};

function cleanRawLabel(value: string | null) {
  return (value ?? "")
    .replace(/^\s*\d+\.\s*/g, "")
    .replace(/^[-*•]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(
  value: string | null,
  language: "en" | "zh",
  type: "trigger" | "thought" | "behaviour"
) {
  const text = cleanRawLabel(value);
  const lower = text.toLowerCase();

  if (
    !text ||
    lower === "unspecified" ||
    lower === "not clearly identified" ||
    lower === "not identified"
  ) {
    return "";
  }

  const maps = {
    en: {
      thought: [
        [/emotional reasoning/i, "Emotional reasoning"],
        [/mind.?reading/i, "Mind reading"],
        [/catastroph/i, "Catastrophising"],
        [/personal/i, "Personalisation"],
        [/all.?or.?nothing/i, "All-or-nothing thinking"],
        [/self.?blame/i, "Self-blame"],
        [/comparison/i, "Comparison thinking"],
        [/rejection/i, "Rejection sensitivity"],
        [/low.?energy/i, "Low-energy mode"],
      ],
      trigger: [
        [/delayed reply|late reply|reply/i, "Delayed reply"],
        [/criticism|comment/i, "Criticism"],
        [/work|fatigue|shift/i, "Work fatigue"],
        [/study|exam|assignment/i, "Study pressure"],
        [/comparison|social/i, "Social comparison"],
        [/product testing|curiosity/i, "Product testing"],
        [/pain|period|headache|discomfort/i, "Physical discomfort"],
      ],
      behaviour: [
        [/check|checking/i, "Checking behaviour"],
        [/avoid|delay|procrastinat/i, "Avoidance"],
        [/reassurance/i, "Reassurance-seeking"],
        [/message|text|reply/i, "Emotional messaging"],
        [/soothe|breath|rest|water|shower|heat/i, "Self-soothing"],
        [/clarif|fact/i, "Clarifying facts"],
        [/shutdown|shut down|freeze/i, "Shutdown"],
        [/delay|wait/i, "Delaying action"],
      ],
    },
    zh: {
      thought: [
        [/情绪化推理/, "情绪化推理"],
        [/读心/, "读心式解读"],
        [/灾难化/, "灾难化想法"],
        [/个人化/, "个人化解读"],
        [/全或无|非黑即白/, "非黑即白"],
        [/自责/, "自责循环"],
        [/比较/, "比较思维"],
        [/被拒绝|拒绝/, "拒绝敏感"],
        [/低能量/, "低能量模式"],
      ],
      trigger: [
        [/回复|消息/, "回复延迟"],
        [/批评|评论/, "批评"],
        [/工作|疲劳|班/, "工作疲劳"],
        [/学习|考试|作业/, "学习压力"],
        [/比较|社交/, "社交比较"],
        [/测试|好奇/, "产品测试"],
        [/疼|痛|不舒服|经期|头痛/, "身体不适"],
      ],
      behaviour: [
        [/查看|检查|刷/, "反复查看"],
        [/回避|拖延|逃避/, "回避"],
        [/确认|安慰/, "寻求确认"],
        [/消息|回复|发送/, "情绪化发送消息"],
        [/稳定|呼吸|休息|热水|洗澡|热敷/, "稳定自己"],
        [/事实|澄清/, "澄清事实"],
        [/停摆|关机|动不了/, "停摆"],
        [/等待|延迟/, "延迟行动"],
      ],
    },
  } as const;

  for (const [pattern, label] of maps[language][type]) {
    if (pattern.test(text)) {
      return label;
    }
  }

  const max = language === "zh" ? 12 : 36;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

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

export function SummaryContent() {
  const { language, t } = useLanguage();
  const { session, user, loading: authLoading } = useAuth();
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

  const reflectionCount = reflections.length;
  const hasEnoughData = reflectionCount >= 3;
  const repeatedTriggers = topPatterns(
    reflections.map((item) => normalizeCategory(item.trigger, language, "trigger"))
  );
  const repeatedThoughtPatterns = topPatterns(
    reflections.map((item) =>
      normalizeCategory(item.thought_pattern, language, "thought")
    )
  );
  const recentBehaviouralThemes = topPatterns(
    reflections.map((item) => normalizeCategory(item.behaviour, language, "behaviour"))
  );
  const signals = hasEnoughData ? t.summary.observationItems.slice(0, 3) : [];
  const nextStepCounts = new Map<string, { value: string; used: number; helped: number }>();

  reflections.forEach((item) => {
    const type = cleanRawLabel(item.next_step_type);
    const result = cleanRawLabel(item.follow_up_result);

    if (!type || !result) {
      return;
    }

    const current = nextStepCounts.get(type) ?? { value: type, used: 0, helped: 0 };
    current.used += 1;
    if (result === "Helped" || result === "Somewhat") {
      current.helped += 1;
    }
    nextStepCounts.set(type, current);
  });

  const nextSteps = Array.from(nextStepCounts.values()).slice(0, 3);

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

      {!hasError && loaded && !user && (
        <EmptyState
          title={t.summary.authTitle}
          description={t.summary.authBody}
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/login?next=/summary">
                {t.auth.loginRequired}
              </LinkButton>
              <LinkButton href="/register?next=/summary" variant="secondary">
                {t.auth.createAccount}
              </LinkButton>
            </div>
          }
        />
      )}

      {!hasError && loaded && user && !hasEnoughData && (
        <EmptyState
          title={t.summary.emptyTitle}
          description={`${t.summary.emptyDescription} ${t.summary.emptySubtext}`}
          action={<LinkButton href="/quick">{t.common.startQuick}</LinkButton>}
        />
      )}

      {!hasError && loaded && user && hasEnoughData && (
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
