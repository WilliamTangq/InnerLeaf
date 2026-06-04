"use client";

import { Brain, Footprints, Heart, HelpCircle, Zap } from "lucide-react";
import { useState } from "react";
import { Badge, Card } from "../components/ui";
import type { Reflection } from "./page";

function previewText(value: string | null) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "No input saved.";
  }

  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

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
    emotion: extractSection(aiResult, "Emotion"),
    trigger: extractSection(aiResult, "Trigger"),
    thoughtPattern: extractSection(aiResult, "Thought Pattern"),
    behaviour: extractSection(aiResult, "Behaviour"),
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

const labelIcons = {
  Emotion: Heart,
  Trigger: Zap,
  "Thought pattern": Brain,
  Behaviour: Footprints,
  "Next question": HelpCircle,
} as const;

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
          emotion: item.emotion || extractedLabels.emotion,
          trigger: item.trigger || extractedLabels.trigger,
          thoughtPattern: item.thought_pattern || extractedLabels.thoughtPattern,
          behaviour: item.behaviour || extractedLabels.behaviour,
          nextQuestion: item.next_question || extractedLabels.nextQuestion,
        };
        const isOpen = openCards.has(item.id);

        return (
          <Card key={item.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <time
                    dateTime={item.created_at}
                    className="text-xs text-[var(--foreground-subtle)]"
                  >
                    {new Date(item.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                  {item.emotion && (
                    <Badge variant="accent">{item.emotion}</Badge>
                  )}
                  <Badge variant="outline">{modeLabel(item.mode)}</Badge>
                </div>
                <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
                  {previewText(item.user_input)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleCard(item.id)}
                className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                {isOpen ? "Collapse" : "Read full card"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(
                [
                  ["Emotion", labels.emotion],
                  ["Trigger", labels.trigger],
                  ["Thought pattern", labels.thoughtPattern],
                  ["Behaviour", labels.behaviour],
                  ["Next question", labels.nextQuestion],
                ] as const
              ).map(([title, content]) => (
                <div
                  key={title}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon =
                        labelIcons[title as keyof typeof labelIcons];
                      return (
                        <Icon
                          aria-hidden="true"
                          size={15}
                          strokeWidth={1.8}
                          className="text-[var(--brand-teal-deep)]"
                        />
                      );
                    })()}
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {title}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {content || "Not clearly identified."}
                  </p>
                </div>
              ))}
            </div>

            {isOpen && (
              <div className="mt-6 space-y-6 border-t border-[var(--border)] pt-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">
                    What you wrote
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[var(--foreground-muted)]">
                    {item.user_input}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">
                    Reflection card
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[var(--foreground-muted)]">
                    {item.ai_result}
                  </p>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
