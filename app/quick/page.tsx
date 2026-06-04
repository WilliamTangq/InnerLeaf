"use client";

import { Leaf, PencilLine, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  ReflectionResultCard,
  type StructuredReflectionResult,
} from "../components/reflection-result";
import {
  Card,
  Disclaimer,
  LinkButton,
  LoadingSpinner,
  PageActions,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

const flowSteps = [
  { label: "Write", icon: PencilLine },
  { label: "Organise", icon: Sparkles },
  { label: "Reflect", icon: Leaf },
] as const;

export default function QuickReflectionPage() {
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
        },
        body: JSON.stringify({ input, mode: "quick" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
      setStructured(data.structured || null);
      setWarning(data.warning || "");
    } catch {
      setError("Something went wrong while generating the reflection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reflect"
        title="Quick Reflection"
      >
        Write freely for a moment. InnerLeaf will organise your reaction into a
        structured reflection card you can revisit later.
      </PageHeader>

      <PageActions>
        <LinkButton href="/" variant="ghost">
          Home
        </LinkButton>
        <LinkButton href="/history" variant="secondary">
          History
        </LinkButton>
      </PageActions>

      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {flowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground-muted)]"
            >
              <Icon
                aria-hidden="true"
                size={16}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              {step.label}
            </div>
          );
        })}
      </div>

      <Card>
        <TextareaField
          label="What happened?"
          helper="No need to polish your words. A few honest sentences are enough."
          className="min-h-56"
          placeholder="Write what happened. You can be messy — InnerLeaf will help organise it."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {loading ? (
            <LoadingSpinner label="Organising your reflection…" />
          ) : (
            <Disclaimer />
          )}
          <PrimaryButton
            size="lg"
            onClick={handleReflect}
            disabled={loading || !input.trim()}
            className="sm:shrink-0"
          >
            {loading ? "Organising your reflection..." : "Break down this reaction"}
          </PrimaryButton>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {result && (
        <ReflectionResultCard result={result} structured={structured} />
      )}
    </PageShell>
  );
}
