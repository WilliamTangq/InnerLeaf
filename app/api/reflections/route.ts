import { NextResponse } from "next/server";
import { getUserFromRequest, supabaseAdmin } from "../../lib/auth-server";

const reflectionSelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, body_factor, behavioural_insight, next_question, next_step, next_step_type, mode_detected, follow_up_result, follow_up_note, follow_up_at, mode, language";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Reflection history is unavailable right now." },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reflections")
      .select(reflectionSelect)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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
