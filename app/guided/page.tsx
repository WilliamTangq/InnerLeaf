"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { RoleAwareRedirect } from "../components/role-aware-redirect";
import { trackEvent } from "../lib/analytics";
import { translations } from "../lib/i18n";
import { detectReflectionLanguage } from "../lib/reflection-language";
import type { ReflectionLanguage } from "../lib/reflection-card";
import {
  Card,
  LinkButton,
  LoadingCard,
  LoadingSpinner,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

const fields = [
  { id: "situation" },
  { id: "emotion" },
  { id: "automatic_thought" },
  { id: "facts" },
  { id: "interpretation" },
  { id: "behaviour" },
] as const;

type FieldId = (typeof fields)[number]["id"];
type GuidedValues = Record<FieldId, string>;

const initialValues = fields.reduce((values, field) => {
  values[field.id] = "";
  return values;
}, {} as GuidedValues);

export function GuidedReflectionContent() {
  const { language, t } = useLanguage();
  const { role, session, user } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<GuidedValues>(initialValues);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedInput, setGeneratedInput] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [generatedReflectionLanguage, setGeneratedReflectionLanguage] =
    useState<ReflectionLanguage>(language);

  const filledCount = fields.filter((f) => values[f.id].trim()).length;
  const hasInput = filledCount > 0;
  const activeField = fields[activeStep];
  const draftKey = user?.id ? `innerleaf:guided:${user.id}` : "";
  const textareaId = `guided-reflection-${activeField.id}`;
  const isFinalStep = activeStep === fields.length - 1;
  const progressPercent = Math.round(((activeStep + 1) / fields.length) * 100);
  const [activeLabel, activeHelper, activeGroup] = t.guided.fields[activeField.id];

  useEffect(() => {
    if (!draftKey) {
      return;
    }

    let active = true;

    try {
      const rawDraft = window.localStorage.getItem(draftKey);
      const draft = rawDraft
        ? (JSON.parse(rawDraft) as {
            values?: GuidedValues;
            activeStep?: number;
            result?: string;
            structured?: StructuredReflectionResult;
            saved?: boolean;
            generatedInput?: string;
            reflectionLanguage?: ReflectionLanguage;
          })
        : null;

      if (draft?.saved) {
        window.localStorage.removeItem(draftKey);
      }

      queueMicrotask(() => {
        if (!active) {
          return;
        }

        if (draft?.saved) {
          setValues({ ...initialValues });
          setActiveStep(0);
          setResult("");
          setStructured(null);
          setSaved(false);
          setGeneratedInput("");
          setGeneratedReflectionLanguage(language);
        } else {
          setValues({ ...initialValues, ...(draft?.values ?? {}) });
          setActiveStep(
            typeof draft?.activeStep === "number"
              ? Math.min(Math.max(draft.activeStep, 0), fields.length - 1)
              : 0
          );
          setResult(draft?.result ?? "");
          setStructured(draft?.structured ?? null);
          setSaved(false);
          setGeneratedInput(draft?.generatedInput ?? "");
          setGeneratedReflectionLanguage(draft?.reflectionLanguage ?? language);
        }
        setDraftLoaded(true);
      });
    } catch {
      window.localStorage.removeItem(draftKey);
      queueMicrotask(() => {
        if (active) {
          setDraftLoaded(true);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [draftKey, language]);

  useEffect(() => {
    if (!draftKey || !draftLoaded) {
      return;
    }

    if (saved) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    if (!hasInput && !result && !structured) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        values,
        activeStep,
        result,
        structured,
        saved: false,
        generatedInput,
        reflectionLanguage: generatedReflectionLanguage,
      })
    );
  }, [
    activeStep,
    draftKey,
    draftLoaded,
    generatedInput,
    generatedReflectionLanguage,
    hasInput,
    result,
    saved,
    structured,
    values,
  ]);

  function updateField(field: FieldId, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const startNewReflection = useCallback(() => {
    setValues({ ...initialValues });
    setActiveStep(0);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");
    setLoading(false);
    setSaving(false);
    setSaved(false);
    setGeneratedInput("");
    setGeneratedReflectionLanguage(language);

    if (draftKey) {
      window.localStorage.removeItem(draftKey);
    }

    requestAnimationFrame(() => {
      const textarea = document.getElementById(
        "guided-reflection-situation"
      ) as HTMLTextAreaElement | null;
      textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
      textarea?.focus();
    });
  }, [draftKey, language]);

  async function handleReflect() {
    if (!session?.access_token) {
      router.push("/login?next=/dashboard/guided");
      return;
    }

    setLoading(true);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");
    setSaved(false);
    setGeneratedInput("");
    setGeneratedReflectionLanguage(language);

    const input = fields
      .map((field) => {
        const [label] = t.guided.fields[field.id];
        return `${label}: ${values[field.id].trim()}`;
      })
      .filter((line) => line.split(": ")[1])
      .join("\n");
    setGeneratedInput(input);

    try {
      const reflectionLanguage = detectReflectionLanguage(input, language);
      trackEvent("guided_reflection_started", {
        locale: language,
        authenticated_state: true,
        role_bucket: role ?? "user",
        mode: "guided",
        reflection_language: reflectionLanguage,
        completed_fields: filledCount,
      });
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          input,
          mode: "guided",
          language,
          reflectionLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?next=/dashboard/guided");
          return;
        }
        setError(data.error || t.common.aiGeneric);
        return;
      }

      const nextResult = data.result || "";
      const nextStructured = data.structured || null;
      const nextReflectionLanguage =
        data.reflectionLanguage === "en" || data.reflectionLanguage === "zh"
          ? data.reflectionLanguage
          : reflectionLanguage;

      setResult(nextResult);
      setStructured(nextStructured);
      setGeneratedReflectionLanguage(nextReflectionLanguage);
      setWarning("");
      trackEvent("reflection_generated", {
        locale: language,
        authenticated_state: true,
        role_bucket: role ?? "user",
        mode: "guided",
        reflection_language: nextReflectionLanguage,
        structured: Boolean(nextStructured),
      });
      void autoSaveReflection(
        input,
        nextResult,
        nextStructured,
        nextReflectionLanguage
      );
    } catch {
      setError(t.common.aiGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function autoSaveReflection(
    nextInput: string,
    nextResult: string,
    nextStructured: StructuredReflectionResult,
    nextLanguage: "en" | "zh"
  ) {
    if (!session?.access_token) {
      return;
    }

    setSaving(true);
    setWarning("");
    setError("");

    try {
      const response = await fetch("/api/save-reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          input: nextInput,
          result: nextResult,
          structured: nextStructured,
          mode: "guided",
          language,
          reflectionLanguage: nextLanguage,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setWarning(data.error || t.common.saveWarning);
        return;
      }

      setSaved(true);
      setWarning("");
      toast.success(t.common.savedToHistory);
      trackEvent("reflection_saved", {
        locale: language,
        authenticated_state: true,
        role_bucket: role ?? "user",
        mode: "guided",
        reflection_language: nextLanguage,
        structured: Boolean(nextStructured),
      });
    } catch {
      setWarning(t.common.saveWarning);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
            {t.common.reflect}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {t.guided.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.guided.purpose}
          </p>
        </div>
        <Link
          href="/dashboard/quick"
          className="inline-flex w-fit items-center rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)] transition hover:border-[rgba(31,155,143,0.3)] hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          {t.guided.quickLink}
        </Link>
      </header>

      <Card
        variant="action"
        className="overflow-hidden border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.97),rgba(246,242,233,0.52))] p-0 hover:translate-y-0"
      >
        <div className="border-b border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.62)] px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                {t.guided.progress} {activeStep + 1} {t.guided.of} {fields.length}
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-7 text-[var(--foreground)]">
                {activeLabel}
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
              {filledCount}/{fields.length}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(40,80,60,0.08)]">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),rgba(217,179,74,0.72))] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </span>
            <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
              {fields.map((field, index) => (
                <span
                  key={field.id}
                  className={[
                    "h-2 w-2 rounded-full transition",
                    index <= activeStep
                      ? "bg-[var(--brand-teal)]"
                      : "bg-[rgba(40,80,60,0.14)]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside
            className="hidden border-r border-[rgba(40,80,60,0.08)] bg-[rgba(246,242,233,0.34)] p-4 lg:block"
            aria-label="Reflection steps"
          >
            <div className="space-y-2" role="tablist">
              {fields.map((field, index) => {
                const isActive = index === activeStep;
                const isFilled = Boolean(values[field.id].trim());
                const [label] = t.guided.fields[field.id];

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
                      "flex w-full items-center gap-3 rounded-[1rem] border px-3 py-2.5 text-left text-sm transition duration-200 ease-[var(--motion-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                      isActive
                        ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                        : "border-transparent text-[var(--foreground-muted)] hover:border-[rgba(40,80,60,0.08)] hover:bg-[rgba(255,254,248,0.64)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                        isFilled
                          ? "bg-[var(--brand-teal)] text-white"
                          : isActive
                            ? "bg-[var(--surface)] text-[var(--brand-teal-deep)]"
                            : "bg-[var(--surface-muted)] text-[var(--foreground-subtle)]",
                      ].join(" ")}
                    >
                      {isFilled ? (
                        <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{label}</span>
                      <span className="mt-0.5 block truncate text-xs opacity-70">
                        {t.guided.fields[field.id][2]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="p-4 sm:p-5">
            {draftLoaded && hasInput && !saved && !result && (
              <div className="mb-4 flex items-center gap-2 rounded-full border border-[rgba(31,155,143,0.12)] bg-[rgba(255,254,248,0.68)] px-3 py-2 text-xs font-medium text-[var(--foreground-subtle)]">
                <CheckCircle2
                  aria-hidden="true"
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--brand-teal-deep)]"
                />
                {t.guided.draftSavedHint}
              </div>
            )}
            <div
              role="tabpanel"
              id={`guided-panel-${activeField.id}`}
              aria-labelledby={`guided-tab-${activeField.id}`}
              className="rounded-[1.35rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                {activeGroup}
              </p>
              <TextareaField
                id={textareaId}
                label={activeLabel}
                helper={activeHelper}
                className="mt-3 min-h-40 bg-[rgba(255,254,248,0.96)] sm:min-h-44"
                value={values[activeField.id]}
                onChange={(event) => updateField(activeField.id, event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0 || loading}
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.72)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              >
                {t.guided.back}
              </button>

              {!isFinalStep ? (
                <PrimaryButton
                  type="button"
                  size="lg"
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {t.guided.continue}
                </PrimaryButton>
              ) : loading ? (
                <div className="flex min-h-11 w-full items-center justify-center sm:w-auto">
                  <LoadingSpinner label={t.common.loadingGuided} />
                </div>
              ) : (
                <PrimaryButton
                  size="lg"
                  onClick={handleReflect}
                  disabled={loading || !hasInput}
                  className="w-full sm:w-auto"
                >
                  {t.guided.button}
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {loading && <LoadingCard label={t.common.loadingGuided} />}

      {result && (
        <>
          <ReflectionResultCard
            result={result}
            structured={structured}
            showActions={saved}
            statusText={
              saved
                ? translations[generatedReflectionLanguage].common.savedToHistory
                : translations[generatedReflectionLanguage].reflectionCard
                    .generatedOnly
            }
            saved={saved}
            saving={saving}
            autoSaved
            mode="guided"
            reflectionLanguage={generatedReflectionLanguage}
            onReflectAgain={startNewReflection}
          />
          {saved && (
            <Card className="mt-4 hover:translate-y-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">
                    {t.feedbackPrompt.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                    {t.feedbackPrompt.body}
                  </p>
                </div>
                <LinkButton
                  href="/feedback"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    trackEvent("feedback_prompt_clicked", {
                      locale: language,
                      authenticated_state: true,
                      role_bucket: role ?? "user",
                      mode: "guided",
                    })
                  }
                >
                  {t.feedbackPrompt.cta}
                </LinkButton>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function GuidedReflectionPage() {
  return <RoleAwareRedirect target="/guided" />;
}
