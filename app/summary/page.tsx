import { createClient } from "@supabase/supabase-js";
import { Leaf, Sparkles, TrendingUp } from "lucide-react";
import { PatternSection } from "../components/pattern-section";
import {
  Card,
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
    `You have ${reflections.length} recent reflection cards to compare instead of relying only on memory.`,
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
      "Your recent cards point to more than one trigger, which can make patterns easier to compare."
    );
  }

  if (behaviourCount > 1) {
    signals.push(
      "Your behavioural reactions are not all the same, which may help you notice where different choices are possible."
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
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            What this may suggest
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            Themes to reflect on, not conclusions about you
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
          Save a few more cards to make change easier to notice.
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
      <PageHeader eyebrow="Insights" title="Your recent patterns">
        These patterns are based only on your saved reflection cards. They are
        not diagnosis or medical advice.
      </PageHeader>

      <div className="mb-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
          <TrendingUp
            aria-hidden="true"
            size={18}
            strokeWidth={1.8}
            className="text-[var(--brand-teal-deep)]"
          />
          <span>Recently noticed across saved reflection cards</span>
        </div>
        <svg
          aria-hidden="true"
          className="mt-4 h-12 w-full text-[var(--brand-teal)]"
          viewBox="0 0 320 48"
          preserveAspectRatio="none"
        >
          <path
            d="M2 36 C 42 12, 78 38, 112 24 S 178 12, 214 26 S 278 34, 318 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      </div>

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
              ? "Save at least 3 reflections to see repeated themes."
              : "Almost there"
          }
          description={
            reflections.length === 0
              ? "Patterns become clearer when there is more than one moment to compare."
              : `You have ${reflections.length} reflection${reflections.length === 1 ? "" : "s"}. Save ${remaining} more to unlock your pattern summary.`
          }
          action={<LinkButton href="/quick">Start quick reflection</LinkButton>}
        />
      )}

      {!error && hasEnoughData && (
        <div className="grid gap-5 lg:grid-cols-2">
          <PatternSection
            title="Repeated Triggers"
            description="What tends to set off strong reactions"
            items={repeatedTriggers}
          />
          <PatternSection
            title="Repeated Thought Patterns"
            description="How your mind often frames the moment"
            items={repeatedThoughtPatterns}
          />
          <PatternSection
            title="Behavioural Themes"
            description="How you tend to respond"
            items={recentBehaviouralThemes}
          />
          <ChangeSection signals={signals} />
        </div>
      )}
    </PageShell>
  );
}
