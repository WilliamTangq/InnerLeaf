"use client";

import { useState } from "react";
import { ReflectionResultCard } from "../components/reflection-result";
import {
  Card,
  Disclaimer,
  LoadingSpinner,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
  TextareaField,
} from "../components/ui";

export default function QuickReflectionPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReflect() {
    setLoading(true);
    setResult("");
    setWarning("");
    setError("");

    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
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

      <Card>
        <TextareaField
          label="What happened?"
          helper="No need to polish your words. A few honest sentences are enough."
          className="min-h-56"
          placeholder="Describe the moment, what you felt, and what went through your mind…"
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
            {loading ? "Processing…" : "Create reflection card"}
          </PrimaryButton>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {warning && <StatusCard tone="warning">{warning}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {result && <ReflectionResultCard result={result} />}
    </PageShell>
  );
}
