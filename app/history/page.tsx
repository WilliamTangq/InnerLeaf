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
  mode: string | null;
};

export default async function HistoryPage() {
  const { data, error } = supabase
    ? await supabase
        .from("reflections")
        .select(
          "id, created_at, user_input, ai_result, emotional_validation, emotion, trigger, thought_pattern, facts, interpretation, behaviour, behavioural_insight, next_question, mode"
        )
        .order("created_at", { ascending: false })
    : {
        data: null,
        error: new Error("Missing Supabase server environment variables"),
      };

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
        <StatusCard tone="error">Failed to load reflections.</StatusCard>
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
