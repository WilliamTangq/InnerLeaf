"use client";

import {
  Brain,
  HelpCircle,
  Route,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge, Card } from "../components/ui";
import type { Reflection } from "./page";

function extractSection(aiResult: string | null, section: string) {
  if (!aiResult) {
    return "";
  }

  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion|Emotion Pattern|Trigger|Facts vs Interpretation|Thought Pattern|Behaviour|Behavioural Insight|Reflection Question|One Next Question)\\s*\\n|$)`,
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

function modeLabel(mode: string | null) {
  if (mode === "guided") {
    return "Guided";
  }

  if (mode === "quick") {
    return "Quick";
  }

  return "Reflection";
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
  Interpretation: Route,
} as const;

function storedList(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(" ");
}

function previewLine(value: string | null, max = 140) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function ReflectionCards({
  reflections,
}: {
  reflections: Reflection[];
}) {
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
          trigger: item.trigger || extractedLabels.trigger,
          thoughtPattern:
            item.thought_pattern || extractedLabels.thoughtPattern,
          interpretation: storedList(item.interpretation),
          nextQuestion: item.next_question || extractedLabels.nextQuestion,
        };
        const isOpen = openCards.has(item.id);
        const collapsedPreview = [
          ["Trigger", labels.trigger],
          ["Thought pattern", labels.thoughtPattern],
          ["One next question", labels.nextQuestion],
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
          ["Behavioural insight", item.behavioural_insight],
          ["One next question", labels.nextQuestion],
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
                  <Badge variant="outline">{modeLabel(item.mode)}</Badge>
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
                {isOpen ? "Collapse" : "Read full card"}
              </button>
            </div>

            {!isOpen && visiblePreview.length > 0 && (
              <dl className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {visiblePreview.map(([title, content]) => {
                  const Icon = previewIcons[title as keyof typeof previewIcons];
                  const isQuestion = title === "One next question";
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
                        {title}
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
                      What you wrote
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
                      const isQuestion = title === "One next question";
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
                            {title}
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
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
