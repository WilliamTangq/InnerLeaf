"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { RoleAwareRedirect } from "../components/role-aware-redirect";
import { detectReflectionLanguage } from "../lib/reflection-language";
import {
  Card,
  LinkButton,
  LoadingCard,
  LoadingSpinner,
  PageHeader,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

export function QuickReflectionContent() {
  const { language, t } = useLanguage();
  const { session, user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const draftKey = user?.id ? `innerleaf:quick:${user.id}` : "";

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
        } else {
          setInput(draft?.input ?? "");
          setResult(draft?.result ?? "");
          setStructured(draft?.structured ?? null);
          setSaved(false);
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
  }, [draftKey]);

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
        saved: false,
      })
    );
  }, [draftKey, draftLoaded, input, result, saved, structured]);

  const startNewReflection = useCallback(() => {
    setInput("");
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");
    setLoading(false);
    setSaving(false);
    setSaved(false);

    if (draftKey) {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

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
          language: nextLanguage,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setWarning(data.error || t.common.saveWarning);
        return;
      }

      setSaved(true);
      setWarning("");
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

      setResult(nextResult);
      setStructured(nextStructured);
      setWarning("");
      void autoSaveReflection(input, nextResult, nextStructured, reflectionLanguage);
    } catch {
      setError(t.common.aiGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader compact eyebrow={t.common.reflect} title={t.quick.title}>
        {t.quick.purpose}
      </PageHeader>

      <Card className="hover:translate-y-0">
        <TextareaField
          label={t.quick.label}
          helper={t.quick.helper}
          className="min-h-52 sm:min-h-56"
          placeholder={t.quick.placeholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {t.quick.chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(31,155,143,0.14)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--foreground-muted)]"
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

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <LoadingSpinner label={t.common.loadingQuick} />
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
            statusText={saved ? t.common.savedToHistory : t.reflectionCard.generatedOnly}
            saved={saved}
            saving={saving}
            autoSaved
          />
          {saved && (
            <div className="mt-4 grid gap-3">
              <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.16)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-[var(--brand-teal-deep)]">
                  {t.common.savedToHistory}
                </p>
                <PrimaryButton type="button" onClick={startNewReflection}>
                  {t.quick.startNew}
                </PrimaryButton>
              </div>
              <Card className="hover:translate-y-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {t.feedbackPrompt.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                      {t.feedbackPrompt.body}
                    </p>
                  </div>
                  <LinkButton href="/feedback" variant="secondary" size="sm">
                    {t.feedbackPrompt.cta}
                  </LinkButton>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function QuickReflectionPage() {
  return <RoleAwareRedirect target="/quick" />;
}
