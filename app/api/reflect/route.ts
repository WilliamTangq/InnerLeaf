import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/auth-server";
import { normalizeLanguage, translations, type Language } from "../../lib/i18n";
import { detectReflectionLanguage } from "../../lib/reflection-language";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const geminiModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

type StructuredReflection = {
  scenario_category?: string;
  emotional_source?: string;
  demon_names?: string[];
  core_question?: string;
  emotion_labels?: string[];
  imaginations?: string[];
  unmet_need_surface?: string;
  unmet_need_deeper?: string;
  unmet_need_explanation?: string;
  next_step_text?: string;
  next_step_body_aware_first?: boolean;
  open_hypotheses?: string[];
  thought_pattern_key?: string;
  thought_pattern_label_en?: string;
  thought_pattern_label_zh?: string;
  mind_protecting?: string;
  behavioural_pull_items?: string[];
  behavioural_pull_note?: string;
  observe_next_items?: string[];
  save_card_preview?: {
    category?: string;
    emotion?: string;
    trigger?: string;
    pattern?: string;
    need?: string;
    next_step?: string;
  };
  emotional_validation: string;
  moment_summary?: string;
  emotion: string;
  secondary_emotion?: string;
  trigger: string;
  facts: string[];
  interpretation: string[];
  thought_pattern: string;
  thought_pattern_explanation?: string;
  behaviour: string;
  body_factor?: string;
  behavioural_insight: string;
  next_question: string;
  next_step_type?: string;
  next_step?: string;
  mode_detected?: string;
  gentle_observation?: string;
  safety_note?: string;
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
  "clarify_facts",
  "pause_before_replying",
  "grounding",
  "reassurance_request",
  "journaling",
  "behaviour_reset",
  "check_in_later",
  "rest_and_regulate",
  "other",
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

function toStringList(value: unknown, limit = 2) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function toNextStepType(value: unknown) {
  const text = toStringValue(value);

  return nextStepTypes.has(text) ? text : text;
}

function toPreview(value: unknown): StructuredReflection["save_card_preview"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const preview = value as Record<string, unknown>;

  return {
    category: toStringValue(preview.category),
    emotion: toStringValue(preview.emotion),
    trigger: toStringValue(preview.trigger),
    pattern: toStringValue(preview.pattern),
    need: toStringValue(preview.need),
    next_step: toStringValue(preview.next_step),
  };
}

function toDetectedMode(value: unknown) {
  const text = toStringValue(value);

  return detectedModes.has(text) ? text : "General";
}

function inferNextStepType(pattern: string) {
  const lower = pattern.toLowerCase();

  if (
    lower.includes("mind reading") ||
    lower.includes("读心") ||
    lower.includes("emotional reasoning") ||
    lower.includes("情绪化推理") ||
    lower.includes("overgeneralisation") ||
    lower.includes("过度概括")
  ) {
    return "Clarify facts";
  }

  if (
    lower.includes("catastrophising") ||
    lower.includes("灾难化") ||
    lower.includes("all-or-nothing") ||
    lower.includes("非黑即白") ||
    lower.includes("avoidance") ||
    lower.includes("回避")
  ) {
    return "Reframe";
  }

  if (
    lower.includes("comparison") ||
    lower.includes("比较") ||
    lower.includes("self-blame") ||
    lower.includes("自我责备") ||
    lower.includes("personalisation") ||
    lower.includes("个人化")
  ) {
    return "Pause";
  }

  if (
    lower.includes("reassurance") ||
    lower.includes("反复确认")
  ) {
    return "Communicate";
  }

  return "Pause";
}

function message(
  language: Language,
  key: "aiLimit" | "aiGeneric"
) {
  return translations[language].common[key];
}

function parseStructuredReflection(text: string): StructuredReflection | null {
  const jsonText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const value = JSON.parse(jsonText) as Record<string, unknown>;
    const emotionSnapshot = (value.emotionSnapshot ?? {}) as Record<
      string,
      unknown
    >;
    const mainThoughtPattern = (value.mainThoughtPattern ?? {}) as Record<
      string,
      unknown
    >;
    const thoughtPattern =
      toStringValue(value.thought_pattern) ||
      toStringValue(mainThoughtPattern.label) ||
      [
        toStringValue(value.thought_pattern_label_en),
        toStringValue(value.thought_pattern_label_zh),
      ]
        .filter(Boolean)
        .join(" / ") ||
      toStringValue(value.thought_pattern_key);
    const emotionLabels = toStringList(value.emotion_labels);
    const demonNames = toStringList(value.demon_names);
    const imaginations = toStringList(value.imaginations);
    const behaviouralPullItems = toStringList(value.behavioural_pull_items);
    const saveCardPreview = toPreview(value.save_card_preview);
    const emotionalSource = toStringValue(value.emotional_source);
    const coreQuestion =
      toStringValue(value.core_question) ||
      toStringValue(value.next_question) ||
      toStringValue(value.oneNextQuestion);
    const nextStepText =
      toStringValue(value.next_step_text) ||
      toStringValue(value.next_step) ||
      toStringValue(value.oneSmallNextStep);
    const trigger =
      toStringValue(value.trigger) ||
      toStringValue(saveCardPreview?.trigger) ||
      emotionalSource;
    const structured = {
      scenario_category: toStringValue(value.scenario_category),
      emotional_source: emotionalSource,
      demon_names: demonNames,
      core_question: coreQuestion,
      emotion_labels: emotionLabels,
      imaginations,
      unmet_need_surface: toStringValue(value.unmet_need_surface),
      unmet_need_deeper: toStringValue(value.unmet_need_deeper),
      unmet_need_explanation: toStringValue(value.unmet_need_explanation),
      next_step_text: nextStepText,
      next_step_body_aware_first: Boolean(value.next_step_body_aware_first),
      open_hypotheses: toStringList(value.open_hypotheses, 3),
      thought_pattern_key: toStringValue(value.thought_pattern_key),
      thought_pattern_label_en: toStringValue(value.thought_pattern_label_en),
      thought_pattern_label_zh: toStringValue(value.thought_pattern_label_zh),
      mind_protecting: toStringValue(value.mind_protecting),
      behavioural_pull_items: behaviouralPullItems.slice(0, 3),
      behavioural_pull_note: toStringValue(value.behavioural_pull_note),
      observe_next_items: toStringList(value.observe_next_items, 3),
      save_card_preview: saveCardPreview,
      emotional_validation:
        toStringValue(value.emotional_validation) ||
        toStringValue(value.emotionalValidation) ||
        emotionalSource,
      moment_summary:
        toStringValue(value.moment_summary) ||
        toStringValue(value.momentSummary) ||
        emotionalSource,
      emotion:
        toStringValue(value.emotion) ||
        toStringValue(emotionSnapshot.mainEmotion) ||
        emotionLabels[0] ||
        toStringValue(saveCardPreview?.emotion),
      secondary_emotion:
        toStringValue(value.secondary_emotion) ||
        toStringValue(emotionSnapshot.secondaryEmotion) ||
        emotionLabels[1],
      trigger,
      facts: toStringList(value.facts),
      interpretation:
        toStringList(value.interpretation).length > 0
          ? toStringList(value.interpretation)
          : toStringList(value.interpretations).length > 0
            ? toStringList(value.interpretations)
            : imaginations,
      thought_pattern: thoughtPattern,
      thought_pattern_explanation:
        toStringValue(value.thought_pattern_explanation) ||
        toStringValue(mainThoughtPattern.explanation) ||
        toStringValue(value.thought_pattern_explanation),
      behaviour:
        toStringValue(value.behaviour) ||
        behaviouralPullItems.join("\n"),
      body_factor:
        toStringValue(value.body_factor) ||
        toStringValue(value.mind_protecting) ||
        toStringValue(value.gentleObservation),
      behavioural_insight:
        toStringValue(value.behavioural_insight) ||
        toStringValue(value.behaviouralInsight) ||
        toStringValue(value.unmet_need_explanation),
      next_question: coreQuestion,
      next_step_type:
        toNextStepType(value.next_step_type) || inferNextStepType(thoughtPattern),
      next_step: nextStepText,
      mode_detected: toDetectedMode(value.mode_detected),
      gentle_observation: toStringValue(value.gentleObservation),
      safety_note:
        toStringValue(value.safety_note) ||
        toStringValue(value.safetyNote),
      captured_clearly: toStringValue(value.captured_clearly),
      still_unclear: toStringValue(value.still_unclear),
      completed_reflection: toStringValue(value.completed_reflection),
    };

    if (
      !structured.emotional_validation ||
      !structured.trigger ||
      !structured.next_step
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
  if (reflection.emotional_source || reflection.demon_names?.length) {
    const labels =
      language === "zh"
        ? {
            source: "这次情绪的来源",
            demon: "这次情绪的名字",
            emotions: "情绪标签",
            factsImagination: "事实与想象",
            facts: "事实",
            imagination: "想象",
            unmet: "真正未被满足的需求",
            next: "一个小行动",
            hypotheses: "仍需验证的几种可能",
            thought: "主要思维模式",
            protecting: "大脑正在保护什么",
            pull: "你可能会被拉向的行为",
            observe: "接下来观察什么",
            preview: "保存卡片预览",
            category: "类别",
            emotion: "情绪",
            trigger: "触发点",
            pattern: "模式",
            need: "需求",
            safety: "安全提示",
          }
        : {
            source: "Emotional Source",
            demon: "Name the Demon",
            emotions: "Emotion Labels",
            factsImagination: "Facts vs Imagination",
            facts: "Facts",
            imagination: "Imagination",
            unmet: "Unmet Need",
            next: "One Small Next Step",
            hypotheses: "Open Hypotheses",
            thought: "Thought Pattern",
            protecting: "What Your Mind Might Be Protecting",
            pull: "Behavioural Pull",
            observe: "What to Observe Next",
            preview: "Save Card Preview",
            category: "Category",
            emotion: "Emotion",
            trigger: "Trigger",
            pattern: "Pattern",
            need: "Need",
            safety: "Safety Note",
          };
    const thoughtLabel =
      language === "zh"
        ? [reflection.thought_pattern_label_zh, reflection.thought_pattern_label_en]
            .filter(Boolean)
            .join(" / ")
        : [reflection.thought_pattern_label_en, reflection.thought_pattern_label_zh]
            .filter(Boolean)
            .join(" / ");

    return [
      `1. ${labels.source}\n${reflection.emotional_source || reflection.emotional_validation}`,
      `2. ${labels.demon}\n${(reflection.demon_names ?? []).join(" / ")}\n${reflection.core_question || ""}`.trim(),
      `3. ${labels.emotions}\n${(reflection.emotion_labels ?? []).join(" / ")}`,
      `4. ${labels.factsImagination}\n${labels.facts}:\n${reflection.facts.map((fact) => `- ${fact}`).join("\n")}\n\n${labels.imagination}:\n${(reflection.imaginations ?? reflection.interpretation).map((item) => `- ${item}`).join("\n")}`,
      `5. ${labels.unmet}\n${reflection.unmet_need_surface || ""}\n${reflection.unmet_need_deeper || ""}\n${reflection.unmet_need_explanation || ""}`.trim(),
      `6. ${labels.next}\n${reflection.next_step_text || reflection.next_step}`,
      reflection.open_hypotheses?.length
        ? `7. ${labels.hypotheses}\n${reflection.open_hypotheses.map((item) => `- ${item}`).join("\n")}`
        : "",
      `8. ${labels.thought}\n${thoughtLabel || reflection.thought_pattern}\n${reflection.thought_pattern_explanation || ""}`.trim(),
      reflection.mind_protecting
        ? `9. ${labels.protecting}\n${reflection.mind_protecting}`
        : "",
      reflection.behavioural_pull_items?.length
        ? `10. ${labels.pull}\n${reflection.behavioural_pull_items.map((item) => `- ${item}`).join("\n")}\n${reflection.behavioural_pull_note || ""}`.trim()
        : "",
      reflection.observe_next_items?.length
        ? `11. ${labels.observe}\n${reflection.observe_next_items.map((item) => `- ${item}`).join("\n")}`
        : "",
      reflection.save_card_preview
        ? `12. ${labels.preview}\n${[
            reflection.save_card_preview.category &&
              `${labels.category}: ${reflection.save_card_preview.category}`,
            reflection.save_card_preview.emotion &&
              `${labels.emotion}: ${reflection.save_card_preview.emotion}`,
            reflection.save_card_preview.trigger &&
              `${labels.trigger}: ${reflection.save_card_preview.trigger}`,
            reflection.save_card_preview.pattern &&
              `${labels.pattern}: ${reflection.save_card_preview.pattern}`,
            reflection.save_card_preview.need &&
              `${labels.need}: ${reflection.save_card_preview.need}`,
            reflection.save_card_preview.next_step &&
              `${labels.next}: ${reflection.save_card_preview.next_step}`,
          ]
            .filter(Boolean)
            .join("\n")}`
        : "",
      reflection.safety_note
        ? `13. ${labels.safety}\n${reflection.safety_note}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const labels = translations[language].reflectionCard;
  const summary =
    reflection.moment_summary ||
    labels.momentSummaryFallback.replace("{trigger}", reflection.trigger);
  const facts = reflection.facts.length
    ? reflection.facts.map((fact) => `- ${fact}`).join("\n")
    : `- ${labels.notIdentified}`;
  const interpretation = reflection.interpretation.length
    ? reflection.interpretation
        .map((item) => `- ${item}`)
        .join("\n")
    : `- ${labels.notIdentified}`;

  const nextStep = reflection.next_step
    ? `${reflection.next_step_type ? `[${nextStepTypeLabel(language, reflection.next_step_type)}]\n` : ""}${reflection.next_step}`
    : labels.notIdentified;

  return `1. ${labels.emotionalValidation}
${reflection.emotional_validation}

2. ${labels.momentSummary}
${summary}

3. ${labels.emotionSnapshot}
${labels.mainEmotion}: ${reflection.emotion || labels.notIdentified}
${reflection.secondary_emotion ? `${labels.secondaryEmotion}: ${reflection.secondary_emotion}` : ""}

4. ${labels.trigger}
${reflection.trigger}

5. ${labels.factsInterpretation}
${labels.facts}:
${facts}

${labels.interpretation}:
${interpretation}

6. ${labels.mainThoughtPattern}
${reflection.thought_pattern}
${reflection.thought_pattern_explanation || ""}

7. ${labels.behaviouralInsight}
${reflection.behavioural_insight}

8. ${labels.gentleObservation}
${reflection.body_factor || labels.gentleObservationEmpty}

9. ${labels.nextStep}
${nextStep}

10. ${labels.nextQuestion}
${reflection.next_question}`;
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

function buildQuickPrompt(input: string, reflectionLanguage: Language) {
  const languageInstruction =
    reflectionLanguage === "zh"
      ? "Write user-facing values in natural Simplified Chinese. Keep useful psychology terms bilingual where helpful, for example Mind Reading / 读心式推断. Keep JSON keys in English."
      : "Write user-facing values in natural English. Keep JSON keys in English. Do not switch to Chinese unless the user wrote mainly in Chinese.";

  return `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Product boundary:
- InnerLeaf is not a therapist, doctor, crisis counsellor, diagnostic tool, or medical service.
- You turn one emotional moment into a structured mobile reflection card.
- Core product idea: "The moment you name the demon, it begins to lose its power."

Tone:
- Target reflection language: ${reflectionLanguage}.
- ${languageInstruction}
- Calm, precise, warm, non-judgmental, non-clinical, non-diagnostic.
- Do not sound like a therapist, motivational speaker, productivity coach, or generic chatbot.
- Do not write a long article. Every field must be short enough for a mobile card.

Hard rules:
- Do not diagnose.
- Do not label the user as depressed, traumatised, disordered, or any clinical category.
- Do not say this is therapy.
- Do not give medical advice.
- Do not over-explain.
- Do not add emotion intensity scores, percentages, or severity labels.
- Do not output old modules named Objective Facts, Single Event or Pattern, Interaction Loop, Relationship Dynamic, Unknowns, or Emotion Intensity.
- Return JSON only. No markdown. No commentary outside JSON.

Scenario classification:
Choose scenario_category from:
relationship, friendship, family, study, work_career, personal_growth, body, general.
If body-state language appears, body-aware handling must activate.

Core modules:
1. emotional_source: explain what happened, what sensitivity point got touched, and why emotion rose. Mechanism, not generic comfort.
2. demon_names: max 1-2 short names for the pain. Do not diagnose or label the user as a person.
3. core_question: the inner fear question underneath the reaction.
4. emotion_labels: only emotions the user explicitly stated. If none are stated, use an empty array.
5. facts and imaginations: facts max 2; imaginations max 2. Use imagination, not interpretation. Do not say imagination is wrong.
6. unmet need: include surface need, deeper need, and one short explanation.
7. one small next step: tiny, low-risk, doable within 5 minutes, not dependent on immediate external response.

Need examples:
安全感, 被选择感, 被重视感, 确定性, 掌控感, 自我效能感, 被理解, 自主权, 边界感.

Name the demon examples:
Rejection Sensitivity / 拒绝敏感
Attachment Anxiety / 依恋焦虑
Comparison Thinking / 比较型思维
Procrastination Paralysis / 拖延瘫痪

Thought pattern:
Choose one primary thought_pattern_key only:
mind_reading, personalization, comparison_thinking, catastrophising, reassurance_seeking, self_blame, procrastination_paralysis, all_or_nothing_thinking, emotional_reasoning, uncertainty_intolerance.

Open hypotheses:
- Purpose: prevent premature conclusions.
- For relationship scenarios, include up to 3 possibilities when appropriate: external situation, communication habit, relationship investment/boundary.
- Do not jump to betrayal, manipulation, abuse, or "they do not love you" unless clear facts support it.

One small next step rules:
- Must not encourage monitoring, checking, scrolling, interrogating, or over-explaining.
- Never recommend checking online status, stalking social media, using another account, monitoring last seen, or digging for evidence.
- If tiredness, burnout, poor sleep, headache, period discomfort, physical low energy, no energy, or unable to start appears, the next step must be body-aware first.
- Body-aware examples: drink water, turn on a light, sit somewhere warmer, take three slow breaths, rest for 20 minutes, use heat, open only one document.

Behavioural pull:
Show likely behavioural pulls and end behavioural_pull_note with the natural equivalent of:
"This is the pull of an activated emotional state, not a personality flaw."

What to observe next:
Observe stable patterns, not surveillance.

Safety:
- Do not show safety notes for ordinary emotional distress.
- Only add safety_note if the user mentions self-harm, suicide, immediate danger, violence, abuse, being unsafe, or threat.
- If safety_note is needed, keep it short and encourage immediate local emergency/trusted/professional support.
- Otherwise safety_note must be an empty string.

User input:
${input}

Output JSON schema:
{
  "scenario_category": "relationship | friendship | family | study | work_career | personal_growth | body | general",
  "emotional_source": "",
  "demon_names": ["", ""],
  "core_question": "",
  "emotion_labels": [],
  "facts": [],
  "imaginations": [],
  "unmet_need_surface": "",
  "unmet_need_deeper": "",
  "unmet_need_explanation": "",
  "next_step_text": "",
  "next_step_type": "clarify_facts | pause_before_replying | grounding | reassurance_request | journaling | behaviour_reset | check_in_later | rest_and_regulate | other",
  "next_step_body_aware_first": false,
  "open_hypotheses": [],
  "thought_pattern_key": "",
  "thought_pattern_label_en": "",
  "thought_pattern_label_zh": "",
  "thought_pattern_explanation": "",
  "mind_protecting": "",
  "behavioural_pull_items": [],
  "behavioural_pull_note": "",
  "observe_next_items": [],
  "save_card_preview": {
    "category": "",
    "emotion": "",
    "trigger": "",
    "pattern": "",
    "need": "",
    "next_step": ""
  },
  "safety_note": ""
}
`;
}

function buildPrompt(input: string, mode: "quick" | "guided", language: Language) {
  const guidedNote =
    mode === "guided"
      ? `
This was collected through a guided flow. Still return the same Prompt 2 JSON contract. You may use the user's guided answers to make the fields more precise.
`
      : "";

  return `${buildQuickPrompt(input, language)}
${guidedNote}`;
}

export async function POST(request: Request) {
  let responseLanguage: Language = "en";

  try {
    const {
      input,
      mode: requestedMode,
      language: requestedLanguage,
      reflectionLanguage: requestedReflectionLanguage,
    } =
      await request.json();
    const mode = requestedMode === "guided" ? "guided" : "quick";
    const uiLanguage = normalizeLanguage(requestedLanguage);
    const reflectionLanguage =
      requestedReflectionLanguage === "en" || requestedReflectionLanguage === "zh"
        ? requestedReflectionLanguage
        : detectReflectionLanguage(
            typeof input === "string" ? input : "",
            uiLanguage
          );
    responseLanguage = uiLanguage;
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: translations[uiLanguage].common.loginToStart },
        { status: 401 }
      );
    }

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(input, mode, reflectionLanguage);

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawResult =
      response.text || "No reflection generated. Please try again.";
    const parsedStructured = parseStructuredReflection(rawResult);
    const structured = parsedStructured;
    const result = structured
      ? mode === "guided"
        ? formatGuidedReflection(structured, reflectionLanguage)
        : formatStructuredReflection(structured, reflectionLanguage)
      : rawResult;

    return NextResponse.json({
      result,
      structured,
      saved: false,
    });
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
