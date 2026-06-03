"use client";

import { useState } from "react";
import {
  Card,
  Disclaimer,
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
      <PageHeader title="Quick Reflection">
        Write freely for a moment. InnerLeaf will organise the reaction into a
        clear reflection card.
      </PageHeader>

      <Card>
        <TextareaField
          label="What happened?"
          helper="No need to make it tidy. A few rough sentences are enough."
          className="min-h-64"
          placeholder="Write what happened. You can be messy — InnerLeaf will help organise it."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="mt-5">
          <PrimaryButton
            onClick={handleReflect}
            disabled={loading || !input.trim()}
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
        <Card className="mt-8">
          <p className="text-sm font-medium tracking-wide text-[#6B7C6A]">
            Reflection Card
          </p>
          <div className="mt-4 whitespace-pre-wrap leading-7 text-[#35483B]">
            {result}
          </div>
        </Card>
      )}

      <Disclaimer />
    </PageShell>
  );
}
