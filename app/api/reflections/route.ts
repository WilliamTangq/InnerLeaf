import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const reflectionSelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, body_factor, behavioural_insight, next_question, next_step, next_step_type, mode_detected, follow_up_result, follow_up_note, follow_up_at, mode, language";

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string | number =>
      typeof item === "string" || typeof item === "number"
    )
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 50);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const ids = normalizeIds(body.ids);

    if (ids.length === 0) {
      return NextResponse.json({ reflections: [] });
    }

    const { data, error } = await supabase
      .from("reflections")
      .select(reflectionSelect)
      .in("id", ids)
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
