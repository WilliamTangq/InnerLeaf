"use client";

import Link from "next/link";
import { CheckCircle2, HelpCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
  LoadingCard,
  LoadingSpinner,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

export function QuickReflectionContent() {
  const { language, t } = useLanguage();
  const { role, session, user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [generatedReflectionLanguage, setGeneratedReflectionLanguage] =
    useState<ReflectionLanguage>(language);

  const draftKey = user?.id ? `innerleaf:quick:${user.id}` : "";
  const textareaId = "quick-reflection-input";
  const selectedMoodOption = t.quick.moodOptions.find(
    (option) => option.id === selectedMood
  );

  useEffect(() => {
    if (!draftKey) {
      return;
    }

    let active = true;

    try {
      const rawDraft = window.localStorage.getItem(draftKey);
      const draft = rawDraft
        ? (JSON.parse(rawDraft) as {
            input?: string;
            result?: string;
            structured?: StructuredReflectionResult;
            saved?: boolean;
            saveToHistory?: boolean;
            selectedMood?: string;
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
          setInput("");
          setResult("");
          setStructured(null);
          setSaved(false);
          setSaveToHistory(true);
          setSelectedMood("");
          setGeneratedReflectionLanguage(language);
        } else {
          setInput(draft?.input ?? "");
          setResult(draft?.result ?? "");
          setStructured(draft?.structured ?? null);
          setSaved(false);
          setSaveToHistory(draft?.saveToHistory ?? true);
          setSelectedMood(draft?.selectedMood ?? "");
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

    if (!input && !result && !structured) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        input,
        result,
        structured,
        selectedMood,
        saveToHistory,
        reflectionLanguage: generatedReflectionLanguage,
        saved: false,
      })
    );
  }, [
    draftKey,
    draftLoaded,
    generatedReflectionLanguage,
    input,
    result,
    saved,
    saveToHistory,
    selectedMood,
    structured,
  ]);

  const startNewReflection = useCallback(() => {
    setInput("");
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");
    setSelectedMood("");
    setLoading(false);
    setSaving(false);
    setSaved(false);
    setSaveToHistory(true);
    setGeneratedReflectionLanguage(language);

    if (draftKey) {
      window.localStorage.removeItem(draftKey);
    }

    requestAnimationFrame(() => {
      const textarea = document.getElementById(
        textareaId
      ) as HTMLTextAreaElement | null;
      textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
      textarea?.focus();
    });
  }, [draftKey, language]);

  useEffect(() => {
    function onNewReflection() {
      if (saved) {
        startNewReflection();
      }
    }

    window.addEventListener("innerleaf:new-quick-reflection", onNewReflection);

    return () => {
      window.removeEventListener(
        "innerleaf:new-quick-reflection",
        onNewReflection
      );
    };
  }, [saved, startNewReflection]);

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
          mode: "quick",
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
        mode: "quick",
        reflection_language: nextLanguage,
        structured: Boolean(nextStructured),
      });
    } catch {
      setWarning(t.common.saveWarning);
    } finally {
      setSaving(false);
    }
  }

  async function handleReflect() {
    if (!session?.access_token) {
      router.push("/login?next=/dashboard/quick");
      return;
    }

    setLoading(true);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");
    setSaved(false);

    try {
      const reflectionLanguage = detectReflectionLanguage(input, language);
      trackEvent("quick_reflection_started", {
        locale: language,
        authenticated_state: true,
        role_bucket: role ?? "user",
        mode: "quick",
        reflection_language: reflectionLanguage,
        selected_mood: selectedMood || "none",
      });
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          input,
          mode: "quick",
          language,
          reflectionLanguage,
          selectedMood: selectedMood || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?next=/dashboard/quick");
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
        mode: "quick",
        reflection_language: nextReflectionLanguage,
        selected_mood: selectedMood || "none",
        structured: Boolean(nextStructured),
      });
      if (saveToHistory) {
        void autoSaveReflection(
          input,
          nextResult,
          nextStructured,
          nextReflectionLanguage
        );
      }
    } catch {
      setError(t.common.aiGeneric);
    } finally {
      setLoading(false);
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
            {t.quick.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.quick.purpose}
          </p>
        </div>
        <Link
          href="/dashboard/guided"
          className="inline-flex w-fit items-center rounded-full border border-[rgba(31,155,143,0.16)] bg-[rgba(255,254,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)] transition hover:border-[rgba(31,155,143,0.3)] hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          {t.common.tryGuided}
        </Link>
      </header>

      <Card
        variant="action"
        className="overflow-hidden border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.97),rgba(246,242,233,0.52))] p-0 hover:translate-y-0"
      >
        <div className="border-b border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.62)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                {t.quick.cardEyebrow}
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-7 text-[var(--foreground)]">
                {t.quick.cardTitle}
              </h2>
            </div>
            {selectedMoodOption && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
                <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                {selectedMoodOption.label}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.quick.cardHelper}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="rounded-[1.35rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <div className="mb-4 grid gap-2 rounded-[1.1rem] border border-[rgba(31,155,143,0.12)] bg-[rgba(230,245,239,0.42)] p-3 text-xs leading-5 text-[var(--foreground-muted)] sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex gap-2.5">
                <ShieldCheck
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
                />
                <span>{t.quick.privacyHint}</span>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(180,90,45,0.16)] bg-[rgba(255,248,226,0.70)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground-subtle)]">
                <LockKeyhole aria-hidden="true" size={12} strokeWidth={1.8} />
                {t.quick.savePreferenceTitle}
              </span>
            </div>

            <TextareaField
              id={textareaId}
              label={t.quick.label}
              helper={selectedMoodOption?.prompt ?? t.quick.helper}
              className="min-h-56 bg-[rgba(255,254,248,0.96)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),var(--shadow-sm)] sm:min-h-64"
              placeholder={selectedMoodOption?.prompt ?? t.quick.placeholder}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {t.quick.chips.slice(0, 4).map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(31,155,143,0.12)] bg-[rgba(255,254,248,0.62)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground-subtle)]"
                >
                  <HelpCircle
                    aria-hidden="true"
                    size={12}
                    strokeWidth={1.8}
                    className="text-[var(--brand-teal-deep)]"
                  />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-[1.25rem] border border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.62)] p-3.5">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  value: true,
                  title: t.quick.saveToHistory,
                  body: t.quick.saveToHistoryDesc,
                },
                {
                  value: false,
                  title: t.quick.doNotSave,
                  body: t.quick.doNotSaveDesc,
                },
              ].map((option) => {
                const active = saveToHistory === option.value;

                return (
                  <button
                    key={option.title}
                    type="button"
                    onClick={() => setSaveToHistory(option.value)}
                    aria-pressed={active}
                    className={[
                      "rounded-[1rem] border p-3 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                      active
                        ? "border-[rgba(31,155,143,0.28)] bg-[var(--accent-soft)] shadow-[var(--shadow-sm)]"
                        : "border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.58)] hover:border-[rgba(31,155,143,0.18)]",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          active
                            ? "border-[var(--brand-teal-deep)] bg-[var(--brand-teal-deep)] text-white"
                            : "border-[var(--border-strong)] bg-[var(--surface)] text-transparent",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        <CheckCircle2 size={13} strokeWidth={2.2} />
                      </span>
                      {option.title}
                    </span>
                    <span className="mt-1.5 block text-xs leading-5 text-[var(--foreground-muted)]">
                      {option.body}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--foreground-subtle)]">
              {t.quick.safetyBoundary}
            </p>
          </div>

          <details className="group mt-3 rounded-[1.1rem] border border-[rgba(40,80,60,0.075)] bg-[rgba(255,254,248,0.52)] px-3.5 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-[var(--foreground-muted)] marker:hidden">
              <span>{t.quick.moodPrompt}</span>
              <span className="text-[var(--brand-teal-deep)] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.quick.moodOptions.map((mood) => {
                const isSelected = selectedMood === mood.id;

                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() =>
                      setSelectedMood((current) =>
                        current === mood.id ? "" : mood.id
                      )
                    }
                    aria-pressed={isSelected}
                    className={[
                      "rounded-full border px-2.5 py-1.5 text-xs font-semibold transition duration-200 ease-[var(--motion-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                      isSelected
                        ? "border-[rgba(31,155,143,0.28)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                        : "border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.58)] text-[var(--foreground-subtle)] hover:border-[rgba(31,155,143,0.18)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </details>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--foreground-subtle)]">
              {t.quick.guidedLinkLead}{" "}
              <Link
                href="/dashboard/guided"
                className="font-medium text-[var(--brand-teal-deep)] underline-offset-2 hover:underline"
              >
                {t.common.tryGuided}
              </Link>
            </p>
            {loading ? (
              <div className="flex min-h-11 w-full items-center justify-center sm:w-auto">
                <LoadingSpinner label={t.common.loadingQuick} />
              </div>
            ) : (
              <PrimaryButton
                size="lg"
                onClick={handleReflect}
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto sm:shrink-0"
              >
                {t.quick.button}
              </PrimaryButton>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {loading && <LoadingCard label={t.common.loadingQuick} />}

      {result && (
        <>
          <ReflectionResultCard
            result={result}
            structured={structured}
            showActions={saved}
            statusText={
              saved
                ? translations[generatedReflectionLanguage].common
                    .savedToReflectionHistory
                : !saveToHistory
                  ? translations[generatedReflectionLanguage].quick
                      .noSaveGenerated
                : translations[generatedReflectionLanguage].reflectionCard
                    .generatedOnly
            }
            saved={saved}
            saving={saving}
            autoSaved={saveToHistory}
            noSaveMode={!saveToHistory}
            mode="quick"
            reflectionLanguage={generatedReflectionLanguage}
            onReflectAgain={startNewReflection}
          />
        </>
      )}
    </div>
  );
}

export default function QuickReflectionPage() {
  return <RoleAwareRedirect target="/quick" />;
}
