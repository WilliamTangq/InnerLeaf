"use client";

import { useState } from "react";
import {
  Card,
  Disclaimer,
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
    id: "automaticThought",
    label: "Automatic thought",
    prompt: "What thought came up?",
    helper: "The first thought, assumption, or image that appeared.",
  },
  {
    id: "facts",
    label: "Facts",
    prompt: "What are the facts?",
    helper: "What you know happened, separate from meaning.",
  },
  {
    id: "interpretation",
    label: "Interpretation",
    prompt: "What did you assume or interpret?",
    helper: "The story your mind started to build around the facts.",
  },
  {
    id: "behaviour",
    label: "Behaviour",
    prompt: "How did you react?",
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
  const [result, setResult] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasInput = fields.some((field) => values[field.id].trim());

  function updateField(field: FieldId, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleReflect() {
    setLoading(true);
    setResult("");
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
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
      setWarning(data.warning || "");
    } catch {
      setError("Something went wrong while generating the reflection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title="Guided Reflection">
        Move through the moment one piece at a time. Keep your answers brief;
        the card will do the organising.
      </PageHeader>

      <Card>
        <div className="space-y-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-3xl border border-[#E4DED2] bg-[#FAF8F4] p-4"
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#7A8377]">
                Step {index + 1}
              </p>
              <TextareaField
                label={field.label}
                helper={`${field.prompt} ${field.helper}`}
                className="min-h-28"
                value={values[field.id]}
                onChange={(event) => updateField(field.id, event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={handleReflect} disabled={loading || !hasInput}>
            {loading ? "Creating your reflection card..." : "Create reflection card"}
          </PrimaryButton>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {result && (
        <Card className="mt-8">
          <p className="text-sm font-medium tracking-wide text-[#6B7C6A]">
            Reflection Card
          </p>
          <div className="mt-4 whitespace-pre-wrap leading-7 text-[#35483B]">
            {result}
          </div>
        </Card>
      )}

      <Disclaimer />
    </PageShell>
  );
}
