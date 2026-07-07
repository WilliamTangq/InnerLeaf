import {
  Brain,
  ChevronDown,
  CheckCircle2,
  Footprints,
  Heart,
  HelpCircle,
  Leaf,
  ListChecks,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Card, LinkButton, PageActions, PrimaryButton, SectionLabel } from "./ui";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { translateDetectedMode, translations } from "../lib/i18n";
import {
  createCanonicalReflectionCard,
  localizeMixedLanguageValue,
  localizedCanonicalLabel,
  shouldDisplayNormalizedChip,
  type ReflectionMode,
  type ReflectionLanguage,
} from "../lib/reflection-card";

export type StructuredReflectionResult = {
  scenario_category?: string;
  emotional_source?: string;
  demon_names?: string[];
  core_question?: string;
  emotion_labels?: string[];
  imaginations?: string[];
  unmet_need_surface?: string;
  unmet_need_deeper?: string;
  unmet_need_explanation?: string;
  next_step_text?: string;
  next_step_body_aware_first?: boolean;
  open_hypotheses?: string[];
  thought_pattern_key?: string;
  thought_pattern_label?: string;
  thought_pattern_label_en?: string;
  thought_pattern_label_zh?: string;
  mind_protecting?: string;
  behavioural_pull_items?: string[];
  behavioural_pull_note?: string;
  observe_next_items?: string[];
  save_card_preview?: {
    category?: string;
    emotion?: string;
    trigger?: string;
    pattern?: string;
    need?: string;
    next_step?: string;
  };
  emotional_validation?: string;
  moment_summary?: string;
  emotion?: string;
  secondary_emotion?: string;
  trigger?: string;
  facts?: string[];
  interpretation?: string[];
  thought_pattern?: string;
  thought_pattern_explanation?: string;
  behaviour?: string;
  body_factor?: string;
  behavioural_insight?: string;
  next_question?: string;
  next_step_type?: string;
  next_step?: string;
  mode_detected?: string;
  gentle_observation?: string;
  safety_note?: string;
  safetyNote?: string;
  captured_clearly?: string;
  still_unclear?: string;
  completed_reflection?: string;
} | null;

type SavedReflectionSignal = {
  trigger?: string | null;
  thought_pattern?: string | null;
};

const SECTIONS = [
  { key: "Emotional Validation", label: "What came up" },
  { key: "Trigger", label: "Trigger" },
  { key: "Facts vs Interpretation", label: "Facts & interpretation" },
  { key: "Thought Pattern", label: "Thought pattern" },
  { key: "Behaviour", label: "Behaviour" },
  { key: "Body / context", label: "Body / context" },
  { key: "Behavioural Insight", label: "Behavioural insight" },
  { key: "One Next Question", label: "One next question" },
  { key: "One Small Next Step", label: "One small next step" },
] as const;

const sectionIcons = {
  "What came up": Sparkles,
  Emotion: Heart,
  Trigger: Zap,
  Facts: ListChecks,
  Interpretation: Route,
  "Thought pattern": Brain,
  Behaviour: Footprints,
  "Body / context": Waves,
  "Behavioural insight": Leaf,
  "One next question": MessageCircleQuestion,
  "One small next step": Footprints,
  "Captured clearly": ListChecks,
  "Still unclear": HelpCircle,
  "Completed reflection": Leaf,
} as const;

function extractSection(text: string, section: string) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion|Trigger|Facts vs Interpretation|Thought Pattern|Behaviour|Body / context|Behavioural Insight|One Next Question|One Small Next Step|What You Captured Clearly|What May Still Be Unclear|Completed Reflection Card)\\s*\\n|$)`,
    "i"
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function parseSections(result: string) {
  const parsed = SECTIONS.map(({ key, label }) => ({
    label,
    content: extractSection(result, key),
  })).filter((s) => s.content);

  return parsed.length > 0 ? parsed : null;
}

function compactItems(items?: string[]) {
  return (items ?? []).filter(Boolean).slice(0, 2);
}

function compactDeepItems(items?: string[]) {
  return (items ?? []).filter(Boolean).slice(0, 3);
}

function shortenWords(value?: string, maxWords = 25) {
  const text = value?.trim();

  if (!text) {
    return "";
  }

  const words = text.split(/\s+/);
  return words.length > maxWords
    ? `${words.slice(0, maxWords).join(" ")}...`
    : text;
}

function normaliseSignal(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function countMatching(
  history: SavedReflectionSignal[],
  key: keyof SavedReflectionSignal,
  current?: string
) {
  const signal = normaliseSignal(current);

  if (!signal) {
    return 0;
  }

  return history.filter((item) => {
    const saved = normaliseSignal(item[key]);
    return (
      saved &&
      (saved === signal || saved.includes(signal) || signal.includes(saved))
    );
  }).length;
}

function ReflectionSection({
  label,
  labelText,
  content,
  tone = "default",
}: {
  label: string;
  labelText?: string;
  content?: string;
  tone?: "default" | "highlight";
}) {
  if (!content) {
    return null;
  }

  const Icon = sectionIcons[label as keyof typeof sectionIcons] || Leaf;

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border p-3.5 transition duration-200 sm:p-4",
        tone === "highlight"
          ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] ring-1 ring-[rgba(31,155,143,0.12)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-teal-deep)]"
          aria-hidden="true"
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          {labelText || label}
        </h3>
      </div>
      <div
        className={[
          "mt-2 whitespace-pre-wrap text-[var(--foreground-muted)]",
          tone === "highlight" ? "text-[15px] leading-7" : "text-sm leading-6",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}

function Prompt2ModuleCard({
  index,
  title,
  icon: Icon,
  children,
  accent = false,
  className = "",
}: {
  index: number;
  title: string;
  icon: typeof Leaf;
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[1.35rem] border p-3.5 sm:p-4",
        accent
          ? "border-[rgba(31,155,143,0.22)] bg-[linear-gradient(135deg,rgba(232,246,241,0.78),rgba(255,254,248,0.94))] shadow-[0_18px_48px_rgba(31,155,143,0.09)] ring-1 ring-[rgba(31,155,143,0.09)]"
          : "border-[rgba(40,80,60,0.095)] bg-[rgba(255,254,248,0.74)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--surface)] text-[11px] font-bold text-[var(--brand-teal-deep)]">
          {index}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
          <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
        </span>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {title}
        </h3>
      </div>
      <div className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
        {children}
      </div>
    </section>
  );
}

function Prompt2PillList({
  items,
  empty,
  accent = false,
}: {
  items: string[];
  empty: string;
  accent?: boolean;
}) {
  if (items.length === 0) {
    return <p>{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={[
            "rounded-full border px-3 py-1.5 text-xs font-semibold",
            accent
              ? "border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
          ].join(" ")}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Prompt2ResultModules({
  structured,
  labels,
  language,
  nextStepType,
}: {
  structured: NonNullable<StructuredReflectionResult>;
  labels: ReturnType<typeof useLanguage>["t"]["reflectionCard"];
  language: "en" | "zh";
  nextStepType?: string;
}) {
  const copy =
    language === "zh"
      ? {
          source: "这次情绪的来源",
          demon: "这次情绪的名字",
          emotions: "情绪标签",
          facts: "事实",
          imagination: "想象",
          unmetNeed: "真正未被满足的需求",
          surface: "表面诉求可能是",
          deeper: "更深层的需求可能是",
          nextStep: "一个小行动",
          deeperInsight: "更深一层",
          deepHint: "可选查看",
          hypotheses: "仍需验证的几种可能",
          thoughtPattern: "主要思维模式",
          mindProtecting: "大脑正在保护什么",
          behaviouralPull: "你可能会被拉向的行为",
          observeNext: "接下来观察什么",
          preview: "保存卡片预览",
          noEmotion: "用户没有明确命名情绪。",
        }
      : {
          source: "Emotional Source",
          demon: "Name the Demon",
          emotions: "Emotion Labels",
          facts: "Facts",
          imagination: "Imagination",
          unmetNeed: "Unmet Need",
          surface: "Surface ask may be",
          deeper: "Deeper need may be",
          nextStep: "One Small Next Step",
          deeperInsight: "Deeper layer",
          deepHint: "Optional",
          hypotheses: "Open hypotheses",
          thoughtPattern: "Main thought pattern",
          mindProtecting: "What your mind might be protecting",
          behaviouralPull: "Behavioural pull",
          observeNext: "What to observe next",
          preview: "Save Card Preview",
          noEmotion: "No emotion was explicitly named.",
        };
  const facts = compactItems(structured.facts);
  const imaginations = compactItems(structured.imaginations ?? structured.interpretation);
  const emotionLabels = compactDeepItems(structured.emotion_labels);
  const demonNames = compactItems(structured.demon_names);
  const previewItems = Object.entries(structured.save_card_preview ?? {})
    .filter(([, value]) => typeof value === "string" && value.trim())
    .map(([key, value]) => ({
      key,
      value: String(value),
    }));
  const thoughtLabel = localizeMixedLanguageValue(
    structured.thought_pattern_label ||
      (language === "zh"
      ? structured.thought_pattern_label_zh ||
        structured.thought_pattern_label_en
      : structured.thought_pattern_label_en ||
        structured.thought_pattern_label_zh) ||
      structured.thought_pattern ||
      "",
    language
  );
  const localizedDemonNames = demonNames.map((name) =>
    localizedCanonicalLabel(name, language)
  );
  const unmetNeedLines = [
    structured.unmet_need_surface && `${copy.surface}: ${structured.unmet_need_surface}`,
    structured.unmet_need_deeper && `${copy.deeper}: ${structured.unmet_need_deeper}`,
    structured.unmet_need_explanation,
  ].filter(Boolean) as string[];
  const deepModuleCount = [
    structured.open_hypotheses?.length,
    thoughtLabel || structured.thought_pattern,
    structured.mind_protecting || structured.body_factor,
    structured.behavioural_pull_items?.length || structured.behavioural_pull_note,
    structured.observe_next_items?.length,
    previewItems.length,
  ].filter(Boolean).length;

  return (
    <div className="mt-5 grid gap-4">
      <div className="rounded-[calc(var(--radius-xl)+10px)] border border-[rgba(31,155,143,0.16)] bg-[linear-gradient(145deg,rgba(255,254,248,0.98),rgba(236,248,243,0.64))] p-3 shadow-[0_24px_70px_rgba(20,35,28,0.07)] sm:p-4">
        <div className="grid gap-3">
          <Prompt2ModuleCard index={1} title={copy.source} icon={Sparkles} accent>
            <p>{structured.emotional_source || structured.emotional_validation}</p>
          </Prompt2ModuleCard>

          <div className="grid gap-3 md:grid-cols-2">
            <Prompt2ModuleCard index={2} title={copy.demon} icon={Zap}>
              <Prompt2PillList
                items={localizedDemonNames}
                empty={labels.notIdentified}
                accent
              />
              {structured.core_question && (
                <p className="mt-3 text-[var(--foreground)]">
                  {structured.core_question}
                </p>
              )}
            </Prompt2ModuleCard>

            <Prompt2ModuleCard index={3} title={copy.emotions} icon={Heart}>
              <Prompt2PillList
                items={emotionLabels}
                empty={copy.noEmotion}
              />
            </Prompt2ModuleCard>
          </div>

          <Prompt2ModuleCard
            index={4}
            title={language === "zh" ? "事实与想象" : "Facts vs Imagination"}
            icon={ListChecks}
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(255,254,248,0.78)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  {copy.facts}
                </p>
                {facts.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {facts.map((fact) => (
                      <li key={fact}>- {fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2">{labels.notIdentified}</p>
                )}
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(255,254,248,0.78)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  {copy.imagination}
                </p>
                {imaginations.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {imaginations.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2">{labels.notIdentified}</p>
                )}
              </div>
            </div>
          </Prompt2ModuleCard>

          <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
            <Prompt2ModuleCard index={5} title={copy.unmetNeed} icon={Route}>
              <div className="space-y-2">
                {unmetNeedLines.length ? (
                  unmetNeedLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p>{labels.notIdentified}</p>
                )}
              </div>
            </Prompt2ModuleCard>

            <Prompt2ModuleCard
              index={6}
              title={copy.nextStep}
              icon={Footprints}
              accent
              className="border-[rgba(31,155,143,0.28)] bg-[linear-gradient(135deg,rgba(231,244,239,0.98),rgba(255,248,226,0.58))]"
            >
              <div className="flex flex-wrap items-center gap-2">
                {nextStepType && shouldDisplayNormalizedChip(nextStepType) && (
                  <span className="rounded-full border border-[rgba(31,155,143,0.24)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-teal-deep)]">
                    {localizedCanonicalLabel(nextStepType, language)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] leading-7 text-[var(--foreground)]">
                {structured.next_step_text || structured.next_step}
              </p>
              <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                {labels.nextStepHint}
              </p>
            </Prompt2ModuleCard>
          </div>
        </div>
      </div>

      {deepModuleCount > 0 && (
        <details className="group rounded-[calc(var(--radius-xl)+4px)] border border-[rgba(40,80,60,0.11)] bg-[rgba(255,254,248,0.78)] p-3.5 shadow-[var(--shadow-sm)] sm:p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--foreground)] marker:hidden">
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
              <Leaf size={15} strokeWidth={1.8} aria-hidden="true" />
            </span>
            {copy.deeperInsight}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
            {copy.deepHint}
            <ChevronDown
              aria-hidden="true"
              size={15}
              strokeWidth={1.8}
              className="text-[var(--foreground-subtle)] transition group-open:rotate-180"
            />
          </span>
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ReflectionSection
            label="One next question"
            labelText={copy.hypotheses}
            content={compactDeepItems(structured.open_hypotheses).join("\n")}
          />
          <ReflectionSection
            label="Thought pattern"
            labelText={copy.thoughtPattern}
            content={[
              thoughtLabel || structured.thought_pattern,
              structured.thought_pattern_explanation,
            ]
              .filter(Boolean)
              .join("\n")}
          />
          <ReflectionSection
            label="Body / context"
            labelText={copy.mindProtecting}
            content={structured.mind_protecting || structured.body_factor}
          />
          <ReflectionSection
            label="Behaviour"
            labelText={copy.behaviouralPull}
            content={[
              ...compactDeepItems(structured.behavioural_pull_items),
              structured.behavioural_pull_note,
            ]
              .filter(Boolean)
              .join("\n")}
          />
          <ReflectionSection
            label="One next question"
            labelText={copy.observeNext}
            content={compactDeepItems(structured.observe_next_items).join("\n")}
          />
          {previewItems.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 sm:p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-teal-deep)]">
                  <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="text-sm font-medium text-[var(--foreground)]">
                  {copy.preview}
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {previewItems.map((item) => (
                  <span
                    key={item.key}
                    className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)]"
                  >
                    {item.value}
                  </span>
            ))}
              </div>
            </div>
          )}
        </div>
      </details>
      )}

      <ReflectionSection
        label="Still unclear"
        labelText={labels.safetyNote}
        content={structured.safety_note || structured.safetyNote}
        tone="highlight"
      />
    </div>
  );
}

export function ReflectionResultCard({
  result,
  structured,
  showActions = true,
  statusText,
  saved = false,
  saving = false,
  onSave,
  onReflectAgain,
  autoSaved = false,
  noSaveMode = false,
  mode = "quick",
  reflectionLanguage,
}: {
  result: string;
  structured?: StructuredReflectionResult;
  showActions?: boolean;
  statusText?: string;
  saved?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onReflectAgain?: () => void;
  autoSaved?: boolean;
  noSaveMode?: boolean;
  mode?: ReflectionMode;
  reflectionLanguage?: ReflectionLanguage;
}) {
  const { language } = useLanguage();
  const displayLanguage = reflectionLanguage ?? language;
  const displayT = translations[displayLanguage];
  const { session } = useAuth();
  const [history, setHistory] = useState<SavedReflectionSignal[]>([]);
  const [checkInState, setCheckInState] = useState("");
  const [clarityFeedback, setClarityFeedback] = useState("");
  const [clarityIssue, setClarityIssue] = useState("");
  const sections = structured
    ? null
    : parseSections(result);
  const canonical = structured
    ? createCanonicalReflectionCard({
        structured,
        result,
        mode,
        uiLanguage: language,
        reflectionLanguage: displayLanguage,
      })
    : null;
  const nextStep = canonical?.nextStep;
  const nextStepType = canonical?.normalizedNextStepType;
  const modeDetected = canonical?.modeDetected;
  const isStructured = Boolean(structured);
  const isPrompt2 = Boolean(structured?.emotional_source || structured?.demon_names?.length);
  const labels = displayT.reflectionCard;
  const feedbackCopy =
    displayLanguage === "zh"
      ? {
          question: "这张卡片有没有让这个时刻更清楚？",
          yes: "有",
          somewhat: "有一点",
          no: "没有",
          offQuestion: "哪里不太对？",
          issues: ["太泛泛", "太长", "误解了我", "措辞不安全", "其他"],
          saved: "已记录。谢谢你。",
        }
      : {
          question: "Did this card make the moment clearer?",
          yes: "Yes",
          somewhat: "Somewhat",
          no: "No",
          offQuestion: "What felt off?",
          issues: [
            "Too generic",
            "Too long",
            "Misunderstood me",
            "Unsafe wording",
            "Other",
          ],
          saved: "Noted. Thank you.",
        };
  const resultState = (() => {
    if (noSaveMode) {
      return {
        label: labels.stateNotSaved,
        title: labels.noSaveTitle,
        body: labels.noSaveHint,
        className:
          "border-[rgba(180,90,45,0.18)] bg-[rgba(255,248,226,0.72)] text-[var(--foreground-muted)]",
      };
    }

    if (saving) {
      return {
        label: labels.stateSaving,
        title: labels.autoSavedTitle,
        body: labels.autoSavingHint,
        className:
          "border-[rgba(31,155,143,0.18)] bg-[rgba(230,245,239,0.72)] text-[var(--brand-teal-deep)]",
      };
    }

    if (saved) {
      return {
        label: labels.stateSaved,
        title: autoSaved ? labels.autoSavedTitle : labels.saveCheckInTitle,
        body: autoSaved ? labels.autoSavedHint : labels.savedCheckInHint,
        className:
          "border-[rgba(31,155,143,0.24)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]",
      };
    }

    return {
      label: labels.stateGenerated,
      title: autoSaved ? labels.autoSaveIncompleteTitle : labels.saveCheckInTitle,
      body: autoSaved ? labels.autoSaveFailedHint : labels.saveCheckInHint,
      className:
        "border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.74)] text-[var(--foreground-muted)]",
    };
  })();
  const utilityCopy =
    displayLanguage === "zh"
      ? {
          copy: "复制卡片",
          copied: "反思卡片已复制。",
          keepUnsaved: "保持未保存",
          checkLater: "稍后回看",
        }
      : {
          copy: "Copy card",
          copied: "Reflection card copied.",
          keepUnsaved: "Keep unsaved",
          checkLater: "Check in later",
        };
  const factItems = compactItems(canonical?.factsSummary);
  const interpretationItems = compactItems(canonical?.interpretationSummary);
  const repeatedPatternCount = useMemo(
    () => countMatching(history, "thought_pattern", structured?.thought_pattern),
    [history, structured?.thought_pattern]
  );
  const repeatedTriggerCount = useMemo(
    () => countMatching(history, "trigger", structured?.trigger),
    [history, structured?.trigger]
  );

  useEffect(() => {
    let active = true;

    if (!session?.access_token || !structured) {
      return;
    }

    fetch("/api/reflections", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((response) => (response.ok ? response.json() : { reflections: [] }))
      .then((data) => {
        if (!active) {
          return;
        }

        const reflections = Array.isArray(data.reflections)
          ? data.reflections
          : [];
        setHistory(reflections);
      })
      .catch(() => {
        if (active) {
          setHistory([]);
        }
      });

    return () => {
      active = false;
    };
  }, [session?.access_token, structured]);

  async function copyCard() {
    const text = [
      labels.title,
      canonical?.emotionalValidation,
      canonical?.triggerLabel && `${labels.trigger}: ${canonical.triggerLabel}`,
      canonical?.factsSummary.length
        ? `${labels.facts}: ${canonical.factsSummary.join("; ")}`
        : "",
      canonical?.interpretationSummary.length
        ? `${labels.interpretation}: ${canonical.interpretationSummary.join("; ")}`
        : "",
      canonical?.unmetNeed && `${displayLanguage === "zh" ? "未被满足的需要" : "Unmet need"}: ${canonical.unmetNeed}`,
      canonical?.thoughtPatternLabel &&
        `${labels.thoughtPattern}: ${canonical.thoughtPatternLabel}`,
      canonical?.nextStep && `${labels.nextStep}: ${canonical.nextStep}`,
      labels.safetyNote,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text || result);
      toast.success(utilityCopy.copied);
    } catch {
      toast.error(displayT.common.aiGeneric);
    }
  }

  const gentleObservation = (() => {
    if (!structured) {
      return "";
    }

    if (history.length === 0) {
      return structured.gentle_observation || labels.gentleObservationEmpty;
    }

    if (repeatedPatternCount > 0 && structured.thought_pattern) {
      return labels.gentleObservationPattern
        .replace(
          "{pattern}",
          localizeMixedLanguageValue(
            structured.thought_pattern,
            displayLanguage
          )
        )
        .replace("{count}", String(repeatedPatternCount + 1));
    }

    if (repeatedTriggerCount > 0 && structured.trigger) {
      return labels.gentleObservationTrigger
        .replace(
          "{trigger}",
          localizeMixedLanguageValue(structured.trigger, displayLanguage)
        )
        .replace("{count}", String(repeatedTriggerCount + 1));
    }

    return labels.gentleObservationHistory;
  })();

  return (
    <section aria-labelledby="reflection-card-heading" className="mt-8">
      <Card
        variant="hero"
        className="overflow-hidden border-[rgba(31,155,143,0.13)] bg-[rgba(255,254,248,0.95)] shadow-[var(--shadow-xl)]"
      >
        <div
          className="-mx-5 -mt-5 mb-5 h-1 sm:-mx-6 sm:-mt-6"
          style={{ background: "var(--brand-gradient)" }}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SectionLabel id="reflection-card-heading">
              {labels.title}
            </SectionLabel>
            <p className="mt-2 text-sm text-[var(--foreground-subtle)]">
              {statusText || labels.saved}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {structured?.emotion && (
              <span className="self-start rounded-full border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                {localizeMixedLanguageValue(
                  structured.emotion,
                  displayLanguage
                )}
              </span>
            )}
            {modeDetected && modeDetected !== "General" && (
              <span className="self-start rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                {labels.reflectionMode}:{" "}
                {translateDetectedMode(displayLanguage, modeDetected)}
              </span>
            )}
          </div>
        </div>

        {isPrompt2 && structured ? (
          <Prompt2ResultModules
            structured={structured}
            labels={labels}
            language={displayLanguage}
            nextStepType={nextStepType}
          />
        ) : isStructured && structured ? (
          <div className="mt-5 grid gap-3 sm:gap-3.5">
            {canonical?.emotionalValidation && (
              <div className="rounded-[calc(var(--radius-xl)+8px)] border border-[rgba(31,155,143,0.16)] bg-[linear-gradient(145deg,rgba(232,246,237,0.74),rgba(255,254,248,0.94))] p-4 shadow-[var(--shadow-soft)] ring-1 ring-[rgba(31,155,143,0.08)] sm:p-5">
                <p className="max-w-2xl text-[15px] leading-7 text-[var(--foreground)]">
                  {canonical.emotionalValidation}
                </p>
              </div>
            )}
            <ReflectionSection
              label="Trigger"
              labelText={labels.trigger}
              content={shortenWords(canonical?.triggerLabel, 25)}
            />
            <div className="grid gap-3">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 sm:p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-teal-deep)]"
                      aria-hidden="true"
                    >
                      <ListChecks size={15} strokeWidth={1.8} />
                    </span>
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {labels.factsInterpretation}
                    </h3>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                        {labels.facts}
                      </p>
                      {factItems.length ? (
                        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                          {factItems.map((fact) => (
                            <li key={fact}>- {fact}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                          {labels.notIdentified}
                        </p>
                      )}
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                        {labels.interpretation}
                      </p>
                      {interpretationItems.length ? (
                        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                          {interpretationItems.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                          {labels.notIdentified}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <ReflectionSection
                  label="Thought pattern"
                  labelText={labels.mainThoughtPattern}
                  content={[
                    canonical?.thoughtPatternLabel,
                    canonical?.thoughtPatternExplanation,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                />
                <ReflectionSection
                  label="Behavioural insight"
                  labelText={labels.behaviouralInsight}
                  content={canonical?.behaviouralInsight}
                />
                <ReflectionSection
                  label="Body / context"
                  labelText={labels.gentleObservation}
                  content={gentleObservation}
                />
              </div>
            <ReflectionSection
              label="One next question"
              labelText={labels.nextQuestion}
              content={canonical?.nextQuestion}
              tone="highlight"
            />
            {nextStep && (
              <div className="rounded-[calc(var(--radius-xl)+8px)] border border-[rgba(31,155,143,0.28)] bg-[linear-gradient(135deg,rgba(231,244,239,0.98),rgba(255,248,226,0.58))] p-4 shadow-[0_24px_65px_rgba(31,155,143,0.13)] ring-1 ring-[rgba(31,155,143,0.12)] sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-soft)]"
                    aria-hidden="true"
                  >
                    <Footprints size={17} strokeWidth={1.9} />
                  </span>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">
                    {labels.nextStep}
                  </h3>
                  {nextStepType && shouldDisplayNormalizedChip(nextStepType) && (
                    <span className="rounded-full border border-[rgba(31,155,143,0.24)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                      {localizedCanonicalLabel(nextStepType, displayLanguage)}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
                  {nextStep}
                </p>
                <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                  {labels.nextStepHint}
                </p>
              </div>
            )}
            <ReflectionSection
              label="Still unclear"
              labelText={labels.safetyNote}
              content={structured.safety_note}
              tone="highlight"
            />
          </div>
        ) : sections ? (
          <div className="mt-5 grid gap-2.5 sm:gap-3">
            {sections.map((section) => {
              const isQuestion =
                section.label === "One next question" ||
                section.label === "One small next step";

              return (
                <ReflectionSection
                  key={section.label}
                  label={section.label}
                  labelText={
                    section.label === "One next question"
                      ? labels.nextQuestion
                      : section.label === "One small next step"
                        ? labels.nextStep
                        : section.label
                  }
                  content={section.content}
                  tone={isQuestion ? "highlight" : "default"}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
            {result}
          </div>
        )}

        <div className="mt-6 rounded-[calc(var(--radius-xl)+6px)] border border-[var(--border)] bg-[rgba(246,242,233,0.68)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {resultState.title}
                </h3>
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    resultState.className,
                  ].join(" ")}
                >
                  {saved && (
                    <CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />
                  )}
                  {resultState.label}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                {resultState.body}
              </p>
            </div>
            {onSave && (
              <PrimaryButton
                type="button"
                size="md"
                onClick={onSave}
                disabled={saving || saved}
                className="w-full shrink-0 sm:w-auto"
              >
                {saved
                  ? labels.savedToHistory
                  : saving
                    ? labels.saving
                    : labels.saveThisReflection}
              </PrimaryButton>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyCard()}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
            >
              {utilityCopy.copy}
            </button>
            {noSaveMode && (
              <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[rgba(180,90,45,0.14)] bg-[rgba(255,248,226,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)]">
                {utilityCopy.keepUnsaved}
              </span>
            )}
            {saved && (
              <LinkButton href="/dashboard/history" variant="ghost" size="sm">
                {utilityCopy.checkLater}
              </LinkButton>
            )}
          </div>
          {!showActions &&
            !saving &&
            (onReflectAgain ? (
              <PrimaryButton
                type="button"
                size="md"
                onClick={onReflectAgain}
                className="mt-3 w-full sm:w-auto"
              >
                {labels.reflectAgain}
              </PrimaryButton>
            ) : (
              <LinkButton
                href="/dashboard/quick"
                variant="secondary"
                size="md"
                className="mt-3 w-full sm:w-auto"
              >
                {labels.reflectAgain}
              </LinkButton>
            ))}
          <div className="mt-5 rounded-[1.25rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.66)] p-3.5">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {feedbackCopy.question}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["yes", feedbackCopy.yes],
                ["somewhat", feedbackCopy.somewhat],
                ["no", feedbackCopy.no],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setClarityFeedback(value);
                    if (value !== "no") {
                      setClarityIssue("");
                    }
                  }}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                    clarityFeedback === value
                      ? "border-[rgba(31,155,143,0.32)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  {clarityFeedback === value && (
                    <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                  )}
                  {label}
                </button>
              ))}
            </div>
            {clarityFeedback === "no" && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                  {feedbackCopy.offQuestion}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {feedbackCopy.issues.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setClarityIssue(issue)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        clarityIssue === issue
                          ? "border-[rgba(31,155,143,0.32)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                      ].join(" ")}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {clarityFeedback && (
              <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
                {feedbackCopy.saved}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["helped", labels.helpful],
              ["not_quite", labels.notQuite],
              ["too_much", labels.tooMuch],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCheckInState(value)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                  checkInState === value
                    ? "border-[rgba(31,155,143,0.32)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                {checkInState === value && (
                  <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                )}
                {label}
              </button>
            ))}
          </div>
          {checkInState && (
            <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
              {labels.microCheckInSaved}
            </p>
          )}
        </div>

        {showActions && (
          <PageActions className="mb-0 mt-8 border-t border-[var(--border)] pt-6">
            {onReflectAgain ? (
              <PrimaryButton type="button" size="sm" onClick={onReflectAgain}>
                {labels.reflectAgain}
              </PrimaryButton>
            ) : (
              <LinkButton href="/dashboard/quick" size="sm">
                {labels.newReflection}
              </LinkButton>
            )}
            <LinkButton href="/dashboard/history" variant="secondary" size="sm">
              {displayT.common.viewHistory}
            </LinkButton>
            <LinkButton href="/dashboard/summary" variant="ghost" size="sm">
              {labels.seePatterns}
            </LinkButton>
          </PageActions>
        )}
      </Card>
    </section>
  );
}
