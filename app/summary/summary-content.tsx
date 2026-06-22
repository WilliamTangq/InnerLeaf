"use client";

import { BarChart3, CheckCircle2, Footprints, Leaf, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  EmptyState,
  IconFrame,
  LinkButton,
  MiniBar,
  MiniSparkline,
  PageActions,
  PageHeader,
  StatusCard,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { trackEvent } from "../lib/analytics";
import { translateNextStepType } from "../lib/i18n";

type SummaryReflection = {
  id: string | number;
  created_at: string;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
  next_step_type: string | null;
  next_step: string | null;
  follow_up_result: string | null;
  follow_up_at: string | null;
};

function cleanRawLabel(value: string | null) {
  return (value ?? "")
    .replace(/^\s*\d+\.\s*/g, "")
    .replace(/^[-*•]\s*/g, "")
    .replace(/^["“”'‘’]+|["“”'‘’]+$/g, "")
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
        [/reassurance/i, "Reassurance-seeking"],
        [/avoid/i, "Avoidance"],
        [/over.?general/i, "Overgeneralisation"],
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
        [/确认|安慰/, "反复确认"],
        [/回避|逃避/, "回避"],
        [/概括/, "过度概括"],
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

function joinReadable(items: string[], language: "en" | "zh") {
  const values = items.filter(Boolean).slice(0, 2);

  if (values.length === 0) {
    return language === "zh" ? "几个不同触发点" : "a few different triggers";
  }

  if (values.length === 1) {
    return values[0];
  }

  return language === "zh" ? `${values[0]}和${values[1]}` : `${values[0]} and ${values[1]}`;
}

function thoughtExplanation(pattern: string, language: "en" | "zh") {
  const lower = pattern.toLowerCase();

  if (language === "zh") {
    if (/读心|mind/.test(pattern)) return "信息不完整时，大脑容易先替别人补全意思。";
    if (/灾难|catastroph/.test(pattern)) return "不确定时，注意力容易先跳到较坏的可能性。";
    if (/比较|comparison/.test(pattern)) return "你可能会把别人的状态当作衡量自己的依据。";
    if (/个人化|personal/.test(pattern)) return "你可能会把别人的反应过快地归因到自己身上。";
    if (/非黑即白|all/.test(pattern)) return "事情容易被看成只有成功或失败两种结果。";
    if (/情绪化推理|emotional/.test(pattern)) return "感受很强时，它可能会被当成事实。";
    if (/确认|reassurance/.test(pattern)) return "不确定时，你可能会想通过反复确认来降低不安。";
    if (/回避|avoid/.test(pattern)) return "压力升高时，先避开会短暂减轻负担。";
    if (/自责|blame/.test(pattern)) return "你可能会先把责任放到自己身上。";
    if (/概括|general/.test(pattern)) return "一次事件容易被理解成更大的固定模式。";
    return "这个模式可能影响了你理解当下的方式。";
  }

  if (lower.includes("mind")) return "When information is missing, your mind may fill in the other person's meaning.";
  if (lower.includes("catastroph")) return "Uncertainty may pull attention toward the worst possible explanation.";
  if (lower.includes("comparison")) return "Someone else's situation may become a quick measure of your own.";
  if (lower.includes("personal")) return "Another person's behaviour may start to feel like a statement about you.";
  if (lower.includes("all-or-nothing")) return "The moment may start to feel like either success or failure.";
  if (lower.includes("emotional")) return "A strong feeling may start to feel like evidence.";
  if (lower.includes("reassurance")) return "Uncertainty may create an urge to check or seek confirmation.";
  if (lower.includes("avoid")) return "Stepping away may briefly reduce pressure when the moment feels too much.";
  if (lower.includes("blame")) return "You may be putting responsibility on yourself before the facts are clear.";
  if (lower.includes("general")) return "One event may start to feel like proof of a larger pattern.";
  return "This pattern may be shaping how the moment gets interpreted.";
}

function behaviourSentence(behaviour: string, language: "en" | "zh") {
  if (!behaviour) {
    return language === "zh"
      ? "你的行为模式还不够清楚，需要更多卡片来对比。"
      : "Your behavioural pattern is not clear enough yet; more cards will make it easier to compare.";
  }

  if (language === "zh") {
    const map: Record<string, string> = {
      反复查看: "你可能会反复查看、等待、重读，或在心里回放这件事。",
      回避: "你可能会先避开、拖延，或把回应推迟到压力小一点的时候。",
      寻求确认: "你可能会想通过确认、提问或等待回应来让自己稳定下来。",
      情绪化发送消息: "你可能会在情绪很满时想立刻发送消息或回应。",
      稳定自己: "你已经开始用一些让身体和情绪降速的动作来回应。",
      澄清事实: "你开始把事实和假设分开，再决定下一步怎么回应。",
      停摆: "压力很高时，你可能会停下来、卡住，或暂时动不了。",
      延迟行动: "你可能会选择先等待，让反应慢一点再发生。",
    };
    return map[behaviour] || `你的反应里反复出现的是：${behaviour}。`;
  }

  const map: Record<string, string> = {
    "Checking behaviour": "You tend to check, wait, reread, or mentally replay the situation before responding.",
    Avoidance: "You tend to step back, delay, or avoid the moment until the pressure feels lower.",
    "Reassurance-seeking": "You may look for confirmation before your system feels settled.",
    "Emotional messaging": "You may feel pulled to message or respond while the emotion is still high.",
    "Self-soothing": "You are starting to use small actions that slow the body and emotion down.",
    "Clarifying facts": "You are starting to separate facts from assumptions before choosing a response.",
    Shutdown: "When pressure rises, you may freeze, shut down, or find it hard to start.",
    "Delaying action": "You may wait before acting so the first reaction has time to settle.",
  };
  return map[behaviour] || `One repeated behavioural theme is ${behaviour}.`;
}

function changeNoticed(
  stepType: string,
  behaviour: string,
  language: "en" | "zh"
) {
  const signal = `${stepType} ${behaviour}`.toLowerCase();

  if (language === "zh") {
    if (/clarify|澄清|fact|事实/.test(signal)) {
      return "一个小变化是，你开始在反应前区分事实和假设。";
    }
    if (/pause|暂停|delay|等待|延迟/.test(signal)) {
      return "一个小变化是，你开始给反应留出一点暂停空间。";
    }
    if (/self|稳定|soothe|休息|呼吸/.test(signal)) {
      return "一个小变化是，你开始先稳定身体和情绪，再处理事情。";
    }
    if (/communicate|沟通|消息/.test(signal)) {
      return "一个小变化是，你开始把回应变得更慢、更清楚。";
    }
    return "一个小变化是，你已经在把混乱的反应整理成可以回看的卡片。";
  }

  if (/clarify|fact/.test(signal)) {
    return "One small change is that you are starting to pause and separate facts from assumptions before reacting.";
  }
  if (/pause|delay|wait/.test(signal)) {
    return "One small change is that you are creating a little space before responding.";
  }
  if (/self|soothe|rest|breath/.test(signal)) {
    return "One small change is that you are starting with stabilising yourself before solving the situation.";
  }
  if (/communicate|message/.test(signal)) {
    return "One small change is that you are making responses slower and clearer.";
  }
  return "One small change is that you are turning messy reactions into cards you can review.";
}

function suggestedFocus(pattern: string, language: "en" | "zh") {
  const lower = pattern.toLowerCase();

  if (language === "zh") {
    if (/读心|mind/.test(pattern)) return "下一次反思时，先写下一个事实和两个其他可能解释。";
    if (/灾难|catastroph/.test(pattern)) return "下一次反思时，区分最坏情况、中性情况和最可能情况。";
    if (/比较|comparison/.test(pattern)) return "下一次反思时，先停止查看触发源，再回到一个自己的真实需要。";
    if (/个人化|personal/.test(pattern)) return "下一次反思时，把对方的行为和你的自我价值分开看。";
    if (/非黑即白|all/.test(pattern)) return "下一次反思时，只选择一个 10 分钟的开始动作。";
    if (/情绪化推理|emotional/.test(pattern)) return "下一次反思时，先命名感受，再检查事实是否支持它。";
    if (/确认|reassurance/.test(pattern)) return "下一次反思时，可以先写下想发送的话，但晚一点再决定是否发送。";
    if (/回避|avoid/.test(pattern)) return "下一次反思时，选择一个阻力最低的小动作。";
    if (/自责|blame/.test(pattern)) return "下一次反思时，只识别哪些部分真的在你的控制范围内。";
    if (/概括|general/.test(pattern)) return "下一次反思时，看看这是一次事件，还是已经被多次证明的模式。";
    return "下一次反思时，专注识别一个事实和一个假设，再选择回应。";
  }

  if (lower.includes("mind")) return "For your next reflection, write one fact and two alternative explanations before choosing a response.";
  if (lower.includes("catastroph")) return "For your next reflection, separate the worst-case, neutral-case, and most likely case.";
  if (lower.includes("comparison")) return "For your next reflection, stop checking the trigger source and return to one personal need.";
  if (lower.includes("personal")) return "For your next reflection, separate the other person's behaviour from your own worth.";
  if (lower.includes("all-or-nothing")) return "For your next reflection, choose one 10-minute starting action.";
  if (lower.includes("emotional")) return "For your next reflection, name the feeling first, then check whether the facts support it.";
  if (lower.includes("reassurance")) return "For your next reflection, draft the message but wait before sending.";
  if (lower.includes("avoid")) return "For your next reflection, choose one low-friction action.";
  if (lower.includes("blame")) return "For your next reflection, identify what was actually under your control.";
  if (lower.includes("general")) return "For your next reflection, ask whether this is one event or a repeated proven pattern.";
  return "For your next reflection, focus on identifying one fact and one assumption before choosing a response.";
}

function SummaryNarrativeCard({
  repeatedTriggers,
  repeatedThoughtPatterns,
  behaviouralThemes,
  nextStepTypes,
  reflectionCount,
  checkInCount,
  trendValues,
}: {
  repeatedTriggers: Array<{ value: string; count: number }>;
  repeatedThoughtPatterns: Array<{ value: string; count: number }>;
  behaviouralThemes: Array<{ value: string; count: number }>;
  nextStepTypes: Array<{ value: string; count: number }>;
  reflectionCount: number;
  checkInCount: number;
  trendValues: number[];
}) {
  const { language, t } = useLanguage();
  const topTrigger = repeatedTriggers[0]?.value || "";
  const themeTriggers = joinReadable(
    repeatedTriggers.map((item) => item.value),
    language
  );
  const topThought = repeatedThoughtPatterns[0]?.value || "";
  const topBehaviour = behaviouralThemes[0]?.value || "";
  const topStepType = nextStepTypes[0]?.value || "";
  const rows = [
    [
      t.summary.recentEmotionalTheme,
      t.summary.recentEmotionalThemeText.replace("{triggers}", themeTriggers),
    ],
    [
      t.summary.repeatedTrigger,
      topTrigger
        ? t.summary.repeatedTriggerText.replace("{trigger}", topTrigger)
        : t.summary.noRepeatedTrigger,
    ],
    [
      t.summary.repeatedThoughtPattern,
      topThought
        ? t.summary.repeatedThoughtPatternText
            .replace("{pattern}", topThought)
            .replace("{explanation}", thoughtExplanation(topThought, language))
        : t.summary.noRepeatedThought,
    ],
    [
      t.summary.behaviouralPattern,
      behaviourSentence(topBehaviour, language),
    ],
    [
      t.summary.changeNoticed,
      changeNoticed(topStepType, topBehaviour, language),
    ],
    [t.summary.gentleReassurance, t.summary.gentleReassuranceText],
    [
      t.summary.suggestedFocus,
      suggestedFocus(topThought, language),
    ],
  ];

  return (
    <Card variant="elevated" className="hover:translate-y-0">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
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
          <dl className="grid gap-2">
            {rows.map(([label, text]) => (
              <div
                key={label}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {label}
                </dt>
                <dd className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-[1.35rem] border border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(231,244,239,0.54),rgba(255,254,248,0.82))] p-4">
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
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
            <li
              key={item.value}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium leading-6 text-[var(--foreground)]">
                  {item.value}
                </span>
                <span className="shrink-0 text-xs text-[var(--foreground-subtle)]">
                  {item.count}×
                </span>
              </div>
              <div className="mt-2.5">
                <MiniBar
                  label={item.value}
                  value={item.count}
                  max={maxCount}
                  detail={`${item.count}×`}
                />
              </div>
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

function CheckInSignalsSection({
  settledTriggers,
  repeatingTriggers,
}: {
  settledTriggers: Array<{ value: string; count: number }>;
  repeatingTriggers: Array<{ value: string; count: number }>;
}) {
  const { t } = useLanguage();

  if (settledTriggers.length === 0 && repeatingTriggers.length === 0) {
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
  const repeatedNextStepTypes = topPatterns(
    reflections.map((item) => cleanRawLabel(item.next_step_type))
  );
  const nextStepCounts = new Map<string, { value: string; used: number; helped: number }>();
  const settledTriggerValues: string[] = [];

  reflections.forEach((item) => {
    const type = cleanRawLabel(item.next_step_type);
    const result = cleanRawLabel(item.follow_up_result);
    const trigger = normalizeCategory(item.trigger, language, "trigger");

    if (!type || !result) {
      return;
    }

    const current = nextStepCounts.get(type) ?? { value: type, used: 0, helped: 0 };
    current.used += 1;
    if (result === "Helped" || result === "Somewhat") {
      current.helped += 1;
      if (trigger) {
        settledTriggerValues.push(trigger);
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
              behaviouralThemes={recentBehaviouralThemes}
              nextStepTypes={repeatedNextStepTypes}
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
                title={t.summary.behaviouralThemes}
                description={t.summary.behaviouralThemesDesc}
                items={recentBehaviouralThemes}
              />
            </div>
            <HelpfulNextStepsSection items={nextSteps} />
            <CheckInSignalsSection
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
