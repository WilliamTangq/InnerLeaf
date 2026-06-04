"use client";

import {
  Brain,
  FileText,
  Footprints,
  Heart,
  Route,
  Scale,
} from "lucide-react";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import {
  Badge,
  Card,
  Disclaimer,
  LinkButton,
  LoadingSpinner,
  PageActions,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

const flowSteps = [
  { label: "Situation", icon: FileText },
  { label: "Emotion", icon: Heart },
  { label: "Thought", icon: Brain },
  { label: "Facts", icon: Scale },
  { label: "Interpretation", icon: Route },
  { label: "Behaviour", icon: Footprints },
] as const;

const fields = [
  {
    id: "situation",
    label: "Situation",
    prompt: "What happened?",
    helper: "A simple snapshot of the moment.",
  },
  {
    id: "emotion",
    label: "Emotion",
    prompt: "What emotion did you feel?",
    helper: "One or two words is fine.",
  },
  {
    id: "automatic_thought",
    label: "Automatic thought",
    prompt: "What thought came up immediately?",
    helper: "The first thought, assumption, or image that appeared.",
  },
  {
    id: "facts",
    label: "Facts",
    prompt: "What do you know actually happened?",
    helper: "What you know happened, separate from meaning.",
  },
  {
    id: "interpretation",
    label: "Interpretation",
    prompt: "What did you assume, imagine, or read into the situation?",
    helper: "The story your mind started to build around the facts.",
  },
  {
    id: "behaviour",
    label: "Behaviour",
    prompt: "How did you react or what did you feel pulled to do?",
    helper: "What you did, said, avoided, or wanted to do.",
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
      <PageHeader eyebrow="Reflect" title="Guided Reflection">
        Walk through one emotional moment — situation, feeling, facts, what you
        read into it, and how you reacted.
      </PageHeader>

      <PageActions>
        <LinkButton href="/" variant="ghost">
          Home
        </LinkButton>
        <LinkButton href="/history" variant="secondary">
          History
        </LinkButton>
      </PageActions>

      <Card className="brand-panel mb-6">
        <h2 className="font-semibold text-[var(--foreground)]">
          A calm path through one emotional moment.
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          Fill only the steps that feel clear. Skip anything that does not fit
          the moment.
        </p>
      </Card>

      <div className="mb-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {flowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground-muted)]"
            >
              <Icon
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              {step.label}
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => {
            const isActive = index === activeStep;
            const isFilled = Boolean(values[field.id].trim());
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => setActiveStep(index)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  isActive
                    ? "btn-brand text-white shadow-none"
                    : isFilled
                      ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                      : "bg-[var(--surface-muted)] text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]",
                ].join(" ")}
              >
                {index + 1}. {field.label}
              </button>
            );
          })}
        </div>
        <Badge variant="outline">
          {filledCount}/{fields.length} filled
        </Badge>
      </div>

      <Card>
        {fields.map((field, index) => {
          if (index !== activeStep) return null;
          return (
            <div key={field.id}>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
                Step {index + 1} of {fields.length}
              </p>
              <TextareaField
                label={field.label}
                helper={`${field.prompt} ${field.helper}`}
                className="mt-4 min-h-40"
                value={values[field.id]}
                onChange={(event) => updateField(field.id, event.target.value)}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(index - 1)}
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                  >
                    Back
                  </button>
                )}
                {index < fields.length - 1 ? (
                  <PrimaryButton
                    type="button"
                    size="md"
                    onClick={() => setActiveStep(index + 1)}
                  >
                    Continue
                  </PrimaryButton>
                ) : null}
              </div>
            </div>
          );
        })}

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          {loading ? (
            <LoadingSpinner label="Creating your reflection card…" />
          ) : (
            <Disclaimer />
          )}
          <PrimaryButton
            size="lg"
            onClick={handleReflect}
            disabled={loading || !hasInput}
          >
            {loading ? "Processing…" : "Create reflection card"}
          </PrimaryButton>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {result && (
        <ReflectionResultCard result={result} structured={structured} />
      )}
    </PageShell>
  );
}
