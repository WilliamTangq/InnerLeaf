"use client";

import Link from "next/link";
import { useState } from "react";

const fields = [
  {
    id: "situation",
    label: "Situation",
    prompt: "What happened?",
  },
  {
    id: "emotion",
    label: "Emotion",
    prompt: "What emotion did you feel?",
  },
  {
    id: "automaticThought",
    label: "Automatic thought",
    prompt: "What thought came up?",
  },
  {
    id: "facts",
    label: "Facts",
    prompt: "What are the facts?",
  },
  {
    id: "interpretation",
    label: "Interpretation",
    prompt: "What did you assume or interpret?",
  },
  {
    id: "behaviour",
    label: "Behaviour",
    prompt: "How did you react?",
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
        setResult(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
      setWarning(data.warning || "");
    } catch {
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#5F7F63]">
          Back to home
        </Link>

        <p className="mt-6 mb-3 text-sm tracking-wide text-[#6B7C6A]">
          InnerLeaf
        </p>

        <h1 className="mb-4 text-4xl font-semibold leading-tight">
          Guided Reflection
        </h1>

        <p className="mb-8 text-base leading-7 text-[#5F6F61]">
          Move through the moment one piece at a time, then let InnerLeaf turn
          it into a structured reflection card.
        </p>

        <div className="space-y-4 rounded-3xl bg-white/70 p-5 shadow-sm backdrop-blur">
          {fields.map((field) => (
            <label key={field.id} className="block">
              <span className="block text-sm font-semibold text-[#24352B]">
                {field.label}
              </span>
              <span className="mt-1 block text-sm text-[#5F6F61]">
                {field.prompt}
              </span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#D8D2C4] bg-white/80 p-4 outline-none focus:border-[#8FA88B]"
                value={values[field.id]}
                onChange={(event) => updateField(field.id, event.target.value)}
              />
            </label>
          ))}

          <button
            onClick={handleReflect}
            disabled={loading || !hasInput}
            className="rounded-full bg-[#5F7F63] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Reflecting..." : "Break down this reaction"}
          </button>
        </div>

        {warning && (
          <p className="mt-6 rounded-3xl bg-white/80 p-4 text-sm text-[#8A6B2E] shadow-sm">
            {warning}
          </p>
        )}

        {result && (
          <div className="mt-8 whitespace-pre-wrap rounded-3xl bg-white/80 p-6 leading-7 shadow-sm">
            {result}
          </div>
        )}

        <p className="mt-8 text-xs leading-6 text-[#7A8377]">
          InnerLeaf is not therapy, diagnosis, or medical advice.
        </p>
      </div>
    </main>
  );
}
