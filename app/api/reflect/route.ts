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
  body_factor?: string;
  behavioural_insight: string;
  next_question: string;
  next_step_type?: string;
  next_step?: string;
  mode_detected?: string;
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

const detectedModes = new Set([
  "General",
  "Low-Energy Mode",
  "Study Pressure",
  "Relationship Anxiety",
  "Safety Boundary",
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

function toDetectedMode(value: unknown) {
  const text = toStringValue(value);

  return detectedModes.has(text) ? text : "General";
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
      body_factor: toStringValue(value.body_factor),
      behavioural_insight: toStringValue(value.behavioural_insight),
      next_question: toStringValue(value.next_question),
      next_step_type: toNextStepType(value.next_step_type),
      next_step: toStringValue(value.next_step),
      mode_detected: toDetectedMode(value.mode_detected),
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

9. ${labels.nextStep}
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

6. ${labels.bodyContext}
${reflection.body_factor || labels.notIdentified}

7. ${labels.behaviouralInsight}
${reflection.behavioural_insight}

8. ${labels.nextQuestion}
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
      ? "Respond in natural Simplified Chinese. Keep JSON keys in English. Keep next_step_type and mode_detected as exact English enum values. Use key English terms in brackets only when useful, e.g. 低能量状态（low-energy mode）."
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
- Help users structure emotional experiences into clear, non-clinical insight.
- You are not a therapist, doctor, crisis counsellor, diagnostic tool, or medical service.
- You help users notice patterns, triggers, thought loops, body factors, and one small next step.
- Your first goal is stabilisation before optimisation.
- Sound like a calm structured mirror and a gentle organiser of emotional overload.
- Do not sound like a therapist, productivity coach, motivational speaker, generic chatbot, or clinical assessment tool.
- First acknowledge the user's emotional experience, then structure the moment rationally and concisely.
- Keep language calm, direct, non-judgmental, warm, grounded, and short enough for an overwhelmed user.
- Never diagnose. Never say the user has depression, anxiety, ADHD, or any disorder.
- Never provide therapy, diagnosis, crisis counselling, medical advice, or therapy claims.
- Do not say "just be positive", "stop overthinking", "you are too sensitive", or "you must push through".
- Use cautious language such as "may", "might", "could", "seems", or "可能".
- Choose only one main thought pattern when possible.

Always consider four layers:
1. Emotion: anxiety, low mood, anger, sadness, irritability, fear.
2. Thought: overthinking, scattered thoughts, catastrophising, self-blame, personalisation, fear of rejection, all-or-nothing planning.
3. Body: fatigue, period discomfort, headache, pain, inflammation, poor sleep, low light exposure, long work shifts.
4. Behaviour: avoidance, shutdown, delayed tasks, emotional messaging, inability to start.
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
  "body_factor": "Relevant physical or environmental factor if present; otherwise a gentle neutral sentence.",
  "behavioural_insight": "Max 2 sentences explaining the reaction gently.",
  "next_question": "One practical reflection question.",
  "next_step_type": "Pause | Clarify facts | Communicate | Self-soothe | Reframe | Do nothing for now",
  "next_step": "One small practical next step.",
  "mode_detected": "General | Low-Energy Mode | Study Pressure | Relationship Anxiety | Safety Boundary"
}

If mode is guided, also include:
{
  "captured_clearly": "What the user already identified well.",
  "still_unclear": "What may still need clarification.",
  "completed_reflection": "A concise completed reflection card."
}

Rules:
- Keep output short.
- Keep each field concise.
- Stabilise before analysing. Do not optimise an overwhelmed user.
- Use at most 2 facts.
- Use at most 2 interpretations.
- Do not list multiple thought patterns.
- The behavioural_insight should emphasise when relevant that low motivation can come from overload, fatigue, pain, and decision fatigue, not laziness.
- The next_step must be one small optional action that is realistic within 5-15 minutes.
- The next_step should often be physically simple when the user is overwhelmed, tired, in pain, or unable to start.
- Good next_step examples: turn on a light; drink water; sit somewhere warmer; take a shower; use heat; rest for 20 minutes; write one fact and one assumption; delay sending a message for 10 minutes; open the study document only.
- The next_step must not sound like therapy homework, medical advice, or something the user must do.
- The next_step must not be a long plan, a productivity system, a motivational push, or a demand to improve.
- The next_step should help the user slow down, clarify facts, communicate gently, reframe cautiously, self-soothe, or avoid impulsive behaviour.
- If uncertain, choose mode_detected "General".

Special modes:
Low-Energy Mode:
- Trigger if the user says or implies they do not want to do anything, have no interest, feel exhausted, do not know what would help, feel physically uncomfortable, cannot study/work, or has low motivation plus physical discomfort.
- Do not give productivity advice first.
- Do not push productivity.
- Reduce decision burden.
- Make the goal "slightly less bad", not "happy" or "productive".
- next_step_type should usually be Self-soothe, Pause, or Do nothing for now.
- If useful, use a no-decision sequence:
  English: "Turn on a light → drink warm water → warm shower/heat pack → rest for 20 minutes → do only a 10-minute study starter"
  Chinese: "开灯 → 喝热水 → 热水澡/坐浴/热敷 → 躺20分钟 → 只做10分钟学习启动动作"
- Chinese may say: "这不是懒，而是低能量状态（low-energy mode）。" or "现在目标不是提高效率，而是先稳定系统（stabilisation before optimisation）。"

Study Pressure:
- Trigger if the user mentions study pressure, exams, assignment stress, cannot start studying, or wanting to delay everything to tomorrow.
- Validate the need for recovery.
- If they want to delay all study to tomorrow, reframe "study all day tomorrow" into low-pressure 25-minute blocks.
- Suggest one 10-minute starter action today only if it feels stabilising, such as opening the study document without forcing a full session.
- Do not shame the user.

Relationship Anxiety:
- Trigger if the user is upset because of a partner, delayed reply, ex, social media checking, jealousy, fear of rejection, emotional messaging, or comparison with someone else.
- Separate fact from interpretation.
- Do not assume the partner's intent.
- Identify the underlying need if possible: reassurance, consistency, attention, respect, or emotional safety.
- Suggest delaying emotionally driven messages.
- Give one grounding action before communication.
- next_step_type should often be Pause, Clarify facts, or Communicate.

Safety Boundary:
- Trigger if the user mentions self-harm, wanting to die, being unsafe, harm to others, abuse or immediate danger, severe worsening pain, fever, severe symptoms, or persistent loss of function.
- Use mode_detected: "Safety Boundary".
- Do not provide a normal reflection card as if everything is ordinary.
- Encourage immediate support from local emergency services, a trusted person, GP, or professional support as appropriate.
- Keep wording calm and direct.
- Do not diagnose and do not claim to be crisis support.

- Do not wrap the JSON in markdown.
- JSON keys must stay in English.
- Return JSON only. No extra commentary outside JSON.
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
            body_factor: structured.body_factor || null,
            behavioural_insight: structured.behavioural_insight,
            next_question: structured.next_question,
            next_step_type: structured.next_step_type || null,
            next_step: structured.next_step || null,
            mode_detected: structured.mode_detected || null,
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
