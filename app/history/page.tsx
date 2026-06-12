import { createClient } from "@supabase/supabase-js";
import { HistoryContent } from "./history-content";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

const historySelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, body_factor, behavioural_insight, next_question, next_step, next_step_type, mode_detected, follow_up_result, follow_up_note, follow_up_at, mode, language";

const legacyHistorySelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, behavioural_insight, next_question, mode";

export type Reflection = {
  id: string | number;
  created_at: string;
  user_input: string | null;
  ai_result: string | null;
  emotional_validation: string | null;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  facts: string | null;
  interpretation: string | null;
  behaviour: string | null;
  body_factor: string | null;
  behavioural_insight: string | null;
  next_question: string | null;
  next_step: string | null;
  next_step_type: string | null;
  mode_detected: string | null;
  follow_up_result: string | null;
  follow_up_note: string | null;
  follow_up_at: string | null;
  mode: string | null;
  language: string | null;
};

export default async function HistoryPage() {
  let data = null;
  let error: Error | { code?: string; message?: string } | null = null;

  if (supabase) {
    const response = await supabase
      .from("reflections")
      .select(historySelect)
      .order("created_at", { ascending: false });

    data = response.data;
    error = response.error;

    if (response.error?.code === "42703") {
      const legacyResponse = await supabase
        .from("reflections")
        .select(legacyHistorySelect)
        .order("created_at", { ascending: false });

      data = legacyResponse.data;
      error = legacyResponse.error;
    }
  } else {
    error = new Error("Missing Supabase server environment variables");
  }

  if (error) {
    console.error("Supabase history fetch error:", error);
  }

  const reflections = (data ?? []) as Reflection[];

  return <HistoryContent reflections={reflections} hasError={Boolean(error)} />;
}
