"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import {
  Card,
  LoadingCard,
  LoadingSpinner,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

const helperChips = [
  "What happened?",
  "What did you feel?",
  "What did you assume?",
  "What did you do next?",
] as const;

export default function QuickReflectionPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReflect() {
    setLoading(true);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");

    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, mode: "quick" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
      setStructured(data.structured || null);
      setWarning(data.warning || "");
    } catch {
      setError("Something went wrong while generating the reflection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader compact eyebrow="Reflect" title="Quick Reflection">
        Write freely. InnerLeaf will help organise the moment.
      </PageHeader>

      <Card className="hover:translate-y-0">
        <TextareaField
          label="What happened?"
          helper="A few honest sentences are enough."
          className="min-h-52 sm:min-h-56"
          placeholder="Write what happened. You can be messy — InnerLeaf will help organise it."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {helperChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(31,155,143,0.14)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--foreground-muted)]"
            >
              <HelpCircle
                aria-hidden="true"
                size={12}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--foreground-subtle)]">
            Prefer structure first?{" "}
            <Link
              href="/guided"
              className="font-medium text-[var(--brand-teal-deep)] underline-offset-2 hover:underline"
            >
              Try guided reflection
            </Link>
          </p>
          {loading ? (
            <LoadingSpinner label="Organising your reflection…" />
          ) : (
            <PrimaryButton
              size="lg"
              onClick={handleReflect}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto sm:shrink-0"
            >
              Break down this reaction
            </PrimaryButton>
          )}
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {loading && <LoadingCard label="Organising your reflection..." />}

      {result && (
        <ReflectionResultCard result={result} structured={structured} />
      )}
    </PageShell>
  );
}
