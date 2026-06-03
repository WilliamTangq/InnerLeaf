"use client";

import { useState, type FormEvent } from "react";
import {
  Card,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <PageShell>
      <PageHeader title="Share feedback">
        Help us improve InnerLeaf. Your feedback helps us understand whether
        this tool is useful for emotional reflection.
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <h2 className="text-xl font-semibold">How did it feel to use?</h2>
          <div className="mt-6 space-y-6">
            {radioGroups.map((group) => (
              <fieldset key={group.name}>
                <legend className="text-sm font-semibold">{group.label}</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {group.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 rounded-3xl border border-[#D8D2C4] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4F5F51] transition focus-within:border-[#8FA88B] focus-within:ring-4 focus-within:ring-[#DDE8DA]"
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
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">A few open thoughts</h2>
          <div className="mt-6 space-y-5">
            {textFields.map((field) => (
              <TextareaField
                key={field.name}
                label={field.label}
                className="min-h-28"
                value={values[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
              />
            ))}
          </div>

          <div className="mt-6">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Sending feedback..." : "Submit feedback"}
            </PrimaryButton>
          </div>
        </Card>
      </form>

      <div className="mt-6 space-y-4">
        {submitted && (
          <StatusCard tone="success">
            Thank you. Your feedback helps shape InnerLeaf.
          </StatusCard>
        )}

        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>
    </PageShell>
  );
}
