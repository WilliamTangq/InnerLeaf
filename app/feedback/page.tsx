"use client";

import { Leaf, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
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
  { name: "mode_tried" },
  { name: "ease_of_start" },
  { name: "reflection_length" },
  { name: "clarity_help" },
  { name: "would_use_again" },
  { name: "alternative_tool" },
  { name: "saving_blocker" },
] as const;

const openQuestions = [
  { name: "comparison_feedback" },
  { name: "blocker" },
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
  const { t } = useLanguage();
  const { session } = useAuth();
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
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.feedback.saveError);
        return;
      }

      setSubmitted(true);
      setValues(initialValues);
    } catch {
      setError(t.feedback.error);
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
        <PageHeader
          compact
          eyebrow={t.feedback.thankYouEyebrow}
          title={t.feedback.thankYou}
        >
          {t.feedback.success}
        </PageHeader>
        <PageActions>
          <LinkButton href="/">{t.feedback.backHome}</LinkButton>
          <LinkButton href="/dashboard/quick" variant="secondary">
            {t.common.newReflection}
          </LinkButton>
        </PageActions>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader compact eyebrow={t.feedback.eyebrow} title={t.feedback.title}>
        {t.feedback.purpose}
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="hover:translate-y-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.feedback.experience}
          </h2>
          <div className="mt-6 space-y-7">
            {experienceQuestions.map((group) => (
              <RadioGroupField
                key={group.name}
                name={group.name}
                label={t.feedback.questions[group.name][0]}
                options={t.feedback.questions[group.name][1]}
                value={values[group.name]}
                onChange={(value) => updateField(group.name, value)}
              />
            ))}
          </div>
        </Card>

        <Card className="hover:translate-y-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.feedback.notes}
          </h2>
          <div className="mt-5 space-y-5">
            {openQuestions.map((field) => (
              <TextareaField
                key={field.name}
                label={t.feedback.openQuestions[field.name]}
                className="min-h-24"
                value={values[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
              />
            ))}
            <TextareaField
              label={t.feedback.anythingElse}
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
                {loading ? t.feedback.sending : t.feedback.submit}
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
