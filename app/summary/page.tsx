import { createClient } from "@supabase/supabase-js";
import { Leaf, Sparkles } from "lucide-react";
import { PatternSection } from "../components/pattern-section";
import {
  Card,
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

type SummaryReflection = {
  id: string | number;
  created_at: string;
  emotion: string | null;
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

function uniqueCount(values: Array<string | null>) {
  return new Set(values.map(normalizeValue).filter(Boolean)).size;
}

function changeSignals(reflections: SummaryReflection[]) {
  if (reflections.length < 3) {
    return [];
  }

  const signals = [
    `You have ${reflections.length} recent cards to compare — easier than relying on memory alone.`,
  ];
  const triggerCount = uniqueCount(reflections.map((item) => item.trigger));
  const behaviourCount = uniqueCount(reflections.map((item) => item.behaviour));
  const latest = reflections[0];
  const older = reflections.slice(1);
  const olderThoughtPatterns = topPatterns(
    older.map((item) => item.thought_pattern)
  );

  if (triggerCount > 1) {
    signals.push(
      "More than one trigger shows up in your recent cards — useful to compare side by side."
    );
  }

  if (behaviourCount > 1) {
    signals.push(
      "Your responses vary across cards — a reminder that different choices may be possible."
    );
  }

  if (
    latest?.thought_pattern &&
    olderThoughtPatterns[0]?.value &&
    latest.thought_pattern !== olderThoughtPatterns[0].value
  ) {
    signals.push(
      "Your latest thought pattern differs from the most repeated recent one."
    );
  }

  return signals.slice(0, 3);
}

function ChangeSection({ signals }: { signals: string[] }) {
  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Gentle observations
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            Themes to notice — not conclusions about you
          </p>
        </div>
        <Leaf
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {signals.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          Save a few more cards to compare moments more easily.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {signals.map((signal) => (
            <li
              key={signal}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground-muted)]"
            >
              <Sparkles
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
              />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default async function SummaryPage() {
  const { data, error } = supabase
    ? await supabase
        .from("reflections")
        .select("id, created_at, emotion, trigger, thought_pattern, behaviour")
        .order("created_at", { ascending: false })
        .limit(10)
    : {
        data: null,
        error: new Error("Missing Supabase server environment variables"),
      };

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
  const signals = changeSignals(reflections);

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow="Insights" title="Pattern summary">
        Repeated themes from your last {reflections.length || 0} saved cards
        (up to 10). For reflection only.
      </PageHeader>

      <PageActions className="mb-6">
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
              ? "No patterns yet"
              : `${remaining} more card${remaining === 1 ? "" : "s"} to go`
          }
          description={
            reflections.length === 0
              ? "Save a few reflection cards first. Patterns appear after at least three moments."
              : `You have ${reflections.length} saved. Add ${remaining} more to see repeated triggers and thought patterns.`
          }
          action={<LinkButton href="/quick">Start quick reflection</LinkButton>}
        />
      )}

      {!error && hasEnoughData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <PatternSection
              title="Repeated triggers"
              description="What tends to set off strong reactions"
              items={repeatedTriggers}
            />
            <PatternSection
              title="Repeated thought patterns"
              description="How your mind often frames the moment"
              items={repeatedThoughtPatterns}
            />
            <PatternSection
              title="Behavioural themes"
              description="How you tend to respond"
              items={recentBehaviouralThemes}
            />
            <ChangeSection signals={signals} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/quick">Reflect on a new moment</LinkButton>
            <LinkButton href="/history" variant="secondary">
              Open history
            </LinkButton>
          </div>
        </>
      )}
    </PageShell>
  );
}
