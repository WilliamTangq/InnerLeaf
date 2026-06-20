import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getUserFromRequest, supabaseAdmin } from "../../lib/auth-server";
import { normalizeLanguage, translations, type Language } from "../../lib/i18n";
import { detectReflectionLanguage } from "../../lib/reflection-language";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const geminiModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

type StructuredReflection = {
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
]);

const detectedModes = new Set([
  "General",
  "Low-Energy Mode",
  "Study Pressure",
  "Relationship Anxiety",
  "Safety Boundary",
]);

type PatternKey =
  | "mindReading"
  | "catastrophising"
  | "comparison"
  | "personalisation"
  | "allOrNothing"
  | "emotionalReasoning"
  | "reassuranceSeeking"
  | "avoidance"
  | "selfBlame"
  | "overgeneralisation";

type VariationSet = {
  nextSteps: string[];
  nextQuestions: string[];
};

const patternVariations: Record<Language, Record<PatternKey, VariationSet>> = {
  en: {
    mindReading: {
      nextSteps: [
        "Write one fact you know and two explanations that could also fit.",
        "Wait 10 minutes before acting on the assumption.",
        "Draft what you want to ask, but remove blame language before sending.",
        "Check whether the other person directly said what you are assuming.",
        "Save this card and come back after one new fact appears.",
      ],
      nextQuestions: [
        "What evidence do you have, and what evidence is still missing?",
        "Are you responding to what happened, or to what you fear it means?",
        "What is one neutral explanation that still fits the facts?",
        "If a friend had this same evidence, what would you tell them?",
        "What would you need to know before treating this as true?",
      ],
    },
    catastrophising: {
      nextSteps: [
        "Write the worst-case, neutral-case, and most likely case in three short lines.",
        "Name the first small sign that would show the worst-case is not happening.",
        "Wait 10 minutes, then reread the facts before deciding what to do.",
        "Put the feared outcome into one sentence, then write one less extreme possibility.",
        "Choose one grounding action before making a decision from the worst-case story.",
      ],
      nextQuestions: [
        "What is the most likely outcome, not just the most frightening one?",
        "What fact would need to appear before the worst-case becomes more likely?",
        "Are you preparing for danger, or treating uncertainty as danger?",
        "What is one neutral outcome that still fits the facts?",
        "If this goes only somewhat badly, what would you still be able to do?",
      ],
    },
    comparison: {
      nextSteps: [
        "Stop checking the comparison source for the next 30 minutes.",
        "Write what this comparison made you feel you were missing.",
        "Name one need underneath the comparison.",
        "Return to one thing you can control today.",
        "Save the trigger instead of continuing to investigate.",
      ],
      nextQuestions: [
        "Are you comparing facts, or comparing yourself to an imagined version of someone else?",
        "What did seeing this person make you believe about yourself?",
        "What need is underneath the comparison?",
        "What part of this situation is actually about your relationship with yourself?",
        "What would change if you stopped collecting more evidence?",
      ],
    },
    personalisation: {
      nextSteps: [
        "Write one line separating their behaviour from your worth.",
        "List one explanation for their behaviour that is not about you.",
        "Pause before making their mood or response your responsibility.",
        "Name what was yours to influence and what was outside your control.",
        "Rewrite the story without using yourself as the main cause.",
      ],
      nextQuestions: [
        "What part of this is actually about you, and what part may belong to them?",
        "Are you taking responsibility for something you cannot fully control?",
        "What else could explain their behaviour besides your worth?",
        "If this was not about you, what would be left to respond to?",
        "What would you tell a friend who blamed themselves with this evidence?",
      ],
    },
    allOrNothing: {
      nextSteps: [
        "Choose one 10-minute starting action instead of solving the whole thing.",
        "Write a smaller version of the task that would still count.",
        "Pick the next visible step, not the full outcome.",
        "Set a 10-minute timer and stop when it ends.",
        "Replace the all-day plan with one tiny start you can do now.",
      ],
      nextQuestions: [
        "What is the smallest useful version of this?",
        "Are you asking yourself to finish, or just to begin?",
        "What would count as partial progress today?",
        "What is one step between doing nothing and doing everything?",
        "How could this be 10 minutes instead of a full performance?",
      ],
    },
    emotionalReasoning: {
      nextSteps: [
        "Name the feeling, then write one fact that supports it and one fact that does not.",
        "Pause and ask whether the intensity of the feeling matches the evidence.",
        "Write the sentence: 'I feel this strongly, and I still need facts.'",
        "Separate what your body feels from what you know happened.",
        "Wait until the feeling drops slightly before treating it as information.",
      ],
      nextQuestions: [
        "What is the feeling saying, and what are the facts saying?",
        "Does the strength of the feeling prove the story is true?",
        "What would you think if the feeling were 20% quieter?",
        "Which facts support this feeling, and which facts are missing?",
        "Are you reacting to evidence, or to the emotional volume of the moment?",
      ],
    },
    reassuranceSeeking: {
      nextSteps: [
        "Draft the message, then wait 10 minutes before deciding whether to send it.",
        "Write what reassurance you want before asking for it.",
        "Ask one clear question instead of checking for hidden signs.",
        "Pause after one check and let the answer be enough for now.",
        "Save the urge to ask, then return after one new fact appears.",
      ],
      nextQuestions: [
        "What reassurance are you hoping the other person will give you?",
        "Would asking now create clarity, or only temporary relief?",
        "What is one direct question that would be clearer than checking?",
        "How many times have you already looked for certainty here?",
        "What would help you wait without asking for reassurance immediately?",
      ],
    },
    avoidance: {
      nextSteps: [
        "Take one low-friction action that lasts under five minutes.",
        "Open the message, file, or task without forcing yourself to finish it.",
        "Move the task into view and do only the first tiny part.",
        "Write what you are avoiding in one sentence.",
        "Choose the least demanding step that still keeps the moment moving.",
      ],
      nextQuestions: [
        "What is the first part you are avoiding, not the whole thing?",
        "What would make this 10% easier to start?",
        "Are you avoiding the task, or the feeling that comes with it?",
        "What is one tiny action that would not require full motivation?",
        "What would be enough to reduce the pressure without solving everything?",
      ],
    },
    selfBlame: {
      nextSteps: [
        "Write what was actually under your control and what was not.",
        "Remove one sentence that turns the whole situation into your fault.",
        "Name one factor outside you that may have contributed.",
        "Ask what you would take responsibility for without attacking yourself.",
        "Write a fairer version of the story using shared or uncertain causes.",
      ],
      nextQuestions: [
        "What part was truly yours to control?",
        "Are you taking blame because the situation feels painful?",
        "What would a fair version of responsibility sound like?",
        "What factors outside you also shaped this moment?",
        "If blame were not the goal, what would you want to understand?",
      ],
    },
    overgeneralisation: {
      nextSteps: [
        "Write whether this is one event or a repeated proven pattern.",
        "Name one exception that does not fit the broad conclusion.",
        "Replace 'always' or 'never' with the specific thing that happened.",
        "Save this card and wait for more evidence before making it a rule.",
        "Write the narrowest accurate version of the conclusion.",
      ],
      nextQuestions: [
        "Is this one event, or a repeated pattern with enough evidence?",
        "What exception makes the broad conclusion less certain?",
        "Are you turning this moment into a rule too quickly?",
        "What exactly happened, without adding 'always' or 'never'?",
        "How many examples would you need before treating this as a pattern?",
      ],
    },
  },
  zh: {
    mindReading: {
      nextSteps: [
        "写下一个你确定的事实，再写两个也说得通的其他解释。",
        "先等 10 分钟，再决定要不要根据这个假设行动。",
        "先写下你想问的话，发送前删掉责备语气。",
        "检查一下，对方是否真的直接说过你正在假设的内容。",
        "先保存这张卡片，等出现一个新事实后再回来看看。",
      ],
      nextQuestions: [
        "你现在有什么证据？还有什么证据其实缺失？",
        "你是在回应发生的事，还是在回应你害怕它代表什么？",
        "还有哪一个中性解释也符合目前事实？",
        "如果朋友只有这些证据，你会怎么提醒他？",
        "在把这个假设当真之前，你还需要知道什么？",
      ],
    },
    catastrophising: {
      nextSteps: [
        "用三行写下最坏情况、中性情况和最可能情况。",
        "写下一个能说明最坏情况没有发生的小迹象。",
        "先等 10 分钟，再回头只看事实后决定下一步。",
        "把最害怕的结果写成一句话，再写一个不那么极端的可能。",
        "在根据最坏故事行动前，先做一个让自己稳定下来的动作。",
      ],
      nextQuestions: [
        "最可能发生的结果是什么，而不只是最可怕的结果？",
        "需要出现什么事实，最坏情况才真的更可能？",
        "你是在准备危险，还是把不确定当成危险？",
        "哪一个中性结果也符合现在的事实？",
        "如果事情只是有点不顺，你仍然可以怎么处理？",
      ],
    },
    comparison: {
      nextSteps: [
        "接下来 30 分钟先停止查看让你比较的来源。",
        "写下这次比较让你觉得自己缺少了什么。",
        "说出比较背后的一个真实需要。",
        "回到今天你能控制的一件小事。",
        "先保存这个触发点，不继续调查更多细节。",
      ],
      nextQuestions: [
        "你是在比较事实，还是在拿自己和想象中的别人比较？",
        "看到这个人之后，你开始相信了关于自己的什么？",
        "这个比较背后藏着什么需要？",
        "这件事有哪一部分其实是在反映你和自己的关系？",
        "如果你停止继续收集证据，会有什么变化？",
      ],
    },
    personalisation: {
      nextSteps: [
        "写一句话，把对方的行为和你的自我价值分开。",
        "列出一个不关于你的解释，也可能说明对方的行为。",
        "先暂停，不急着把对方的情绪或回应变成你的责任。",
        "写下哪些是你能影响的，哪些不在你控制范围内。",
        "重写这个故事，不把自己放在唯一原因的位置。",
      ],
      nextQuestions: [
        "这件事哪一部分真的与你有关，哪一部分可能属于对方？",
        "你是不是在为无法完全控制的事负责？",
        "除了你的价值之外，还有什么能解释对方的行为？",
        "如果这不代表你不好，那剩下需要回应的是什么？",
        "如果朋友用这些证据责怪自己，你会怎么说？",
      ],
    },
    allOrNothing: {
      nextSteps: [
        "选择一个 10 分钟的开始动作，而不是要求自己解决全部。",
        "写下这个任务更小、更容易开始的版本。",
        "只选下一个看得见的步骤，不处理整个结果。",
        "设一个 10 分钟计时器，到点就停。",
        "把“明天做一整天”换成现在能做的一个很小开头。",
      ],
      nextQuestions: [
        "这件事最小但仍然有用的版本是什么？",
        "你是在要求自己完成，还是只需要开始？",
        "今天怎样算是部分进展？",
        "在什么都不做和全部完成之间，有哪一步？",
        "怎样把这件事变成 10 分钟，而不是一次表现？",
      ],
    },
    emotionalReasoning: {
      nextSteps: [
        "先命名这个感受，再写一个支持它的事实和一个不支持它的事实。",
        "暂停一下，看看情绪强度是否真的等于证据强度。",
        "写下这句话：“我现在感受很强，但我还需要事实。”",
        "把身体里的感受和你确定发生的事分开写。",
        "等感受稍微降下来一点，再把它当作信息处理。",
      ],
      nextQuestions: [
        "这个感受在说什么？事实又在说什么？",
        "感受很强，是否就能证明这个故事是真的？",
        "如果这个感受小 20%，你会怎么理解这件事？",
        "哪些事实支持这个感受？哪些事实还缺失？",
        "你是在回应证据，还是在回应此刻情绪的音量？",
      ],
    },
    reassuranceSeeking: {
      nextSteps: [
        "先写好想发的消息，但等 10 分钟再决定是否发送。",
        "在寻求确认前，先写下你真正想得到的安定感是什么。",
        "问一个直接问题，而不是继续寻找隐藏信号。",
        "确认一次后先停下，让这个答案暂时足够。",
        "先保存想确认的冲动，等出现一个新事实后再回来。",
      ],
      nextQuestions: [
        "你希望对方给你哪一种确认？",
        "现在去问会带来清晰，还是只带来短暂缓解？",
        "哪一个直接问题会比反复检查更清楚？",
        "你已经为了确定感查看或确认了几次？",
        "什么能帮助你不立刻寻求确认，也能先等一等？",
      ],
    },
    avoidance: {
      nextSteps: [
        "做一个低阻力动作，时间控制在 5 分钟以内。",
        "只打开消息、文件或任务，不要求自己完成。",
        "把任务放到眼前，只做第一个很小部分。",
        "用一句话写下你正在回避的是什么。",
        "选择一个最不费力、但能让事情继续移动的小步骤。",
      ],
      nextQuestions: [
        "你回避的是哪一个开头，而不是整件事？",
        "怎样能让开始变容易 10%？",
        "你是在回避任务，还是回避任务带来的感受？",
        "哪一个小动作不需要完整动力也能做？",
        "什么足够减轻压力，而不需要解决全部？",
      ],
    },
    selfBlame: {
      nextSteps: [
        "写下哪些真的在你控制范围内，哪些不在。",
        "删掉一句把整件事都变成你错了的话。",
        "说出一个你之外、也可能影响这件事的因素。",
        "问问自己：不攻击自己时，我愿意承担哪一部分责任？",
        "用共同因素或不确定因素，写一个更公平的版本。",
      ],
      nextQuestions: [
        "哪一部分真的在你的控制范围内？",
        "你是在因为痛苦而把责任都放到自己身上吗？",
        "一个公平的责任版本会怎么说？",
        "还有哪些你之外的因素影响了这件事？",
        "如果目标不是责怪，而是理解，你想看清什么？",
      ],
    },
    overgeneralisation: {
      nextSteps: [
        "写下这是一次事件，还是已经被多次证明的模式。",
        "找一个不符合这个大结论的例外。",
        "把“总是”或“从不”换成这次具体发生的事。",
        "先保存这张卡片，等更多证据出现后再把它变成规则。",
        "写下最窄、但准确的结论。",
      ],
      nextQuestions: [
        "这是一次事件，还是已经有足够证据的重复模式？",
        "哪一个例外让这个大结论没那么确定？",
        "你是不是太快把这一次变成规则了？",
        "不使用“总是”或“从不”，具体发生了什么？",
        "你需要几个例子，才会把它当成模式？",
      ],
    },
  },
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

function toNextStepType(value: unknown) {
  const text = toStringValue(value);

  return nextStepTypes.has(text) ? text : "";
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

function detectPatternKey(pattern: string): PatternKey {
  const lower = pattern.toLowerCase();

  if (lower.includes("mind reading") || lower.includes("读心")) {
    return "mindReading";
  }
  if (lower.includes("catastroph") || lower.includes("灾难")) {
    return "catastrophising";
  }
  if (lower.includes("comparison") || lower.includes("比较")) {
    return "comparison";
  }
  if (lower.includes("personalisation") || lower.includes("personalization") || lower.includes("个人化")) {
    return "personalisation";
  }
  if (lower.includes("all-or-nothing") || lower.includes("非黑即白")) {
    return "allOrNothing";
  }
  if (lower.includes("emotional reasoning") || lower.includes("情绪化推理")) {
    return "emotionalReasoning";
  }
  if (lower.includes("reassurance") || lower.includes("反复确认")) {
    return "reassuranceSeeking";
  }
  if (lower.includes("avoidance") || lower.includes("回避")) {
    return "avoidance";
  }
  if (lower.includes("self-blame") || lower.includes("自我责备")) {
    return "selfBlame";
  }
  if (lower.includes("overgeneralisation") || lower.includes("overgeneralization") || lower.includes("过度概括")) {
    return "overgeneralisation";
  }

  return "mindReading";
}

function applyNextStepVariation(
  reflection: StructuredReflection,
  cardCount: number,
  language: Language
) {
  if (reflection.mode_detected === "Safety Boundary" || reflection.safety_note) {
    return reflection;
  }

  const patternKey = detectPatternKey(reflection.thought_pattern);
  const variations = patternVariations[language][patternKey];
  const index = cardCount % variations.nextSteps.length;

  return {
    ...reflection,
    next_step: variations.nextSteps[index],
    next_question: variations.nextQuestions[index],
    next_step_type: inferNextStepType(reflection.thought_pattern),
  };
}

async function getUserReflectionCount(userId: string) {
  if (!supabaseAdmin) {
    return 0;
  }

  const { count, error } = await supabaseAdmin
    .from("reflections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase reflection count error:", error);
    return 0;
  }

  return count ?? 0;
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
      toStringValue(mainThoughtPattern.label);
    const structured = {
      emotional_validation:
        toStringValue(value.emotional_validation) ||
        toStringValue(value.emotionalValidation),
      moment_summary:
        toStringValue(value.moment_summary) ||
        toStringValue(value.momentSummary),
      emotion:
        toStringValue(value.emotion) ||
        toStringValue(emotionSnapshot.mainEmotion),
      secondary_emotion:
        toStringValue(value.secondary_emotion) ||
        toStringValue(emotionSnapshot.secondaryEmotion),
      trigger: toStringValue(value.trigger),
      facts: toStringList(value.facts),
      interpretation:
        toStringList(value.interpretation).length > 0
          ? toStringList(value.interpretation)
          : toStringList(value.interpretations),
      thought_pattern: thoughtPattern,
      thought_pattern_explanation:
        toStringValue(value.thought_pattern_explanation) ||
        toStringValue(mainThoughtPattern.explanation),
      behaviour: toStringValue(value.behaviour),
      body_factor:
        toStringValue(value.body_factor) ||
        toStringValue(value.gentleObservation),
      behavioural_insight:
        toStringValue(value.behavioural_insight) ||
        toStringValue(value.behaviouralInsight),
      next_question:
        toStringValue(value.next_question) ||
        toStringValue(value.oneNextQuestion),
      next_step_type:
        toNextStepType(value.next_step_type) || inferNextStepType(thoughtPattern),
      next_step:
        toStringValue(value.next_step) ||
        toStringValue(value.oneSmallNextStep),
      mode_detected: toDetectedMode(value.mode_detected),
      gentle_observation: toStringValue(value.gentleObservation),
      safety_note: toStringValue(value.safetyNote),
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
      ? "Write all user-facing JSON values in natural Simplified Chinese. Keep JSON keys in English. Use key English terms in brackets only when useful. Do not switch to English unless the user explicitly mixed in an English term."
      : "Write all user-facing JSON values in natural English. Keep JSON keys in English. Do not switch to Chinese unless reflectionLanguage is zh.";

  return `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Product boundary:
- InnerLeaf is not therapy, diagnosis, crisis support, or medical advice.
- You help emotionally overloaded users turn one intense moment into a short, warm, structured reflection card.

Tone:
- Target reflection language: ${reflectionLanguage}.
- ${languageInstruction}
- Match the user's input language. Do not switch to Chinese unless target reflection language is zh.
- Be warm, calm, direct, and non-judgmental.
- First validate the user's emotional experience, then structure the moment.
- Do not make the user feel analysed, judged, or labelled.

Hard rules:
- Do not diagnose.
- Do not label the user as anxious attachment, depressed, traumatised, disordered, or any clinical category.
- Do not say this is therapy.
- Do not give medical advice.
- Do not over-explain.
- Do not list more than one main thought pattern.
- Do not use generic next steps.
- Keep the total output short enough to fit into a card UI.
- Return JSON only. No markdown. No commentary outside JSON.

Choose only one primary pattern from this list:
- Mind reading / 读心式推断
- Catastrophising / 灾难化推断
- Comparison thinking / 比较型思维
- Personalisation / 个人化归因
- All-or-nothing thinking / 非黑即白思维
- Emotional reasoning / 情绪化推理
- Reassurance seeking / 反复确认
- Avoidance / 回避
- Self-blame / 自我责备
- Overgeneralisation / 过度概括

Next step logic:
- If Mind reading: ask the user to write one fact and two alternative explanations.
- If Catastrophising: ask the user to write the worst-case, neutral-case, and most likely case.
- If Comparison thinking: ask the user to stop checking the trigger source and return to one personal need.
- If Personalisation: ask the user to separate the other person's behaviour from their own worth.
- If All-or-nothing thinking: ask the user to choose one 10-minute starting action.
- If Emotional reasoning: ask the user to name the feeling, then check whether facts support it.
- If Reassurance seeking: ask the user to draft the message but wait before sending.
- If Avoidance: ask the user to take one low-friction action.
- If Self-blame: ask the user to identify what was actually under their control.
- If Overgeneralisation: ask the user to identify whether this is one event or a repeated proven pattern.

Gentle observation rules:
- No history is provided in this prompt.
- Do not pretend there is a long-term pattern.
- Say the natural equivalent of: "This is one moment, not a full pattern yet."

Safety:
- If the user mentions self-harm, wanting to die, being unsafe, harm to others, abuse, immediate danger, severe worsening pain, fever, severe symptoms, or persistent loss of function, do not give ordinary advice.
- In that case, keep the card calm and direct, and put a brief encouragement to seek immediate local emergency/trusted/professional support in "safetyNote".
- Otherwise "safetyNote" should be an empty string.

User input:
${input}

Output JSON schema:
{
  "emotionalValidation": "",
  "momentSummary": "",
  "emotionSnapshot": {
    "mainEmotion": "",
    "secondaryEmotion": ""
  },
  "trigger": "",
  "facts": [],
  "interpretations": [],
  "mainThoughtPattern": {
    "label": "",
    "explanation": ""
  },
  "behaviouralInsight": "",
  "gentleObservation": "",
  "oneSmallNextStep": "",
  "oneNextQuestion": "",
  "safetyNote": ""
}
`;
}

function buildPrompt(input: string, mode: "quick" | "guided", language: Language) {
  if (mode === "quick") {
    return buildQuickPrompt(input, language);
  }

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
  "emotional_validation": "One short paragraph acknowledging why the user's reaction makes sense in this situation.",
  "moment_summary": "One sentence that begins like 'This moment seems to be about...' or the natural equivalent in the selected language.",
  "emotion": "Main emotion in plain language.",
  "secondary_emotion": "Secondary emotion if clearly present; otherwise empty string.",
  "trigger": "Specific trigger under 25 words.",
  "facts": ["Max 2 factual observations."],
  "interpretation": ["Max 2 possible interpretations or assumptions."],
  "thought_pattern": "One possible thought pattern as a bilingual label, e.g. 'Mind reading / 读心式推断' or '读心式推断 / Mind reading'.",
  "thought_pattern_explanation": "One short explanation of that pattern.",
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
- Emotional validation should come before cognitive analysis and must be specific to the user's situation.
- Do not use generic reassurance such as "it is okay to feel this way" unless it is tied to the user's actual situation.
- The moment_summary must be specific to the user's input.
- Use at most 2 facts.
- Use at most 2 interpretations.
- Do not list multiple thought patterns.
- Do not use clinical labels or numerical emotion scores.
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

    const cardCount = await getUserReflectionCount(user.id);
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
    const structured =
      parsedStructured && mode === "quick"
        ? applyNextStepVariation(
            parsedStructured,
            cardCount,
            reflectionLanguage
          )
        : parsedStructured;
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
