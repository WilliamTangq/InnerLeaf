import { createClient } from "@supabase/supabase-js";
import {
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatChip,
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
  const latest = reflections[0];

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader eyebrow="Revisit" title="Reflection history">
        Your saved reflection cards, newest first. Expand any card to read the
        full reflection.
      </PageHeader>

      {!error && reflections.length > 0 && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <StatChip
            label="Total reflections"
            value={String(reflections.length)}
          />
          <StatChip
            label="Latest"
            value={
              latest
                ? new Date(latest.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>
      )}

      <PageActions>
        <LinkButton href="/quick">New reflection</LinkButton>
        <LinkButton href="/summary" variant="secondary">
          View patterns
        </LinkButton>
      </PageActions>

      {error && (
        <StatusCard tone="error">Failed to load reflections.</StatusCard>
      )}

      {!error && reflections.length === 0 && (
        <EmptyState
          title="No reflections yet"
          description="Complete a quick or guided reflection and your cards will appear here—ready to revisit whenever you need perspective."
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
