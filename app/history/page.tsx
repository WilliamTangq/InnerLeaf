import { RoleAwareRedirect } from "../components/role-aware-redirect";

export const dynamic = "force-dynamic";

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
  ui_language: string | null;
  reflection_language: string | null;
  short_title: string | null;
  mood_chip: string | null;
  normalized_trigger: string | null;
  normalized_thought_pattern: string | null;
  normalized_next_step_type: string | null;
  normalized_check_in_signal: string | null;
  follow_up_result: string | null;
  follow_up_note: string | null;
  follow_up_at: string | null;
  mode: string | null;
  language: string | null;
};

export default function HistoryPage() {
  return <RoleAwareRedirect target="/history" />;
}
