"use client";

import {
  BarChart3,
  Brain,
  Cloud,
  CloudRain,
  Eye,
  Footprints,
  HeartHandshake,
  LineChart as LineChartIcon,
  RefreshCcw,
  Share2,
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
  RankedSoftBars,
  StatusCard,
  VisualizationCard,
  WeeklyRhythmStrip,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { trackEvent } from "../lib/analytics";
import {
  canonicalFromSavedReflection,
  localizeMixedLanguageValue,
  localizedCanonicalLabel,
  shouldDisplayNormalizedChip,
} from "../lib/reflection-card";

type SummaryReflection = {
  id: string | number;
  created_at: string;
  user_input: string | null;
  ai_result: string | null;
  emotional_validation: string | null;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
  body_factor: string | null;
  behavioural_insight: string | null;
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
  scenario_category?: string | null;
  primary_demon?: string | null;
  unmet_need?: string | null;
  observe_next?: string | string[] | null;
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

const PROMPT2_SECTION_HEADINGS = [
  "Emotional Source",
  "这次情绪的来源",
  "Name the Demon",
  "这次情绪的名字",
  "Emotion Labels",
  "情绪标签",
  "Facts vs Imagination",
  "事实与想象",
  "事实 vs 想象",
  "Unmet Need",
  "真正未被满足的需求",
  "One Small Next Step",
  "一个小行动",
  "Open Hypotheses",
  "仍需验证的几种可能",
  "Thought Pattern",
  "主要思维模式",
  "What Your Mind Might Be Protecting",
  "大脑正在保护什么",
  "Behavioural Pull",
  "你可能会被拉向的行为",
  "What to Observe Next",
  "接下来观察什么",
  "Save Card Preview",
  "保存卡片预览",
  "Safety Note",
  "安全提示",
] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSection(aiResult: string | null, section: string) {
  if (!aiResult) {
    return "";
  }

  const headings = PROMPT2_SECTION_HEADINGS.map(escapeRegExp).join("|");
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${escapeRegExp(section)}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:${headings})\\s*\\n|$)`,
    "i"
  );
  const match = aiResult.match(pattern);

  return (
    match?.[1]
      ?.split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

function extractFirstSection(aiResult: string | null, sections: string[]) {
  for (const section of sections) {
    const value = extractSection(aiResult, section);

    if (value) {
      return value;
    }
  }

  return "";
}

function cleanSectionList(value: string, max = 4) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function previewLine(value: string | null | undefined, max = 84) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "";
  }

  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function parseSavePreview(block: string) {
  const values: Record<string, string> = {};

  block.split("\n").forEach((line) => {
    const [rawKey, ...rest] = line.split(/[:：]/);
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (!key || !value) {
      return;
    }

    if (/category|类别/.test(key)) values.category = value;
    if (/emotion|情绪/.test(key)) values.emotion = value;
    if (/trigger|触发/.test(key)) values.trigger = value;
    if (/pattern|模式/.test(key)) values.pattern = value;
    if (/need|需求/.test(key)) values.need = value;
    if (/step|行动|下一步/.test(key)) values.nextStep = value;
  });

  return values;
}

function parsePrompt2Summary(item: SummaryReflection) {
  const preview = parseSavePreview(
    extractFirstSection(item.ai_result, ["Save Card Preview", "保存卡片预览"])
  );

  return {
    source: extractFirstSection(item.ai_result, [
      "Emotional Source",
      "这次情绪的来源",
    ]),
    demonNames: cleanSectionList(
      extractFirstSection(item.ai_result, ["Name the Demon", "这次情绪的名字"]),
      2
    ),
    unmetNeed: extractFirstSection(item.ai_result, [
      "Unmet Need",
      "真正未被满足的需求",
    ]),
    observeNext: cleanSectionList(
      extractFirstSection(item.ai_result, [
        "What to Observe Next",
        "接下来观察什么",
      ]),
      3
    ),
    preview,
  };
}

function countHumanLabels(values: string[]) {
  return topPatterns(
    values
      .map((value) => previewLine(value, 56))
      .filter(Boolean)
      .filter((value) => !/^(other|still emerging|暂未清晰归类)$/i.test(value))
  );
}

function needLabelsFromText(value: string, language: "en" | "zh") {
  const text = value.toLowerCase();
  const rules: Array<[RegExp, string, string]> = [
    [/safe|security|安全|安心/, "Safety", "安全感"],
    [/valued|matter|important|重视|在意|重要/, "Being valued", "被重视感"],
    [/certainty|clear|sure|确定|清楚/, "Certainty", "确定性"],
    [/control|掌控|可控/, "Control", "掌控感"],
    [/autonomy|choice|freedom|自主|选择/, "Autonomy", "自主权"],
    [/understood|seen|理解|看见/, "Being understood", "被理解"],
    [/connection|close|attention|陪伴|连接|关注/, "Connection", "连接感"],
    [/rest|body|fatigue|tired|休息|身体|疲惫/, "Rest", "休息"],
  ];

  return rules
    .filter(([pattern]) => pattern.test(text))
    .map(([, en, zh]) => (language === "zh" ? zh : en));
}

function buildInsightCards(
  reflections: SummaryReflection[],
  language: "en" | "zh"
) {
  return reflections.map((reflection) => {
    const canonical = canonicalFromSavedReflection(reflection);
    const prompt2 = parsePrompt2Summary(reflection);
    const rawPattern = localizeMixedLanguageValue(
      prompt2.preview.pattern || prompt2.demonNames[0] || "",
      language
    );
    const rawTrigger = localizeMixedLanguageValue(
      prompt2.preview.trigger || "",
      language
    );
    const rawNextStep = localizeMixedLanguageValue(
      prompt2.preview.nextStep || "",
      language
    );
    const patternLabel =
      shouldDisplayNormalizedChip(canonical.normalizedThoughtPattern)
        ? localizedCanonicalLabel(canonical.normalizedThoughtPattern, language)
        : rawPattern || localizedCanonicalLabel(canonical.normalizedThoughtPattern, language);
    const demonLabel =
      shouldDisplayNormalizedChip(canonical.normalizedDemon)
        ? localizedCanonicalLabel(canonical.normalizedDemon, language)
        : localizeMixedLanguageValue(canonical.primaryDemon || rawPattern, language);
    const triggerLabel =
      shouldDisplayNormalizedChip(canonical.normalizedTrigger)
        ? localizedCanonicalLabel(canonical.normalizedTrigger, language)
        : rawTrigger || localizedCanonicalLabel(canonical.normalizedTrigger, language);
    const nextStepLabel =
      shouldDisplayNormalizedChip(canonical.normalizedNextStepType)
        ? localizedCanonicalLabel(canonical.normalizedNextStepType, language)
        : rawNextStep || localizedCanonicalLabel(canonical.normalizedNextStepType, language);
    const needLabels = Array.from(new Set([
      shouldDisplayNormalizedChip(canonical.normalizedUnmetNeed)
        ? localizedCanonicalLabel(canonical.normalizedUnmetNeed, language)
        : "",
      localizeMixedLanguageValue(
        canonical.unmetNeed || prompt2.preview.need || "",
        language
      ),
      ...needLabelsFromText(
        [prompt2.unmetNeed, reflection.behavioural_insight, reflection.body_factor]
          .filter(Boolean)
          .join(" "),
        language
      ),
    ].filter(Boolean)));

    return {
      reflection,
      canonical,
      source: prompt2.source,
      triggerLabel,
      patternLabel,
      demonLabel,
      demonNames: prompt2.demonNames,
      unmetNeed: prompt2.unmetNeed,
      needLabels,
      nextStepLabel,
      observeNext: canonical.observeNextItems.length
        ? canonical.observeNextItems
        : prompt2.observeNext,
    };
  });
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
  unit,
  interpretation,
  children,
}: {
  icon: SummaryIcon;
  title: string;
  description: string;
  unit?: string;
  interpretation?: string;
  children: ReactNode;
}) {
  return (
    <VisualizationCard
      icon={icon}
      title={title}
      description={description}
      unit={unit}
      interpretation={interpretation}
    >
      {children}
    </VisualizationCard>
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

function Prompt2RankedBlock({
  icon,
  title,
  description,
  items,
  lowDataText,
  footnote,
}: {
  icon: SummaryIcon;
  title: string;
  description: string;
  items: SummaryItem[];
  lowDataText: string;
  footnote?: string;
}) {
  const { language } = useLanguage();
  const unit =
    language === "zh"
      ? "每条横条表示：保存卡片中出现的次数"
      : "Each bar shows how many saved cards included this signal.";
  const countLabel = language === "zh" ? "次" : "cards";

  return (
    <SummaryBlockShell icon={icon} title={title} description={description} unit={unit}>
      <RankedSoftBars
        items={items}
        emptyText={<span>{lowDataText}</span>}
        unitLabel={countLabel}
      />
      {footnote && (
        <p className="mt-4 text-xs leading-5 text-[var(--foreground-subtle)]">
          {footnote}
        </p>
      )}
    </SummaryBlockShell>
  );
}

function DeeperNeedsBlock({ items }: { items: SummaryItem[] }) {
  const { language, t } = useLanguage();
  const copy =
    language === "zh"
      ? {
          title: "这些情绪下面更常出现的需要",
          desc: "从保存卡片里的“真正未被满足的需求”轻轻归纳。",
          empty: "再保存几张新的反思卡片后，这里会显示更稳定的需要线索。",
          note: "这不是诊断，只是从近期卡片中整理出的需求词。",
        }
      : {
          title: "What may sit underneath",
          desc: "A gentle read from the unmet-need layer in saved cards.",
          empty:
            "Save a few more new reflection cards to see steadier need signals here.",
          note:
            "This is not a diagnosis. It is a reflection of what appeared in recent cards.",
        };

  return (
    <Prompt2RankedBlock
      icon={HeartHandshake}
      title={copy.title}
      description={copy.desc}
      items={items}
      lowDataText={copy.empty}
      footnote={copy.note || t.summary.gentleReassuranceText}
    />
  );
}

function ObserveNextBlock({ items }: { items: SummaryItem[] }) {
  const { language } = useLanguage();
  const copy =
    language === "zh"
      ? {
          title: "接下来更值得观察什么",
          desc: "把卡片里的观察线索整理成更容易回看的提示。",
          empty: "保存新的反思卡片后，这里会显示更具体的观察方向。",
        }
      : {
          title: "What to observe next",
          desc: "Recurring observation cues from your saved reflection cards.",
          empty:
            "New reflection cards will make this section more specific over time.",
        };

  return (
    <SummaryBlockShell
      icon={Eye}
      title={copy.title}
      description={copy.desc}
    >
      {items.length === 0 ? (
        <LowDataState icon={Eye}>{copy.empty}</LowDataState>
      ) : (
        <div className="mt-5 grid gap-2.5">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.value}
              className="rounded-[1.1rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.66)] px-3.5 py-3"
            >
              <p className="text-sm font-medium leading-6 text-[var(--foreground)]">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                {item.count}×
              </p>
            </div>
          ))}
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
      unit={
        language === "zh"
          ? "这些信号来自已保存卡片和回看结果。"
          : "Signals come from saved cards and later check-ins."
      }
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
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--foreground-subtle)]">
                    {t.summary.seenInReflections.replace("{count}", String(item.used))}
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
                  className="rounded-2xl border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.76)] px-3 py-2 text-xs font-semibold text-[var(--brand-teal-deep)]"
                >
                  {item.value}
                  <span className="mt-1 block font-medium text-[var(--foreground-subtle)]">
                    {t.summary.seenInCheckIns.replace("{count}", String(item.count))}
                  </span>
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
  checkInCount,
}: {
  trendValues: number[];
  checkInCount: number;
}) {
  const { language, t } = useLanguage();
  const recentTotal = trendValues.reduce((sum, value) => sum + value, 0);
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
          ? "你已经有足够的最近记录，可以开始看见节奏。"
          : "You have enough recent entries to start noticing rhythm."
        : language === "zh"
          ? "再保存几张卡片后，节奏会更清楚。"
          : "A few more saved cards will make the rhythm clearer.";

  return (
    <SummaryBlockShell
      icon={LineChartIcon}
      title={t.summary.rhythmTitle}
      description={t.summary.rhythmDesc}
      unit={
        language === "zh"
          ? "每条竖条表示：当天保存的反思卡片数量"
          : "Each vertical bar shows saved reflection cards for that day."
      }
      interpretation={caption}
    >
      <WeeklyRhythmStrip
        values={trendValues}
        labels={dayLabels}
        unitLabel={language === "zh" ? "张卡片" : "cards"}
        emptyText={<span>{caption}</span>}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-medium text-[var(--brand-teal-deep)]">
          {t.summary.recentEntries.replace("{count}", String(recentTotal))}
        </span>
        <span className="rounded-full border border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)]">
          {checkInCount} {t.history.checkedIn}
        </span>
      </div>
    </SummaryBlockShell>
  );
}

function SummaryHeroBlock({
  repeatedTriggers,
  repeatedPatterns,
  repeatedNeeds,
  checkInSignals,
  reflectionCount,
}: {
  repeatedTriggers: SummaryItem[];
  repeatedPatterns: SummaryItem[];
  repeatedNeeds: SummaryItem[];
  checkInSignals: SummaryItem[];
  reflectionCount: number;
}) {
  const { language, t } = useLanguage();
  const topTrigger = repeatedTriggers[0]?.value || t.summary.noRepeatedTrigger;
  const topThought = repeatedPatterns[0]?.value || t.summary.noRepeatedThought;
  const topNeed =
    repeatedNeeds[0]?.value ||
    (language === "zh" ? "还在形成中" : "Still becoming clear");
  const topSignal =
    checkInSignals[0]?.value ||
    (language === "zh" ? "需要更多回看" : "More check-ins needed");
  const headline =
    repeatedTriggers[0] && repeatedPatterns[0]
      ? language === "zh"
        ? `最近反复出现的是：${topTrigger}，以及${topThought}。`
        : `${topTrigger} and ${topThought} keep returning lately.`
      : language === "zh"
        ? "你最近的反思，正在慢慢形成可以回看的线索。"
        : "Your recent reflections are starting to form a pattern you can return to.";
  const glanceItems = [
    [t.history.saved, String(reflectionCount)],
    [t.summary.repeatedTrigger, topTrigger],
    [t.summary.repeatedThoughtPattern, topThought],
    [language === "zh" ? "常见需要" : "Deeper need", topNeed],
    [t.summary.checkInSignals, topSignal],
  ] as const;

  return (
    <Card
      variant="elevated"
      className="overflow-hidden border-[rgba(31,155,143,0.15)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(238,249,244,0.58),rgba(255,248,226,0.24))] p-5 shadow-[0_22px_70px_rgba(20,35,28,0.07)] hover:translate-y-0 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
            {t.summary.narrativeTitle}
          </p>
          <h2 className="mt-3 max-w-2xl text-[1.55rem] font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-[1.75rem]">
            {headline}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.summary.heroSupport}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[topTrigger, topThought, topNeed]
              .filter(Boolean)
              .slice(0, 3)
              .map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[rgba(31,155,143,0.15)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]"
                >
                  {item}
                </span>
              ))}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.66)] p-3.5 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
            {t.summary.atAGlance}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {glanceItems.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[0.95rem] border border-[rgba(40,80,60,0.07)] bg-[rgba(255,254,248,0.58)] px-3 py-2"
              >
                <span className="block text-[11px] font-medium text-[var(--foreground-subtle)]">
                  {label}
                </span>
                <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-5 text-[var(--foreground)]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Prompt2SignalPath({
  repeatedTriggers,
  repeatedPatterns,
  repeatedNeeds,
  nextSteps,
}: {
  repeatedTriggers: SummaryItem[];
  repeatedPatterns: SummaryItem[];
  repeatedNeeds: SummaryItem[];
  nextSteps: Array<{ value: string; used: number; helped: number }>;
}) {
  const { language } = useLanguage();
  const copy =
    language === "zh"
      ? {
          title: "近期卡片里的主要线索",
          desc: "从触发点、情绪名字、需要和下一步四个层面轻轻归纳。",
          trigger: "触发点",
          demon: "情绪名字 / 模式",
          need: "未满足的需要",
          step: "常见下一步",
          empty: "继续保存反思后，这条线索会更清楚。",
        }
      : {
          title: "The main signal in recent cards",
          desc: "A light read across trigger, demon, need, and next step.",
          trigger: "Trigger",
          demon: "Demon / Pattern",
          need: "Unmet need",
          step: "Next step",
          empty: "Save more reflections to make this signal clearer.",
        };
  const signals = [
    [copy.trigger, repeatedTriggers[0]?.value],
    [copy.demon, repeatedPatterns[0]?.value],
    [copy.need, repeatedNeeds[0]?.value],
    [
      copy.step,
      nextSteps[0]?.value
        ? localizedCanonicalLabel(nextSteps[0].value, language)
        : "",
    ],
  ] as const;

  return (
    <Card
      variant="insight"
      className="rounded-[26px] border-[rgba(31,155,143,0.12)] bg-[rgba(255,254,248,0.82)] p-4 hover:translate-y-0 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
            {copy.title}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
            {copy.desc}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px] lg:grid-cols-4">
          {signals.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[1rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(246,242,233,0.46)] px-3 py-2.5"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                {label}
              </span>
              <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-5 text-[var(--foreground)]">
                {value || copy.empty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ShareableInsightDirection() {
  const { t } = useLanguage();

  return (
    <Card
      variant="support"
      className="rounded-[26px] border-[rgba(31,155,143,0.12)] bg-[linear-gradient(135deg,rgba(255,254,248,0.86),rgba(232,246,241,0.44))] p-4 hover:translate-y-0 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <IconFrame icon={Share2} size="sm" tone="sage" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                {t.summary.shareableInsightTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.summary.shareableInsightBody}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-2 lg:min-w-[420px]">
          {t.summary.shareableExamples.map((item) => (
            <div
              key={item}
              className="rounded-[1rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.72)] px-3 py-2.5 text-sm font-medium leading-5 text-[var(--foreground-muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmotionalWeatherCard({
  weatherType,
}: {
  weatherType: WeatherType;
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
      className="relative overflow-hidden rounded-[26px] border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.94),rgba(232,246,241,0.52),rgba(255,248,226,0.24))] p-4 shadow-[0_16px_48px_rgba(20,35,28,0.055)] hover:translate-y-0 sm:p-5"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(217,179,74,0.2),transparent_66%)]"
        aria-hidden="true"
      />
      <div className="relative grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.72)] shadow-[var(--shadow-sm)]">
          <WeatherIcon
            aria-hidden="true"
            size={25}
            strokeWidth={1.55}
            className="text-[var(--brand-teal-deep)]"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
            {t.summary.emotionalWeatherTitle}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-7 text-[var(--foreground)]">
            {t.summary.weather[weatherType]}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.summary.emotionalWeatherSubtitle}
          </p>
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
  const prompt2Cards = buildInsightCards(reflections, language);
  const repeatedTriggers = meaningfulTopPatterns(
    canonicalCards.map((item) => item.normalizedTrigger),
    language
  );
  const prompt2TriggerRows = countHumanLabels(
    prompt2Cards.map((item) => item.triggerLabel)
  );
  const prompt2PatternRows = countHumanLabels(
    prompt2Cards.map((item) => item.demonLabel || item.patternLabel)
  );
  const prompt2NeedRows = countHumanLabels(
    prompt2Cards.flatMap((item) => item.needLabels)
  );
  const repeatedDemonRows = meaningfulTopPatterns(
    canonicalCards.map((item) => item.normalizedDemon),
    language
  );
  const repeatedNeedRows = meaningfulTopPatterns(
    canonicalCards.map((item) => item.normalizedUnmetNeed),
    language
  );
  const summaryTriggerRows = prompt2TriggerRows.length
    ? prompt2TriggerRows
    : repeatedTriggers;
  const summaryPatternRows = prompt2PatternRows.length
    ? prompt2PatternRows
    : repeatedDemonRows.length
      ? repeatedDemonRows
      : meaningfulTopPatterns(
          canonicalCards.map((item) => item.normalizedThoughtPattern),
          language
        );
  const summaryNeedRows = prompt2NeedRows.length
    ? prompt2NeedRows
    : repeatedNeedRows;
  const prompt2ObserveRows = countHumanLabels(
    prompt2Cards.flatMap((item) => item.observeNext)
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
              <SummaryHeroBlock
                repeatedTriggers={summaryTriggerRows}
                repeatedPatterns={summaryPatternRows}
                repeatedNeeds={summaryNeedRows}
                checkInSignals={repeatedCheckInSignals}
                reflectionCount={reflectionCount}
              />
            </MotionBlock>
            <MotionBlock>
              <Prompt2SignalPath
                repeatedTriggers={summaryTriggerRows}
                repeatedPatterns={summaryPatternRows}
                repeatedNeeds={summaryNeedRows}
                nextSteps={nextSteps}
              />
            </MotionBlock>
            <MotionBlock>
              <ShareableInsightDirection />
            </MotionBlock>
            <MotionBlock>
              <EmotionalWeatherCard
                weatherType={emotionalWeatherType}
              />
            </MotionBlock>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <MotionBlock>
                <Prompt2RankedBlock
                  icon={BarChart3}
                  title={t.summary.keepsReturningTitle}
                  description={
                    language === "zh"
                      ? "这些情境更常成为情绪卡片的起点。"
                      : "The situations that most often begin the emotional loop."
                  }
                  items={summaryTriggerRows}
                  lowDataText={t.summary.moreReflectionsNeeded}
                />
              </MotionBlock>
              <MotionBlock>
                <Prompt2RankedBlock
                  icon={Brain}
                  title={
                    language === "zh"
                      ? "这次情绪的名字 / 主要思维模式"
                      : "Name the Demon / Thought Pattern"
                  }
                  description={
                    language === "zh"
                      ? "来自卡片里的“这次情绪的名字”和主要思维模式。"
                      : "From each card’s Name the Demon and Thought Pattern sections."
                  }
                  items={summaryPatternRows}
                  lowDataText={t.summary.moreReflectionsNeeded}
                />
              </MotionBlock>
              <MotionBlock>
                <DeeperNeedsBlock items={summaryNeedRows} />
              </MotionBlock>
              <MotionBlock>
                <HelpfulCheckInBlock
                  nextSteps={nextSteps}
                  checkInSignals={repeatedCheckInSignals}
                  checkInCount={checkInCount}
                />
              </MotionBlock>
              <MotionBlock>
                <ObserveNextBlock items={prompt2ObserveRows} />
              </MotionBlock>
              <MotionBlock>
                <ActivityRhythmBlock trendValues={trendValues} checkInCount={checkInCount} />
              </MotionBlock>
            </div>
          </div>
        </>
      )}
      {!hasError && loaded && user && hasEnoughData && (
        <div className="mt-7 flex flex-wrap gap-3">
          <LinkButton href="/dashboard/quick">{t.summary.createAnother}</LinkButton>
          <LinkButton href="/dashboard/history" variant="secondary">
            {t.summary.openHistory}
          </LinkButton>
        </div>
      )}
    </>
  );
}
