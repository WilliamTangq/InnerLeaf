"use client";

import {
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Footprints,
  Heart,
  MessageCircle,
  MessageCircleQuestion,
  MoreHorizontal,
  Route,
  Search,
  Send,
  Sparkles as SparklesIcon,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge, Card, IconFrame, LinkButton } from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { translateDetectedMode } from "../lib/i18n";
import { trackEvent } from "../lib/analytics";
import {
  canonicalFromSavedReflection,
  localizeMixedLanguageValue,
  localizedCanonicalLabel,
  shouldDisplayNormalizedChip,
} from "../lib/reflection-card";
import type { Reflection } from "./page";

const PROMPT2_SECTION_HEADINGS = [
  "Emotional Source",
  "这次情绪的来源",
  "Name the Demon",
  "这次情绪的名字",
  "Emotion Labels",
  "情绪标签",
  "Facts vs Imagination",
  "Facts vs Interpretation",
  "事实与想象",
  "事实 vs 想象",
  "事实与解读",
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
  "Emotional Validation",
  "Emotion",
  "Emotion Pattern",
  "Trigger",
  "Behaviour",
  "Behavioural Insight",
  "Reflection Question",
  "One Next Question",
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

  return match?.[1]
    ?.split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .join("\n")
    .trim() ?? "";
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

function cleanSectionList(value: string, max = 3) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^(facts|imagination|事实|想象)\s*[:：]?$/i.test(line))
    .slice(0, max);
}

function extractLabeledList(
  block: string,
  labelPattern: RegExp,
  stopPattern: RegExp,
  max = 2
) {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => labelPattern.test(line.trim()));

  if (startIndex === -1) {
    return [];
  }

  const items: string[] = [];

  for (const line of lines.slice(startIndex + 1)) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (stopPattern.test(trimmed)) {
      break;
    }

    const cleaned = trimmed.replace(/^[-*]\s*/, "").trim();

    if (cleaned) {
      items.push(cleaned);
    }
  }

  return items.slice(0, max);
}

function extractNextQuestion(aiResult: string | null) {
  return (
    extractSection(aiResult, "One Next Question") ||
    extractSection(aiResult, "Reflection Question")
  );
}

function cardLabels(aiResult: string | null) {
  return {
    trigger: extractSection(aiResult, "Trigger"),
    thoughtPattern: extractSection(aiResult, "Thought Pattern"),
    nextQuestion: extractNextQuestion(aiResult),
  };
}

type Labels = ReturnType<typeof useLanguage>["t"];

function checkInResultLabel(result: string | null, labels: Labels) {
  if (result === "Helped") {
    return labels.history.helped;
  }

  if (result === "Somewhat") {
    return labels.history.somewhat;
  }

  return labels.history.didNotHelp;
}

function followUpLabel(result: string | null, labels: Labels) {
  if (!result) {
    return labels.history.notCheckedIn;
  }

  return `${labels.history.checkedIn}: ${checkInResultLabel(result, labels)}`;
}

function formatHistoryDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatHistoryGroup(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function CanonicalDetailSection({
  icon: Icon,
  title,
  children,
  accent = false,
}: {
  icon: typeof Heart;
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={[
        "rounded-[22px] border p-4 sm:p-5",
        accent
          ? "border-[rgba(31,155,143,0.22)] bg-[linear-gradient(135deg,rgba(231,244,239,0.72),rgba(255,254,248,0.9))] ring-1 ring-[rgba(31,155,143,0.08)]"
          : "border-[rgba(40,80,60,0.095)] bg-[rgba(255,254,248,0.72)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <IconFrame icon={Icon} size="sm" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          {title}
        </h3>
      </div>
      <div className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.slice(0, 3).map((item) => (
        <li key={item} className="flex gap-2">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function sectionTitle(title: string, labels: Labels) {
  const map: Record<string, string> = {
    "What came up": labels.reflectionCard.emotionalValidation,
    Emotion: labels.reflectionCard.emotion,
    Trigger: labels.reflectionCard.trigger,
    Facts: labels.reflectionCard.facts,
    Interpretation: labels.reflectionCard.interpretation,
    "Thought pattern": labels.reflectionCard.thoughtPattern,
    Behaviour: labels.reflectionCard.behaviour,
    "Body / context": labels.reflectionCard.bodyContext,
    "Behavioural insight": labels.reflectionCard.behaviouralInsight,
    "One next question": labels.reflectionCard.nextQuestion,
    "One small next step": labels.reflectionCard.nextStep,
  };

  return map[title] || title;
}

function previewLine(value: string | null, max = 140) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  if (
    !text ||
    lower === "unspecified" ||
    lower === "not clearly identified" ||
    lower === "not identified"
  ) {
    return null;
  }

  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function parsePrompt2Details(item: Reflection) {
  const factsBlock = extractFirstSection(item.ai_result, [
    "Facts vs Imagination",
    "事实与想象",
    "事实 vs 想象",
  ]);
  const previewBlock = extractFirstSection(item.ai_result, [
    "Save Card Preview",
    "保存卡片预览",
  ]);

  return {
    emotionalSource: extractFirstSection(item.ai_result, [
      "Emotional Source",
      "这次情绪的来源",
    ]),
    demonNames: cleanSectionList(
      extractFirstSection(item.ai_result, ["Name the Demon", "这次情绪的名字"]),
      2
    ),
    emotionLabels: cleanSectionList(
      extractFirstSection(item.ai_result, ["Emotion Labels", "情绪标签"]),
      3
    ),
    facts: extractLabeledList(
      factsBlock,
      /^(facts|事实)\s*[:：]?$/i,
      /^(imagination|想象)\s*[:：]?$/i,
      2
    ),
    imaginations: extractLabeledList(
      factsBlock,
      /^(imagination|想象)\s*[:：]?$/i,
      /^(facts|事实)\s*[:：]?$/i,
      2
    ),
    unmetNeed: extractFirstSection(item.ai_result, [
      "Unmet Need",
      "真正未被满足的需求",
    ]),
    nextStep: extractFirstSection(item.ai_result, [
      "One Small Next Step",
      "一个小行动",
    ]),
    openHypotheses: cleanSectionList(
      extractFirstSection(item.ai_result, [
        "Open Hypotheses",
        "仍需验证的几种可能",
      ])
    ),
    thoughtPattern: extractFirstSection(item.ai_result, [
      "Thought Pattern",
      "主要思维模式",
    ]),
    mindProtecting: extractFirstSection(item.ai_result, [
      "What Your Mind Might Be Protecting",
      "大脑正在保护什么",
    ]),
    behaviouralPull: cleanSectionList(
      extractFirstSection(item.ai_result, [
        "Behavioural Pull",
        "你可能会被拉向的行为",
      ])
    ),
    observeNext: cleanSectionList(
      extractFirstSection(item.ai_result, [
        "What to Observe Next",
        "接下来观察什么",
      ])
    ),
    saveCardPreview: cleanSectionList(previewBlock, 6),
  };
}

function formatFollowUpDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function parseCheckInNote(value: string | null) {
  if (!value) {
    return { feelNow: "", differentNow: "", legacy: "" };
  }

  try {
    const parsed = JSON.parse(value) as {
      feel_now?: unknown;
      different_now?: unknown;
    };

    return {
      feelNow: typeof parsed.feel_now === "string" ? parsed.feel_now : "",
      differentNow:
        typeof parsed.different_now === "string" ? parsed.different_now : "",
      legacy: "",
    };
  } catch {
    return { feelNow: "", differentNow: "", legacy: value };
  }
}

function serializeCheckInNote(feelNow: string, differentNow: string) {
  return JSON.stringify({
    feel_now: feelNow.trim(),
    different_now: differentNow.trim(),
  });
}

function toHistoryCard(item: Reflection) {
  const canonical = canonicalFromSavedReflection(item);
  const prompt2 = parsePrompt2Details(item);
  const extractedLabels = cardLabels(item.ai_result);
  const originalInput =
    typeof item.user_input === "string" ? item.user_input.trim() : "";
  const trigger = previewLine(canonical.triggerLabel) || extractedLabels.trigger || "";
  const thoughtPattern =
    previewLine(canonical.thoughtPatternLabel) ||
    previewLine(prompt2.thoughtPattern, 140) ||
    extractedLabels.thoughtPattern ||
    "";
  const oneNextQuestion =
    previewLine(canonical.nextQuestion) || extractedLabels.nextQuestion || "";
  const oneSmallNextStep =
    previewLine(canonical.nextStep) ||
    previewLine(prompt2.nextStep, 260) ||
    extractSection(item.ai_result, "One Small Next Step") ||
    "";

  return {
    id: item.id,
    createdAt: item.created_at,
    originalInput,
    mainEmotion: previewLine(canonical.mainEmotion, 80) || "",
    secondaryEmotion: previewLine(canonical.secondaryEmotion, 80) || "",
    shortTitle: previewLine(canonical.shortTitle, 100) || "",
    moodChip: previewLine(canonical.moodChip, 60) || "",
    trigger,
    normalizedTrigger: canonical.normalizedTrigger,
    normalizedThoughtPattern: canonical.normalizedThoughtPattern,
    normalizedDemon: canonical.normalizedDemon,
    normalizedUnmetNeed: canonical.normalizedUnmetNeed,
    normalizedNextStepType: canonical.normalizedNextStepType,
    normalizedCheckInSignal: canonical.normalizedCheckInSignal,
    scenarioCategory: canonical.scenarioCategory,
    primaryDemon: canonical.primaryDemon,
    unmetNeed: canonical.unmetNeed,
    observeNext: canonical.observeNextItems,
    facts: canonical.factsSummary.length ? canonical.factsSummary : prompt2.facts,
    interpretations: canonical.interpretationSummary.length
      ? canonical.interpretationSummary
      : prompt2.imaginations,
    thoughtPattern,
    behaviouralInsight: previewLine(canonical.behaviouralInsight, 280) || "",
    oneSmallNextStep,
    oneNextQuestion,
    userFeedback: {
      result: item.follow_up_result,
      note: item.follow_up_note,
    },
    checkInStatus: item.follow_up_result ? "checked_in" : "not_checked_in",
    nextStepType: previewLine(canonical.nextStepType, 60) || "",
    modeLabel: canonical.mode,
    reflectionLanguage: canonical.reflectionLanguage,
    modeDetected: canonical.modeDetected,
    prompt2: {
      emotionalSource:
        previewLine(prompt2.emotionalSource, 420) ||
        previewLine(canonical.emotionalValidation, 420) ||
        "",
      demonNames: (
        prompt2.demonNames.length ? prompt2.demonNames : [canonical.primaryDemon]
      )
        .filter(Boolean)
        .map((name) =>
          localizedCanonicalLabel(
            localizeMixedLanguageValue(name, canonical.reflectionLanguage),
            canonical.reflectionLanguage
          )
        ),
      emotionLabels: prompt2.emotionLabels.length
        ? prompt2.emotionLabels.map((label) =>
            localizeMixedLanguageValue(label, canonical.reflectionLanguage)
          )
        : [canonical.mainEmotion, canonical.secondaryEmotion].filter(Boolean),
      unmetNeed:
        previewLine(prompt2.unmetNeed, 420) ||
        previewLine(canonical.unmetNeed, 220) ||
        previewLine(canonical.behaviouralInsight, 420) ||
        "",
      nextStep:
        previewLine(prompt2.nextStep, 320) ||
        previewLine(canonical.nextStep, 320) ||
        "",
      openHypotheses: prompt2.openHypotheses.map((item) =>
        localizeMixedLanguageValue(item, canonical.reflectionLanguage)
      ),
      thoughtPattern:
        previewLine(
          localizeMixedLanguageValue(
            prompt2.thoughtPattern,
            canonical.reflectionLanguage
          ),
          360
        ) ||
        previewLine(canonical.thoughtPatternLabel, 180) ||
        "",
      mindProtecting:
        previewLine(prompt2.mindProtecting, 360) ||
        previewLine(canonical.bodyFactor, 240) ||
        "",
      behaviouralPull: prompt2.behaviouralPull.length
        ? prompt2.behaviouralPull.map((item) =>
            localizeMixedLanguageValue(item, canonical.reflectionLanguage)
          )
        : canonical.behaviour
          ? [canonical.behaviour]
          : [],
      observeNext: (prompt2.observeNext.length
        ? prompt2.observeNext
        : canonical.observeNextItems
      ).map((item) =>
        localizeMixedLanguageValue(item, canonical.reflectionLanguage)
      ),
      saveCardPreview: prompt2.saveCardPreview.map((item) =>
        localizeMixedLanguageValue(item, canonical.reflectionLanguage)
      ),
    },
    raw: item,
  };
}

type HistoryChip = {
  key: string;
  value: string;
  variant: "accent" | "outline";
};

function primaryHistoryChips(card: ReturnType<typeof toHistoryCard>) {
  const rawChips: HistoryChip[] = [
    {
      key: "trigger",
      value: card.normalizedTrigger,
      variant: "accent",
    },
    {
      key: "pattern",
      value: card.normalizedDemon,
      variant: "outline",
    },
    {
      key: "need",
      value: card.normalizedUnmetNeed,
      variant: "outline",
    },
  ];
  const meaningful = rawChips.filter((chip) =>
    shouldDisplayNormalizedChip(chip.value)
  );

  if (meaningful.length > 0) {
    return meaningful.slice(0, 2);
  }

  return [];
}

function detailHistoryChips(card: ReturnType<typeof toHistoryCard>) {
  return [
    {
      key: "trigger",
      value: card.normalizedTrigger,
      variant: "accent" as const,
    },
    {
      key: "demon",
      value: card.normalizedDemon,
      variant: "outline" as const,
    },
    {
      key: "pattern",
      value: card.normalizedThoughtPattern,
      variant: "outline" as const,
    },
    {
      key: "need",
      value: card.normalizedUnmetNeed,
      variant: "outline" as const,
    },
    {
      key: "step",
      value: card.normalizedNextStepType,
      variant: "outline" as const,
    },
  ]
    .filter((chip) => shouldDisplayNormalizedChip(chip.value))
    .slice(0, 4);
}

function checkInChipValue(card: ReturnType<typeof toHistoryCard>) {
  return card.normalizedCheckInSignal !== "not_checked_in"
    ? card.normalizedCheckInSignal
    : "";
}

function Prompt2HistoryDetail({
  card,
  item,
}: {
  card: ReturnType<typeof toHistoryCard>;
  item: Reflection;
}) {
  const detailLanguage = card.reflectionLanguage;
  const copy =
    detailLanguage === "zh"
      ? {
          whatYouWrote: "你当时写了什么",
          source: "这次情绪的来源",
          demon: "这次情绪的名字",
          emotions: "情绪标签",
          trigger: "触发点",
          facts: "事实",
          notIdentified: "尚未清楚识别。",
          factsImagination: "事实与想象",
          imagination: "想象",
          unmetNeed: "真正未被满足的需求",
          nextStep: "一个小行动",
          deeper: "更深一层",
          deepHint: "可选查看",
          hypotheses: "仍需验证的几种可能",
          thought: "主要思维模式",
          protecting: "大脑正在保护什么",
          pull: "你可能会被拉向的行为",
          observe: "接下来观察什么",
          preview: "保存卡片预览",
        }
      : {
          whatYouWrote: "What you wrote",
          source: "Emotional Source",
          demon: "Name the Demon",
          emotions: "Emotion Labels",
          trigger: "Trigger",
          facts: "Facts",
          notIdentified: "Not clearly identified.",
          factsImagination: "Facts vs Imagination",
          imagination: "Imagination",
          unmetNeed: "Unmet Need",
          nextStep: "One Small Next Step",
          deeper: "Deeper layer",
          deepHint: "Optional",
          hypotheses: "Open hypotheses",
          thought: "Thought Pattern",
          protecting: "What your mind might be protecting",
          pull: "Behavioural pull",
          observe: "What to observe next",
          preview: "Save Card Preview",
        };
  const hasDeepLayer =
    card.prompt2.openHypotheses.length > 0 ||
    card.prompt2.thoughtPattern ||
    card.prompt2.mindProtecting ||
    card.prompt2.behaviouralPull.length > 0 ||
    card.prompt2.observeNext.length > 0 ||
    card.prompt2.saveCardPreview.length > 0;

  return (
    <div className="space-y-4">
      {card.originalInput && (
        <CanonicalDetailSection icon={FileText} title={copy.whatYouWrote}>
          <p className="whitespace-pre-wrap text-[var(--foreground-muted)]">
            {card.originalInput}
          </p>
        </CanonicalDetailSection>
      )}

      {card.prompt2.emotionalSource && (
        <CanonicalDetailSection icon={Heart} title={copy.source} accent>
          <p className="whitespace-pre-wrap">{card.prompt2.emotionalSource}</p>
        </CanonicalDetailSection>
      )}

      {(card.prompt2.demonNames.length > 0 || card.oneNextQuestion) && (
        <CanonicalDetailSection icon={SparklesIcon} title={copy.demon}>
          {card.prompt2.demonNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {card.prompt2.demonNames.map((name) => (
                <Badge key={name} variant="accent">
                  {name}
                </Badge>
              ))}
            </div>
          )}
          {card.oneNextQuestion && (
            <p className="mt-3 whitespace-pre-wrap text-[var(--foreground)]">
              {card.oneNextQuestion}
            </p>
          )}
        </CanonicalDetailSection>
      )}

      {card.prompt2.emotionLabels.length > 0 && (
        <CanonicalDetailSection icon={Heart} title={copy.emotions}>
          <div className="flex flex-wrap gap-2">
            {card.prompt2.emotionLabels.slice(0, 3).map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </CanonicalDetailSection>
      )}

      {(card.trigger || card.facts.length > 0 || card.interpretations.length > 0) && (
        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          {card.trigger && (
            <CanonicalDetailSection icon={Zap} title={copy.trigger}>
              <p className="whitespace-pre-wrap">{card.trigger}</p>
            </CanonicalDetailSection>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <CanonicalDetailSection icon={FileText} title={copy.facts}>
              {card.facts.length > 0 ? (
                <BulletList items={card.facts} />
              ) : (
                <p>{copy.notIdentified}</p>
              )}
            </CanonicalDetailSection>
            <CanonicalDetailSection icon={MessageCircle} title={copy.imagination}>
              {card.interpretations.length > 0 ? (
                <BulletList items={card.interpretations} />
              ) : (
                <p>{copy.notIdentified}</p>
              )}
            </CanonicalDetailSection>
          </div>
        </div>
      )}

      {card.prompt2.unmetNeed && (
        <CanonicalDetailSection icon={Route} title={copy.unmetNeed}>
          <p className="whitespace-pre-wrap">{card.prompt2.unmetNeed}</p>
        </CanonicalDetailSection>
      )}

      {card.prompt2.nextStep && (
        <CanonicalDetailSection icon={Footprints} title={copy.nextStep} accent>
          <p className="whitespace-pre-wrap text-[var(--foreground)]">
            {card.prompt2.nextStep}
          </p>
        </CanonicalDetailSection>
      )}

      {hasDeepLayer && (
        <details className="group rounded-[24px] border border-[rgba(40,80,60,0.105)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 marker:hidden">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--foreground)]">
              <IconFrame icon={Brain} size="sm" />
              {copy.deeper}
            </span>
            <span className="text-xs font-semibold text-[var(--brand-teal-deep)]">
              {copy.deepHint}
            </span>
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {card.prompt2.openHypotheses.length > 0 && (
              <CanonicalDetailSection icon={MessageCircleQuestion} title={copy.hypotheses}>
                <BulletList items={card.prompt2.openHypotheses} />
              </CanonicalDetailSection>
            )}
            {card.prompt2.thoughtPattern && (
              <CanonicalDetailSection icon={Brain} title={copy.thought}>
                <p className="whitespace-pre-wrap">{card.prompt2.thoughtPattern}</p>
              </CanonicalDetailSection>
            )}
            {card.prompt2.mindProtecting && (
              <CanonicalDetailSection icon={Heart} title={copy.protecting}>
                <p className="whitespace-pre-wrap">{card.prompt2.mindProtecting}</p>
              </CanonicalDetailSection>
            )}
            {card.prompt2.behaviouralPull.length > 0 && (
              <CanonicalDetailSection icon={Route} title={copy.pull}>
                <BulletList items={card.prompt2.behaviouralPull} />
              </CanonicalDetailSection>
            )}
            {card.prompt2.observeNext.length > 0 && (
              <CanonicalDetailSection icon={MessageCircleQuestion} title={copy.observe}>
                <BulletList items={card.prompt2.observeNext} />
              </CanonicalDetailSection>
            )}
            {card.prompt2.saveCardPreview.length > 0 && (
              <CanonicalDetailSection icon={CheckCircle2} title={copy.preview}>
                <div className="flex flex-wrap gap-2">
                  {card.prompt2.saveCardPreview.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CanonicalDetailSection>
            )}
          </div>
        </details>
      )}

      <NextStepCheckIn reflection={item} />
    </div>
  );
}

export function isVisibleHistoryReflection(item: Reflection) {
  const card = toHistoryCard(item);
  const input = card.originalInput.toLowerCase();
  const trigger = card.trigger.toLowerCase();
  const lowQualityInputs = new Set([
    "test",
    "testing",
    "stress",
    "stressed",
    "sad",
    "angry",
  ]);
  const weakTriggers = [
    "unspecified",
    "not clearly identified",
    "not identified",
    "尚未清楚识别",
    "未明确",
  ];

  if (!card.originalInput && !card.trigger && !card.thoughtPattern) {
    return false;
  }

  if (lowQualityInputs.has(input)) {
    return false;
  }

  if (input.length > 0 && input.length < 8 && !input.includes(" ")) {
    return false;
  }

  if (!trigger || weakTriggers.some((value) => trigger.includes(value))) {
    return false;
  }

  return true;
}

function NextStepCheckIn({ reflection }: { reflection: Reflection }) {
  const { language, t } = useLanguage();
  const { role, session } = useAuth();
  const initialNote = parseCheckInNote(reflection.follow_up_note);
  const [selectedResult, setSelectedResult] = useState(
    reflection.follow_up_result ?? ""
  );
  const [feelNow, setFeelNow] = useState(initialNote.feelNow);
  const [differentNow, setDifferentNow] = useState(initialNote.differentNow);
  const [savedResult, setSavedResult] = useState(
    reflection.follow_up_result ?? ""
  );
  const [savedFeelNow, setSavedFeelNow] = useState(initialNote.feelNow);
  const [savedDifferentNow, setSavedDifferentNow] = useState(
    initialNote.differentNow
  );
  const [savedLegacyNote, setSavedLegacyNote] = useState(initialNote.legacy);
  const [savedAt, setSavedAt] = useState(reflection.follow_up_at ?? "");
  const [showForm, setShowForm] = useState(Boolean(reflection.follow_up_result));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const canonical = canonicalFromSavedReflection(reflection);
  const nextStep = previewLine(reflection.next_step, 220);
  const nextStepType = canonical.normalizedNextStepType;
  const savedDate = formatFollowUpDate(savedAt);

  if (!nextStep) {
    return null;
  }

  async function saveCheckIn() {
    if (!selectedResult) {
      return;
    }

    setStatus("saving");

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          id: reflection.id,
          follow_up_result: selectedResult,
          follow_up_note: serializeCheckInNote(feelNow, differentNow),
        }),
      });

      if (!response.ok) {
        throw new Error("Check-in failed");
      }

      setSavedResult(selectedResult);
      setSavedFeelNow(feelNow.trim());
      setSavedDifferentNow(differentNow.trim());
      setSavedLegacyNote("");
      setSavedAt(new Date().toISOString());
      setStatus("saved");
      setShowForm(true);
      toast.success(t.history.checkInSaved);
      trackEvent("check_in_completed", {
        locale: language,
        authenticated_state: Boolean(session),
        role_bucket: role ?? "user",
        has_feel_now: Boolean(feelNow.trim()),
        has_different_now: Boolean(differentNow.trim()),
        result_bucket: selectedResult,
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] p-4 ring-1 ring-[rgba(31,155,143,0.08)]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(217,179,74,0.20),transparent_66%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-center gap-2">
        <IconFrame icon={Footprints} size="sm" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {t.reflectionCard.nextStep}
          </h3>
        </div>
        {shouldDisplayNormalizedChip(nextStepType) && (
          <Badge variant="accent">
            {localizedCanonicalLabel(nextStepType, language)}
          </Badge>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
        {nextStep}
      </p>

      {savedResult ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.16)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(239,249,245,0.72))] px-4 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <CheckCircle2
                aria-hidden="true"
                size={16}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              {t.history.checkInSummary}
            </p>
            <Badge variant="accent">{checkInResultLabel(savedResult, t)}</Badge>
          </div>
          {savedDate && (
            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              {t.history.checkedInAt} {savedDate}
            </p>
          )}
          <div className="mt-3 grid gap-2">
            {(savedFeelNow || savedLegacyNote) && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {t.history.feelsNow}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {savedFeelNow || savedLegacyNote}
                </p>
              </div>
            )}
            {savedDifferentNow && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {t.history.differentNow}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {savedDifferentNow}
                </p>
              </div>
            )}
          </div>
          {status === "saved" && (
            <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {t.feedbackPrompt.title}
                  </p>
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
                      authenticated_state: Boolean(session),
                      role_bucket: role ?? "user",
                      source: "check_in",
                    })
                  }
                >
                  {t.feedbackPrompt.cta}
                </LinkButton>
              </div>
            </div>
          )}
        </div>
      ) : !showForm ? (
        <button
          type="button"
          onClick={() => {
            trackEvent("check_in_opened", {
              locale: language,
              authenticated_state: Boolean(session),
              role_bucket: role ?? "user",
              had_previous_check_in: false,
            });
            setShowForm(true);
          }}
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition duration-200 ease-[var(--motion-ease)] hover:bg-[var(--brand-teal-deep)] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
          {t.history.checkInCta}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {t.history.checkInCta}
          </p>
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t.history.feelsNow}
            </span>
            <textarea
              value={feelNow}
              onChange={(event) => setFeelNow(event.target.value)}
              rows={2}
              className="mt-2 min-h-20 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
              placeholder={t.history.feelsNowPlaceholder}
            />
          </label>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {t.history.helpedQuestion}
          </p>
          <div className="flex flex-wrap gap-2">
            {["Helped", "Somewhat", "Did not help"].map((result) => {
              const isSelected = selectedResult === result;

              return (
                <button
                  key={result}
                  type="button"
                  onClick={() => setSelectedResult(result)}
                  className={[
                    "rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                    isSelected
                      ? "border-[rgba(31,155,143,0.28)] bg-[var(--brand-teal)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  {checkInResultLabel(result, t)}
                </button>
              );
            })}
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t.history.differentNow}
            </span>
            <textarea
              value={differentNow}
              onChange={(event) => setDifferentNow(event.target.value)}
              rows={3}
              className="mt-2 min-h-24 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
              placeholder={t.history.differentNowPlaceholder}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveCheckIn}
              disabled={!selectedResult || status === "saving"}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition duration-200 ease-[var(--motion-ease)] hover:bg-[var(--brand-teal-deep)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            >
              <Send aria-hidden="true" size={15} strokeWidth={1.8} />
              {status === "saving" ? t.history.savingCheckIn : t.history.saveCheckIn}
            </button>
            {status === "saved" && (
              <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.78)] px-3 py-1.5 text-sm font-medium text-[var(--brand-teal-deep)]">
                <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
                {t.history.checkInSaved}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-[var(--error)]">
                {t.common.checkInError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReflectionCards({
  reflections,
  onDeleted,
}: {
  reflections: Reflection[];
  onDeleted?: (id: string | number) => void;
}) {
  const { language, t } = useLanguage();
  const { role, session, user } = useAuth();
  const [openCards, setOpenCards] = useState<Set<string | number>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string | number>>(new Set());
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string | number;
    title: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("all");
  const [needFilter, setNeedFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const baseReflections = reflections.filter((item) => !hiddenIds.has(item.id));
  const cardCache = useMemo(
    () => new Map(baseReflections.map((item) => [item.id, toHistoryCard(item)])),
    [baseReflections]
  );
  const filterCopy =
    language === "zh"
      ? {
          search: "搜索历史记录",
          allTriggers: "所有触发点",
          allNeeds: "所有需要",
          allPatterns: "所有模式",
          allDates: "所有时间",
          today: "今天",
          week: "最近 7 天",
          month: "最近 30 天",
          noMatches: "没有符合筛选条件的反思记录。",
          clear: "清除筛选",
          trigger: "触发点",
          need: "需要",
          pattern: "模式",
          nextStep: "下一步",
        }
      : {
          search: "Search history",
          allTriggers: "All triggers",
          allNeeds: "All needs",
          allPatterns: "All patterns",
          allDates: "All dates",
          today: "Today",
          week: "Last 7 days",
          month: "Last 30 days",
          noMatches: "No reflections match those filters.",
          clear: "Clear filters",
          trigger: "Trigger",
          need: "Unmet need",
          pattern: "Pattern",
          nextStep: "Next step",
        };
  const makeOptions = (values: string[]) =>
    Array.from(new Set(values.filter(shouldDisplayNormalizedChip))).sort();
  const triggerOptions = makeOptions(
    baseReflections.map((item) => cardCache.get(item.id)?.normalizedTrigger ?? "")
  );
  const needOptions = makeOptions(
    baseReflections.map((item) => cardCache.get(item.id)?.normalizedUnmetNeed ?? "")
  );
  const patternOptions = makeOptions(
    baseReflections.map((item) => cardCache.get(item.id)?.normalizedThoughtPattern ?? "")
  );
  const visibleReflections = baseReflections.filter((item) => {
    const card = cardCache.get(item.id);

    if (!card) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();
    const searchable = [
      card.originalInput,
      card.trigger,
      card.thoughtPattern,
      card.unmetNeed,
      card.oneSmallNextStep,
      card.prompt2.emotionalSource,
    ]
      .join(" ")
      .toLowerCase();
    const created = new Date(item.created_at);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / 86400000;

    return (
      (!query || searchable.includes(query)) &&
      (triggerFilter === "all" || card.normalizedTrigger === triggerFilter) &&
      (needFilter === "all" || card.normalizedUnmetNeed === needFilter) &&
      (patternFilter === "all" ||
        card.normalizedThoughtPattern === patternFilter) &&
      (dateFilter === "all" ||
        (dateFilter === "today" && created.toDateString() === now.toDateString()) ||
        (dateFilter === "week" && diffDays <= 7) ||
        (dateFilter === "month" && diffDays <= 30))
    );
  });
  const groupedReflections = visibleReflections.reduce<
    Array<{ label: string; items: Reflection[] }>
  >((groups, item) => {
    const label = formatHistoryGroup(item.created_at);
    const latest = groups.at(-1);

    if (latest?.label === label) {
      latest.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }

    return groups;
  }, []);

  function toggleCard(id: string | number) {
    setOpenCards((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        trackEvent("reflection_detail_opened", {
          locale: language,
          authenticated_state: Boolean(user),
          role_bucket: role ?? "user",
          has_check_in: Boolean(
            visibleReflections.find((item) => item.id === id)?.follow_up_result
          ),
        });
      }

      return next;
    });
  }

  async function confirmDeleteReflection() {
    const id = pendingDelete?.id;

    if (!session?.access_token) {
      return;
    }

    if (!id) {
      return;
    }

    setDeletingId(id);
    setMenuOpenId(null);

    try {
      const response = await fetch("/api/reflections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: String(id) }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setHiddenIds((current) => new Set(current).add(id));
      setOpenCards((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      onDeleted?.(id);
      window.dispatchEvent(
        new CustomEvent("innerleaf:reflection-deleted", {
          detail: { id },
        })
      );
      setPendingDelete(null);
      toast.success(t.history.deleteSuccess);
    } catch (error) {
      console.error("Reflection delete error:", error);
      toast.error(t.history.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  function requestDelete(id: string | number, title: string) {
    setMenuOpenId(null);
    setPendingDelete({ id, title });
  }

  return (
    <div className="space-y-8">
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[1600] flex items-end justify-center bg-[rgba(20,28,24,0.34)] px-3 py-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-reflection-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-[rgba(40,80,60,0.12)] bg-[rgba(255,254,248,0.98)] p-4 shadow-[0_28px_100px_rgba(20,35,28,0.22)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  {t.history.privateControl}
                </p>
                <h2
                  id="delete-reflection-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]"
                >
                  {t.history.deleteConfirmTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.82)] text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                aria-label={t.common.cancel}
              >
                <X aria-hidden="true" size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mt-4 rounded-[18px] border border-[rgba(40,80,60,0.08)] bg-[rgba(246,242,233,0.56)] p-3">
              <p className="line-clamp-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                {pendingDelete.title}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.history.deleteConfirmBody}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--foreground-muted)]">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{t.history.deleteHistoryImpact}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{t.history.deleteSummaryImpact}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(155,55,55,0.72)]" />
                <span>{t.history.deleteCannotUndo}</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.82)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteReflection()}
                disabled={deletingId === pendingDelete.id}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(155,55,55,0.20)] bg-[rgba(155,55,55,0.075)] px-4 py-2.5 text-sm font-semibold text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
                {deletingId === pendingDelete.id
                  ? t.history.deletingReflection
                  : t.history.deleteConfirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-[24px] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.68)] p-3 shadow-[var(--shadow-sm)]">
        <div className="grid gap-2 md:grid-cols-[1.2fr_repeat(4,minmax(0,0.7fr))]">
          <label className="relative block">
            <Search
              aria-hidden="true"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]"
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={filterCopy.search}
              className="min-h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
          </label>
          {[
            {
              value: triggerFilter,
              onChange: setTriggerFilter,
              all: filterCopy.allTriggers,
              options: triggerOptions,
            },
            {
              value: needFilter,
              onChange: setNeedFilter,
              all: filterCopy.allNeeds,
              options: needOptions,
            },
            {
              value: patternFilter,
              onChange: setPatternFilter,
              all: filterCopy.allPatterns,
              options: patternOptions,
            },
          ].map((filter) => (
            <select
              key={filter.all}
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              className="min-h-11 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground-muted)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            >
              <option value="all">{filter.all}</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {localizedCanonicalLabel(option, language)}
                </option>
              ))}
            </select>
          ))}
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="min-h-11 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground-muted)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
          >
            <option value="all">{filterCopy.allDates}</option>
            <option value="today">{filterCopy.today}</option>
            <option value="week">{filterCopy.week}</option>
            <option value="month">{filterCopy.month}</option>
          </select>
        </div>
      </div>

      {visibleReflections.length === 0 && (
        <Card variant="support" className="text-center hover:translate-y-0">
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">
            {filterCopy.noMatches}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setTriggerFilter("all");
              setNeedFilter("all");
              setPatternFilter("all");
              setDateFilter("all");
            }}
            className="mt-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
          >
            {filterCopy.clear}
          </button>
        </Card>
      )}

      {groupedReflections.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              {group.label}
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="space-y-3">
            {group.items.map((item) => {
              const card = toHistoryCard(item);
              const isOpen = openCards.has(item.id);
              const previewChips = primaryHistoryChips(card);
              const expandedChips = detailHistoryChips(card);
              const checkedInSignal = checkInChipValue(card);
              const inputPreview = previewLine(card.originalInput, 180);
              const headline =
                previewLine(card.shortTitle, 100) ||
                previewLine(card.prompt2.demonNames[0], 80) ||
                previewLine(card.prompt2.emotionalSource, 110) ||
                previewLine(item.emotional_validation, 110) ||
                previewLine(card.originalInput, 100) ||
                "Reflection card";

              const validation = previewLine(item.emotional_validation, 360);
              const hasFactsVsInterpretation =
                card.facts.length > 0 || card.interpretations.length > 0;
              const hasStructuredDetail =
                validation ||
                card.mainEmotion ||
                card.trigger ||
                card.thoughtPattern ||
                card.behaviouralInsight ||
                hasFactsVsInterpretation ||
                card.oneNextQuestion ||
                card.oneSmallNextStep;
              const hasPrompt2Detail = Boolean(
                card.prompt2.emotionalSource ||
                  card.prompt2.demonNames.length ||
                  card.prompt2.emotionLabels.length ||
                  card.prompt2.unmetNeed ||
                  card.prompt2.nextStep ||
                  card.prompt2.openHypotheses.length ||
                  card.prompt2.mindProtecting ||
                  card.prompt2.behaviouralPull.length ||
                  card.prompt2.observeNext.length ||
                  card.prompt2.saveCardPreview.length
              );

              return (
                <Card
                  key={item.id}
                  variant="insight"
                  className={[
                    "relative overflow-visible rounded-[28px] transition duration-200 ease-[var(--motion-ease)]",
                    isOpen
                      ? "hover:translate-y-0"
                      : "hover:-translate-y-0.5 hover:border-[rgba(31,155,143,0.18)] hover:shadow-[0_24px_70px_rgba(20,35,28,0.075)]",
                  ].join(" ")}
                >
                  <div className="absolute right-3 top-3 z-20">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpenId((current) =>
                          current === item.id ? null : item.id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.86)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                      aria-label={t.history.cardActions}
                      aria-expanded={menuOpenId === item.id}
                    >
                      <MoreHorizontal aria-hidden="true" size={17} strokeWidth={1.9} />
                    </button>
                    {menuOpenId === item.id && (
                      <div className="absolute right-0 top-11 w-56 rounded-[18px] border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.98)] p-2 shadow-[0_18px_54px_rgba(20,35,28,0.14)]">
                        <button
                          type="button"
                          onClick={() => requestDelete(item.id, headline)}
                          className="flex w-full items-start gap-3 rounded-[14px] px-3 py-2.5 text-left transition hover:bg-[rgba(155,55,55,0.055)]"
                        >
                          <Trash2
                            aria-hidden="true"
                            size={16}
                            strokeWidth={1.8}
                            className="mt-0.5 shrink-0 text-[var(--error)]"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-[var(--foreground)]">
                              {t.history.deleteReflection}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-[var(--foreground-subtle)]">
                              {t.history.deleteMenuHint}
                            </span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCard(item.id)}
                    aria-expanded={isOpen}
                    className="block w-full rounded-[inherit] pr-10 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <time
                          dateTime={item.created_at}
                          className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[var(--foreground-subtle)]"
                          title={formatHistoryDate(item.created_at)}
                        >
                          <Clock3
                            aria-hidden="true"
                            size={13}
                            strokeWidth={1.8}
                            className="text-[var(--brand-teal-deep)]/70"
                          />
                          <span>{formatHistoryDate(item.created_at)}</span>
                        </time>
                        {card.modeLabel && (
                          <span className="shrink-0 rounded-full border border-[rgba(40,80,60,0.11)] bg-[rgba(246,242,233,0.66)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                            {card.modeLabel === "guided" ? t.nav.guided : t.nav.quick}
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-2 text-base font-semibold leading-6 text-[var(--foreground)] sm:line-clamp-1">
                        {headline}
                      </p>

                      {inputPreview && (
                        <div className="rounded-[18px] border border-[rgba(40,80,60,0.075)] bg-[rgba(255,254,248,0.58)] px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                            {t.history.whatYouWrote}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--foreground-muted)]">
                            {inputPreview}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {previewChips.map((chip) => (
                          <Badge key={chip.key} variant={chip.variant}>
                            {localizedCanonicalLabel(chip.value, language)}
                          </Badge>
                        ))}
                        {item.follow_up_result && checkedInSignal && (
                          <Badge variant="accent">
                            {localizedCanonicalLabel(checkedInSignal, language)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-2 rounded-[18px] border border-[rgba(40,80,60,0.07)] bg-[rgba(255,254,248,0.46)] p-3 text-xs leading-5 text-[var(--foreground-muted)] sm:grid-cols-2">
                        {[
                          [filterCopy.trigger, card.trigger],
                          [filterCopy.pattern, card.thoughtPattern],
                          [filterCopy.need, card.unmetNeed],
                          [filterCopy.nextStep, card.oneSmallNextStep],
                        ]
                          .filter(([, value]) => Boolean(previewLine(value, 120)))
                          .map(([label, value]) => (
                            <p key={label}>
                              <span className="font-semibold text-[var(--foreground-subtle)]">
                                {label}:{" "}
                              </span>
                              {previewLine(value, 120)}
                            </p>
                          ))}
                      </div>
                    </div>
                    <span className="mt-3 inline-flex text-xs font-semibold text-[var(--brand-teal-deep)]">
                      {isOpen ? t.history.collapse : t.history.readFull}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-5 space-y-4 border-t border-[rgba(40,80,60,0.09)] pt-5">
                      <div className="rounded-[28px] border border-[rgba(40,80,60,0.105)] bg-[linear-gradient(135deg,rgba(255,255,248,0.96),rgba(242,249,244,0.76))] p-4 shadow-[0_18px_70px_rgba(20,35,28,0.08)] sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                              <CalendarClock
                                aria-hidden="true"
                                size={14}
                                strokeWidth={1.8}
                                className="text-[var(--brand-teal-deep)]"
                              />
                              {formatHistoryDate(item.created_at)}
                            </p>
                            <h3 className="mt-3 text-xl font-semibold leading-8 text-[var(--foreground)]">
                              {headline}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.mode_detected && item.mode_detected !== "General" && (
                              <Badge variant="outline">
                                {translateDetectedMode(language, item.mode_detected)}
                              </Badge>
                            )}
                            {shouldDisplayNormalizedChip(card.normalizedNextStepType) && (
                              <Badge variant="accent">
                                {localizedCanonicalLabel(
                                  card.normalizedNextStepType,
                                  language
                                )}
                              </Badge>
                            )}
                            {item.follow_up_result && (
                              <Badge variant="accent">
                                {followUpLabel(item.follow_up_result, t)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {card.moodChip && <Badge variant="accent">{card.moodChip}</Badge>}
                          {expandedChips.map((chip) => (
                            <Badge key={chip.key} variant={chip.variant}>
                              {localizedCanonicalLabel(chip.value, language)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {hasPrompt2Detail ? (
                        <Prompt2HistoryDetail card={card} item={item} />
                      ) : (
                        <>
                      {card.originalInput && (
                        <CanonicalDetailSection
                          icon={FileText}
                          title={t.history.whatYouWrote}
                        >
                          <p className="whitespace-pre-wrap text-[var(--foreground-muted)]">
                            {card.originalInput}
                          </p>
                        </CanonicalDetailSection>
                      )}

                      {validation && (
                        <CanonicalDetailSection
                          icon={Heart}
                          title={sectionTitle("What came up", t)}
                          accent
                        >
                          <p className="whitespace-pre-wrap">{validation}</p>
                        </CanonicalDetailSection>
                      )}

                      {card.trigger && (
                        <CanonicalDetailSection
                          icon={Zap}
                          title={sectionTitle("Trigger", t)}
                        >
                          <p className="whitespace-pre-wrap">{card.trigger}</p>
                        </CanonicalDetailSection>
                      )}

                      {hasFactsVsInterpretation && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <CanonicalDetailSection
                            icon={FileText}
                            title={sectionTitle("Facts", t)}
                          >
                            {card.facts.length > 0 ? (
                              <BulletList items={card.facts} />
                            ) : (
                              <p>{t.reflectionCard.notIdentified}</p>
                            )}
                          </CanonicalDetailSection>
                          <CanonicalDetailSection
                            icon={MessageCircle}
                            title={sectionTitle("Interpretation", t)}
                          >
                            {card.interpretations.length > 0 ? (
                              <BulletList items={card.interpretations} />
                            ) : (
                              <p>{t.reflectionCard.notIdentified}</p>
                            )}
                          </CanonicalDetailSection>
                        </div>
                      )}

                      {card.thoughtPattern && (
                        <CanonicalDetailSection
                          icon={Brain}
                          title={sectionTitle("Thought pattern", t)}
                        >
                          <p className="whitespace-pre-wrap">{card.thoughtPattern}</p>
                        </CanonicalDetailSection>
                      )}

                      {card.behaviouralInsight && (
                        <CanonicalDetailSection
                          icon={Route}
                          title={sectionTitle("Behavioural insight", t)}
                        >
                          <p className="whitespace-pre-wrap">
                            {card.behaviouralInsight}
                          </p>
                        </CanonicalDetailSection>
                      )}

                      {card.oneNextQuestion && (
                        <CanonicalDetailSection
                          icon={MessageCircleQuestion}
                          title={sectionTitle("One next question", t)}
                          accent
                        >
                          <p className="whitespace-pre-wrap text-[var(--foreground)]">
                            {card.oneNextQuestion}
                          </p>
                        </CanonicalDetailSection>
                      )}

                      {!hasStructuredDetail && item.ai_result && (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                          {item.ai_result}
                        </p>
                      )}
                      <NextStepCheckIn reflection={item} />
                        </>
                      )}
                      <div className="flex flex-col gap-3 rounded-[22px] border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.62)] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {t.history.deleteReflection}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                            {t.history.deleteDetailHint}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => requestDelete(item.id, headline)}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[rgba(155,55,55,0.16)] bg-[rgba(255,254,248,0.82)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--error-bg)] hover:text-[var(--error)]"
                        >
                          <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
                          {t.history.deleteReflection}
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
