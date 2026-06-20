"use client";

import { CheckCircle2, Leaf, MessageSquareText, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AnalyticsPageView } from "../components/analytics-tracker";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { trackEvent } from "../lib/analytics";
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
] as const;

const productFitQuestions = [
  { name: "would_use_again" },
  { name: "alternative_tool" },
  { name: "saving_blocker" },
] as const;

type RadioFieldName =
  | (typeof experienceQuestions)[number]["name"]
  | (typeof productFitQuestions)[number]["name"];
type TextFieldName = "comparison_feedback" | "blocker" | "other_thoughts";
type FeedbackValues = Record<RadioFieldName | TextFieldName, string>;

const initialValues = {
  ...[...experienceQuestions, ...productFitQuestions].reduce(
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
  const { language, t } = useLanguage();
  const { role, session } = useAuth();
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
      trackEvent("feedback_submitted", {
        locale: language,
        authenticated_state: Boolean(session),
        role_bucket: role ?? "logged_out",
        mode: values.mode_tried || "unspecified",
        has_comments: Boolean(values.other_thoughts.trim()),
      });
    } catch {
      setError(t.feedback.error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <PageShell>
        <Card variant="elevated" className="text-center hover:translate-y-0 sm:text-left">
          <div
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] sm:mx-0"
            aria-hidden="true"
          >
            <CheckCircle2 size={22} strokeWidth={1.8} />
          </div>
          <PageHeader
            compact
            eyebrow={t.feedback.thankYouEyebrow}
            title={t.feedback.thankYou}
          >
            {t.feedback.success}
          </PageHeader>
          <PageActions className="mb-0 justify-center sm:justify-start">
            <LinkButton href="/dashboard/quick">{t.common.newReflection}</LinkButton>
            <LinkButton href="/dashboard/history" variant="secondary">
              {t.common.viewHistory}
            </LinkButton>
            <LinkButton href="/" variant="ghost">
              {t.feedback.backHome}
            </LinkButton>
          </PageActions>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AnalyticsPageView event="feedback_page_viewed" />
      <PageHeader compact eyebrow={t.feedback.eyebrow} title={t.feedback.title}>
        {t.feedback.purpose}
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="hover:translate-y-0">
          <div className="flex items-start gap-3">
            <Leaf
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
            />
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {t.feedback.basics}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-subtle)]">
                {t.feedback.experience}
              </p>
            </div>
          </div>
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
          <div className="flex items-start gap-3">
            <MessageSquareText
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
            />
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {t.feedback.productFit}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-subtle)]">
                {t.feedback.notes}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-7">
            {productFitQuestions.map((group) => (
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
            {t.feedback.commentsTitle}
          </h2>
          <div className="mt-5">
            <TextareaField
              label={t.feedback.anythingElse}
              name="other_thoughts"
              className="min-h-28"
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
