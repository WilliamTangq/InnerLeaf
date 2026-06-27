import { NextResponse } from "next/server";
import { requireAuth, supabaseAdmin } from "../../lib/auth-server";

const reflectionSelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, body_factor, behavioural_insight, next_question, next_step, next_step_type, mode_detected, follow_up_result, follow_up_note, follow_up_at, mode, language, ui_language, reflection_language, short_title, mood_chip, normalized_trigger, normalized_thought_pattern, normalized_next_step_type, normalized_check_in_signal, scenario_category, primary_demon, unmet_need, observe_next";
const legacyReflectionSelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, body_factor, behavioural_insight, next_question, next_step, next_step_type, mode_detected, follow_up_result, follow_up_note, follow_up_at, mode, language";

function isMissingCanonicalColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("reflection_language") ||
      error?.message?.includes("ui_language") ||
      error?.message?.includes("short_title") ||
      error?.message?.includes("mood_chip") ||
      error?.message?.includes("normalized_") ||
      error?.message?.includes("scenario_category") ||
      error?.message?.includes("primary_demon") ||
      error?.message?.includes("unmet_need") ||
      error?.message?.includes("observe_next")
  );
}

export async function GET(request: Request) {
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
        { error: "Reflection history is unavailable right now." },
        { status: 500 }
      );
    }

    const initialQuery = await supabaseAdmin
      .from("reflections")
      .select(reflectionSelect)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    let data: unknown[] | null = initialQuery.data;
    let error = initialQuery.error;

    if (error && isMissingCanonicalColumn(error)) {
      const legacy = await supabaseAdmin
        .from("reflections")
        .select(legacyReflectionSelect)
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      console.error("Supabase scoped reflections fetch error:", error);
      return NextResponse.json(
        { error: "Reflection history is unavailable right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reflections: data ?? [] });
  } catch (error) {
    console.error("Reflections API error:", error);
    return NextResponse.json(
      { error: "Reflection history is unavailable right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
