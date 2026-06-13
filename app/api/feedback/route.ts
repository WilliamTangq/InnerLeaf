import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/auth-server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user = await getUserFromRequest(request);

    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      mode_tried: textValue(body.mode_tried),
      ease_of_start: textValue(body.ease_of_start),
      reflection_length: textValue(body.reflection_length),
      clarity_help: textValue(body.clarity_help),
      would_use_again: textValue(body.would_use_again),
      alternative_tool: textValue(body.alternative_tool),
      saving_blocker: textValue(body.saving_blocker),
      comparison_feedback: textValue(body.comparison_feedback),
      blocker: textValue(body.blocker),
      other_thoughts: textValue(body.other_thoughts),
    });

    if (error) {
      console.error("Supabase feedback insert error:", error);
      return NextResponse.json(
        { error: "Feedback could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving feedback." },
      { status: 500 }
    );
  }
}
