import { HistoryContent } from "./history-content";
import { RequireAuth } from "../components/route-guards";
import { UserShell } from "../components/user-shell";

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
  follow_up_result: string | null;
  follow_up_note: string | null;
  follow_up_at: string | null;
  mode: string | null;
  language: string | null;
};

export default function HistoryPage() {
  return (
    <RequireAuth>
      <UserShell maxWidth="max-w-4xl">
        <HistoryContent />
      </UserShell>
    </RequireAuth>
  );
}
