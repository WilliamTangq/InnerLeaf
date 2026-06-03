import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const geminiModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type StructuredReflection = {
  emotional_validation: string;
  emotion: string;
  trigger: string;
  facts: string[];
  interpretation: string[];
  thought_pattern: string;
  behavioural_insight: string;
  next_question: string;
};

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function parseStructuredReflection(text: string): StructuredReflection | null {
  const jsonText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const value = JSON.parse(jsonText) as Record<string, unknown>;
    const structured = {
      emotional_validation: toStringValue(value.emotional_validation),
      emotion: toStringValue(value.emotion),
      trigger: toStringValue(value.trigger),
      facts: toStringList(value.facts),
      interpretation: toStringList(value.interpretation),
      thought_pattern: toStringValue(value.thought_pattern),
      behavioural_insight: toStringValue(value.behavioural_insight),
      next_question: toStringValue(value.next_question),
    };

    if (
      !structured.emotional_validation ||
      !structured.trigger ||
      !structured.thought_pattern ||
      !structured.next_question
    ) {
      return null;
    }

    return structured;
  } catch {
    return null;
  }
}

function formatStructuredReflection(reflection: StructuredReflection) {
  const facts = reflection.facts.length
    ? reflection.facts.map((fact) => `- ${fact}`).join("\n")
    : "- Not clearly identified.";
  const interpretation = reflection.interpretation.length
    ? reflection.interpretation
        .map((item) => `- ${item}`)
        .join("\n")
    : "- Not clearly identified.";

  return `1. Emotional Validation
${reflection.emotional_validation}

2. Trigger
${reflection.trigger}

3. Facts vs Interpretation
Facts:
${facts}

Interpretation:
${interpretation}

4. Thought Pattern
${reflection.thought_pattern}

5. Behavioural Insight
${reflection.behavioural_insight}

6. One Next Question
${reflection.next_question}`;
}

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Your role:
- Turn emotional moments into concise structured reflection data.
- Do not diagnose.
- Do not provide therapy, diagnosis, medical advice, or crisis counselling.
- Do not over-explain.
- Use cautious language such as "may", "might", or "could".
- Use warm but clear language.
- Avoid clinical labels unless the user clearly provides enough context.

User input:
${input}

Return only valid JSON in exactly this shape:
{
  "emotional_validation": "string",
  "emotion": "string",
  "trigger": "string",
  "facts": ["string", "string"],
  "interpretation": ["string", "string"],
  "thought_pattern": "string",
  "behavioural_insight": "string",
  "next_question": "string"
}

Rules:
- Keep all fields short.
- Use at most 2 facts.
- Use at most 2 interpretations.
- Include only one main thought pattern.
- Do not diagnose.
- Do not provide therapy, diagnosis, or medical advice.
- Do not over-explain.
- Do not wrap the JSON in markdown.
- Use warm but clear language.
`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawResult =
      response.text || "No reflection generated. Please try again.";
    const structured = parseStructuredReflection(rawResult);
    const result = structured
      ? formatStructuredReflection(structured)
      : rawResult;

    const reflectionRecord = {
      user_input: input,
      ai_result: result,
      ...(structured
        ? {
            emotion: structured.emotion,
            trigger: structured.trigger,
            thought_pattern: structured.thought_pattern,
            facts: structured.facts.join("\n"),
            interpretation: structured.interpretation.join("\n"),
            behaviour: structured.behavioural_insight,
            next_question: structured.next_question,
          }
        : {}),
    };

    const { error } = await supabase.from("reflections").insert(reflectionRecord);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({
        result,
        structured,
        warning: "Reflection generated but could not be saved.",
      });
    }

    return NextResponse.json({ result, structured });
  } catch (error: unknown) {
    console.error("Reflect API error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 429
    ) {
      return NextResponse.json(
        {
          error:
            "InnerLeaf has reached today’s AI usage limit. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while generating the reflection." },
      { status: 500 }
    );
  }
}
