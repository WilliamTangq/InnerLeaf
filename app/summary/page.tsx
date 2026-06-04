import { createClient } from "@supabase/supabase-js";
import { PatternSection } from "../components/pattern-section";
import {
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatChip,
  StatusCard,
} from "../components/ui";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type SummaryReflection = {
  id: string | number;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
};

function normalizeValue(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function topPatterns(values: Array<string | null>) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const normalized = normalizeValue(value);

    if (!normalized) {
      return;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return first.value.localeCompare(second.value);
    })
    .slice(0, 3);
}

export default async function SummaryPage() {
  const { data, error } = await supabase
    .from("reflections")
    .select("id, trigger, thought_pattern, behaviour")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase summary fetch error:", error);
  }

  const reflections = (data ?? []) as SummaryReflection[];
  const hasEnoughData = reflections.length >= 3;
  const remaining = Math.max(0, 3 - reflections.length);

  const repeatedTriggers = topPatterns(reflections.map((item) => item.trigger));
  const repeatedThoughtPatterns = topPatterns(
    reflections.map((item) => item.thought_pattern)
  );
  const recentBehaviouralThemes = topPatterns(
    reflections.map((item) => item.behaviour)
  );

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow="Insights" title="Your recent patterns">
        Patterns drawn from your last saved reflections. For self-understanding
        only—not diagnosis or medical advice.
      </PageHeader>

      {!error && (
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatChip
            label="Reflections analysed"
            value={String(reflections.length)}
          />
          <StatChip
            label="Window"
            value="Last 10 cards"
          />
          <StatChip
            label="Status"
            value={
              hasEnoughData
                ? "Patterns available"
                : `${remaining} more needed`
            }
          />
        </div>
      )}

      <PageActions>
        <LinkButton href="/quick">New reflection</LinkButton>
        <LinkButton href="/history" variant="secondary">
          View history
        </LinkButton>
      </PageActions>

      {error && (
        <StatusCard tone="error">Failed to load pattern summary.</StatusCard>
      )}

      {!error && !hasEnoughData && (
        <EmptyState
          title={
            reflections.length === 0
              ? "Patterns will appear here"
              : "Almost there"
          }
          description={
            reflections.length === 0
              ? "Save a few reflections first. Once you have at least three, InnerLeaf will surface recurring triggers, thought patterns, and behavioural themes."
              : `You have ${reflections.length} reflection${reflections.length === 1 ? "" : "s"}. Save ${remaining} more to unlock your pattern summary.`
          }
          action={<LinkButton href="/quick">Start quick reflection</LinkButton>}
        />
      )}

      {!error && hasEnoughData && (
        <div className="grid gap-5 lg:grid-cols-3">
          <PatternSection
            title="Repeated triggers"
            description="What tends to set off strong reactions"
            items={repeatedTriggers}
          />
          <PatternSection
            title="Thought patterns"
            description="How your mind often frames the moment"
            items={repeatedThoughtPatterns}
          />
          <PatternSection
            title="Behavioural themes"
            description="How you tend to respond"
            items={recentBehaviouralThemes}
          />
        </div>
      )}
    </PageShell>
  );
}
