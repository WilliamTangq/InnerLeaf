"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { RequireAuth } from "../components/route-guards";
import { UserShell } from "../components/user-shell";
import {
  Card,
  LoadingCard,
  LoadingSpinner,
  PageHeader,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

function QuickReflectionContent() {
  const { language, t } = useLanguage();
  const { session } = useAuth();
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
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ input, mode: "quick", language }),
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

      setResult(data.result);
      setStructured(data.structured || null);
      setWarning("");
    } catch {
      setError(t.common.aiGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function saveReflection() {
    if (!session?.access_token) {
      router.push("/login?next=/dashboard/quick");
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
          input,
          result,
          structured,
          mode: "quick",
          language,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.common.saveWarning);
        return;
      }

      setSaved(true);
      setWarning("");
    } catch {
      setError(t.common.saveWarning);
    } finally {
      setSaving(false);
    }
  }

  return (
    <UserShell maxWidth="max-w-3xl">
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
          />
          {!saved && (
            <div className="mt-4 space-y-3">
              <StatusCard tone="neutral">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{t.auth.trust}</span>
                  <PrimaryButton
                    type="button"
                    size="sm"
                    onClick={saveReflection}
                    disabled={saving}
                    className="shrink-0"
                  >
                    {saving
                      ? t.common.savingReflection
                      : t.common.saveToHistory}
                  </PrimaryButton>
                </div>
              </StatusCard>
            </div>
          )}
        </>
      )}
    </UserShell>
  );
}

export default function QuickReflectionPage() {
  return (
    <RequireAuth>
      <QuickReflectionContent />
    </RequireAuth>
  );
}
