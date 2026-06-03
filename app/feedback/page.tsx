"use client";

import Link from "next/link";
import { useState } from "react";

const radioGroups = [
  {
    name: "mode_tried",
    label: "Which mode did you try?",
    options: ["Quick Reflection", "Guided Reflection", "Both"],
  },
  {
    name: "ease_of_start",
    label: "Was it easy to start writing?",
    options: ["Very easy", "Somewhat easy", "Not easy"],
  },
  {
    name: "reflection_length",
    label: "Was the AI reflection too long, too short, or about right?",
    options: ["Too long", "About right", "Too short"],
  },
  {
    name: "clarity_help",
    label: "Did the reflection help you understand your reaction more clearly?",
    options: ["Yes", "Somewhat", "No"],
  },
  {
    name: "would_use_again",
    label: "Would you use InnerLeaf again next time you feel emotionally triggered?",
    options: ["Yes", "Maybe", "No"],
  },
] as const;

const textFields = [
  {
    name: "comparison_feedback",
    label:
      "Compared with ChatGPT, Notes, or talking to a friend, what felt better or worse?",
  },
  {
    name: "blocker",
    label: "What would stop you from using InnerLeaf again?",
  },
  {
    name: "other_thoughts",
    label: "Any other thoughts?",
  },
] as const;

type RadioFieldName = (typeof radioGroups)[number]["name"];
type TextFieldName = (typeof textFields)[number]["name"];
type FeedbackValues = Record<RadioFieldName | TextFieldName, string>;

const initialValues = [...radioGroups, ...textFields].reduce(
  (values, field) => {
    values[field.name] = "";
    return values;
  },
  {} as FeedbackValues
);

export default function FeedbackPage() {
  const [values, setValues] = useState<FeedbackValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof FeedbackValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSubmitted(false);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Feedback could not be saved.");
        return;
      }

      setSubmitted(true);
      setValues(initialValues);
    } catch {
      setError("Something went wrong while saving feedback.");
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

        <h1 className="mt-6 text-3xl font-semibold">Share feedback</h1>

        <p className="mt-3 leading-7 text-[#5F6F61]">
          Help us improve InnerLeaf. Your feedback helps us understand whether
          this tool is useful for emotional reflection.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-3xl bg-white/80 p-6 shadow-sm"
        >
          {radioGroups.map((group) => (
            <fieldset key={group.name}>
              <legend className="font-semibold">{group.label}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {group.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-2xl border border-[#D8D2C4] bg-white/70 px-4 py-3 text-sm text-[#4F5F51]"
                  >
                    <input
                      type="radio"
                      name={group.name}
                      value={option}
                      checked={values[group.name] === option}
                      onChange={(event) =>
                        updateField(group.name, event.target.value)
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {textFields.map((field) => (
            <label key={field.name} className="block">
              <span className="font-semibold">{field.label}</span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-[#D8D2C4] bg-white/80 p-4 text-[#4F5F51] outline-none focus:border-[#8FA88B]"
                value={values[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#5F7F63] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit feedback"}
          </button>
        </form>

        {submitted && (
          <p className="mt-6 rounded-3xl bg-white/80 p-5 text-[#5F6F61] shadow-sm">
            Thank you. Your feedback helps shape InnerLeaf.
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-3xl bg-white/80 p-5 text-red-600 shadow-sm">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
