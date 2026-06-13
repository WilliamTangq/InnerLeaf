"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  Card,
  LoadingCard,
  LoadingSpinner,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

export default function QuickReflectionPage() {
  const { language, t } = useLanguage();
  const { session, user } = useAuth();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [structured, setStructured] =
    useState<StructuredReflectionResult>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReflect() {
    setLoading(true);
    setResult("");
    setStructured(null);
    setWarning("");
    setError("");

    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ input, mode: "quick", language }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.common.aiGeneric);
        return;
      }

      setResult(data.result);
      setStructured(data.structured || null);
      setWarning(data.warning || (data.saved ? "" : t.common.loginToSave));
    } catch {
      setError(t.common.aiGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
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
              href="/guided"
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
            statusText={user ? t.common.savedToHistory : t.reflectionCard.generatedOnly}
          />
          {!user && (
            <div className="mt-4">
              <StatusCard tone="neutral">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{t.auth.savingUnavailable}</span>
                  <Link
                    href="/login?next=/quick"
                    className="font-medium text-[var(--brand-teal-deep)] underline-offset-2 hover:underline"
                  >
                    {t.auth.loginToSaveButton}
                  </Link>
                </div>
              </StatusCard>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
