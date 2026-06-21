"use client";

import {
  Brain,
  CalendarClock,
  CheckCircle2,
  Footprints,
  Heart,
  Lightbulb,
  MessageCircleQuestion,
  Route,
  Send,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge, Card, IconFrame, LinkButton } from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { translateDetectedMode, translateNextStepType } from "../lib/i18n";
import { trackEvent } from "../lib/analytics";
import type { Reflection } from "./page";

function extractSection(aiResult: string | null, section: string) {
  if (!aiResult) {
    return "";
  }

  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion|Emotion Pattern|Trigger|Facts vs Interpretation|Thought Pattern|Behaviour|Behavioural Insight|Reflection Question|One Next Question|One Small Next Step)\\s*\\n|$)`,
    "i"
  );
  const match = aiResult.match(pattern);

  return match?.[1]
    ?.split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .join(" ")
    .trim() ?? "";
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

function formatHistoryTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
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

const previewIcons = {
  Emotion: Heart,
  Trigger: Zap,
  "Thought pattern": Brain,
  "One small next step": Footprints,
  Interpretation: Route,
} as const;

function DetailMetric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  accent?: boolean;
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border p-3.5",
        accent
          ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]",
      ].join(" ")}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
        <Icon
          aria-hidden="true"
          size={14}
          strokeWidth={1.8}
          className="text-[var(--brand-teal-deep)]"
        />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium leading-6 text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function DetailSection({
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
        "rounded-[var(--radius-xl)] border p-4",
        accent
          ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] ring-1 ring-[rgba(31,155,143,0.08)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]",
      ].join(" ")}
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <Icon
          aria-hidden="true"
          size={16}
          strokeWidth={1.8}
          className="text-[var(--brand-teal-deep)]"
        />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
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

function storedItems(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
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

function meaningfulBodyFactor(value: string | null) {
  const text = previewLine(value);

  if (!text) {
    return null;
  }

  const lower = text.toLowerCase();
  const neutralPhrases = [
    "not mentioned",
    "not clearly identified",
    "no clear body",
    "no body",
    "not identified",
    "未提到",
    "没有明显",
    "尚未清楚",
    "未明确",
  ];

  return neutralPhrases.some((phrase) => lower.includes(phrase)) ? null : text;
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
  const extractedLabels = cardLabels(item.ai_result);
  const originalInput = previewLine(item.user_input, 800) || "";
  const trigger = previewLine(item.trigger) || extractedLabels.trigger || "";
  const thoughtPattern =
    previewLine(item.thought_pattern) || extractedLabels.thoughtPattern || "";
  const oneNextQuestion =
    previewLine(item.next_question) || extractedLabels.nextQuestion || "";
  const oneSmallNextStep =
    previewLine(item.next_step) ||
    extractSection(item.ai_result, "One Small Next Step") ||
    "";

  return {
    id: item.id,
    createdAt: item.created_at,
    originalInput,
    mainEmotion: previewLine(item.emotion, 80) || "",
    secondaryEmotion: "",
    trigger,
    facts: storedItems(item.facts),
    interpretations: storedItems(item.interpretation),
    thoughtPattern,
    behaviouralInsight: previewLine(item.behavioural_insight, 280) || "",
    oneSmallNextStep,
    oneNextQuestion,
    userFeedback: {
      result: item.follow_up_result,
      note: item.follow_up_note,
    },
    checkInStatus: item.follow_up_result ? "checked_in" : "not_checked_in",
    nextStepType: previewLine(item.next_step_type, 60) || "",
    modeLabel: item.mode,
    modeDetected: item.mode_detected,
    raw: item,
  };
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

  const nextStep = previewLine(reflection.next_step, 220);
  const nextStepType = previewLine(reflection.next_step_type, 60);
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
        {nextStepType && (
          <Badge variant="accent">
            {translateNextStepType(language, nextStepType)}
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
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-teal-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-teal-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
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
}: {
  reflections: Reflection[];
}) {
  const { language, t } = useLanguage();
  const { role, user } = useAuth();
  const [openCards, setOpenCards] = useState<Set<string | number>>(new Set());
  const groupedReflections = reflections.reduce<
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
            reflections.find((item) => item.id === id)?.follow_up_result
          ),
        });
      }

      return next;
    });
  }

  return (
    <div className="space-y-8">
      {groupedReflections.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              {group.label}
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="space-y-4">
            {group.items.map((item) => {
              const card = toHistoryCard(item);
              const bodyFactor = meaningfulBodyFactor(item.body_factor);
              const isOpen = openCards.has(item.id);
              const collapsedPreview = [
                ["Emotion", card.mainEmotion],
                ["Trigger", card.trigger],
                ["Thought pattern", card.thoughtPattern],
                ["One small next step", card.oneSmallNextStep],
              ] as const;
              const visiblePreview = collapsedPreview.filter(([, content]) =>
                Boolean(content)
              );
              const headline =
                previewLine(card.trigger) ||
                previewLine(card.originalInput, 100) ||
                "Reflection card";

              const validation = previewLine(item.emotional_validation, 360);
              const behaviour = previewLine(item.behaviour, 180);
              const hasFactsVsInterpretation =
                card.facts.length > 0 || card.interpretations.length > 0;
              const hasStructuredDetail =
                validation ||
                card.mainEmotion ||
                card.trigger ||
                card.thoughtPattern ||
                bodyFactor ||
                behaviour ||
                card.behaviouralInsight ||
                hasFactsVsInterpretation ||
                card.oneNextQuestion ||
                card.oneSmallNextStep;

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden border-[rgba(40,80,60,0.14)] hover:translate-y-0"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <time
                          dateTime={item.created_at}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-subtle)]"
                          title={formatHistoryDate(item.created_at)}
                        >
                          {formatHistoryTime(item.created_at)}
                        </time>
                        {item.mode_detected && item.mode_detected !== "General" && (
                          <Badge variant="outline">
                            {translateDetectedMode(language, item.mode_detected)}
                          </Badge>
                        )}
                        {card.oneSmallNextStep && (
                          <Badge variant={item.follow_up_result ? "accent" : "outline"}>
                            {followUpLabel(item.follow_up_result, t)}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
                        {headline}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCard(item.id)}
                      aria-expanded={isOpen}
                      className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                    >
                      {isOpen ? t.history.collapse : t.history.readFull}
                    </button>
                  </div>

                  {!isOpen && visiblePreview.length > 0 && (
                    <dl className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                      {visiblePreview.map(([title, content]) => {
                        const Icon = previewIcons[title as keyof typeof previewIcons];
                        const isNextStep = title === "One small next step";
                        return (
                          <div
                            key={title}
                            className={[
                              "rounded-[var(--radius-lg)] border p-3.5",
                              isNextStep
                                ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] sm:col-span-2 xl:col-span-1"
                                : "border-[var(--border)] bg-[var(--surface-muted)]",
                            ].join(" ")}
                          >
                            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                              <Icon
                                aria-hidden="true"
                                size={14}
                                strokeWidth={1.8}
                                className="text-[var(--brand-teal-deep)]"
                              />
                              {sectionTitle(title, t)}
                            </dt>
                            <dd className="mt-1.5 line-clamp-3 text-sm leading-6 text-[var(--foreground-muted)]">
                              {content}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}

                  {isOpen && (
                    <div className="mt-6 space-y-5 border-t border-[var(--border)] pt-6">
                      <div className="rounded-[28px] border border-[rgba(40,80,60,0.12)] bg-[linear-gradient(135deg,rgba(255,255,248,0.96),rgba(242,249,244,0.76))] p-4 shadow-[0_18px_70px_rgba(20,35,28,0.08)] sm:p-5">
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
                            {card.nextStepType && (
                              <Badge variant="accent">
                                {translateNextStepType(language, card.nextStepType)}
                              </Badge>
                            )}
                            {card.oneSmallNextStep && (
                              <Badge variant={item.follow_up_result ? "accent" : "outline"}>
                                {followUpLabel(item.follow_up_result, t)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <DetailMetric
                            icon={Heart}
                            label={sectionTitle("Emotion", t)}
                            value={card.mainEmotion}
                          />
                          <DetailMetric
                            icon={Zap}
                            label={sectionTitle("Trigger", t)}
                            value={card.trigger}
                          />
                          <DetailMetric
                            icon={Brain}
                            label={sectionTitle("Thought pattern", t)}
                            value={card.thoughtPattern}
                          />
                          <DetailMetric
                            icon={Footprints}
                            label={sectionTitle("One small next step", t)}
                            value={
                              card.nextStepType
                                ? translateNextStepType(language, card.nextStepType)
                                : card.oneSmallNextStep
                            }
                            accent
                          />
                        </div>
                      </div>

                      {item.user_input && (
                        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                          <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {t.history.whatYouWrote}
                          </h3>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                            {card.originalInput}
                          </p>
                        </div>
                      )}

                      {validation && (
                        <DetailSection
                          icon={Heart}
                          title={sectionTitle("What came up", t)}
                          accent
                        >
                          <p className="whitespace-pre-wrap">{validation}</p>
                        </DetailSection>
                      )}

                      {hasFactsVsInterpretation && (
                        <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <Route
                              aria-hidden="true"
                              size={16}
                              strokeWidth={1.8}
                              className="text-[var(--brand-teal-deep)]"
                            />
                            {sectionTitle("Facts", t)} /{" "}
                            {sectionTitle("Interpretation", t)}
                          </h3>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                                {sectionTitle("Facts", t)}
                              </p>
                              <div className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                                {card.facts.length > 0 ? (
                                  <BulletList items={card.facts} />
                                ) : (
                                  <p>{t.reflectionCard.notIdentified}</p>
                                )}
                              </div>
                            </div>
                            <div className="rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                                {sectionTitle("Interpretation", t)}
                              </p>
                              <div className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                                {card.interpretations.length > 0 ? (
                                  <BulletList items={card.interpretations} />
                                ) : (
                                  <p>{t.reflectionCard.notIdentified}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </section>
                      )}

                      <div className="grid gap-3 lg:grid-cols-2">
                        {card.thoughtPattern && (
                          <DetailSection
                            icon={Brain}
                            title={sectionTitle("Thought pattern", t)}
                          >
                            <p className="whitespace-pre-wrap">{card.thoughtPattern}</p>
                          </DetailSection>
                        )}
                        {card.behaviouralInsight && (
                          <DetailSection
                            icon={Lightbulb}
                            title={sectionTitle("Behavioural insight", t)}
                          >
                            <p className="whitespace-pre-wrap">
                              {card.behaviouralInsight}
                            </p>
                          </DetailSection>
                        )}
                        {behaviour && (
                          <DetailSection
                            icon={Route}
                            title={sectionTitle("Behaviour", t)}
                          >
                            <p className="whitespace-pre-wrap">{behaviour}</p>
                          </DetailSection>
                        )}
                        {bodyFactor && (
                          <DetailSection
                            icon={Zap}
                            title={sectionTitle("Body / context", t)}
                          >
                            <p className="whitespace-pre-wrap">{bodyFactor}</p>
                          </DetailSection>
                        )}
                      </div>

                      {card.oneNextQuestion && (
                        <DetailSection
                          icon={MessageCircleQuestion}
                          title={sectionTitle("One next question", t)}
                          accent
                        >
                          <p className="whitespace-pre-wrap text-[var(--foreground)]">
                            {card.oneNextQuestion}
                          </p>
                        </DetailSection>
                      )}

                      {!hasStructuredDetail && item.ai_result && (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                          {item.ai_result}
                        </p>
                      )}
                      <NextStepCheckIn reflection={item} />
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
