import { NextResponse } from "next/server";
import { requireAuth, supabaseAdmin } from "../../lib/auth-server";
import { normalizeLanguage } from "../../lib/i18n";
import { createCanonicalReflectionCard } from "../../lib/reflection-card";

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function textList(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const values = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  return values.length ? values.join("\n") : null;
}

function isMissingCanonicalColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("reflection_language") ||
      error?.message?.includes("ui_language") ||
      error?.message?.includes("short_title") ||
      error?.message?.includes("mood_chip") ||
      error?.message?.includes("normalized_")
  );
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Log in to save this reflection to your history." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const structured = (body.structured ?? {}) as Record<string, unknown>;
    const input = textValue(body.input);
    const result = textValue(body.result);
    const mode = body.mode === "guided" ? "guided" : "quick";
    const language = normalizeLanguage(body.language);
    const canonical = createCanonicalReflectionCard({
      structured,
      input,
      result,
      mode,
      uiLanguage: language,
      reflectionLanguage: body.reflectionLanguage ?? body.language,
    });

    if (!input || !result) {
      return NextResponse.json(
        { error: "Reflection could not be saved." },
        { status: 400 }
      );
    }

    const insertPayload = {
      user_id: auth.user.id,
      user_input: input,
      ai_result: result,
      mode,
      language,
      ui_language: canonical.uiLanguage,
      short_title: canonical.shortTitle || null,
      mood_chip: canonical.moodChip || null,
      emotional_validation: textValue(structured.emotional_validation),
      emotion: textValue(structured.emotion),
      trigger: textValue(structured.trigger),
      thought_pattern: textValue(structured.thought_pattern),
      facts: textList(structured.facts),
      interpretation: textList(structured.interpretation),
      behaviour: textValue(structured.behaviour),
      body_factor: textValue(structured.body_factor),
      behavioural_insight: textValue(structured.behavioural_insight),
      next_question: textValue(structured.next_question),
      next_step_type: textValue(structured.next_step_type),
      next_step: textValue(structured.next_step),
      mode_detected: textValue(structured.mode_detected),
      reflection_language: canonical.reflectionLanguage,
      normalized_trigger: canonical.normalizedTrigger,
      normalized_thought_pattern: canonical.normalizedThoughtPattern,
      normalized_next_step_type: canonical.normalizedNextStepType,
      normalized_check_in_signal: canonical.normalizedCheckInSignal,
    };
    let { data, error } = await supabaseAdmin
      .from("reflections")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error && isMissingCanonicalColumn(error)) {
      const legacyPayload = {
        user_id: insertPayload.user_id,
        user_input: insertPayload.user_input,
        ai_result: insertPayload.ai_result,
        mode: insertPayload.mode,
        language: insertPayload.language,
        emotional_validation: insertPayload.emotional_validation,
        emotion: insertPayload.emotion,
        trigger: insertPayload.trigger,
        thought_pattern: insertPayload.thought_pattern,
        facts: insertPayload.facts,
        interpretation: insertPayload.interpretation,
        behaviour: insertPayload.behaviour,
        body_factor: insertPayload.body_factor,
        behavioural_insight: insertPayload.behavioural_insight,
        next_question: insertPayload.next_question,
        next_step_type: insertPayload.next_step_type,
        next_step: insertPayload.next_step,
        mode_detected: insertPayload.mode_detected,
      };
      const legacy = await supabaseAdmin
        .from("reflections")
        .insert(legacyPayload)
        .select("id")
        .single();

      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      console.error("Supabase save reflection error:", error);
      return NextResponse.json(
        { error: "Reflection could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id });
  } catch (error) {
    console.error("Save reflection API error:", error);
    return NextResponse.json(
      { error: "Reflection could not be saved." },
      { status: 500 }
    );
  }
}
