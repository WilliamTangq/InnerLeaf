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
  | "personalization"
  | "catastrophising"
  | "comparison_thinking"
  | "emotional_reasoning"
  | "cognitive_fusion"
  | "reassurance_seeking"
  | "rejection_sensitivity"
  | "retroactive_jealousy"
  | "all_or_nothing_thinking"
  | "uncertainty_intolerance"
  | "overgeneralisation"
  | "avoidance"
  | "self_blame"
  | "procrastination_paralysis"
  | "fear_of_being_replaced"
  | "fear_of_being_unimportant"
  | "control_seeking"
  | "fear_of_failure"
  | "future_anxiety"
  | "other";

export type NormalizedDemonName =
  | "rejection_sensitivity"
  | "retroactive_jealousy"
  | "reassurance_seeking"
  | "fear_of_being_replaced"
  | "fear_of_being_unimportant"
  | "attachment_anxiety"
  | "comparison_thinking"
  | "procrastination_paralysis"
  | "fear_of_failure"
  | "uncertainty_intolerance"
  | "self_blame"
  | "need_for_autonomy"
  | "boundary_sensitivity"
  | "fear_of_disapproval"
  | "future_anxiety"
  | "other";

export type NormalizedUnmetNeed =
  | "safety"
  | "being_chosen"
  | "certainty"
  | "being_valued"
  | "connection"
  | "autonomy"
  | "being_understood"
  | "control"
  | "self_efficacy"
  | "recognition"
  | "rest"
  | "belonging"
  | "boundary_respect"
  | "future_stability"
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
  scenario_category?: string | null;
  primary_demon?: string | null;
  unmet_need?: string | null;
  observe_next?: string | string[] | null;
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
  scenarioCategory: string;
  primaryDemon: string;
  normalizedDemon: NormalizedDemonName;
  unmetNeed: string;
  normalizedUnmetNeed: NormalizedUnmetNeed;
  observeNextItems: string[];
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

function containsHan(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

export function localizeMixedLanguageValue(
  value: string,
  language: ReflectionLanguage
) {
  const text = clean(value);

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

export function isWeakFallbackValue(value?: string | null) {
  const normalized = clean(value).toLowerCase();

  return (
    !normalized ||
    normalized === "other" ||
    normalized === "其他" ||
    normalized === "still emerging" ||
    normalized === "暂未清晰归类"
  );
}

export function shouldDisplayNormalizedChip(value?: string | null) {
  return !isWeakFallbackValue(value);
}

function cleanList(value: unknown, max = 2) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => clean(item))
      .filter(Boolean)
      .slice(0, max);
  }

  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((item) => item.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, max);
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
  cognitive_fusion: "cognitive_fusion",
  "cognitive fusion": "cognitive_fusion",
  reassurance_seeking: "reassurance_seeking",
  "reassurance seeking": "reassurance_seeking",
  uncertainty_intolerance: "uncertainty_intolerance",
  "uncertainty intolerance": "uncertainty_intolerance",
  overgeneralisation: "overgeneralisation",
  avoidance: "avoidance",
  procrastination_paralysis: "procrastination_paralysis",
  "procrastination paralysis": "procrastination_paralysis",
  self_blame: "self_blame",
  "self-blame": "self_blame",
  rejection_sensitivity: "rejection_sensitivity",
  "rejection sensitivity": "rejection_sensitivity",
  retroactive_jealousy: "retroactive_jealousy",
  "retroactive jealousy": "retroactive_jealousy",
  personalization: "personalization",
  personalisation: "personalization",
  all_or_nothing_thinking: "all_or_nothing_thinking",
  "all or nothing thinking": "all_or_nothing_thinking",
  "all-or-nothing thinking": "all_or_nothing_thinking",
  fear_of_being_replaced: "fear_of_being_replaced",
  "fear of being replaced": "fear_of_being_replaced",
  fear_of_being_unimportant: "fear_of_being_unimportant",
  "fear of being unimportant": "fear_of_being_unimportant",
  control_seeking: "control_seeking",
  "control seeking": "control_seeking",
  fear_of_failure: "fear_of_failure",
  "fear of failure": "fear_of_failure",
  future_anxiety: "future_anxiety",
  "future anxiety": "future_anxiety",
  other: "other",
};

const demonAliases: Record<string, NormalizedDemonName> = {
  rejection_sensitivity: "rejection_sensitivity",
  "rejection sensitivity": "rejection_sensitivity",
  retroactive_jealousy: "retroactive_jealousy",
  "retroactive jealousy": "retroactive_jealousy",
  reassurance_seeking: "reassurance_seeking",
  "reassurance seeking": "reassurance_seeking",
  fear_of_being_replaced: "fear_of_being_replaced",
  "fear of being replaced": "fear_of_being_replaced",
  fear_of_being_unimportant: "fear_of_being_unimportant",
  "fear of being unimportant": "fear_of_being_unimportant",
  attachment_anxiety: "attachment_anxiety",
  "attachment anxiety": "attachment_anxiety",
  comparison_thinking: "comparison_thinking",
  "comparison thinking": "comparison_thinking",
  procrastination_paralysis: "procrastination_paralysis",
  "procrastination paralysis": "procrastination_paralysis",
  fear_of_failure: "fear_of_failure",
  "fear of failure": "fear_of_failure",
  uncertainty_intolerance: "uncertainty_intolerance",
  "uncertainty intolerance": "uncertainty_intolerance",
  self_blame: "self_blame",
  "self-blame": "self_blame",
  need_for_autonomy: "need_for_autonomy",
  "need for autonomy": "need_for_autonomy",
  boundary_sensitivity: "boundary_sensitivity",
  "boundary sensitivity": "boundary_sensitivity",
  fear_of_disapproval: "fear_of_disapproval",
  "fear of disapproval": "fear_of_disapproval",
  future_anxiety: "future_anxiety",
  "future anxiety": "future_anxiety",
  other: "other",
};

const unmetNeedAliases: Record<string, NormalizedUnmetNeed> = {
  safety: "safety",
  being_chosen: "being_chosen",
  "being chosen": "being_chosen",
  certainty: "certainty",
  being_valued: "being_valued",
  "being valued": "being_valued",
  connection: "connection",
  autonomy: "autonomy",
  being_understood: "being_understood",
  "being understood": "being_understood",
  control: "control",
  self_efficacy: "self_efficacy",
  "self-efficacy": "self_efficacy",
  "self efficacy": "self_efficacy",
  recognition: "recognition",
  rest: "rest",
  belonging: "belonging",
  boundary_respect: "boundary_respect",
  "boundary respect": "boundary_respect",
  future_stability: "future_stability",
  "future stability": "future_stability",
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
      [/all.?or.?nothing|非黑即白/, "all_or_nothing_thinking"],
      [/comparison|比较/, "comparison_thinking"],
      [/emotional reasoning|情绪化推理/, "emotional_reasoning"],
      [/cognitive fusion|想法融合|认知融合/, "cognitive_fusion"],
      [/reassurance|confirm|确认|安慰/, "reassurance_seeking"],
      [/uncertainty intolerance|不确定性|无法忍受不确定/, "uncertainty_intolerance"],
      [/reject|rejection|被拒绝|拒绝/, "rejection_sensitivity"],
      [/retroactive jealousy|过去|前任|ex|回溯性嫉妒/, "retroactive_jealousy"],
      [/procrastination|拖延|瘫痪|启动不了/, "procrastination_paralysis"],
      [/avoid|回避|逃避/, "avoidance"],
      [/self.?blame|自责/, "self_blame"],
      [/personali[sz]ation|个人化/, "personalization"],
      [/replaced|替代|被取代/, "fear_of_being_replaced"],
      [/unimportant|不重要|不被重视/, "fear_of_being_unimportant"],
      [/control|掌控|控制/, "control_seeking"],
      [/failure|失败/, "fear_of_failure"],
      [/future|未来|以后/, "future_anxiety"],
      [/over.?general|概括/, "overgeneralisation"],
    ],
    "other"
  ) as NormalizedThoughtPattern;
}

export function normalizeDemonName(value: unknown): NormalizedDemonName {
  const aliased = aliasValue(value, demonAliases);

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
      [/reject|被拒绝|拒绝敏感/, "rejection_sensitivity"],
      [/retroactive|ex|past|前任|过去|回溯性嫉妒/, "retroactive_jealousy"],
      [/reassurance|确认|安慰|反复确认/, "reassurance_seeking"],
      [/replaced|替代|取代/, "fear_of_being_replaced"],
      [/unimportant|not matter|不重要|不被重视/, "fear_of_being_unimportant"],
      [/attachment|依恋|黏住|拉扯/, "attachment_anxiety"],
      [/comparison|比较/, "comparison_thinking"],
      [/procrastination|拖延|瘫痪|启动不了/, "procrastination_paralysis"],
      [/failure|失败/, "fear_of_failure"],
      [/uncertainty|不确定/, "uncertainty_intolerance"],
      [/self.?blame|自责/, "self_blame"],
      [/autonomy|自主|自由|选择/, "need_for_autonomy"],
      [/boundary|边界/, "boundary_sensitivity"],
      [/disapproval|不认可|批评|否定/, "fear_of_disapproval"],
      [/future|未来/, "future_anxiety"],
    ],
    "other"
  ) as NormalizedDemonName;
}

export function normalizeUnmetNeed(value: unknown): NormalizedUnmetNeed {
  const aliased = aliasValue(value, unmetNeedAliases);

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
      [/safe|security|安全|安心/, "safety"],
      [/chosen|被选择|唯一|优先/, "being_chosen"],
      [/certain|clarity|clear|确定|清楚/, "certainty"],
      [/valued|matter|important|重视|在意|重要/, "being_valued"],
      [/connection|close|陪伴|连接|靠近|关注/, "connection"],
      [/autonomy|choice|freedom|自主|选择|自由/, "autonomy"],
      [/understood|seen|理解|看见/, "being_understood"],
      [/control|掌控|可控/, "control"],
      [/efficacy|capable|能做到|自我效能/, "self_efficacy"],
      [/recognition|认可|肯定/, "recognition"],
      [/rest|body|fatigue|tired|休息|身体|疲惫/, "rest"],
      [/belong|belonging|归属/, "belonging"],
      [/boundary|respect|尊重|边界/, "boundary_respect"],
      [/future|stability|稳定|未来/, "future_stability"],
    ],
    "other"
  ) as NormalizedUnmetNeed;
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

function localizedThoughtPattern(
  structured: StructuredReflectionLike,
  language: ReflectionLanguage
) {
  const direct = localizeMixedLanguageValue(
    clean(structured?.thought_pattern),
    language
  );
  const contractLabel = localizeMixedLanguageValue(
    clean(structured?.thought_pattern_label),
    language
  );
  const preferred =
    language === "zh"
      ? localizeMixedLanguageValue(clean(structured?.thought_pattern_label_zh), language)
      : localizeMixedLanguageValue(clean(structured?.thought_pattern_label_en), language);
  const fallback =
    language === "zh"
      ? localizeMixedLanguageValue(clean(structured?.thought_pattern_label_en), language)
      : localizeMixedLanguageValue(clean(structured?.thought_pattern_label_zh), language);

  return (
    direct ||
    contractLabel ||
    preferred ||
    fallback ||
    clean(structured?.thought_pattern_key)
  );
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
  const resolvedUiLanguage = normalizeLanguage(uiLanguage);
  const resolvedReflectionLanguage = normalizeLanguage(
    reflectionLanguage ?? uiLanguage
  );
  const nextStepType = clean(structured?.next_step_type);
  const thoughtPattern = localizedThoughtPattern(
    structured,
    resolvedReflectionLanguage
  );
  const trigger =
    clean(structured?.trigger) ||
    clean(structured?.save_card_preview?.trigger) ||
    clean(structured?.emotional_source);
  const emotion =
    clean(structured?.emotion) ||
    clean(structured?.emotion_labels?.[0]) ||
    clean(structured?.save_card_preview?.emotion);
  const primaryDemon = localizeMixedLanguageValue(
    clean(structured?.demon_names?.[0]) ||
      clean(structured?.save_card_preview?.pattern) ||
      thoughtPattern,
    resolvedReflectionLanguage
  );
  const unmetNeed = localizeMixedLanguageValue(
    clean(structured?.save_card_preview?.need) ||
      clean(structured?.unmet_need_deeper) ||
      clean(structured?.unmet_need_surface) ||
      clean(structured?.unmet_need_explanation),
    resolvedReflectionLanguage
  );
  const observeNextItems = cleanList(structured?.observe_next_items, 3).map(
    (item) => localizeMixedLanguageValue(item, resolvedReflectionLanguage)
  );

  return {
    originalInput: clean(input),
    aiResult: clean(result),
    mode: normalizeMode(mode),
    uiLanguage: resolvedUiLanguage,
    reflectionLanguage: resolvedReflectionLanguage,
    emotionalValidation:
      clean(structured?.emotional_validation) ||
      clean(structured?.emotional_source),
    momentSummary:
      clean(structured?.moment_summary) ||
      clean(structured?.emotional_source),
    mainEmotion: emotion,
    secondaryEmotion:
      clean(structured?.secondary_emotion) ||
      clean(structured?.emotion_labels?.[1]),
    triggerLabel: trigger,
    factsSummary: cleanList(structured?.facts),
    interpretationSummary:
      cleanList(structured?.interpretation).length > 0
        ? cleanList(structured?.interpretation)
        : cleanList(structured?.imaginations),
    thoughtPatternLabel: thoughtPattern,
    thoughtPatternExplanation: localizeMixedLanguageValue(
      clean(structured?.thought_pattern_explanation),
      resolvedReflectionLanguage
    ),
    behaviour: clean(structured?.behaviour),
    bodyFactor:
      clean(structured?.body_factor) ||
      clean(structured?.mind_protecting),
    behaviouralInsight:
      clean(structured?.behavioural_insight) ||
      clean(structured?.unmet_need_explanation),
    nextQuestion: clean(structured?.next_question) || clean(structured?.core_question),
    nextStep: clean(structured?.next_step) || clean(structured?.next_step_text),
    nextStepType,
    modeDetected: clean(structured?.mode_detected),
    normalizedTrigger: normalizeTrigger(trigger),
    normalizedThoughtPattern: normalizeThoughtPattern(thoughtPattern),
    normalizedNextStepType: normalizeNextStepType(nextStepType),
    normalizedCheckInSignal: "not_checked_in",
    scenarioCategory: clean(structured?.scenario_category) || "general",
    primaryDemon,
    normalizedDemon: normalizeDemonName(primaryDemon || thoughtPattern),
    unmetNeed,
    normalizedUnmetNeed: normalizeUnmetNeed(unmetNeed),
    observeNextItems,
    shortTitle: shortTitleFrom(trigger, clean(structured?.emotion)),
    moodChip: clean(structured?.emotion),
    saveStatus: "generated",
  };
}

export function canonicalFromSavedReflection(
  reflection: SavedReflectionLike
): CanonicalReflectionCard {
  const uiLanguage = normalizeLanguage(reflection.ui_language ?? reflection.language);
  const reflectionLanguage = normalizeLanguage(
    reflection.reflection_language ?? reflection.language
  );
  const thoughtPattern = localizeMixedLanguageValue(
    clean(reflection.thought_pattern),
    reflectionLanguage
  );
  const trigger = clean(reflection.trigger);
  const nextStepType = clean(reflection.next_step_type);
  const primaryDemon = localizeMixedLanguageValue(
    clean(reflection.primary_demon) || thoughtPattern,
    reflectionLanguage
  );
  const unmetNeed = localizeMixedLanguageValue(
    clean(reflection.unmet_need) || clean(reflection.behavioural_insight),
    reflectionLanguage
  );
  const observeNextItems = cleanList(reflection.observe_next, 3).map((item) =>
    localizeMixedLanguageValue(item, reflectionLanguage)
  );

  return {
    id: reflection.id,
    createdAt: reflection.created_at,
    originalInput: clean(reflection.user_input),
    aiResult: clean(reflection.ai_result),
    mode: normalizeMode(reflection.mode),
    uiLanguage,
    reflectionLanguage,
    emotionalValidation: clean(reflection.emotional_validation),
    momentSummary: trigger
      ? reflectionLanguage === "zh"
        ? `这次情绪时刻似乎和「${trigger}」有关。`
        : `This moment seems to be about ${trigger}.`
      : "",
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
    scenarioCategory: clean(reflection.scenario_category) || "general",
    primaryDemon,
    normalizedDemon: normalizeDemonName(primaryDemon),
    unmetNeed,
    normalizedUnmetNeed: normalizeUnmetNeed(unmetNeed),
    observeNextItems,
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
    other: "Still emerging",
    mind_reading: "Mind reading",
    "mind reading": "Mind reading",
    personalization: "Personalization",
    personalisation: "Personalization",
    catastrophising: "Catastrophising",
    comparison_thinking: "Comparison thinking",
    "comparison thinking": "Comparison thinking",
    emotional_reasoning: "Emotional reasoning",
    "emotional reasoning": "Emotional reasoning",
    cognitive_fusion: "Cognitive fusion",
    "cognitive fusion": "Cognitive fusion",
    reassurance_seeking: "Reassurance seeking",
    "reassurance seeking": "Reassurance seeking",
    rejection_sensitivity: "Rejection sensitivity",
    "rejection sensitivity": "Rejection sensitivity",
    retroactive_jealousy: "Retroactive jealousy",
    "retroactive jealousy": "Retroactive jealousy",
    all_or_nothing_thinking: "All-or-nothing thinking",
    "all-or-nothing thinking": "All-or-nothing thinking",
    uncertainty_intolerance: "Uncertainty intolerance",
    "uncertainty intolerance": "Uncertainty intolerance",
    avoidance: "Avoidance",
    self_blame: "Self-blame",
    "self-blame": "Self-blame",
    procrastination_paralysis: "Procrastination paralysis",
    "procrastination paralysis": "Procrastination paralysis",
    fear_of_being_replaced: "Fear of being replaced",
    fear_of_being_unimportant: "Fear of being unimportant",
    attachment_anxiety: "Attachment anxiety",
    control_seeking: "Control seeking",
    fear_of_failure: "Fear of failure",
    need_for_autonomy: "Need for autonomy",
    boundary_sensitivity: "Boundary sensitivity",
    fear_of_disapproval: "Fear of disapproval",
    future_anxiety: "Future anxiety",
    overgeneralisation: "Overgeneralisation",
    safety: "Safety",
    being_chosen: "Being chosen",
    certainty: "Certainty",
    being_valued: "Being valued",
    connection: "Connection",
    autonomy: "Autonomy",
    being_understood: "Being understood",
    control: "Control",
    self_efficacy: "Self-efficacy",
    recognition: "Recognition",
    rest: "Rest",
    belonging: "Belonging",
    boundary_respect: "Boundary respect",
    future_stability: "Future stability",
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
    other: "暂未清晰归类",
    mind_reading: "读心式推断",
    "mind reading": "读心式推断",
    personalization: "个人化归因",
    personalisation: "个人化归因",
    catastrophising: "灾难化推断",
    comparison_thinking: "比较型思维",
    "comparison thinking": "比较型思维",
    emotional_reasoning: "情绪化推理",
    "emotional reasoning": "情绪化推理",
    cognitive_fusion: "想法融合",
    "cognitive fusion": "想法融合",
    reassurance_seeking: "反复确认",
    "reassurance seeking": "反复确认",
    rejection_sensitivity: "拒绝敏感",
    "rejection sensitivity": "拒绝敏感",
    retroactive_jealousy: "回溯性嫉妒",
    "retroactive jealousy": "回溯性嫉妒",
    all_or_nothing_thinking: "非黑即白思维",
    "all-or-nothing thinking": "非黑即白思维",
    uncertainty_intolerance: "不确定性难耐",
    "uncertainty intolerance": "不确定性难耐",
    avoidance: "回避",
    self_blame: "自我责备",
    "self-blame": "自我责备",
    procrastination_paralysis: "拖延瘫痪",
    "procrastination paralysis": "拖延瘫痪",
    fear_of_being_replaced: "害怕被取代",
    fear_of_being_unimportant: "害怕不重要",
    attachment_anxiety: "依恋焦虑",
    control_seeking: "寻求掌控",
    fear_of_failure: "害怕失败",
    need_for_autonomy: "需要自主",
    boundary_sensitivity: "边界敏感",
    fear_of_disapproval: "害怕不被认可",
    future_anxiety: "未来焦虑",
    overgeneralisation: "过度概括",
    safety: "安全感",
    being_chosen: "被选择感",
    certainty: "确定性",
    being_valued: "被重视感",
    connection: "连接感",
    autonomy: "自主权",
    being_understood: "被理解",
    control: "掌控感",
    self_efficacy: "自我效能感",
    recognition: "认可感",
    rest: "休息",
    belonging: "归属感",
    boundary_respect: "边界被尊重",
    future_stability: "未来稳定感",
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

  return labels[value] || localizeMixedLanguageValue(value, language);
}
