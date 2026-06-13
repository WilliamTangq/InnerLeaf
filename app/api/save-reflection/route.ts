import { NextResponse } from "next/server";
import { getUserFromRequest, supabaseAdmin } from "../../lib/auth-server";
import { normalizeLanguage } from "../../lib/i18n";

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

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Log in to save this reflection to your history." },
        { status: user ? 500 : 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const structured = (body.structured ?? {}) as Record<string, unknown>;
    const input = textValue(body.input);
    const result = textValue(body.result);
    const mode = body.mode === "guided" ? "guided" : "quick";
    const language = normalizeLanguage(body.language);

    if (!input || !result) {
      return NextResponse.json(
        { error: "Reflection could not be saved." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reflections")
      .insert({
        user_id: user.id,
        user_input: input,
        ai_result: result,
        mode,
        language,
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
      })
      .select("id")
      .single();

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
