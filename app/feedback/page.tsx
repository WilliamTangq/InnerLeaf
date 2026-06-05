"use client";

import { Leaf, Send } from "lucide-react";
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

const experienceQuestions = [
  {
    name: "mode_tried",
    label: "Which mode did you use?",
    options: ["Quick Reflection", "Guided Reflection", "Both"],
  },
  {
    name: "ease_of_start",
    label: "Was it easy to start writing?",
    options: ["Very easy", "Somewhat easy", "Not easy"],
  },
  {
    name: "reflection_length",
    label: "Was the reflection card length about right?",
    options: ["Too long", "About right", "Too short"],
  },
  {
    name: "clarity_help",
    label: "Did the card help you see your reaction more clearly?",
    options: ["Yes", "Somewhat", "No"],
  },
  {
    name: "would_use_again",
    label: "Would you use InnerLeaf after an intense moment again?",
    options: ["Yes", "Maybe", "No"],
  },
] as const;

const openQuestions = [
  {
    name: "comparison_feedback",
    label: "What worked better or worse than Notes, a friend, or a chat tool?",
  },
  {
    name: "blocker",
    label: "What would stop you from coming back?",
  },
] as const;

type RadioFieldName = (typeof experienceQuestions)[number]["name"];
type TextFieldName = (typeof openQuestions)[number]["name"] | "other_thoughts";
type FeedbackValues = Record<RadioFieldName | TextFieldName, string>;

const initialValues = {
  ...experienceQuestions.reduce(
    (values, field) => {
      values[field.name] = "";
      return values;
    },
    {} as Record<RadioFieldName, string>
  ),
  comparison_feedback: "",
  blocker: "",
  other_thoughts: "",
};

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
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
          aria-hidden="true"
        >
          <Leaf size={22} strokeWidth={1.8} />
        </div>
        <PageHeader compact eyebrow="Thank you" title="Feedback received">
          Your answers help us improve the reflection experience.
        </PageHeader>
        <PageActions>
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
      <PageHeader compact eyebrow="Help us improve" title="Share feedback">
        About two minutes. Share only what feels useful.
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="hover:translate-y-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Your experience
          </h2>
          <div className="mt-6 space-y-7">
            {experienceQuestions.map((group) => (
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

        <Card className="hover:translate-y-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Optional notes
          </h2>
          <div className="mt-5 space-y-5">
            {openQuestions.map((field) => (
              <TextareaField
                key={field.name}
                label={field.label}
                className="min-h-24"
                value={values[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
              />
            ))}
            <TextareaField
              label="Anything else?"
              name="other_thoughts"
              className="min-h-24"
              value={values.other_thoughts}
              onChange={(event) =>
                updateField("other_thoughts", event.target.value)
              }
            />
          </div>

          <div className="mt-8">
            <PrimaryButton
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                {!loading && (
                  <Send aria-hidden="true" size={15} strokeWidth={1.8} />
                )}
                {loading ? "Sending…" : "Submit feedback"}
              </span>
            </PrimaryButton>
          </div>
        </Card>
      </form>

      {error && (
        <div className="mt-4">
          <StatusCard tone="error">{error}</StatusCard>
        </div>
      )}
    </PageShell>
  );
}
