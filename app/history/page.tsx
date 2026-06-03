import { createClient } from "@supabase/supabase-js";
import {
  Card,
  LinkButton,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { ReflectionCards } from "./reflection-cards";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export type Reflection = {
  id: string | number;
  created_at: string;
  user_input: string | null;
  ai_result: string | null;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  facts: string | null;
  interpretation: string | null;
  behaviour: string | null;
  next_question: string | null;
};

export default async function HistoryPage() {
  const { data, error } = await supabase
    .from("reflections")
    .select(
      "id, created_at, user_input, ai_result, emotion, trigger, thought_pattern, facts, interpretation, behaviour, next_question"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase history fetch error:", error);
  }

  const reflections = (data ?? []) as Reflection[];

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader title="Reflection History">
        Saved reflection cards, ordered from newest to oldest.
      </PageHeader>

      <div className="mb-8 flex flex-wrap gap-3">
        <LinkButton href="/quick">Start Quick Reflection</LinkButton>
        <LinkButton href="/summary" variant="secondary">
          View Pattern Summary
        </LinkButton>
        <LinkButton href="/feedback" variant="secondary">
          Share feedback
        </LinkButton>
      </div>

      {error && (
        <StatusCard tone="error">Failed to load reflections.</StatusCard>
      )}

      {!error && reflections.length === 0 && (
        <Card>
          <h2 className="text-xl font-semibold">No reflections saved yet.</h2>
          <p className="mt-3 leading-7 text-[#5F6F61]">
            Start with a quick reflection and your saved cards will appear here.
          </p>
          <div className="mt-6">
            <LinkButton href="/quick">Start Quick Reflection</LinkButton>
          </div>
        </Card>
      )}

      {!error && reflections.length > 0 && (
        <ReflectionCards reflections={reflections} />
      )}
    </PageShell>
  );
}
