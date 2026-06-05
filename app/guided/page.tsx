"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import {
  Badge,
  Card,
  LoadingCard,
  LoadingSpinner,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

const fields = [
  {
    id: "situation",
    label: "Situation",
    group: "What happened",
    helper: "What happened? A short snapshot is enough.",
  },
  {
    id: "emotion",
    label: "Emotion",
    group: "What came up",
    helper: "What did you feel? One or two words is fine.",
  },
  {
    id: "automatic_thought",
    label: "Automatic thought",
    group: "What came up",
    helper: "What popped into your mind first?",
  },
  {
    id: "facts",
    label: "Facts",
    group: "Fact vs interpretation",
    helper: "What do you know actually happened?",
  },
  {
    id: "interpretation",
    label: "Interpretation",
    group: "Fact vs interpretation",
    helper: "What did you assume or read into the situation?",
  },
  {
    id: "behaviour",
    label: "Behaviour",
    group: "How you reacted",
    helper: "How did you react, or what did you want to do?",
  },
] as const;

type FieldId = (typeof fields)[number]["id"];
type GuidedValues = Record<FieldId, string>;

const initialValues = fields.reduce((values, field) => {
  values[field.id] = "";
  return values;
}, {} as GuidedValues);

export default function GuidedReflectionPage() {
  const [values, setValues] = useState<GuidedValues>(initialValues);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filledCount = fields.filter((f) => values[f.id].trim()).length;
  const hasInput = filledCount > 0;
  const activeField = fields[activeStep];

  function updateField(field: FieldId, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleReflect() {
    setLoading(true);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");

    const input = fields
      .map((field) => `${field.label}: ${values[field.id].trim()}`)
      .filter((line) => line.split(": ")[1])
      .join("\n");

    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, mode: "guided" }),
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
    <PageShell maxWidth="max-w-3xl">
      <PageHeader compact eyebrow="Reflect" title="Guided Reflection">
        Reflect step by step using a CBT-informed structure.
      </PageHeader>

      <div className="-mt-2 mb-6 flex flex-col gap-2 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>This is self-reflection, not therapy. Skip anything that does not fit.</p>
        <Link
          href="/quick"
          className="font-medium text-[var(--brand-teal-deep)] underline-offset-2 hover:underline"
        >
          Use quick reflection
        </Link>
      </div>

      <div
        className="mb-4 flex items-center justify-between gap-3"
        role="tablist"
        aria-label="Reflection steps"
      >
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-1">
          {fields.map((field, index) => {
            const isActive = index === activeStep;
            const isFilled = Boolean(values[field.id].trim());
            return (
              <button
                key={field.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`guided-panel-${field.id}`}
                id={`guided-tab-${field.id}`}
                onClick={() => setActiveStep(index)}
                className={[
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                  isActive
                    ? "btn-brand text-white shadow-none"
                    : isFilled
                      ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                      : "bg-[var(--surface-muted)] text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]",
                ].join(" ")}
              >
                {field.label}
              </button>
            );
          })}
        </div>
        <span className="shrink-0">
          <Badge variant="outline">
            {filledCount}/{fields.length}
          </Badge>
        </span>
      </div>

      <Card className="hover:translate-y-0">
        <div
          role="tabpanel"
          id={`guided-panel-${activeField.id}`}
          aria-labelledby={`guided-tab-${activeField.id}`}
        >
          <p className="text-xs font-medium text-[var(--foreground-subtle)]">
            {activeField.group} · Step {activeStep + 1} of {fields.length}
          </p>
          <TextareaField
            label={activeField.label}
            helper={activeField.helper}
            className="mt-3 min-h-40 sm:min-h-44"
            value={values[activeField.id]}
            onChange={(event) => updateField(activeField.id, event.target.value)}
          />
          <div className="mt-5 flex flex-wrap gap-3">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                Back
              </button>
            )}
            {activeStep < fields.length - 1 ? (
              <PrimaryButton
                type="button"
                size="md"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Continue
              </PrimaryButton>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-end">
          {loading ? (
            <LoadingSpinner label="Creating your reflection card…" />
          ) : (
            <PrimaryButton
              size="lg"
              onClick={handleReflect}
              disabled={loading || !hasInput}
              className="w-full sm:w-auto"
            >
              Create reflection card
            </PrimaryButton>
          )}
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {loading && <LoadingCard label="Creating your reflection card..." />}

      {result && (
        <ReflectionResultCard result={result} structured={structured} />
      )}
    </PageShell>
  );
}
