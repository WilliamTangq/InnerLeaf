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
  scenario_category?: ScenarioCategory;
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
  thought_pattern_key?: ThoughtPatternKey;
  thought_pattern_label?: string;
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

type ScenarioCategory =
  | "relationship"
  | "friendship"
  | "family"
  | "study"
  | "work_career"
  | "personal_growth"
  | "body"
  | "general";

type ThoughtPatternKey =
  | "mind_reading"
  | "personalization"
  | "comparison_thinking"
  | "catastrophising"
  | "cognitive_fusion"
  | "reassurance_seeking"
  | "rejection_sensitivity"
  | "retroactive_jealousy"
  | "self_blame"
  | "procrastination_paralysis"
  | "all_or_nothing_thinking"
  | "emotional_reasoning"
  | "uncertainty_intolerance"
  | "fear_of_being_replaced"
  | "fear_of_being_unimportant"
  | "control_seeking"
  | "fear_of_failure"
  | "future_anxiety"
  | "other";

const scenarioCategories = new Set<ScenarioCategory>([
  "relationship",
  "friendship",
  "family",
  "study",
  "work_career",
  "personal_growth",
  "body",
  "general",
]);

const thoughtPatternKeys = new Set<ThoughtPatternKey>([
  "mind_reading",
  "personalization",
  "comparison_thinking",
  "catastrophising",
  "cognitive_fusion",
  "reassurance_seeking",
  "rejection_sensitivity",
  "retroactive_jealousy",
  "self_blame",
  "procrastination_paralysis",
  "all_or_nothing_thinking",
  "emotional_reasoning",
  "uncertainty_intolerance",
  "fear_of_being_replaced",
  "fear_of_being_unimportant",
  "control_seeking",
  "fear_of_failure",
  "future_anxiety",
  "other",
]);

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

function toScenarioCategory(value: unknown): ScenarioCategory {
  const text = toStringValue(value);

  return scenarioCategories.has(text as ScenarioCategory)
    ? (text as ScenarioCategory)
    : "general";
}

function toThoughtPatternKey(value: unknown): ThoughtPatternKey {
  const text = toStringValue(value);

  return thoughtPatternKeys.has(text as ThoughtPatternKey)
    ? (text as ThoughtPatternKey)
    : "other";
}

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

function toPreview(
  value: unknown,
  language: Language
): StructuredReflection["save_card_preview"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const preview = value as Record<string, unknown>;

  return {
    category: localizedString(preview.category, language),
    emotion: localizedString(preview.emotion, language),
    trigger: localizedString(preview.trigger, language),
    pattern: localizedString(preview.pattern, language),
    need: localizedString(preview.need, language),
    next_step: localizedString(preview.next_step, language),
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
    lower.includes("mind_reading") ||
    lower.includes("读心") ||
    lower.includes("emotional reasoning") ||
    lower.includes("emotional_reasoning") ||
    lower.includes("cognitive_fusion") ||
    lower.includes("uncertainty_intolerance") ||
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
    lower.includes("all_or_nothing") ||
    lower.includes("非黑即白") ||
    lower.includes("avoidance") ||
    lower.includes("procrastination_paralysis") ||
    lower.includes("fear_of_failure") ||
    lower.includes("future_anxiety") ||
    lower.includes("回避")
  ) {
    return "Reframe";
  }

  if (
    lower.includes("comparison") ||
    lower.includes("comparison_thinking") ||
    lower.includes("比较") ||
    lower.includes("self-blame") ||
    lower.includes("self_blame") ||
    lower.includes("自我责备") ||
    lower.includes("personalisation") ||
    lower.includes("personalization") ||
    lower.includes("rejection_sensitivity") ||
    lower.includes("retroactive_jealousy") ||
    lower.includes("fear_of_being_replaced") ||
    lower.includes("fear_of_being_unimportant") ||
    lower.includes("control_seeking") ||
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

function containsHan(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function stripBilingualPair(value: string, language: Language) {
  const text = value.trim();

  if (!text || !/[\/／]/.test(text)) {
    return text;
  }

  const parts = text
    .split(/\s*[\/／]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return text;
  }

  const localized = parts.find((part) =>
    language === "zh" ? containsHan(part) : !containsHan(part)
  );

  return localized || parts[0] || text;
}

function localizedString(value: unknown, language: Language) {
  return stripBilingualPair(toStringValue(value), language);
}

function localizedList(value: unknown, language: Language, limit = 2) {
  return toStringList(value, limit).map((item) =>
    stripBilingualPair(item, language)
  );
}

function preferredThoughtPattern(
  value: Record<string, unknown>,
  mainThoughtPattern: Record<string, unknown>,
  language: Language
) {
  const direct =
    localizedString(value.thought_pattern, language) ||
    localizedString(mainThoughtPattern.label, language) ||
    localizedString(value.thought_pattern_label, language);
  const preferredLabel =
    language === "zh"
      ? localizedString(value.thought_pattern_label_zh, language)
      : localizedString(value.thought_pattern_label_en, language);
  const fallbackLabel =
    language === "zh"
      ? localizedString(value.thought_pattern_label_en, language)
      : localizedString(value.thought_pattern_label_zh, language);

  return (
    direct ||
    preferredLabel ||
    fallbackLabel ||
    localizedString(value.thought_pattern_key, language)
  );
}

function parseStructuredReflection(
  text: string,
  language: Language
): StructuredReflection | null {
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
    const thoughtPattern = preferredThoughtPattern(
      value,
      mainThoughtPattern,
      language
    );
    const emotionLabels = localizedList(value.emotion_labels, language);
    const demonNames = localizedList(value.demon_names, language);
    const imaginations = localizedList(value.imaginations, language);
    const behaviouralPullItems = localizedList(
      value.behavioural_pull_items,
      language
    );
    const saveCardPreview = toPreview(value.save_card_preview, language);
    const emotionalSource = localizedString(value.emotional_source, language);
    const coreQuestion =
      localizedString(value.core_question, language) ||
      localizedString(value.next_question, language) ||
      localizedString(value.oneNextQuestion, language);
    const nextStepText =
      localizedString(value.next_step_text, language) ||
      localizedString(value.next_step, language) ||
      localizedString(value.oneSmallNextStep, language);
    const trigger =
      localizedString(value.trigger, language) ||
      localizedString(saveCardPreview?.trigger, language) ||
      emotionalSource;
    const structured = {
      scenario_category: toScenarioCategory(value.scenario_category),
      emotional_source: emotionalSource,
      demon_names: demonNames,
      core_question: coreQuestion,
      emotion_labels: emotionLabels,
      imaginations,
      unmet_need_surface: localizedString(value.unmet_need_surface, language),
      unmet_need_deeper: localizedString(value.unmet_need_deeper, language),
      unmet_need_explanation: localizedString(
        value.unmet_need_explanation,
        language
      ),
      next_step_text: nextStepText,
      next_step_body_aware_first: Boolean(value.next_step_body_aware_first),
      open_hypotheses: localizedList(value.open_hypotheses, language, 3),
      thought_pattern_key: toThoughtPatternKey(value.thought_pattern_key),
      thought_pattern_label: localizedString(
        value.thought_pattern_label,
        language
      ),
      thought_pattern_label_en: localizedString(
        value.thought_pattern_label_en,
        language
      ),
      thought_pattern_label_zh: localizedString(
        value.thought_pattern_label_zh,
        language
      ),
      mind_protecting: localizedString(value.mind_protecting, language),
      behavioural_pull_items: behaviouralPullItems.slice(0, 3),
      behavioural_pull_note: localizedString(
        value.behavioural_pull_note,
        language
      ),
      observe_next_items: localizedList(value.observe_next_items, language, 3),
      save_card_preview: saveCardPreview,
      emotional_validation:
        localizedString(value.emotional_validation, language) ||
        localizedString(value.emotionalValidation, language) ||
        emotionalSource,
      moment_summary:
        localizedString(value.moment_summary, language) ||
        localizedString(value.momentSummary, language) ||
        emotionalSource,
      emotion:
        localizedString(value.emotion, language) ||
        localizedString(emotionSnapshot.mainEmotion, language) ||
        emotionLabels[0] ||
        localizedString(saveCardPreview?.emotion, language),
      secondary_emotion:
        localizedString(value.secondary_emotion, language) ||
        localizedString(emotionSnapshot.secondaryEmotion, language) ||
        emotionLabels[1],
      trigger,
      facts: localizedList(value.facts, language),
      interpretation:
        localizedList(value.interpretation, language).length > 0
          ? localizedList(value.interpretation, language)
          : localizedList(value.interpretations, language).length > 0
            ? localizedList(value.interpretations, language)
            : imaginations,
      thought_pattern: thoughtPattern,
      thought_pattern_explanation:
        localizedString(value.thought_pattern_explanation, language) ||
        localizedString(mainThoughtPattern.explanation, language),
      behaviour:
        localizedString(value.behaviour, language) ||
        behaviouralPullItems.join("\n"),
      body_factor:
        localizedString(value.body_factor, language) ||
        localizedString(value.mind_protecting, language) ||
        localizedString(value.gentleObservation, language),
      behavioural_insight:
        localizedString(value.behavioural_insight, language) ||
        localizedString(value.behaviouralInsight, language) ||
        localizedString(value.unmet_need_explanation, language),
      next_question: coreQuestion,
      next_step_type:
        toNextStepType(value.next_step_type) || inferNextStepType(thoughtPattern),
      next_step: nextStepText,
      mode_detected: toDetectedMode(value.mode_detected),
      gentle_observation: localizedString(value.gentleObservation, language),
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
            noEmotion: "用户未明确命名情绪",
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
            noEmotion: "No emotion explicitly named",
          };
    const thoughtLabel =
      (language === "zh"
        ? reflection.thought_pattern_label_zh ||
          reflection.thought_pattern_label_en
        : reflection.thought_pattern_label_en ||
          reflection.thought_pattern_label_zh) || reflection.thought_pattern;

    return [
      `1. ${labels.source}\n${reflection.emotional_source || reflection.emotional_validation}`,
      `2. ${labels.demon}\n${(reflection.demon_names ?? []).join(language === "zh" ? "、" : ", ")}\n${reflection.core_question || ""}`.trim(),
      `3. ${labels.emotions}\n${(reflection.emotion_labels ?? []).length ? (reflection.emotion_labels ?? []).join(language === "zh" ? "、" : ", ") : labels.noEmotion}`,
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
  return formatStructuredReflection(reflection, language);
}

function buildQuickPrompt(input: string, reflectionLanguage: Language) {
  const languageInstruction =
    reflectionLanguage === "zh"
      ? "Write every user-facing JSON value entirely in natural Simplified Chinese. Do not include English translations, English labels, or bilingual pairs. Keep JSON keys in English."
      : "Write every user-facing JSON value entirely in natural English. Do not include Chinese translations, Chinese labels, or bilingual pairs. Keep JSON keys in English.";

  return `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Product boundary:
- InnerLeaf is not a therapist, doctor, crisis counsellor, diagnostic tool, or medical service.
- You turn one emotional moment into a structured mobile reflection card.
- Core product idea: "The moment you name the demon, it begins to lose its power."
- You must follow the official InnerLeaf Prompt 2 contract.
- The reflection card must support exactly these 12 modules in this order:
  1. Emotional Source
  2. Name the Demon
  3. Emotion Labels
  4. Facts vs Imagination
  5. Unmet Need
  6. One Small Next Step
  7. Open Hypotheses
  8. Thought Pattern
  9. What Your Mind Might Be Protecting
  10. Behavioural Pull
  11. What to Observe Next
  12. Save Card Preview

Tone:
- Target reflection language: ${reflectionLanguage}.
- ${languageInstruction}
- Calm, precise, warm, non-judgmental, non-clinical, non-diagnostic.
- Do not sound like a therapist, motivational speaker, productivity coach, or generic chatbot.
- Do not write a long article. Every field must be short enough for a mobile card.

Language purity:
- If target reflection language is zh, every user-facing value must be Simplified Chinese only.
- If target reflection language is en, every user-facing value must be English only.
- Do not mix Chinese and English inside the same value.
- Do not write bilingual pairs such as "Mind reading / 读心式推断".
- Do not place English psychology terms in Chinese output.
- Do not place Chinese explanations in English output.
- For thought pattern labels, fill only the target-language label field and leave the other label field as an empty string.

Hard rules:
- Do not diagnose.
- Do not label the user as depressed, traumatised, disordered, or any clinical category.
- Do not say this is therapy.
- Do not give medical advice.
- Do not over-explain.
- Do not add emotion intensity scores, percentages, or severity labels.
- Do not output old modules named Objective Facts, Single Event or Pattern, Interaction Loop, Relationship Dynamic, Unknowns, or Emotion Intensity.
- Do not output any module outside the official 12-module contract, except safety_note as a JSON field when safety language appears.
- Return JSON only. No markdown. No commentary outside JSON.

Scenario classification:
Choose scenario_category from:
relationship, friendship, family, study, work_career, personal_growth, body, general.
If body-state language appears, body-aware handling must activate.

Required Prompt 2 modules:
1. emotional_source:
   Explain what happened, what sensitivity point got touched, and why emotion rose.
   Use mechanism, not generic comfort. Do not write "your reaction is normal" or "your feeling is valid".
2. demon_names:
   Max 1-2 short names for the pain. Do not diagnose or label the user as a person.
3. emotion_labels:
   Only include emotions explicitly stated by the user.
   If none are explicitly named, return [] and the UI will display the no-emotion fallback.
4. facts and imaginations:
   facts max 2. imaginations max 2.
   Use "imagination", not "interpretation".
   Do not say the imagination is wrong.
5. unmet need:
   Include unmet_need_surface, unmet_need_deeper, and unmet_need_explanation.
6. next_step_text:
   One tiny, low-risk action startable within 5 minutes.
   It must not depend on immediate response from another person.
7. open_hypotheses:
   Keep multiple possibilities open. For relationship scenarios, include neutral possibility space when appropriate:
   external situation, communication habit, investment/boundary change possibility.
8. thought_pattern:
   Choose one thought_pattern_key and one thought_pattern_label in the target language.
9. mind_protecting:
   Name what the mind may be trying to protect.
10. behavioural_pull:
   behavioural_pull_items should show likely pulls without shame.
   behavioural_pull_note should end with the natural equivalent of:
   "This is the pull of an activated emotional state, not a personality flaw."
11. observe_next_items:
   Observe stable patterns and self-signals. Do not monitor another person.
12. save_card_preview:
   Compact values for category, emotion, trigger, pattern, need, and next_step.

Need examples:
${reflectionLanguage === "zh" ? "安全感, 被选择感, 被重视感, 确定性, 掌控感, 自我效能感, 被理解, 自主权, 边界感." : "safety, feeling chosen, feeling valued, certainty, control, self-efficacy, being understood, autonomy, boundaries."}

Name the demon examples:
${reflectionLanguage === "zh" ? "拒绝敏感\n不确定性拉扯\n比较型思维\n拖延瘫痪" : "Rejection sensitivity\nUncertainty spiral\nComparison thinking\nProcrastination paralysis"}

Name the demon taxonomy:
Choose 1-2 natural target-language demon names that best match these stable categories:
rejection_sensitivity, retroactive_jealousy, reassurance_seeking, fear_of_being_replaced, fear_of_being_unimportant, attachment_anxiety, comparison_thinking, procrastination_paralysis, fear_of_failure, uncertainty_intolerance, self_blame, need_for_autonomy, boundary_sensitivity, fear_of_disapproval, future_anxiety.
Do not output the raw enum names as user-facing text. Use natural labels in the target language.

Unmet need taxonomy:
The unmet need should map naturally to one of:
safety, being_chosen, certainty, being_valued, connection, autonomy, being_understood, control, self_efficacy, recognition, rest, belonging, boundary_respect, future_stability.
Do not output the raw enum names as user-facing text. Use natural labels in the target language.

Thought pattern:
Choose one primary thought_pattern_key only:
mind_reading, personalization, comparison_thinking, emotional_reasoning, catastrophising, cognitive_fusion, reassurance_seeking, rejection_sensitivity, retroactive_jealousy, all_or_nothing_thinking, avoidance, self_blame, procrastination_paralysis, uncertainty_intolerance, fear_of_being_replaced, fear_of_being_unimportant, control_seeking, fear_of_failure, future_anxiety, other.
Use thought_pattern_label for the visible label in the target language.
Leave thought_pattern_label_en and thought_pattern_label_zh empty unless needed for legacy compatibility.

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
  "thought_pattern_label": "",
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
    const parsedStructured = parseStructuredReflection(
      rawResult,
      reflectionLanguage
    );
    const structured = parsedStructured;
    const result = structured
      ? mode === "guided"
        ? formatGuidedReflection(structured, reflectionLanguage)
        : formatStructuredReflection(structured, reflectionLanguage)
      : rawResult;

    return NextResponse.json({
      result,
      structured,
      reflectionLanguage,
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
