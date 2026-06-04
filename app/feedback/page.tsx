"use client";

import { useState, type FormEvent } from "react";
import {
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  PrimaryButton,
  RadioGroupField,
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
    label:
      "Would you use InnerLeaf again next time you feel emotionally triggered?",
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

  if (submitted) {
    return (
      <PageShell>
        <PageHeader eyebrow="Thank you" title="Feedback received">
          Your input helps shape InnerLeaf into a more useful reflection
          experience.
        </PageHeader>
        <StatusCard tone="success">
          We appreciate you taking the time to share your experience.
        </StatusCard>
        <PageActions className="mt-8">
          <LinkButton href="/">Back to home</LinkButton>
          <LinkButton href="/quick" variant="secondary">
            New reflection
          </LinkButton>
        </PageActions>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Help us improve" title="Share feedback">
        A short survey—about two minutes. Your answers stay private and help us
        understand what works.
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            How did it feel to use?
          </h2>
          <div className="mt-6 space-y-8">
            {radioGroups.map((group) => (
              <RadioGroupField
                key={group.name}
                name={group.name}
                label={group.label}
                options={group.options}
                value={values[group.name]}
                onChange={(value) => updateField(group.name, value)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            A few open thoughts
          </h2>
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

          <div className="mt-8">
            <PrimaryButton type="submit" size="lg" disabled={loading}>
              {loading ? "Sending…" : "Submit feedback"}
            </PrimaryButton>
          </div>
        </Card>
      </form>

      {error && (
        <div className="mt-6">
          <StatusCard tone="error">{error}</StatusCard>
        </div>
      )}
    </PageShell>
  );
}
