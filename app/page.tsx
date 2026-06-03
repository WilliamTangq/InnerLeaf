"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReflect() {
    setLoading(true);
    setResult("");

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
        setResult(data.error || "Something went wrong.");
        return;
      }

      setResult(data.result);
    } catch {
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-sm tracking-wide text-[#6B7C6A]">
          InnerLeaf
        </p>

        <h1 className="mb-4 text-4xl font-semibold leading-tight">
          Understand the pattern behind your emotional reaction.
        </h1>

        <p className="mb-8 text-base leading-7 text-[#5F6F61]">
          Write down what happened. InnerLeaf helps you reflect on the trigger,
          thought pattern, emotional reaction, and one practical next question.
        </p>

        <div className="rounded-3xl bg-white/70 p-5 shadow-sm backdrop-blur">
          <textarea
            className="min-h-44 w-full resize-none rounded-2xl border border-[#D8D2C4] bg-white/80 p-4 outline-none focus:border-[#8FA88B]"
            placeholder="What happened? What did you feel? What did you assume or imagine?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <button
            onClick={handleReflect}
            disabled={loading || !input.trim()}
            className="mt-4 rounded-full bg-[#5F7F63] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Reflecting..." : "Reflect"}
          </button>
        </div>

        {result && (
          <div className="mt-8 whitespace-pre-wrap rounded-3xl bg-white/80 p-6 leading-7 shadow-sm">
            {result}
          </div>
        )}

        <p className="mt-8 text-xs leading-6 text-[#7A8377]">
          InnerLeaf is not therapy, diagnosis, or medical advice. It is a
          reflection tool for self-understanding.
        </p>

        <a href="/history" className="text-sm text-[#5F7F63]">
          View reflection history →
        </a>
        
      </div>
    </main>
  );
}