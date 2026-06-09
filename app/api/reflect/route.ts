import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeLanguage, translations, type Language } from "../../lib/i18n";

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
  behaviour: string;
  behavioural_insight: string;
  next_question: string;
  next_step_type?: string;
  next_step?: string;
  captured_clearly?: string;
  still_unclear?: string;
  completed_reflection?: string;
};

const nextStepTypes = new Set([
  "Pause",
  "Clarify facts",
  "Communicate",
  "Self-soothe",
  "Reframe",
  "Do nothing for now",
]);

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

function toNextStepType(value: unknown) {
  const text = toStringValue(value);

  return nextStepTypes.has(text) ? text : "";
}

function message(language: Language, key: "aiLimit" | "aiGeneric" | "saveWarning" | "structuredWarning") {
  return translations[language].common[key];
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
      behaviour: toStringValue(value.behaviour),
      behavioural_insight: toStringValue(value.behavioural_insight),
      next_question: toStringValue(value.next_question),
      next_step_type: toNextStepType(value.next_step_type),
      next_step: toStringValue(value.next_step),
      captured_clearly: toStringValue(value.captured_clearly),
      still_unclear: toStringValue(value.still_unclear),
      completed_reflection: toStringValue(value.completed_reflection),
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

function nextStepTypeLabel(language: Language, value?: string) {
  if (!value) {
    return "";
  }

  return (
    translations[language].nextStepTypes[
      value as keyof typeof translations.en.nextStepTypes
    ] || value
  );
}

function formatStructuredReflection(
  reflection: StructuredReflection,
  language: Language
) {
  const labels = translations[language].reflectionCard;
  const facts = reflection.facts.length
    ? reflection.facts.map((fact) => `- ${fact}`).join("\n")
    : `- ${labels.notIdentified}`;
  const interpretation = reflection.interpretation.length
    ? reflection.interpretation
        .map((item) => `- ${item}`)
        .join("\n")
    : `- ${labels.notIdentified}`;

  const nextStep = reflection.next_step
    ? `

8. ${labels.nextStep}
${reflection.next_step_type ? `[${nextStepTypeLabel(language, reflection.next_step_type)}]\n` : ""}${reflection.next_step}`
    : "";

  return `1. ${labels.emotionalValidation}
${reflection.emotional_validation}

2. ${labels.trigger}
${reflection.trigger}

3. ${labels.factsInterpretation}
${labels.facts}:
${facts}

${labels.interpretation}:
${interpretation}

4. ${labels.thoughtPattern}
${reflection.thought_pattern}

5. ${labels.behaviour}
${reflection.behaviour || labels.notIdentified}

6. ${labels.behaviouralInsight}
${reflection.behavioural_insight}

7. ${labels.nextQuestion}
${reflection.next_question}${nextStep}`;
}

function formatGuidedReflection(
  reflection: StructuredReflection,
  language: Language
) {
  const baseReflection = formatStructuredReflection(reflection, language);

  if (language === "zh") {
    return `1. 你已经清楚捕捉到的部分
${reflection.captured_clearly || "你已经识别出这次情绪时刻中的几个重要部分。"}

2. 可能还不清楚的部分
${reflection.still_unclear || "也许还可以进一步澄清，什么对你来说最重要。"}

3. 完整反思卡片
${reflection.completed_reflection || baseReflection}

4. 一个反思问题
${reflection.next_question}`;
  }

  return `1. What You Captured Clearly
${reflection.captured_clearly || "You identified several useful parts of the moment."}

2. What May Still Be Unclear
${reflection.still_unclear || "There may be more to clarify about what felt most important."}

3. Completed Reflection Card
${reflection.completed_reflection || baseReflection}

4. One Next Question
${reflection.next_question}`;
}

function buildPrompt(input: string, mode: "quick" | "guided", language: Language) {
  const languageInstruction =
    language === "zh"
      ? "Respond in natural Simplified Chinese. Keep JSON keys in English. Keep next_step_type as one of the exact English enum values."
      : "Respond in natural English. Keep JSON keys in English.";
  const guidedFields =
    mode === "guided"
      ? `
This is a guided CBT-informed reflection. Also evaluate the user's completeness gently:
- what they captured clearly
- what may still be unclear
- a concise completed reflection card
- one next question
`
      : "";

  return `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Language:
- ${languageInstruction}

Your role:
- First acknowledge the user's emotional experience.
- Then help structure the moment rationally and concisely.
- Keep language warm, grounded, and non-clinical.
- Do not diagnose.
- Do not provide therapy, diagnosis, medical advice, or crisis counselling.
- Do not say the user has a disorder.
- Do not over-explain.
- Use cautious language such as "may", "might", or "could".
- Avoid clinical labels unless the user clearly provides enough context.
- Choose only one main thought pattern when possible.
${guidedFields}
User input:
${input}

Return only valid JSON.

For all modes, include exactly these core fields:
{
  "emotional_validation": "One sentence acknowledging the user's experience.",
  "emotion": "Main emotion in plain language.",
  "trigger": "Specific trigger.",
  "facts": ["Max 2 factual observations."],
  "interpretation": ["Max 2 possible interpretations or assumptions."],
  "thought_pattern": "One possible thought pattern, cautious language.",
  "behaviour": "Observed or likely behavioural reaction.",
  "behavioural_insight": "Max 2 sentences explaining the reaction gently.",
  "next_question": "One practical reflection question.",
  "next_step_type": "Pause | Clarify facts | Communicate | Self-soothe | Reframe | Do nothing for now",
  "next_step": "One small practical next step."
}

If mode is guided, also include:
{
  "captured_clearly": "What the user already identified well.",
  "still_unclear": "What may still need clarification.",
  "completed_reflection": "A concise completed reflection card."
}

Rules:
- Keep output short.
- Use at most 2 facts.
- Use at most 2 interpretations.
- Do not list multiple thought patterns.
- The next_step must be one small optional action that is realistic within 5 minutes.
- The next_step must not sound like therapy homework, medical advice, or something the user must do.
- The next_step should help the user slow down, clarify facts, communicate gently, reframe cautiously, self-soothe, or avoid impulsive behaviour.
- If the input suggests crisis, self-harm, harm to others, abuse, or immediate danger, do not provide a normal next step. Give a brief safety-oriented next_step encouraging immediate support from local emergency services or a trusted person.
- Do not wrap the JSON in markdown.
- JSON keys must stay in English.
`;
}

export async function POST(request: Request) {
  let responseLanguage: Language = "en";

  try {
    const { input, mode: requestedMode, language: requestedLanguage } =
      await request.json();
    const mode = requestedMode === "guided" ? "guided" : "quick";
    const language = normalizeLanguage(requestedLanguage);
    responseLanguage = language;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(input, mode, language);

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
      ? mode === "guided"
        ? formatGuidedReflection(structured, language)
        : formatStructuredReflection(structured, language)
      : rawResult;

    const reflectionRecord = {
      user_input: input,
      ai_result: result,
      mode,
      language,
      ...(structured
        ? {
            emotional_validation: structured.emotional_validation,
            emotion: structured.emotion,
            trigger: structured.trigger,
            thought_pattern: structured.thought_pattern,
            facts: structured.facts.join("\n"),
            interpretation: structured.interpretation.join("\n"),
            behaviour: structured.behaviour,
            behavioural_insight: structured.behavioural_insight,
            next_question: structured.next_question,
            next_step_type: structured.next_step_type || null,
            next_step: structured.next_step || null,
          }
        : {}),
    };

    const { error } = await supabase.from("reflections").insert(reflectionRecord);

    if (error) {
      console.error("Supabase insert error:", error);
      const { error: fallbackError } = await supabase.from("reflections").insert({
        user_input: input,
        ai_result: result,
      });

      if (!fallbackError) {
        return NextResponse.json({
          result,
          structured,
          warning: message(language, "structuredWarning"),
        });
      }

      console.error("Supabase fallback insert error:", fallbackError);
      return NextResponse.json({
        result,
        structured,
        warning: message(language, "saveWarning"),
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
            message(responseLanguage, "aiLimit"),
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message(responseLanguage, "aiGeneric") },
      { status: 500 }
    );
  }
}
