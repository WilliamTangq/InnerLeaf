"use client";

import { useState } from "react";
import { Card } from "../components/ui";
import type { Reflection } from "./page";

function previewText(value: string | null) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "No input saved.";
  }

  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function extractSection(aiResult: string | null, section: string) {
  if (!aiResult) {
    return "";
  }

  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion Pattern|Trigger|Facts vs Interpretation|Thought Pattern|Behavioural Insight|Reflection Question|One Next Question)\\s*\\n|$)`,
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
    <div className="space-y-5">
      {reflections.map((item) => {
        const extractedLabels = cardLabels(item.ai_result);
        const labels = {
          trigger: item.trigger || extractedLabels.trigger,
          thoughtPattern: item.thought_pattern || extractedLabels.thoughtPattern,
          nextQuestion: item.next_question || extractedLabels.nextQuestion,
        };
        const isOpen = openCards.has(item.id);

        return (
          <Card key={item.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[#7A8377]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <p className="mt-3 max-w-2xl leading-7 text-[#4F5F51]">
                  {previewText(item.user_input)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleCard(item.id)}
                className="rounded-full border border-[#D8D2C4] px-4 py-2 text-left text-sm text-[#5F7F63] transition hover:border-[#BFCAB8] hover:bg-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FA88B] sm:text-center"
              >
                {isOpen ? "Hide full reflection" : "View full reflection"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-[#F7F4EF] p-4">
                <p className="text-xs font-semibold uppercase text-[#6B7C6A]">
                  Trigger
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4F5F51]">
                  {labels.trigger || "Not clearly identified."}
                </p>
              </div>

              <div className="rounded-3xl bg-[#F7F4EF] p-4">
                <p className="text-xs font-semibold uppercase text-[#6B7C6A]">
                  Thought Pattern
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4F5F51]">
                  {labels.thoughtPattern || "Not clearly identified."}
                </p>
              </div>

              <div className="rounded-3xl bg-[#F7F4EF] p-4">
                <p className="text-xs font-semibold uppercase text-[#6B7C6A]">
                  Next Question
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4F5F51]">
                  {labels.nextQuestion || "Not clearly identified."}
                </p>
              </div>
            </div>

            {isOpen && (
              <div className="mt-5 border-t border-[#E4DED2] pt-5">
                <h2 className="font-semibold">What happened</h2>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-[#4F5F51]">
                  {item.user_input}
                </p>

                <h2 className="mt-5 font-semibold">InnerLeaf Reflection</h2>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-[#4F5F51]">
                  {item.ai_result}
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
