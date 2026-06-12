"use client";

import {
  Brain,
  CheckCircle2,
  Footprints,
  HelpCircle,
  Route,
  Send,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge, Card } from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { translateDetectedMode, translateNextStepType } from "../lib/i18n";
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

function modeLabel(mode: string | null, labels: Labels) {
  if (mode === "guided") {
    return labels.history.modeGuided;
  }

  if (mode === "quick") {
    return labels.history.modeQuick;
  }

  return labels.history.modeReflection;
}

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

const previewIcons = {
  Trigger: Zap,
  "Thought pattern": Brain,
  "One next question": HelpCircle,
  "One small next step": Footprints,
  Interpretation: Route,
} as const;

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

function storedList(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(" ");
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

function NextStepCheckIn({ reflection }: { reflection: Reflection }) {
  const { language, t } = useLanguage();
  const [selectedResult, setSelectedResult] = useState(
    reflection.follow_up_result ?? ""
  );
  const [note, setNote] = useState(reflection.follow_up_note ?? "");
  const [savedResult, setSavedResult] = useState(
    reflection.follow_up_result ?? ""
  );
  const [savedAt, setSavedAt] = useState(reflection.follow_up_at ?? "");
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
        },
        body: JSON.stringify({
          id: reflection.id,
          follow_up_result: selectedResult,
          follow_up_note: note,
        }),
      });

      if (!response.ok) {
        throw new Error("Check-in failed");
      }

      setSavedResult(selectedResult);
      setSavedAt(new Date().toISOString());
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] p-4 ring-1 ring-[rgba(31,155,143,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <Footprints
          aria-hidden="true"
          size={16}
          strokeWidth={1.8}
          className="text-[var(--brand-teal-deep)]"
        />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {t.reflectionCard.nextStep}
        </h3>
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
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <CheckCircle2
              aria-hidden="true"
              size={16}
              strokeWidth={1.8}
              className="text-[var(--brand-teal-deep)]"
            />
            {t.history.checkInSaved} {checkInResultLabel(savedResult, t)}
          </p>
          {savedDate && (
            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              {t.history.checkedInAt} {savedDate}
            </p>
          )}
          {note.trim() && (
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {note}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
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
              {t.history.noteLabel}
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="mt-2 min-h-24 w-full resize-y rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
              placeholder={t.history.notePlaceholder}
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
              <p className="text-sm text-[var(--brand-teal-deep)]">
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
  const [openCards, setOpenCards] = useState<Set<string | number>>(new Set());

  function toggleCard(id: string | number) {
    setOpenCards((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <div className="space-y-4">
      {reflections.map((item) => {
        const extractedLabels = cardLabels(item.ai_result);
        const labels = {
          trigger: previewLine(item.trigger) || extractedLabels.trigger,
          thoughtPattern:
            previewLine(item.thought_pattern) || extractedLabels.thoughtPattern,
          interpretation: storedList(item.interpretation),
          nextQuestion:
            previewLine(item.next_question) || extractedLabels.nextQuestion,
          nextStep:
            previewLine(item.next_step) ||
            extractSection(item.ai_result, "One Small Next Step"),
          nextStepType: previewLine(item.next_step_type, 60),
          bodyFactor: meaningfulBodyFactor(item.body_factor),
        };
        const isOpen = openCards.has(item.id);
        const collapsedPreview = [
          ["Trigger", labels.trigger],
          ["Thought pattern", labels.thoughtPattern],
          ["One next question", labels.nextQuestion],
          ["One small next step", labels.nextStep],
        ] as const;
        const visiblePreview = collapsedPreview.filter(([, content]) =>
          Boolean(content)
        );
        const headline =
          previewLine(labels.trigger) ||
          previewLine(item.user_input, 100) ||
          "Reflection card";

        const fullSections = [
          ["What came up", item.emotional_validation],
          ["Emotion", item.emotion],
          ["Trigger", labels.trigger],
          ["Facts", storedList(item.facts)],
          ["Interpretation", labels.interpretation],
          ["Thought pattern", labels.thoughtPattern],
          ["Behaviour", item.behaviour],
          ["Body / context", labels.bodyFactor],
          ["Behavioural insight", item.behavioural_insight],
          ["One next question", labels.nextQuestion],
          ["One small next step", labels.nextStep],
        ] as const;

        return (
          <Card key={item.id} className="hover:translate-y-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <time
                    dateTime={item.created_at}
                    className="text-xs text-[var(--foreground-subtle)]"
                  >
                    {formatHistoryDate(item.created_at)}
                  </time>
                  {item.emotion && (
                    <Badge variant="accent">{item.emotion}</Badge>
                  )}
                  <Badge variant="outline">{modeLabel(item.mode, t)}</Badge>
                  {item.mode_detected && item.mode_detected !== "General" && (
                    <Badge variant="outline">
                      {t.reflectionCard.reflectionMode}:{" "}
                      {translateDetectedMode(language, item.mode_detected)}
                    </Badge>
                  )}
                  {labels.nextStepType && (
                    <Badge variant="accent">
                      {translateNextStepType(language, labels.nextStepType)}
                    </Badge>
                  )}
                  {labels.nextStep && (
                    <Badge variant={item.follow_up_result ? "accent" : "outline"}>
                      {followUpLabel(item.follow_up_result, t)}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-base font-medium leading-7 text-[var(--foreground)]">
                  {headline}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleCard(item.id)}
                aria-expanded={isOpen}
                className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                {isOpen ? t.history.collapse : t.history.readFull}
              </button>
            </div>

            {!isOpen && visiblePreview.length > 0 && (
              <dl className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {visiblePreview.map(([title, content]) => {
                  const Icon = previewIcons[title as keyof typeof previewIcons];
                  const isQuestion =
                    title === "One next question" ||
                    title === "One small next step";
                  return (
                    <div
                      key={title}
                      className={[
                        "rounded-[var(--radius-lg)] border p-3",
                        isQuestion
                          ? "border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] sm:col-span-3"
                          : "border-[var(--border)] bg-[var(--surface-muted)]",
                      ].join(" ")}
                    >
                      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                        <Icon
                          aria-hidden="true"
                          size={14}
                          strokeWidth={1.8}
                          className="text-[var(--brand-teal-deep)]"
                        />
                        {sectionTitle(title, t)}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                        {content}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            {isOpen && (
              <div className="mt-6 space-y-6 border-t border-[var(--border)] pt-6">
                {item.user_input && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {t.history.whatYouWrote}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                      {item.user_input}
                    </p>
                  </div>
                )}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {fullSections
                    .filter(([, content]) => Boolean(content))
                    .map(([title, content]) => {
                      const isQuestion =
                        title === "One next question" ||
                        title === "One small next step";
                      return (
                        <div
                          key={title}
                          className={[
                            "rounded-[var(--radius-lg)] border p-3.5",
                            isQuestion
                              ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] sm:col-span-2"
                              : "border-[var(--border)] bg-[var(--surface-muted)]",
                          ].join(" ")}
                        >
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                            {sectionTitle(title, t)}
                          </p>
                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                            {content}
                          </p>
                        </div>
                      );
                    })}
                </div>
                {!fullSections.some(([, c]) => c) && item.ai_result && (
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
  );
}
