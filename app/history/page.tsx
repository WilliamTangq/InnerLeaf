import { createClient } from "@supabase/supabase-js";
import {
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { ReflectionCards } from "./reflection-cards";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

const historySelect =
  "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, behavioural_insight, next_question, next_step, next_step_type, follow_up_result, follow_up_note, follow_up_at, mode";

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
  behavioural_insight: string | null;
  next_question: string | null;
  next_step: string | null;
  next_step_type: string | null;
  follow_up_result: string | null;
  follow_up_note: string | null;
  follow_up_at: string | null;
  mode: string | null;
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
  const latest = reflections[0];

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader compact eyebrow="Revisit" title="Reflection history">
        Your saved reflection cards. Open any card to read the full breakdown.
      </PageHeader>

      <PageActions className="mb-6">
        <LinkButton href="/quick">New reflection</LinkButton>
        <LinkButton href="/summary" variant="secondary">
          View patterns
        </LinkButton>
      </PageActions>

      {!error && reflections.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm text-[var(--foreground-muted)]">
          <span>
            <span className="font-medium text-[var(--foreground)]">
              {reflections.length}
            </span>{" "}
            saved
          </span>
          {latest && (
            <>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                ·
              </span>
              <span>
                Latest{" "}
                <time dateTime={latest.created_at}>
                  {new Date(latest.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <StatusCard tone="error">
          Reflection history is unavailable right now.
        </StatusCard>
      )}

      {!error && reflections.length === 0 && (
        <EmptyState
          title="No reflections yet"
          description="Start with one moment. InnerLeaf will help you turn it into a reflection card."
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/quick">Start quick reflection</LinkButton>
              <LinkButton href="/guided" variant="secondary">
                Try guided flow
              </LinkButton>
            </div>
          }
        />
      )}

      {!error && reflections.length > 0 && (
        <ReflectionCards reflections={reflections} />
      )}
    </PageShell>
  );
}
