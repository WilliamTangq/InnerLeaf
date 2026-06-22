export type ReflectionLanguage = "en" | "zh";

export type ReflectionMode = "quick" | "guided";

export type NormalizedTrigger =
  | "delayed_reply"
  | "comparison"
  | "silence_after_conflict"
  | "uncertainty"
  | "feeling_ignored"
  | "workload_stress"
  | "social_media_checking"
  | "fear_of_rejection"
  | "other";

export type NormalizedThoughtPattern =
  | "mind_reading"
  | "catastrophising"
  | "comparison_thinking"
  | "emotional_reasoning"
  | "reassurance_seeking"
  | "overgeneralisation"
  | "avoidance"
  | "self_blame"
  | "rejection_sensitivity"
  | "other";

export type NormalizedNextStepType =
  | "clarify_facts"
  | "pause_before_replying"
  | "grounding"
  | "reassurance_request"
  | "journaling"
  | "behaviour_reset"
  | "check_in_later"
  | "rest_and_regulate"
  | "other";

export type NormalizedCheckInSignal =
  | "not_checked_in"
  | "felt_lighter_later"
  | "still_recurring"
  | "mostly_resolved"
  | "uncertain";

export type StructuredReflectionLike = {
  emotional_validation?: string;
  moment_summary?: string;
  emotion?: string;
  secondary_emotion?: string;
  trigger?: string;
  facts?: string[];
  interpretation?: string[];
  thought_pattern?: string;
  thought_pattern_explanation?: string;
  behaviour?: string;
  body_factor?: string;
  behavioural_insight?: string;
  next_question?: string;
  next_step_type?: string;
  next_step?: string;
  mode_detected?: string;
  gentle_observation?: string;
  safety_note?: string;
} | null;

export type SavedReflectionLike = {
  id: string | number;
  created_at: string;
  user_input?: string | null;
  ai_result?: string | null;
  emotional_validation?: string | null;
  emotion?: string | null;
  secondary_emotion?: string | null;
  trigger?: string | null;
  thought_pattern?: string | null;
  facts?: string | string[] | null;
  interpretation?: string | string[] | null;
  behaviour?: string | null;
  body_factor?: string | null;
  behavioural_insight?: string | null;
  next_question?: string | null;
  next_step?: string | null;
  next_step_type?: string | null;
  mode_detected?: string | null;
  mode?: string | null;
  language?: string | null;
  ui_language?: string | null;
  reflection_language?: string | null;
  short_title?: string | null;
  mood_chip?: string | null;
  normalized_trigger?: string | null;
  normalized_thought_pattern?: string | null;
  normalized_next_step_type?: string | null;
  normalized_check_in_signal?: string | null;
  follow_up_result?: string | null;
  follow_up_note?: string | null;
  follow_up_at?: string | null;
};

export type CanonicalReflectionCard = {
  id?: string | number;
  createdAt?: string;
  originalInput?: string;
  aiResult?: string;
  mode: ReflectionMode;
  uiLanguage: ReflectionLanguage;
  reflectionLanguage: ReflectionLanguage;
  emotionalValidation: string;
  momentSummary: string;
  mainEmotion: string;
  secondaryEmotion: string;
  triggerLabel: string;
  factsSummary: string[];
  interpretationSummary: string[];
  thoughtPatternLabel: string;
  thoughtPatternExplanation: string;
  behaviour: string;
  bodyFactor: string;
  behaviouralInsight: string;
  nextQuestion: string;
  nextStep: string;
  nextStepType: string;
  modeDetected: string;
  normalizedTrigger: NormalizedTrigger;
  normalizedThoughtPattern: NormalizedThoughtPattern;
  normalizedNextStepType: NormalizedNextStepType;
  normalizedCheckInSignal: NormalizedCheckInSignal;
  shortTitle: string;
  moodChip: string;
  saveStatus: string;
  followUpResult?: string | null;
  followUpNote?: string | null;
  followUpAt?: string | null;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function cleanList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => clean(item))
      .filter(Boolean)
      .slice(0, 2);
  }

  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((item) => item.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 2);
  }

  return [];
}

function normalizeLanguage(value: unknown): ReflectionLanguage {
  return value === "zh" ? "zh" : "en";
}

function normalizeMode(value: unknown): ReflectionMode {
  return value === "guided" ? "guided" : "quick";
}

function matchLabel(
  text: string,
  rules: Array<[RegExp, string]>,
  fallback: string
) {
  const normalized = clean(text).toLowerCase();

  for (const [pattern, label] of rules) {
    if (pattern.test(normalized)) {
      return label;
    }
  }

  return fallback;
}

const triggerAliases: Record<string, NormalizedTrigger> = {
  delayed_reply: "delayed_reply",
  "delayed reply": "delayed_reply",
  comparison: "comparison",
  silence_after_conflict: "silence_after_conflict",
  "silence after conflict": "silence_after_conflict",
  uncertainty: "uncertainty",
  feeling_ignored: "feeling_ignored",
  "feeling ignored": "feeling_ignored",
  workload_stress: "workload_stress",
  "workload stress": "workload_stress",
  social_media_checking: "social_media_checking",
  "social media checking": "social_media_checking",
  fear_of_rejection: "fear_of_rejection",
  "fear of rejection": "fear_of_rejection",
  other: "other",
};

const thoughtPatternAliases: Record<string, NormalizedThoughtPattern> = {
  mind_reading: "mind_reading",
  "mind reading": "mind_reading",
  catastrophising: "catastrophising",
  comparison_thinking: "comparison_thinking",
  "comparison thinking": "comparison_thinking",
  emotional_reasoning: "emotional_reasoning",
  "emotional reasoning": "emotional_reasoning",
  reassurance_seeking: "reassurance_seeking",
  "reassurance seeking": "reassurance_seeking",
  overgeneralisation: "overgeneralisation",
  avoidance: "avoidance",
  self_blame: "self_blame",
  "self-blame": "self_blame",
  rejection_sensitivity: "rejection_sensitivity",
  "rejection sensitivity": "rejection_sensitivity",
  other: "other",
};

const nextStepTypeAliases: Record<string, NormalizedNextStepType> = {
  clarify_facts: "clarify_facts",
  "clarify facts": "clarify_facts",
  pause_before_replying: "pause_before_replying",
  "pause before replying": "pause_before_replying",
  pause: "pause_before_replying",
  grounding: "grounding",
  "self-soothe": "grounding",
  communicate: "reassurance_request",
  reassurance_request: "reassurance_request",
  "reassurance request": "reassurance_request",
  journaling: "journaling",
  behaviour_reset: "behaviour_reset",
  "behaviour reset": "behaviour_reset",
  check_in_later: "check_in_later",
  "check-in later": "check_in_later",
  rest_and_regulate: "rest_and_regulate",
  "rest and regulate": "rest_and_regulate",
  "do nothing for now": "rest_and_regulate",
  other: "other",
};

const checkInSignalAliases: Record<string, NormalizedCheckInSignal> = {
  not_checked_in: "not_checked_in",
  "not checked in": "not_checked_in",
  "not checked in yet": "not_checked_in",
  felt_lighter_later: "felt_lighter_later",
  "felt lighter later": "felt_lighter_later",
  settling: "felt_lighter_later",
  still_recurring: "still_recurring",
  "still recurring": "still_recurring",
  "still active": "still_recurring",
  mostly_resolved: "mostly_resolved",
  "mostly resolved": "mostly_resolved",
  "checked in": "mostly_resolved",
  uncertain: "uncertain",
};

function aliasValue<T extends string>(
  value: unknown,
  aliases: Record<string, T>
): T | null {
  const text = clean(value).toLowerCase();
  return aliases[text] ?? null;
}

export function normalizeTrigger(value: unknown): NormalizedTrigger {
  const aliased = aliasValue(value, triggerAliases);

  if (aliased) {
    return aliased;
  }

  const text = clean(value);

  if (!text) {
    return "other";
  }

  return matchLabel(
    text,
    [
      [/delayed|late|reply|message|text|回复|消息|回信/, "delayed_reply"],
      [/checking|instagram|tiktok|social media|刷|查看|社交媒体/, "social_media_checking"],
      [/reject|rejection|abandon|被拒绝|拒绝/, "fear_of_rejection"],
      [/comparison|compare|social|别人|比较|社交/, "comparison"],
      [/silence|conflict|argument|冷战|冲突|沉默/, "silence_after_conflict"],
      [/ignored|unseen|not cared|不被在意|忽视/, "feeling_ignored"],
      [/work|workload|deadline|shift|job|工作|加班|任务/, "workload_stress"],
      [/uncertain|unknown|not enough|不确定|不知道|没信息/, "uncertainty"],
    ],
    "other"
  ) as NormalizedTrigger;
}

export function normalizeThoughtPattern(value: unknown): NormalizedThoughtPattern {
  const aliased = aliasValue(value, thoughtPatternAliases);

  if (aliased) {
    return aliased;
  }

  const text = clean(value);

  if (!text) {
    return "other";
  }

  return matchLabel(
    text,
    [
      [/mind.?reading|读心/, "mind_reading"],
      [/catastroph|worst|灾难/, "catastrophising"],
      [/comparison|比较/, "comparison_thinking"],
      [/emotional reasoning|情绪化推理/, "emotional_reasoning"],
      [/reassurance|confirm|确认|安慰/, "reassurance_seeking"],
      [/reject|rejection|被拒绝|拒绝/, "rejection_sensitivity"],
      [/avoid|回避|逃避/, "avoidance"],
      [/self.?blame|自责/, "self_blame"],
      [/over.?general|概括/, "overgeneralisation"],
    ],
    "other"
  ) as NormalizedThoughtPattern;
}

export function normalizeNextStepType(value: unknown): NormalizedNextStepType {
  const aliased = aliasValue(value, nextStepTypeAliases);

  if (aliased) {
    return aliased;
  }

  const text = clean(value);

  if (!text) {
    return "other";
  }

  return matchLabel(
    text,
    [
      [/clarify|fact|澄清|事实/, "clarify_facts"],
      [/communicate|message|ask|request|沟通|消息|询问|请求/, "reassurance_request"],
      [/ground|self.?soothe|soothe|稳定|安抚|休息|热敷|呼吸/, "grounding"],
      [/journal|write|记录|写下/, "journaling"],
      [/reset|start|action|启动|行动/, "behaviour_reset"],
      [/check.?in|later|回看|稍后/, "check_in_later"],
      [/rest|regulate|do nothing|躺|休息|热水|热敷/, "rest_and_regulate"],
      [/pause|wait|delay|reply|暂停|等待|延迟|回复/, "pause_before_replying"],
    ],
    "other"
  ) as NormalizedNextStepType;
}

export function normalizeCheckInSignal(value: unknown): NormalizedCheckInSignal {
  const aliased = aliasValue(value, checkInSignalAliases);

  if (aliased) {
    return aliased;
  }

  const text = clean(value).toLowerCase();

  if (!text) {
    return "not_checked_in";
  }

  if (/helped|有帮助/.test(text)) {
    return "felt_lighter_later";
  }

  if (/somewhat|有一点/.test(text)) {
    return "mostly_resolved";
  }

  if (/not|did not|没有|无效/.test(text)) {
    return "still_recurring";
  }

  return "uncertain";
}

function shortTitleFrom(trigger: string, emotion: string) {
  if (trigger && emotion) {
    return `${emotion} · ${trigger}`;
  }

  return trigger || emotion || "Reflection card";
}

export function createCanonicalReflectionCard({
  structured,
  input,
  result,
  mode,
  uiLanguage,
  reflectionLanguage,
}: {
  structured: StructuredReflectionLike;
  input?: string | null;
  result?: string | null;
  mode?: unknown;
  uiLanguage?: unknown;
  reflectionLanguage?: unknown;
}): CanonicalReflectionCard {
  const nextStepType = clean(structured?.next_step_type);
  const thoughtPattern = clean(structured?.thought_pattern);
  const trigger = clean(structured?.trigger);

  return {
    originalInput: clean(input),
    aiResult: clean(result),
    mode: normalizeMode(mode),
    uiLanguage: normalizeLanguage(uiLanguage),
    reflectionLanguage: normalizeLanguage(reflectionLanguage ?? uiLanguage),
    emotionalValidation: clean(structured?.emotional_validation),
    momentSummary: clean(structured?.moment_summary),
    mainEmotion: clean(structured?.emotion),
    secondaryEmotion: clean(structured?.secondary_emotion),
    triggerLabel: trigger,
    factsSummary: cleanList(structured?.facts),
    interpretationSummary: cleanList(structured?.interpretation),
    thoughtPatternLabel: thoughtPattern,
    thoughtPatternExplanation: clean(structured?.thought_pattern_explanation),
    behaviour: clean(structured?.behaviour),
    bodyFactor: clean(structured?.body_factor),
    behaviouralInsight: clean(structured?.behavioural_insight),
    nextQuestion: clean(structured?.next_question),
    nextStep: clean(structured?.next_step),
    nextStepType,
    modeDetected: clean(structured?.mode_detected),
    normalizedTrigger: normalizeTrigger(trigger),
    normalizedThoughtPattern: normalizeThoughtPattern(thoughtPattern),
    normalizedNextStepType: normalizeNextStepType(nextStepType),
    normalizedCheckInSignal: "not_checked_in",
    shortTitle: shortTitleFrom(trigger, clean(structured?.emotion)),
    moodChip: clean(structured?.emotion),
    saveStatus: "generated",
  };
}

export function canonicalFromSavedReflection(
  reflection: SavedReflectionLike
): CanonicalReflectionCard {
  const thoughtPattern = clean(reflection.thought_pattern);
  const trigger = clean(reflection.trigger);
  const nextStepType = clean(reflection.next_step_type);
  const uiLanguage = normalizeLanguage(reflection.ui_language ?? reflection.language);

  return {
    id: reflection.id,
    createdAt: reflection.created_at,
    originalInput: clean(reflection.user_input),
    aiResult: clean(reflection.ai_result),
    mode: normalizeMode(reflection.mode),
    uiLanguage,
    reflectionLanguage: normalizeLanguage(reflection.reflection_language ?? reflection.language),
    emotionalValidation: clean(reflection.emotional_validation),
    momentSummary: trigger ? `This moment seems to be about ${trigger}.` : "",
    mainEmotion: clean(reflection.emotion),
    secondaryEmotion: clean(reflection.secondary_emotion),
    triggerLabel: trigger,
    factsSummary: cleanList(reflection.facts),
    interpretationSummary: cleanList(reflection.interpretation),
    thoughtPatternLabel: thoughtPattern,
    thoughtPatternExplanation: "",
    behaviour: clean(reflection.behaviour),
    bodyFactor: clean(reflection.body_factor),
    behaviouralInsight: clean(reflection.behavioural_insight),
    nextQuestion: clean(reflection.next_question),
    nextStep: clean(reflection.next_step),
    nextStepType,
    modeDetected: clean(reflection.mode_detected),
    normalizedTrigger: normalizeTrigger(reflection.normalized_trigger || trigger),
    normalizedThoughtPattern:
      normalizeThoughtPattern(reflection.normalized_thought_pattern || thoughtPattern),
    normalizedNextStepType:
      normalizeNextStepType(reflection.normalized_next_step_type || nextStepType),
    normalizedCheckInSignal:
      normalizeCheckInSignal(
        reflection.normalized_check_in_signal || reflection.follow_up_result
      ),
    shortTitle: clean(reflection.short_title) || shortTitleFrom(trigger, clean(reflection.emotion)),
    moodChip: clean(reflection.mood_chip) || clean(reflection.emotion),
    saveStatus: "saved",
    followUpResult: reflection.follow_up_result ?? null,
    followUpNote: reflection.follow_up_note ?? null,
    followUpAt: reflection.follow_up_at ?? null,
  };
}

export function localizedCanonicalLabel(
  value: string,
  language: ReflectionLanguage
) {
  const englishLabels: Record<string, string> = {
    delayed_reply: "Delayed reply",
    "delayed reply": "Delayed reply",
    comparison: "Comparison",
    silence_after_conflict: "Silence after conflict",
    "silence after conflict": "Silence after conflict",
    uncertainty: "Uncertainty",
    feeling_ignored: "Feeling ignored",
    "feeling ignored": "Feeling ignored",
    workload_stress: "Workload stress",
    "workload stress": "Workload stress",
    social_media_checking: "Social media checking",
    "social media checking": "Social media checking",
    fear_of_rejection: "Fear of rejection",
    "fear of rejection": "Fear of rejection",
    other: "Other",
    mind_reading: "Mind reading",
    "mind reading": "Mind reading",
    catastrophising: "Catastrophising",
    comparison_thinking: "Comparison thinking",
    "comparison thinking": "Comparison thinking",
    emotional_reasoning: "Emotional reasoning",
    "emotional reasoning": "Emotional reasoning",
    reassurance_seeking: "Reassurance seeking",
    "reassurance seeking": "Reassurance seeking",
    rejection_sensitivity: "Rejection sensitivity",
    "rejection sensitivity": "Rejection sensitivity",
    avoidance: "Avoidance",
    self_blame: "Self-blame",
    "self-blame": "Self-blame",
    overgeneralisation: "Overgeneralisation",
    pause_before_replying: "Pause before replying",
    "pause before replying": "Pause before replying",
    pause: "Pause",
    clarify_facts: "Clarify facts",
    "clarify facts": "Clarify facts",
    communicate: "Communicate",
    "self-soothe": "Self-soothe",
    reframe: "Reframe",
    "do nothing for now": "Do nothing for now",
    grounding: "Grounding",
    reassurance_request: "Reassurance request",
    "reassurance request": "Reassurance request",
    journaling: "Journaling",
    behaviour_reset: "Behaviour reset",
    "behaviour reset": "Behaviour reset",
    check_in_later: "Check in later",
    "check-in later": "Check in later",
    rest_and_regulate: "Rest and regulate",
    felt_lighter_later: "Felt lighter later",
    "felt lighter later": "Felt lighter later",
    settling: "Settling",
    still_recurring: "Still recurring",
    "still recurring": "Still recurring",
    "still active": "Still active",
    mostly_resolved: "Mostly resolved",
    "mostly resolved": "Mostly resolved",
    "checked in": "Checked in",
    uncertain: "Uncertain",
    not_checked_in: "Not checked in",
    "not checked in yet": "Not checked in",
    "not checked in": "Not checked in",
  };

  const chineseLabels: Record<string, string> = {
    delayed_reply: "回复延迟",
    "delayed reply": "回复延迟",
    comparison: "比较",
    silence_after_conflict: "冲突后的沉默",
    "silence after conflict": "冲突后的沉默",
    uncertainty: "不确定",
    feeling_ignored: "被忽视感",
    "feeling ignored": "被忽视感",
    workload_stress: "工作压力",
    "workload stress": "工作压力",
    social_media_checking: "社交媒体查看",
    "social media checking": "社交媒体查看",
    fear_of_rejection: "害怕被拒绝",
    "fear of rejection": "害怕被拒绝",
    other: "其他",
    mind_reading: "读心式推断",
    "mind reading": "读心式推断",
    catastrophising: "灾难化推断",
    comparison_thinking: "比较型思维",
    "comparison thinking": "比较型思维",
    emotional_reasoning: "情绪化推理",
    "emotional reasoning": "情绪化推理",
    reassurance_seeking: "反复确认",
    "reassurance seeking": "反复确认",
    rejection_sensitivity: "拒绝敏感",
    "rejection sensitivity": "拒绝敏感",
    avoidance: "回避",
    self_blame: "自我责备",
    "self-blame": "自我责备",
    overgeneralisation: "过度概括",
    pause_before_replying: "回复前暂停",
    "pause before replying": "回复前暂停",
    pause: "暂停",
    clarify_facts: "澄清事实",
    "clarify facts": "澄清事实",
    communicate: "沟通",
    "self-soothe": "安抚自己",
    reframe: "重新理解",
    "do nothing for now": "暂时不行动",
    grounding: "稳定身体",
    reassurance_request: "请求确认",
    "reassurance request": "请求确认",
    journaling: "写下整理",
    behaviour_reset: "行为重启",
    "behaviour reset": "行为重启",
    check_in_later: "稍后回看",
    "check-in later": "稍后回看",
    rest_and_regulate: "休息并稳定",
    "felt lighter later": "之后轻了一点",
    felt_lighter_later: "之后轻了一点",
    settling: "有所缓和",
    still_recurring: "仍在反复",
    "still recurring": "仍在反复",
    "still active": "仍然明显",
    mostly_resolved: "基本缓和",
    "mostly resolved": "基本缓和",
    "checked in": "已回看",
    uncertain: "还不确定",
    not_checked_in: "尚未回看",
    "not checked in yet": "尚未回看",
    "not checked in": "尚未回看",
  };

  const labels = language === "zh" ? chineseLabels : englishLabels;

  return labels[value] || value;
}
